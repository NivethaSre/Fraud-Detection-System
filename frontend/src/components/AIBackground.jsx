import { motion } from 'framer-motion';
import { useTheme } from './ThemeContext';

export default function AIBackground() {
    const { theme } = useTheme();

    // Only show AI background when AI theme is active
    if (theme !== 'ai') return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: -1,
            overflow: 'hidden',
            background: 'var(--color-bg)',
            pointerEvents: 'none'
        }}>
            {/* Animated Grid */}
            <motion.div
                animate={{
                    backgroundPosition: ['0px 0px', '50px 50px'],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                }}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: `
                        linear-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0, 240, 255, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px',
                    opacity: 0.3
                }}
            />

            {/* Glowing Orbs */}
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.4, 0.2],
                    x: [0, 100, 0],
                    y: [0, -50, 0]
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{
                    position: 'absolute',
                    top: '20%',
                    left: '10%',
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #00F0FF 0%, transparent 70%)',
                    filter: 'blur(80px)',
                    opacity: 0.3
                }}
            />

            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.15, 0.3, 0.15],
                    x: [0, -80, 0],
                    y: [0, 60, 0]
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{
                    position: 'absolute',
                    bottom: '15%',
                    right: '15%',
                    width: '500px',
                    height: '500px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #7B61FF 0%, transparent 70%)',
                    filter: 'blur(100px)',
                    opacity: 0.25
                }}
            />

            <motion.div
                animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.1, 0.25, 0.1],
                    rotate: [0, 180, 360]
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear"
                }}
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #FF00FF 0%, transparent 70%)',
                    filter: 'blur(90px)',
                    opacity: 0.2,
                    transform: 'translate(-50%, -50%)'
                }}
            />

            {/* Scanning Lines */}
            <motion.div
                animate={{
                    y: ['-100%', '200%']
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                }}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, #00F0FF, transparent)',
                    boxShadow: '0 0 20px #00F0FF',
                    opacity: 0.5
                }}
            />

            {/* Circuit Pattern Overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0.03,
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10h20v20h-20z M40 10h20v20h-20z M70 10h20v20h-20z M10 40h20v20h-20z M40 40h20v20h-20z M70 40h20v20h-20z M10 70h20v20h-20z M40 70h20v20h-20z M70 70h20v20h-20z' fill='none' stroke='%2300F0FF' stroke-width='0.5'/%3E%3C/svg%3E")`,
                backgroundSize: '100px 100px'
            }} />
        </div>
    );
}
