import { NextResponse } from 'next/server';
import { getItems, createItem, getListById, GiftItem } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { listId, name, url, price, imageUrl } = await req.json();

    // Verify list ownership
    const list = await getListById(listId);
    if (!list || list.ownerId !== userId) {
        return NextResponse.json({ error: 'List not found or unauthorized' }, { status: 404 });
    }

    const newItem = await createItem({
        id: crypto.randomUUID(),
        listId,
        name,
        url,
        price,
        imageUrl,
        isBought: false,
        createdAt: Date.now()
    });

    return NextResponse.json(newItem);
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const listId = searchParams.get('listId');

    if (!listId) {
        return NextResponse.json({ error: 'List ID required' }, { status: 400 });
    }

    const listItems = await getItems(listId);
    const list = await getListById(listId);
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (list && list.ownerId === userId) {
        // User is the owner (Receiver)
        // Mask the bought status so they don't spoil the surprise
        const sanitizedItems = listItems.map(item => ({
            ...item,
            isBought: false,
            boughtBy: undefined
        }));
        return NextResponse.json(sanitizedItems);
    }

    return NextResponse.json(listItems);
}
