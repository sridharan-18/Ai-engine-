import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { queryCache } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
    }

    const cached = await db
      .select()
      .from(queryCache)
      .where(eq(queryCache.query, query))
      .orderBy(desc(queryCache.lastAccessed))
      .limit(1);

    if (cached.length > 0) {
      // Update last accessed time
      await db
        .update(queryCache)
        .set({ lastAccessed: new Date().toISOString() })
        .where(eq(queryCache.id, cached[0].id));

      return NextResponse.json({ found: true, data: cached[0] });
    }

    return NextResponse.json({ found: false });
  } catch (error) {
    console.error('Error fetching from cache:', error);
    return NextResponse.json({ error: 'Failed to fetch from cache' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, response } = body;

    if (!query || !response) {
      return NextResponse.json({ error: 'Query and response required' }, { status: 400 });
    }

    // Check if already exists
    const existing = await db
      .select()
      .from(queryCache)
      .where(eq(queryCache.query, query));

    if (existing.length > 0) {
      // Update existing
      await db
        .update(queryCache)
        .set({
          response,
          lastAccessed: new Date().toISOString(),
        })
        .where(eq(queryCache.id, existing[0].id));
    } else {
      // Insert new
      await db.insert(queryCache).values({
        id: crypto.randomUUID(),
        query,
        response,
        createdAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error caching query:', error);
    return NextResponse.json({ error: 'Failed to cache query' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await db.delete(queryCache);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json({ error: 'Failed to clear cache' }, { status: 500 });
  }
}
