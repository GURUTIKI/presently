'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function ShareButton({ title }: { title: string }) {
    const [copied, setCopied] = useState(false);

    function handleShare() {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <button onClick={handleShare} className="btn btn-ghost" style={{ border: '1px solid var(--glass-border)' }}>
            {copied ? 'Copied!' : 'Share List'}
        </button>
    );
}
