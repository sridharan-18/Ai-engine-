import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { queryCache } from '@/lib/db/schema';

export async function GET() {
  try {
    const cachedQueries = await db.select().from(queryCache);
    
    const totalSize = cachedQueries.reduce((sum, item) => {
      return sum + JSON.stringify(item).length;
    }, 0);

    return NextResponse.json({
      count: cachedQueries.length,
      size: totalSize,
    });
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    return NextResponse.json({ error: 'Failed to fetch cache stats' }, { status: 500 });
  }
}
