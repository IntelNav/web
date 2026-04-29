"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const links = [
    { href: "/sovereignty/",  label: "Sovereignty" },
    { href: "/how-it-works/", label: "How it works" },
    { href: "/demo/",         label: "Demo" },
    { href: "/install/",      label: "Install" },
    { href: "/docs/",         label: "Docs" },
    { href: "/community/",    label: "Community" },
];

export function Nav() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    /* Auto-close on navigation. The drawer is `position: fixed` and
     * doesn't unmount across route changes on its own. */
    useEffect(() => { setOpen(false); }, [pathname]);

    /* Lock body scroll while the drawer is open. */
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev; };
    }, [open]);

    /* Close on Escape. */
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    return (
        <motion.header
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="sticky top-0 z-50"
            style={{
                background: "color-mix(in srgb, var(--bg) 70%, transparent)",
                borderBottom: "1px solid var(--line)",
                backdropFilter: "blur(14px) saturate(180%)",
                WebkitBackdropFilter: "blur(14px) saturate(180%)",
            }}
        >
            <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-8">
                <Link
                    href="/"
                    className="font-serif text-[20px] tracking-tight transition-opacity hover:opacity-80"
                    style={{ color: "var(--strong)" }}
                >
                    IntelNav
                </Link>

                {/* Desktop links */}
                <ul className="hidden md:flex gap-6 text-[14px]" style={{ color: "var(--muted)" }}>
                    {links.map((l) => (
                        <li key={l.href}>
                            <Link
                                href={l.href}
                                className="link-sweep transition-colors hover:text-[var(--strong)]"
                            >
                                {l.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="flex-1" />

                <a
                    href="https://github.com/IntelNav/intelnav"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm px-3.5 py-1.5 rounded-full transition-all hover:scale-[1.03]"
                    style={{
                        color: "var(--strong)",
                        background: "var(--panel)",
                        border: "1px solid var(--line)",
                    }}
                >
                    GitHub →
                </a>

                {/* Hamburger — phones + small tablets */}
                <button
                    type="button"
                    aria-label={open ? "Close menu" : "Open menu"}
                    aria-expanded={open}
                    aria-controls="mobile-nav"
                    onClick={() => setOpen((v) => !v)}
                    className="md:hidden -mr-1 ml-1 w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                    style={{
                        background: open ? "var(--panel-2)" : "transparent",
                        border: "1px solid var(--line)",
                        color: "var(--strong)",
                    }}
                >
                    <Hamburger open={open} />
                </button>
            </nav>

            {/* Mobile drawer — slides down below the nav bar.
             * `id` matches `aria-controls` on the trigger so screen
             * readers announce the relationship. */}
            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            key="scrim"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            onClick={() => setOpen(false)}
                            aria-hidden
                            className="md:hidden fixed inset-0 top-16 z-40"
                            style={{ background: "rgba(0, 0, 0, 0.32)" }}
                        />
                        <motion.div
                            id="mobile-nav"
                            key="drawer"
                            initial={{ y: -8, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -8, opacity: 0 }}
                            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                            className="md:hidden absolute left-0 right-0 top-16 z-40"
                            style={{
                                background: "var(--bg)",
                                borderBottom: "1px solid var(--line)",
                            }}
                        >
                            <ul className="max-w-6xl mx-auto px-4 py-3 flex flex-col">
                                {links.map((l) => (
                                    <li key={l.href}>
                                        <Link
                                            href={l.href}
                                            onClick={() => setOpen(false)}
                                            className="block px-3 py-3 rounded-lg text-[15px] transition-colors hover:bg-[var(--panel-2)]"
                                            style={{
                                                color: pathname === l.href ? "var(--accent)" : "var(--strong)",
                                            }}
                                        >
                                            {l.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.header>
    );
}

/* Two-bar → X morph on toggle. Plain SVG, no library. */
function Hamburger({ open }: { open: boolean }) {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
            <motion.line
                x1="3" x2="15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
                animate={open ? { y1: 9, y2: 9, rotate: 45 } : { y1: 6, y2: 6, rotate: 0 }}
                transition={{ duration: 0.18 }}
                style={{ originX: "9px", originY: "9px" }}
            />
            <motion.line
                x1="3" x2="15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
                animate={open ? { y1: 9, y2: 9, rotate: -45 } : { y1: 12, y2: 12, rotate: 0 }}
                transition={{ duration: 0.18 }}
                style={{ originX: "9px", originY: "9px" }}
            />
        </svg>
    );
}
