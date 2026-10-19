import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { customAgents } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const agents = await db.select().from(customAgents).orderBy(customAgents.createdAt);
    return NextResponse.json(agents);
  } catch (error) {
    console.error('Error fetching custom agents:', error);
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, systemInstructions, preferredModel, preferredMode, context } = body;

    if (!name || !description || !systemInstructions || !preferredModel) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newAgent = {
      id: crypto.randomUUID(),
      name,
      description,
      systemInstructions,
      preferredModel,
      preferredMode: preferredMode || 'balanced',
      createdAt: new Date().toISOString(),
      context: context || {},
    };

    await db.insert(customAgents).values(newAgent);
    return NextResponse.json(newAgent, { status: 201 });
  } catch (error) {
    console.error('Error creating custom agent:', error);
    return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, systemInstructions, preferredModel, preferredMode, context } = body;

    if (!id) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (systemInstructions) updateData.systemInstructions = systemInstructions;
    if (preferredModel) updateData.preferredModel = preferredModel;
    if (preferredMode) updateData.preferredMode = preferredMode;
    if (context) updateData.context = context;

    await db.update(customAgents).set(updateData).where(eq(customAgents.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating custom agent:', error);
    return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 });
    }

    await db.delete(customAgents).where(eq(customAgents.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting custom agent:', error);
    return NextResponse.json({ error: 'Failed to delete agent' }, { status: 500 });
  }
}
