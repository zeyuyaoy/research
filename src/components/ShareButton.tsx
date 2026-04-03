"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ShareButtonProps {
    title: string;
    shortUrl: string;
}

let globalOpenPopup: (() => void) | null = null;

export default function ShareButton({ title, shortUrl }: ShareButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
    const [mounted, setMounted] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    const getFullUrl = () => `${window.location.origin}${shortUrl}`;

    const closePopup = () => {
        setIsOpen(false);
        globalOpenPopup = null;
    };

    const openPopup = () => {
        if (globalOpenPopup) {
            globalOpenPopup();
        }
        setIsOpen(true);
        globalOpenPopup = closePopup;
    };

    const togglePopup = () => {
        if (isOpen) {
            closePopup();
        } else {
            openPopup();
        }
    };

    const copyToClipboard = async () => {
        try {
            const fullUrl = getFullUrl();
            await navigator.clipboard.writeText(fullUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    const shareToTwitter = () => {
        const fullUrl = getFullUrl();
        const text = `Check out "${title}": ${fullUrl}`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const shareToLinkedIn = () => {
        const fullUrl = getFullUrl();
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`;
        window.open(url, '_blank');
    };

    const shareToFacebook = () => {
        const fullUrl = getFullUrl();
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
        window.open(url, '_blank');
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const updatePopupPosition = () => {
            const rect = buttonRef.current?.getBoundingClientRect();
            if (!rect) return;

            setPopupPosition({
                top: rect.bottom + 8,
                left: Math.max(8, Math.min(rect.right, window.innerWidth - 8)),
            });
        };

        if (isOpen) {
            updatePopupPosition();
            window.addEventListener("resize", updatePopupPosition);
            window.addEventListener("scroll", updatePopupPosition, true);
        }

        return () => {
            window.removeEventListener("resize", updatePopupPosition);
            window.removeEventListener("scroll", updatePopupPosition, true);
        };
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const targetNode = event.target as Node;
            const clickedButton = buttonRef.current?.contains(targetNode);
            const clickedPopup = popupRef.current?.contains(targetNode);

            if (!clickedButton && !clickedPopup && isOpen) {
                closePopup();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative">
            <motion.button
                ref={buttonRef}
                onClick={togglePopup}
                className="p-2 rounded-full transition-colors"
                style={{
                    backgroundColor: 'transparent',
                    cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Share2 className="w-4 h-4" style={{ color: 'var(--text-color)', opacity: 0.7 }} />
            </motion.button>

            {mounted && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            ref={popupRef}
                            initial={{ opacity: 0, scale: 0.8, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: -10 }}
                            className="rounded-lg shadow-lg p-2 min-w-40"
                            style={{
                                position: 'fixed',
                                top: popupPosition.top,
                                left: popupPosition.left,
                                transform: 'translateX(-100%)',
                                zIndex: 2147483647,
                                backgroundColor: 'var(--card-bg)',
                                borderColor: 'var(--card-border)',
                                border: '1px solid',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                            }}
                        >
                            <motion.button
                                onClick={copyToClipboard}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors"
                                style={{
                                    color: 'var(--text-color)',
                                    backgroundColor: 'transparent',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {copied ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                    <Copy className="w-4 h-4" style={{ color: 'var(--text-color)' }} />
                                )}
                                {copied ? 'Copied!' : 'Copy Link'}
                            </motion.button>

                            <div className="border-t my-1" style={{ borderColor: 'var(--card-border)' }} />

                            <motion.button
                                onClick={shareToTwitter}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors"
                                style={{
                                    color: 'var(--text-color)',
                                    backgroundColor: 'transparent'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <svg
                                    className="w-4 h-4"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    aria-hidden="true"
                                    style={{ color: 'var(--text-color)' }}
                                >
                                    <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.724-.951.564-2.005.974-3.127 1.195-.897-.959-2.178-1.559-3.594-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.025-1.566-.247-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.376 4.6 3.419-1.68 1.318-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.162-.067 2.19 1.394 4.768 2.209 7.548 2.209 9.057 0 14.01-7.502 14.01-14.01 0-.213 0-.425-.015-.636.962-.689 1.8-1.56 2.46-2.548l-.047-.02z" />
                                </svg>
                                Twitter
                            </motion.button>

                            <motion.button
                                onClick={shareToLinkedIn}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors"
                                style={{
                                    color: 'var(--text-color)',
                                    backgroundColor: 'transparent',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <svg
                                    className="w-4 h-4"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    aria-hidden="true"
                                    style={{ color: 'var(--text-color)' }}
                                >
                                    <path d="M20.447 20.452H16.89V14.87c0-1.33-.028-3.041-1.852-3.041-1.854 0-2.136 1.445-2.136 2.944v5.679H9.35V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.368 4.267 5.455v6.286zM5.337 7.433a2.064 2.064 0 1 1 0-4.128 2.064 2.064 0 0 1 0 4.128zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                                LinkedIn
                            </motion.button>

                            <motion.button
                                onClick={shareToFacebook}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors"
                                style={{
                                    color: 'var(--text-color)',
                                    backgroundColor: 'transparent',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <svg
                                    className="w-4 h-4"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    aria-hidden="true"
                                    style={{ color: 'var(--text-color)' }}
                                >
                                    <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.099 4.388 23.094 10.125 24v-8.438H7.078v-3.489h3.047V9.414c0-3.007 1.792-4.669 4.533-4.669 1.313 0 2.686.235 2.686.235v2.953h-1.513c-1.49 0-1.953.931-1.953 1.887v2.253h3.328l-.532 3.489h-2.796V24C19.612 23.094 24 18.099 24 12.073z" />
                                </svg>
                                Facebook
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
