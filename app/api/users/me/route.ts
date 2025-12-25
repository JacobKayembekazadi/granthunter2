import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user from database
    const [userData] = await db
      .select()
      .from(users)
      .where(eq(users.id, authUser.id))
      .limit(1);

    // If user doesn't exist in database, return basic info from auth
    if (!userData) {
      return NextResponse.json({
        user: {
          id: authUser.id,
          email: authUser.email,
          fullName: authUser.user_metadata?.full_name || null,
          organizationId: null,
        },
      });
    }

    return NextResponse.json({ user: userData });
  } catch (error: any) {
    console.error('Error fetching user:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      code: error?.code,
    });
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error?.message || 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      },
      { status: 500 }
    );
  }
}

