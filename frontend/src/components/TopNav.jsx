import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './ThemeContext';
import { LayoutDashboard, FileText, Palette, User } from 'lucide-react';

export default function TopNav({ activeTab, setActiveTab }) {
    const { theme, setTheme, availableThemes } = useTheme();
    const [showThemeMenu, setShowThemeMenu] = useState(false);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'analysis', label: 'New Analysis', icon: FileText }
    ];

    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--color-border)',
                padding: '1rem 2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
            }}
        >
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <motion.div
                    animate={{
                        boxShadow: [
                            '0 0 20px rgba(255, 107, 157, 0.3)',
                            '0 0 40px rgba(255, 179, 179, 0.6)',
                            '0 0 20px rgba(255, 107, 157, 0.3)'
                        ]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    style={{
                        width: '45px',
                        height: '45px',
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '1.3rem',
                        color: '#fff',
                        cursor: 'pointer'
                    }}
                >
                    FG
                </motion.div>
                <div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', margin: 0, lineHeight: 1, color: 'var(--color-text)' }}>
                        FraudGuard
                    </h2>
                    <span style={{ fontSize: '0.75rem', opacity: 0.6, color: 'var(--color-text-muted)' }}>
                        AI Detector
                    </span>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                background: 'var(--color-card)',
                padding: '0.5rem',
                borderRadius: '12px',
                border: '1px solid var(--color-border)'
            }}>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                        <motion.button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: isActive
                                    ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))'
                                    : 'transparent',
                                color: isActive ? '#fff' : 'var(--color-text)',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontWeight: isActive ? '600' : '500',
                                fontSize: '0.95rem',
                                transition: 'all 0.2s ease',
                                boxShadow: isActive ? '0 4px 15px rgba(255, 107, 157, 0.3)' : 'none'
                            }}
                        >
                            <Icon size={18} />
                            {item.label}
                        </motion.button>
                    );
                })}
            </div>

            {/* Right Section - Theme & User */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Theme Switcher */}
                <div style={{ position: 'relative' }}>
                    <motion.button
                        onClick={() => setShowThemeMenu(!showThemeMenu)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        style={{
                            background: 'var(--color-card)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '10px',
                            padding: '0.6rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            color: 'var(--color-text)'
                        }}
                    >
                        <Palette size={20} />
                    </motion.button>

                    <AnimatePresence>
                        {showThemeMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                style={{
                                    position: 'absolute',
                                    top: '120%',
                                    right: 0,
                                    background: 'var(--color-card)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '12px',
                                    padding: '0.5rem',
                                    minWidth: '150px',
                                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                                    zIndex: 1000
                                }}
                            >
                                {availableThemes.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => {
                                            setTheme(t.id);
                                            setShowThemeMenu(false);
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '0.6rem 1rem',
                                            background: theme === t.id ? 'var(--color-primary)' : 'transparent',
                                            color: theme === t.id ? '#fff' : 'var(--color-text)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            fontSize: '0.9rem',
                                            marginBottom: '0.25rem',
                                            fontWeight: theme === t.id ? '600' : '400'
                                        }}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* User Info */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '0.5rem 1rem',
                    background: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px'
                }}>
                    <div style={{
                        width: '35px',
                        height: '35px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '0.9rem'
                    }}>
                        <User size={18} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-text)' }}>
                            Admin User
                        </span>
                        <span style={{ fontSize: '0.75rem', opacity: 0.6, color: 'var(--color-text-muted)' }}>
                            admin@fraud.ai
                        </span>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}
