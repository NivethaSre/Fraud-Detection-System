import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
    ShieldCheck,
    ShieldAlert,
    ImageIcon,
    TrendingUp,
    Activity,
    AlertTriangle,
    Clock,
    X,
    FileText
} from 'lucide-react';

// Animated Counter Component
const AnimatedCounter = ({ value, duration = 2 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime;
        let animationFrame;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

            setCount(Math.floor(progress * value));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [value, duration]);

    return <span>{count}</span>;
};

const StatsCard = ({ title, value, icon: Icon, color }) => {
    const cardRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"]);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={cardRef}
            variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(16px)',
                border: '1px solid var(--glass-border)',
                borderRadius: '20px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                boxShadow: isHovered
                    ? `0 20px 40px -10px rgba(${color}, 0.4)`
                    : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                transition: 'box-shadow 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Shine effect on hover */}
            <motion.div
                animate={{
                    opacity: isHovered ? 0.15 : 0,
                    x: isHovered ? '100%' : '-100%'
                }}
                transition={{ duration: 0.6 }}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, white, transparent)',
                    transform: 'translateZ(50px)',
                    pointerEvents: 'none'
                }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', transform: 'translateZ(20px)' }}>
                <motion.div
                    animate={{ rotate: isHovered ? 360 : 0 }}
                    transition={{ duration: 0.6 }}
                    style={{
                        background: `rgba(${color}, 0.2)`,
                        padding: '12px',
                        borderRadius: '14px',
                        boxShadow: `0 0 20px rgba(${color}, 0.3)`
                    }}
                >
                    <Icon size={28} color={`rgb(${color})`} />
                </motion.div>
                <div style={{ textAlign: 'right' }}>
                    <h3 style={{
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        margin: '10px 0 0 0',
                        color: 'var(--color-text)',
                        textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                    }}>
                        <AnimatedCounter value={value} />
                    </h3>
                    <p style={{
                        margin: 0,
                        opacity: 0.7,
                        fontSize: '0.9rem',
                        color: 'var(--color-text-muted)',
                        fontWeight: 500
                    }}>{title}</p>
                </div>
            </div>
        </motion.div>
    );
};

const HistoryItem = ({ item, index, onClick }) => {
    const isFraud = item.risk.includes("High");
    const isAI = item.image_verdict.includes("Likely AI") || item.image_verdict.includes("AI Generated");


    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, x: -20 },
                show: { opacity: 1, x: 0 }
            }}
            whileHover={{
                x: 5,
                backgroundColor: 'var(--color-card-hover)',
                transition: { duration: 0.2 }
            }}
            onClick={() => onClick(item)}
            style={{
                padding: '1rem',
                borderBottom: index < 5 ? '1px solid var(--color-border)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                borderRadius: '8px',
                transition: 'background-color 0.2s ease'
            }}
        >
            <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: isFraud ? 'var(--color-danger)' : 'var(--color-success)',
                    flexShrink: 0,
                    boxShadow: isFraud
                        ? '0 0 10px var(--color-danger)'
                        : '0 0 10px var(--color-success)'
                }}
            />
            <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: '500', color: 'var(--color-text)', fontSize: '0.95rem' }}>
                    {item.text}
                </p>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    {new Date(item.date).toLocaleString()}
                </span>
            </div>
            {item.has_image && (
                <div style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: item.image_verdict.includes("AI") ? 'rgba(220, 38, 38, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    color: item.image_verdict.includes("AI") ? '#f87171' : '#34d399',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    <ImageIcon size={12} />
                    {item.image_verdict.includes("AI") ? 'AI' : 'Real'}
                </div>
            )}
            <motion.span
                whileHover={{ scale: 1.1 }}
                style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    background: isFraud ? 'rgba(255, 107, 157, 0.2)' : 'rgba(255, 154, 158, 0.2)',
                    color: isFraud ? 'var(--color-danger)' : 'var(--color-success)',
                    border: `1px solid ${isFraud ? 'var(--color-danger)' : 'var(--color-success)'}`,
                    flexShrink: 0
                }}
            >
                {isFraud ? 'Fraud' : 'Genuine'}
            </motion.span>
        </motion.div>
    );
};

