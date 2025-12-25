import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateDOCX } from '@/lib/documents/docx-generator';
import { generatePDF } from '@/lib/documents/pdf-generator';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { format = 'docx' } = body;

    let buffer: Buffer;
    let mimeType: string;
    let extension: string;

    if (format === 'pdf') {
      buffer = await generatePDF(id);
      mimeType = 'application/pdf';
      extension = 'pdf';
    } else {
      buffer = await generateDOCX(id);
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      extension = 'docx';
    }

    // Upload to Supabase Storage
    const supabaseClient = createSupabaseClient();
    const fileName = `proposal-${id}-${Date.now()}.${extension}`;
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('proposals')
      .upload(fileName, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabaseClient.storage
      .from('proposals')
      .getPublicUrl(fileName);

    return NextResponse.json({
      url: urlData.publicUrl,
      fileName,
      format,
    });
  } catch (error) {
    console.error('Error generating document:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

