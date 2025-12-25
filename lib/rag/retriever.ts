import { db } from '@/db';
import { pastPerformance } from '@/db/schema';
import { generateEmbedding } from './embeddings';
import { sql } from 'drizzle-orm';

export interface PastPerformanceResult {
  id: string;
  title: string;
  agency: string;
  value: string;
  description: string;
  score: number;
}

export async function retrievePastPerformance(
  query: string,
  limit: number = 5
): Promise<PastPerformanceResult[]> {
  try {
    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query);

    // Vector similarity search using pgvector
    // Note: This requires the pgvector extension and proper indexing
    const results = await db.execute(sql`
      SELECT 
        id,
        title,
        agency,
        value,
        description,
        1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector) as score
      FROM ${pastPerformance}
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector
      LIMIT ${limit}
    `);

    // db.execute returns an array directly, not an object with rows
    return (results as any[]).map((row: any) => ({
      id: row.id,
      title: row.title,
      agency: row.agency || '',
      value: row.value || '',
      description: row.description || '',
      score: parseFloat(row.score) || 0,
    }));
  } catch (error) {
    console.error('Error retrieving past performance:', error);
    // Fallback to text search if vector search fails
    return await fallbackTextSearch(query, limit);
  }
}

async function fallbackTextSearch(
  query: string,
  limit: number
): Promise<PastPerformanceResult[]> {
  const queryLower = query.toLowerCase();
  const keywords = queryLower.split(' ').filter(w => w.length > 3);

  const results = await db
    .select()
    .from(pastPerformance)
    .limit(limit);

  // Simple keyword matching
  return results
    .map(pp => {
      const content = `${pp.title} ${pp.description} ${pp.agency}`.toLowerCase();
      const matches = keywords.filter(kw => content.includes(kw)).length;
      const score = matches / keywords.length;

      return {
        id: pp.id,
        title: pp.title,
        agency: pp.agency || '',
        value: pp.value || '',
        description: pp.description || '',
        score,
      };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

