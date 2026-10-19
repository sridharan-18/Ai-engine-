import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { customAgents } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agent = await db.select().from(customAgents).where(eq(customAgents.id, params.id));
    
    if (agent.length === 0) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json(agent[0]);
  } catch (error) {
    console.error('Error fetching custom agent:', error);
    return NextResponse.json({ error: 'Failed to fetch agent' }, { status: 500 });
  }
}
