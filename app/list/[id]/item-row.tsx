'use client';

import { useState } from 'react';
import styles from './page.module.css';

interface ItemRowProps {
    item: any; // Type strictly if possible, but any is faster for now
    isOwner: boolean;
}

export default function ItemRow({ item: initialItem, isOwner }: ItemRowProps) {
    const [item, setItem] = useState(initialItem);
    const [loading, setLoading] = useState(false);

    async function toggleBought() {
        if (isOwner) return; // Owners can't mark bought
        setLoading(true);

        try {
            const res = await fetch(`/api/items/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isBought: !item.isBought })
            });

            if (res.ok) {
                const updated = await res.json();
                setItem(updated);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function deleteItem() {
        if (!confirm('Delete this gift?')) return;
        try {
            const res = await fetch(`/api/items/${item.id}`, { method: 'DELETE' });
            if (res.ok) {
                window.location.reload(); // Simple reload for now
            }
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <div className={`glass-panel ${styles.itemCard} ${item.isBought && !isOwner ? styles.bought : ''}`}>
            <div className={styles.itemContent}>
                <div className={styles.itemHeader}>
                    <h3>{item.name}</h3>
                    {item.price && <span className={styles.price}>{item.price}</span>}
                </div>

                {item.url && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className={styles.link}>
                        View Link &nearr;
                    </a>
                )}
            </div>

            <div className={styles.itemActions}>
                {!isOwner ? (
                    <button
                        onClick={toggleBought}
                        disabled={loading}
                        className={`btn ${item.isBought ? styles.btnBought : styles.btnMark}`}
                    >
                        {item.isBought ? 'Bought!' : 'Mark as Bought'}
                    </button>
                ) : (
                    <button onClick={deleteItem} className={styles.deleteBtn}>
                        &times;
                    </button>
                )}
            </div>
        </div>
    );
}
