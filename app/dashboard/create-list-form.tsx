'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function CreateListForm() {
    const [isExpanding, setIsExpanding] = useState(false);
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/lists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description: desc }),
            });

            if (res.ok) {
                setTitle('');
                setDesc('');
                setIsExpanding(false);
                router.refresh(); // Refresh server component
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    if (!isExpanding) {
        return (
            <button
                className={`glass-panel ${styles.createCard}`}
                onClick={() => setIsExpanding(true)}
            >
                <span className={styles.plusIcon}>+</span>
                <span>Create New List</span>
            </button>
        );
    }

    return (
        <div className={`glass-panel ${styles.formCard}`}>
            <form onSubmit={handleSubmit}>
                <input
                    className={styles.input}
                    placeholder="List Title (e.g. Birthday 2024)"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    autoFocus
                />
                <textarea
                    className={styles.textarea}
                    placeholder="Description (optional)"
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                />
                <div className={styles.formActions}>
                    <button type="button" className="btn btn-ghost" onClick={() => setIsExpanding(false)}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </form>
        </div>
    );
}
