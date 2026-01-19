import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { getListById, getItems } from '@/lib/db';
import AddItemForm from './add-item-form';
import ItemRow from './item-row';
import ShareButton from './share-button';
import styles from './page.module.css';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ListPage({ params }: PageProps) {
    const { id } = await params;
    const list = await getListById(id);

    if (!list) {
        notFound();
    }

    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    const isOwner = list.ownerId === userId;

    const rawItems = await getItems(id);
    const items = rawItems.map(item => ({
        ...item,
        // If owner, HIDE bought status (always false to them visually)
        isBought: isOwner ? false : item.isBought,
        boughtBy: isOwner ? undefined : item.boughtBy
    }));

    return (
        <main className={styles.container}>
            <div className={styles.nav}>
                <Link href={isOwner ? "/dashboard" : "/"} className={styles.backLink}>
                    &larr; {isOwner ? 'Back to Dashboard' : 'Home'}
                </Link>
            </div>

            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>{list.title}</h1>
                    <p className={styles.description}>{list.description}</p>
                </div>
                <ShareButton title={list.title} />
            </header>

            {isOwner && (
                <section className={styles.addSection}>
                    <AddItemForm listId={list.id} />
                </section>
            )}

            <section className={styles.listSection}>
                {items.length === 0 ? (
                    <div className={`glass-panel ${styles.emptyState}`}>
                        <p>No gifts on this list yet.</p>
                    </div>
                ) : (
                    <div className={styles.itemsGrid}>
                        {items.map(item => (
                            <ItemRow key={item.id} item={item} isOwner={isOwner} />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
