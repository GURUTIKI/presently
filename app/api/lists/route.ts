import { NextResponse } from 'next/server';
import { getLists, createList } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userLists = await getLists(userId);
    return NextResponse.json(userLists);
}

export async function POST(req: Request) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description } = await req.json();

    const newList = await createList({
        id: crypto.randomUUID(),
        ownerId: userId,
        title,
        description,
        theme: 'default'
    });

    return NextResponse.json(newList);
}
