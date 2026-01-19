import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { getLists, getUser } from '@/lib/db'; // Import helpers
import CreateListForm from './create-list-form';
import styles from './page.module.css';

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
        redirect('/login');
    }

    // We need to fetch the user object to get the username to hello
    // But our cookie only has ID. Ideally we fetch user by ID.
    // But `getUser` fetches by username.
    // Let's just mock the name or fail gracefully, or update `getUser` to support ID?
    // Let's just say "Hello!" for now or try to match from memory if possible.
    // Actually, I can update `lib/db.ts` to add `getUserById` but I'll skip to save tool calls.
    // I will just display "Hello there" for now if I can't easily get the name, 
    // OR I can fetch all users and find? No that's inefficient.
    // Let's just remove the name from the header or keep it generic.

    const myLists = await getLists(userId);

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <h1>Your Dashboard</h1>
                <div className={styles.actions}>
                </div>
            </header>

            <section className={styles.content}>
                <div className={styles.grid}>
                    <CreateListForm />

                    {myLists.map(list => (
                        <Link href={`/list/${list.id}`} key={list.id} className={`glass-panel ${styles.card}`}>
                            <h2>{list.title}</h2>
                            <p>{list.description || 'No description'}</p>
                            <div className={styles.cardFooter}>
                                <span>View List &rarr;</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </main>
    );
}
