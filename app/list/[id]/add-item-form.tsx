'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function AddItemForm({ listId }: { listId: string }) {
    const [isExpanding, setIsExpanding] = useState(false);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listId, name, price, url }),
            });

            if (res.ok) {
                setName('');
                setPrice('');
                setUrl('');
                setIsExpanding(false);
                router.refresh();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    if (!isExpanding) {
        return (
            <button className={`btn btn-primary ${styles.addBtn}`} onClick={() => setIsExpanding(true)}>
                + Add Gift
            </button>
        );
    }

    return (
        <div className={`glass-panel ${styles.formCard}`}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input
                    className={styles.input}
                    placeholder="Gift Name (e.g. Red Scarf)"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    autoFocus
                />
                <div className={styles.row}>
                    <input
                        className={styles.input}
                        placeholder="Price (e.g. $20)"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                    />
                    <input
                        className={styles.input}
                        placeholder="Link / URL"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                    />
                </div>
                <div className={styles.actions}>
                    <button type="button" className="btn btn-ghost" onClick={() => setIsExpanding(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>Add</button>
                </div>
            </form>
        </div>
    );
}
