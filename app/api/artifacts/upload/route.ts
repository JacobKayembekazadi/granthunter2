import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { artifacts } from '@/db/schema';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const opportunityId = formData.get('opportunityId') as string | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Get file info
        const fileName = file.name;
        const fileSize = file.size;
        const fileExt = fileName.split('.').pop()?.toLowerCase() || 'txt';

        // Upload to Supabase Storage
        const storagePath = `artifacts/${user.id}/${Date.now()}_${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(storagePath, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (uploadError) {
            console.error('Storage upload error:', uploadError);
            // If storage fails, still create artifact record without storage URL
            console.warn('Creating artifact without storage URL');
        }

        // Get public URL if upload succeeded
        let storageUrl = null;
        if (uploadData) {
            const { data: urlData } = supabase.storage
                .from('documents')
                .getPublicUrl(storagePath);
            storageUrl = urlData?.publicUrl;
        }

        // Create artifact record in database
        const [artifact] = await db
            .insert(artifacts)
            .values({
                name: fileName,
                type: fileExt,
                status: 'ready',
                size: fileSize,
                opportunityId: opportunityId || null,
                storageUrl: storageUrl,
            })
            .returning();

        return NextResponse.json({
            artifact: {
                ...artifact,
                size: `${(fileSize / 1024 / 1024).toFixed(1)} MB`,
                date: new Date().toISOString().split('T')[0],
            }
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error uploading file:', error);
        return NextResponse.json({
            error: error.message || 'Internal server error'
        }, { status: 500 });
    }
}
