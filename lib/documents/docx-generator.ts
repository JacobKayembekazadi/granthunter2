import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { db } from '@/db';
import { proposals, proposalSections } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function generateDOCX(proposalId: string): Promise<Buffer> {
  // Get proposal and sections
  const [proposal] = await db
    .select()
    .from(proposals)
    .where(eq(proposals.id, proposalId))
    .limit(1);

  if (!proposal) {
    throw new Error('Proposal not found');
  }

  const sections = await db
    .select()
    .from(proposalSections)
    .where(eq(proposalSections.proposalId, proposalId))
    .orderBy(proposalSections.order);

  // Build document
  const children: Paragraph[] = [
    new Paragraph({
      text: proposal.name,
      heading: HeadingLevel.TITLE,
    }),
    new Paragraph({
      text: '',
    }),
  ];

  // Add each section
  for (const section of sections) {
    children.push(
      new Paragraph({
        text: `${section.sectionNumber}. ${section.title}`,
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph({
        text: section.content || '',
      }),
      new Paragraph({
        text: '',
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        children,
      },
    ],
  });

  // Generate buffer
  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

