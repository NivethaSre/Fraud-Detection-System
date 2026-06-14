import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function ResultCard({ result }) {
    if (!result) return null;

    const { fraud_probability, risk_level, top_matches } = result;

    // Determine color and icon based on risk
    const isHighRisk = fraud_probability > 75;
    const color = isHighRisk ? 'var(--color-danger)' : 'var(--color-success)';
    const Icon = isHighRisk ? ShieldAlert : ShieldCheck;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel"
            style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                <div>
                    <h3 style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Risk Assessment</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '0.5rem' }}>
                        <Icon size={32} color={color} />
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: color }}>
                            {risk_level}
                        </span>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: 1 }}>
                        {fraud_probability.toFixed(1)}%
                    </div>
                    <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>Fraud Probability</span>
                </div>
            </div>

            {/* Progress Bar for Probability */}
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '2rem' }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${fraud_probability}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    style={{ height: '100%', background: color }}
                />
            </div>

            <div>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                    <AlertTriangle size={18} color="var(--color-warning)" />
                    Top Semantic Matches
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {top_matches.length === 0 ? (
                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontStyle: 'italic', opacity: 0.7 }}>
                            No similar patterns found in database.
                        </div>
                    ) : (
                        top_matches.map((match, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    borderLeft: `4px solid ${match.core ? 'var(--color-primary)' : 'rgba(255,255,255,0.2)'}`
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{
                                        fontSize: '0.8rem',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        background: match.type === 'suspicious' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                                        color: match.type === 'suspicious' ? '#fca5a5' : '#86efac',
                                        fontWeight: 600,
                                        textTransform: 'uppercase'
                                    }}>
                                        {match.type}
                                    </span>
                                    <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Score: {match.score.toFixed(4)}</span>
                                </div>
                                <div style={{ fontSize: '0.95rem', lineHeight: 1.4 }}>
                                    {match.text}
                                </div>
                                {match.core && (
                                    <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--color-primary)', fontWeight: 500 }}>
                                        Core Knowledge Base Example
                                    </div>
                                )}
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </motion.div>
    );
}
