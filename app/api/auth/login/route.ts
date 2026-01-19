import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();

        const user = await getUser(username);
        if (!user || user.passwordHash !== password) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const cookieStore = await cookies();
        cookieStore.set('userId', user.id, { httpOnly: true, path: '/' });

        return NextResponse.json({ id: user.id, username: user.username });
    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
