import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2 } from 'lucide-react';

export default function AnalysisForm({ onAnalyze, isLoading }) {
    const [text, setText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim()) {
            onAnalyze(text);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 w-full max-w-2xl mx-auto mb-8"
            style={{ padding: '2rem', textAlign: 'left' }}
        >
            <h2 style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Search size={24} color="var(--color-primary)" />
                Analyze Return Description
            </h2>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste the return description here (e.g., 'Box arrived damaged...')"
                    disabled={isLoading}
                />
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={isLoading || !text.trim()}
                        style={{
                            backgroundColor: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            padding: '0.8rem 2rem',
                            borderRadius: '8px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            opacity: (isLoading || !text.trim()) ? 0.6 : 1,
                            cursor: (isLoading || !text.trim()) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Analyze Fraud Risk'}
                    </motion.button>
                </div>
            </form>
        </motion.div>
    );
}
