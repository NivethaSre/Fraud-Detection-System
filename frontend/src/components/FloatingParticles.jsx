import { motion } from 'framer-motion';
import { useMemo } from 'react';

export default function FloatingParticles() {
    // Generate random particles
    const particles = useMemo(() => {
        return Array.from({ length: 20 }, (_, i) => ({
            id: i,
            size: Math.random() * 4 + 2,
            x: Math.random() * 100,
            y: Math.random() * 100,
            duration: Math.random() * 10 + 20,
            delay: Math.random() * 5,
        }));
    }, []);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 0,
            pointerEvents: 'none',
            overflow: 'hidden'
        }}>
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    animate={{
                        y: [0, -30, 0],
                        x: [0, Math.random() * 20 - 10, 0],
                        opacity: [0.2, 0.5, 0.2],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{
                        duration: particle.duration,
                        repeat: Infinity,
                        delay: particle.delay,
                        ease: "easeInOut"
                    }}
                    style={{
                        position: 'absolute',
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, var(--color-primary), transparent)',
                        filter: 'blur(1px)',
                        opacity: 0.3
                    }}
                />
            ))}
        </div>
    );
}