export default function Dashboard() {
    const [stats, setStats] = useState({ total_scans: 0, fraud_detected: 0, ai_images_detected: 0 });
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, historyRes] = await Promise.all([
                    axios.get('http://127.0.0.1:8000/stats'),
                    axios.get('http://127.0.0.1:8000/history')
                ]);
                setStats(statsRes.data);
                setHistory(historyRes.data);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text)' }}>
                    <Activity color="var(--color-primary)" /> Dashboard Overview
                </h1>
                <p style={{ opacity: 0.6, color: 'var(--color-text-muted)' }}>Real-time insights from your fraud detection system.</p>
            </header>

            {/* Stats Grid */}
            <motion.div
                variants={{
                    hidden: { opacity: 0 },
                    show: {
                        opacity: 1,
                        transition: {
                            staggerChildren: 0.1
                        }
                    }
                }}
                initial="hidden"
                animate="show"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}
            >
                <StatsCard
                    title="Total Scans Processed"
                    value={stats.total_scans}
                    icon={ShieldCheck}
                    color="59, 130, 246"
                />
                <StatsCard
                    title="High Risk Detected"
                    value={stats.fraud_detected}
                    icon={AlertTriangle}
                    color="239, 68, 68"
                />
                <StatsCard
                    title="AI Images Flagged"
                    value={stats.ai_images_detected}
                    icon={ImageIcon}
                    color="168, 85, 247"
                />
            </motion.div>

            {/* Recent Activity Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '20px',
                    padding: '2rem',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, color: 'var(--color-text)' }}>
                        <Clock size={24} color="var(--color-primary)" />
                        Recent Activity
                    </h3>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-primary)',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.9rem'
                        }}
                    >
                        View All
                    </motion.button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>Loading activity feed...</div>
                ) : history.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>No recent activity found.</div>
                ) : (
                    <motion.div
                        variants={{
                            hidden: { opacity: 0 },
                            show: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.08
                                }
                            }
                        }}
                        initial="hidden"
                        animate="show"
                    >
                        {history.slice(0, 6).map((item, index) => (
                            <HistoryItem
                                key={item.id}
                                item={item}
                                index={index}
                                onClick={() => handleHistoryClick(item)}
                            />
                        ))}
                    </motion.div>
                )}
            </motion.div>

            {/* Detail Modal */}
            {selectedItem && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(5px)',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem'
                }} onClick={() => setSelectedItem(null)}>
                    <motion.div
                        layoutId={`item-${selectedItem.id}`}
                        style={{
                            background: 'var(--color-card)',
                            border: '1px solid var(--color-border)',
                            padding: '2rem',
                            borderRadius: '16px',
                            width: '100%',
                            maxWidth: '600px',
                            position: 'relative'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedItem(null)}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--color-text-muted)'
                            }}
                        >
                            <X size={20} />
                        </button>

                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: 0, color: 'var(--color-text)' }}>
                            <FileText size={24} color="var(--color-primary)" /> Claim Details
                        </h2>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ fontSize: '0.8rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)' }}>Description</label>
                            <p style={{ marginTop: '0.5rem', lineHeight: 1.6, background: 'var(--color-bg)', padding: '1rem', borderRadius: '8px', color: 'var(--color-text)' }}>
                                {selectedItem.text}
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ background: 'var(--color-bg)', padding: '1rem', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.8rem', opacity: 0.5, color: 'var(--color-text-muted)' }}>Fraud Risk</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: selectedItem.risk.includes('High') ? 'var(--color-danger)' : 'var(--color-success)' }}>
                                    {selectedItem.risk}
                                </div>
                            </div>

                            <div style={{ background: 'var(--color-bg)', padding: '1rem', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.8rem', opacity: 0.5, color: 'var(--color-text-muted)' }}>Image Verdict</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: selectedItem.image_verdict.includes('AI') ? 'var(--color-danger)' : 'var(--color-success)' }}>
                                    {selectedItem.image_verdict}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', opacity: 0.4, color: 'var(--color-text-muted)' }}>
                            Analyzed on: {new Date(selectedItem.date).toLocaleString()} <br />
                            ID: {selectedItem.id}
                        </div>

                    </motion.div>
                </div>
            )}
        </div>
    );
}
