import {
    LayoutDashboard,
    FileText,
    History,
    Settings,
    LogOut,
    Palette
} from 'lucide-react';
import { useTheme } from './ThemeContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({ activeTab, setActiveTab }) {
    const { theme, setTheme, availableThemes } = useTheme();
    const [showThemeMenu, setShowThemeMenu] = useState(false);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'analysis', label: 'New Analysis', icon: FileText },
        { id: 'history', label: 'History', icon: History },
    ];

    return (
        <div style={{
            width: '260px',
            background: 'var(--sidebar-bg)',
            backdropFilter: 'blur(10px)',
            borderRight: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            padding: '2rem 1.5rem',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 50,
            transition: 'background 0.3s, border-color 0.3s'
        }}>
            {/* Logo Area */}
            <div style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <motion.div
                    animate={{
                        boxShadow: [
                            '0 0 20px rgba(59, 130, 246, 0.3)',
                            '0 0 40px rgba(139, 92, 246, 0.6)',
                            '0 0 20px rgba(59, 130, 246, 0.3)'
                        ]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        color: '#fff',
                        cursor: 'pointer'
                    }}
                >
                    FG
                </motion.div>
                <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0, lineHeight: 1, color: 'var(--color-text)' }}>FraudGuard</h2>
                    <span style={{ fontSize: '0.8rem', opacity: 0.5, color: 'var(--color-text)' }}>AI Detector</span>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1 }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        return (
                            <li key={item.id} style={{ marginBottom: '0.5rem' }}>
                                <button
                                    onClick={() => setActiveTab(item.id)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        background: isActive ? 'linear-gradient(to right, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))' : 'transparent', // Keep gradient transparent but adjust colors if needed
                                        border: isActive ? '1px solid var(--color-primary)' : '1px solid transparent',
                                        color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)',
                                        fontWeight: isActive ? 600 : 400,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        textAlign: 'left'
                                    }}
                                    className="hover:bg-white/5"
                                >
                                    <Icon size={20} color={isActive ? 'var(--color-primary)' : 'currentColor'} />
                                    {item.label}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer User Info */}
            <div style={{
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                position: 'relative'
            }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-card-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text)' }}>
                    <span style={{ fontSize: '0.9rem' }}>JD</span>
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>John Doe</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.5, color: 'var(--color-text)' }}>Admin</div>
                </div>

                {/* Theme Switcher */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowThemeMenu(!showThemeMenu)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--color-text-muted)' }}
                    >
                        <Palette size={18} />
                    </button>

                    <AnimatePresence>
                        {showThemeMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                style={{
                                    position: 'absolute',
                                    bottom: '100%',
                                    left: '0',
                                    marginBottom: '10px',
                                    background: 'var(--color-card)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '12px',
                                    padding: '0.5rem',
                                    width: '140px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                                    zIndex: 100
                                }}
                            >
                                {availableThemes.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => {
                                            setTheme(t.id);
                                            setShowThemeMenu(false);
                                        }}
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: '8px 12px',
                                            background: theme === t.id ? 'var(--color-primary)' : 'transparent',
                                            color: theme === t.id ? '#fff' : 'var(--color-text)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            marginBottom: '2px'
                                        }}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
