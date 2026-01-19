import { NextResponse } from 'next/server';
import { createUser, getUser } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const existingUser = await getUser(username);
        if (existingUser) {
            return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
        }

        const newUser = await createUser({
            id: crypto.randomUUID(),
            username,
            passwordHash: password, // Note: In production, hash this!
        });

        const cookieStore = await cookies();
        cookieStore.set('userId', newUser.id, { httpOnly: true, path: '/' });

        return NextResponse.json({ id: newUser.id, username: newUser.username });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
