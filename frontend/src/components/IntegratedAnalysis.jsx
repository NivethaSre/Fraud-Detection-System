import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, ShieldAlert, ShieldCheck, ImageIcon, Loader2, FileText, CheckCircle, Activity } from 'lucide-react';
import axios from 'axios';

export default function IntegratedAnalysis() {
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected && selected.type.startsWith('image/')) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
        }
    };

    const clearFile = () => {
        setFile(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const analyzeClaim = async () => {
        if (!text.trim()) {
            setError("Please provide a text description of the return.");
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append('description', text);
        // Customer ID and Category removed as requested
        if (file) {
            formData.append('image', file);
        }

        try {
            const response = await axios.post('http://127.0.0.1:8000/analyze-claim', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult(response.data);
        } catch (err) {
            console.error(err);
            setError("Analysis failed. Ensure backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
                className="glass-panel"
                style={{
                    padding: '2rem',
                    textAlign: 'left',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Animated border gradient */}
                <motion.div
                    animate={{
                        rotate: 360
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    style={{
                        position: 'absolute',
                        top: '-50%',
                        left: '-50%',
                        width: '200%',
                        height: '200%',
                        background: 'conic-gradient(from 0deg, transparent, var(--color-primary), transparent)',
                        opacity: 0.1,
                        pointerEvents: 'none'
                    }}
                />

                <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: 0, color: 'var(--color-text)', position: 'relative', zIndex: 1 }}>
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <ShieldAlert size={28} color="var(--color-primary)" />
                    </motion.div>
                    New Return Claim Analysis
                </h2>
                <p style={{ opacity: 0.7, marginBottom: '2rem', color: 'var(--color-text-muted)', position: 'relative', zIndex: 1 }}>
                    Analyze both the return description and product image simultaneously for a comprehensive fraud risk assessment.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* Left Column: Inputs */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>Return Description</label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="e.g., 'Item arrived damaged with scratches on the screen...'"
                            style={{ minHeight: '150px', marginBottom: '1.5rem', width: '100%' }}
                            disabled={loading}
                        />

                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>Product Image (Optional)</label>
                        {!preview ? (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    border: '2px dashed var(--color-border)',
                                    borderRadius: '12px',
                                    padding: '2rem',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    color: 'var(--color-text)'
                                }}
                                className="hover:bg-white/5 hover:border-primary"
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                                <Upload size={32} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                                <p style={{ margin: 0 }}>Upload Image Evidence</p>
                            </div>
                        ) : (
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <img
                                    src={preview}
                                    alt="Preview"
                                    style={{ maxHeight: '150px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                                />
                                <button
                                    onClick={clearFile}
                                    style={{
                                        position: 'absolute',
                                        top: '-10px',
                                        right: '-10px',
                                        background: 'var(--color-card)',
                                        borderRadius: '50%',
                                        padding: '4px',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        )}

                        <motion.button
                            onClick={analyzeClaim}
                            disabled={loading}
                            whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)' }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                width: '100%',
                                marginTop: '2rem',
                                padding: '1rem',
                                background: loading ? 'var(--color-card)' : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                opacity: loading ? 0.7 : 1,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '10px',
                                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Analyze Claim'}
                        </motion.button>
                        {error && <p style={{ color: 'var(--color-danger)', marginTop: '1rem' }}>{error}</p>}
                    </div>

                    {/* Right Column: Results */}
                    <div style={{ background: 'var(--color-bg)', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--color-border)' }}>
                        {!result ? (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3, flexDirection: 'column', color: 'var(--color-text)' }}>
                                <ShieldCheck size={64} />
                                <p>Results will appear here</p>
                            </div>
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', color: 'var(--color-text)' }}>Analysis Report</h3>

                                {/* Text Analysis Result */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                                        <FileText size={18} color="var(--color-primary)" /> Text Analysis
                                    </h4>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-card)', padding: '1rem', borderRadius: '8px' }}>
                                        <div>
                                            <div style={{ fontSize: '0.9rem', opacity: 0.7, color: 'var(--color-text-muted)' }}>Fraud Risk</div>
                                            <div style={{ fontWeight: 'bold', color: result.text_analysis.risk_level.includes("High") ? 'var(--color-danger)' : 'var(--color-success)' }}>
                                                {result.text_analysis.risk_level}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text)' }}>
                                            {(result.text_analysis.risk_score * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                </div>

                                {/* Image Analysis Result */}
                                {result.image_analysis && result.image_analysis.verdict !== "No Image" ? (
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                                            <ImageIcon size={18} color="var(--color-primary)" /> Image Authenticity
                                        </h4>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-card)', padding: '1rem', borderRadius: '8px' }}>
                                            <div>
                                                <div style={{ fontSize: '0.9rem', opacity: 0.7, color: 'var(--color-text-muted)' }}>Verdict</div>
                                                <div style={{ fontWeight: 'bold', color: result.image_analysis.verdict.includes('AI') ? 'var(--color-danger)' : 'var(--color-success)' }}>
                                                    {result.image_analysis.verdict}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text)' }}>
                                                {result.image_analysis.aggregate_score ? result.image_analysis.aggregate_score.toFixed(1) : 0}% <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>AI Prob</span>
                                            </div>
                                        </div>
                                        {/* Detailed Breakdown */}
                                        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                                            {result.image_analysis.details && Object.values(result.image_analysis.details).map((m, i) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.6, color: 'var(--color-text-muted)' }}>
                                                    <span>{m.name}:</span>
                                                    <span>{(m.ai_probability * 100).toFixed(0)}% AI</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ marginBottom: '1.5rem', opacity: 0.5, fontStyle: 'italic' }}>
                                        No image provided for analysis.
                                    </div>
                                )}

                                {/* Behavioral Analysis */}
                                {result.behavioral_analysis && (
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                                            <Activity size={18} color="var(--color-primary)" /> Customer Behavior
                                        </h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--color-card)', padding: '1rem', borderRadius: '8px' }}>
                                            <div>
                                                <div style={{ fontSize: '0.8rem', opacity: 0.7, color: 'var(--color-text-muted)' }}>History Score</div>
                                                <div style={{ fontWeight: 'bold', color: 'var(--color-text)' }}>{result.behavioral_analysis.fraud_history_score}/100</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.8rem', opacity: 0.7, color: 'var(--color-text-muted)' }}>Return Freq</div>
                                                <div style={{ fontWeight: 'bold', color: 'var(--color-text)' }}>{result.behavioral_analysis.return_frequency_score}/100</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* AI Analyst Report */}
                                <div style={{ background: 'var(--color-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--color-primary)' }}>
                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0, color: 'var(--color-primary)' }}>
                                        <CheckCircle size={18} /> AI Investigation Summary
                                    </h4>
                                    <p style={{ lineHeight: 1.6, fontSize: '0.95rem', opacity: 0.9, color: 'var(--color-text)' }}>
                                        {result.ai_explanation || "AI Analysis unavailable."}
                                    </p>
                                </div>

                                <div style={{ textAlign: 'center', marginTop: '2rem', opacity: 0.5, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                    Report ID: {result.stored_id}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
