"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Hero } from "@/components/Hero";
import { Typewriter } from "@/components/Typewriter";
import { TerminalMock, TerminalLine } from "@/components/TerminalMock";
import { InteractiveChain } from "@/components/InteractiveChain";
import { CopyableShell } from "@/components/CopyableShell";

export default function Home() {
    return (
        <>
            <Hero />
            <Tagline />
            <Sovereignty />
            <LiveDemo />
            <NetworkSection />
            <Features />
            <InstallStrip />
        </>
    );
}

/* The political pitch in one section. Three cards, each a single
 * idea: who can see you, what's on the wire, and why latency
 * isn't the long-term concern. */
function Sovereignty() {
    return (
        <section className="max-w-6xl mx-auto px-6 py-12 sm:py-20 lg:py-28">
            <SectionHeader
                eyebrow="Why decentralized"
                title="A hosted model logs every prompt. A chain doesn't."
                lede={
                    <>
                        When you query a hosted model, the company that
                        runs it sees and stores what you asked. Your code,
                        your medical question, your business plan, your
                        private writing. IntelNav splits the work across
                        volunteer machines: no one peer holds the whole
                        prompt, the wire is real cryptography, and the
                        latency gap shrinks as more people run nodes.
                    </>
                }
            />

            <div className="grid md:grid-cols-3 gap-4">
                <SovCard
                    tag="Threat"
                    title="No single peer sees you whole."
                    body={
                        <>
                            The entry peer decrypts the prompt and runs
                            the front slice. Every peer after it sees
                            only tensors of activations. No published
                            method recovers a prompt from a mid-layer
                            hidden state of a modern transformer. The
                            chain is the privacy boundary, and no party
                            stands on both sides of it.
                        </>
                    }
                />
                <SovCard
                    tag="Crypto"
                    title="Real cryptography on every hop."
                    body={
                        <>
                            Each peer pair speaks Noise XX: ephemeral
                            X25519 for the handshake, AES-256-GCM for
                            bulk traffic, forward secrecy by default.
                            Peers identify themselves by Ed25519
                            public keys, not session tokens. Slice
                            advertisements on the DHT are signed.
                        </>
                    }
                />
                <SovCard
                    tag="Trajectory"
                    title="Slower today. Faster with more nodes."
                    body={
                        <>
                            A four-hop chain costs more round-trips
                            than a hosted call. We won&apos;t paper
                            over it. What changes with population is
                            shorter hops, parallel chains for tail
                            latency, more replicas of popular slices.
                            Tor and BitTorrent both walked this same
                            curve.
                        </>
                    }
                />
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
                <Link
                    href="/sovereignty/"
                    className="px-5 py-3 rounded-full text-[15px] font-medium transition-all hover:scale-[1.03]"
                    style={{
                        background: "var(--accent)",
                        color: "#ffffff",
                        boxShadow: "0 8px 24px -8px rgba(99, 102, 241, 0.55)",
                    }}
                >
                    The full threat model →
                </Link>
                <Link
                    href="/how-it-works/"
                    className="px-5 py-3 rounded-full text-[15px] font-medium"
                    style={{
                        background: "transparent",
                        color: "var(--strong)",
                        border: "1px solid var(--line-2)",
                    }}
                >
                    How it works
                </Link>
            </div>
        </section>
    );
}

function SovCard({
    tag, title, body,
}: {
    tag: string;
    title: string;
    body: React.ReactNode;
}) {
    return (
        <motion.div
            initial={{ y: 16, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl p-6"
            style={{
                background: "var(--panel)",
                border: "1px solid var(--line)",
            }}
        >
            <p className="text-xs tracking-[0.2em] uppercase mb-3 font-mono"
               style={{ color: "var(--accent)" }}>
                {tag}
            </p>
            <h3 className="font-serif text-xl mb-3 tracking-tight leading-snug"
                style={{ color: "var(--strong)" }}>
                {title}
            </h3>
            <p className="leading-relaxed" style={{ color: "var(--muted)" }}>
                {body}
            </p>
        </motion.div>
    );
}

/* ────────────────────────────────────────────────────────────────── */
/* A single declarative line that expands the hero, doesn't restate.
   Anti-platform / anti-data-center stance, framed in plain words. */
function Tagline() {
    return (
        <section className="max-w-4xl mx-auto px-6 py-16 sm:py-28 lg:py-40 text-center">
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.15] tracking-tight"
                style={{ color: "var(--strong)" }}
            >
                No data centers. No moats. A model that runs on
                {" "}
                <em className="italic" style={{ color: "var(--accent)" }}>everyone&apos;s hardware</em>
                {" "}
                or nobody&apos;s.
            </motion.p>
        </section>
    );
}

/* ────────────────────────────────────────────────────────────────── */

function LiveDemo() {
    return (
        <section className="relative max-w-6xl mx-auto px-6 py-12 sm:py-20 lg:py-28">
            <SectionHeader
                eyebrow="Two binaries, one chain"
                title="Chat from one terminal. Host from another."
                lede={
                    <>
                        <code>intelnav</code> is the chat client.{" "}
                        <code>intelnav-node</code> is the host daemon.
                        They share an identity and a models directory,
                        but run as separate processes; closing the chat
                        does not take your hosted slices offline.
                    </>
                }
            />

            <div className="grid lg:grid-cols-2 gap-6">
                <TerminalMock title="user@host ~ — intelnav">
                    <TerminalLine tag="sys" tone="muted">
                        Welcome to intelnav 0.1.0 · proto v1.
                    </TerminalLine>
                    <TerminalLine tag="sys" tone="muted">
                        peer 12D3KooW…uizeh reading the DHT.
                    </TerminalLine>
                    <div className="h-2" />
                    <TerminalLine tag="you" tone="accent">
                        write a rust function that reverses a string
                    </TerminalLine>
                    <div className="h-2" />
                    <TerminalLine tag="qwen">
                        <Typewriter
                            text={`fn reverse(s: &str) -> String {\n    s.chars().rev().collect()\n}`}
                            delay={26}
                        />
                    </TerminalLine>
                </TerminalMock>

                <TerminalMock title="user@host ~ — intelnav-node" delay={0.15}>
                    <TerminalLine tag="INFO" tone="success">
                        libp2p node up · /ip4/0.0.0.0/tcp/4001
                    </TerminalLine>
                    <TerminalLine tag="INFO" tone="success">
                        DHT announces published n=2
                    </TerminalLine>
                    <TerminalLine tag="INFO" tone="muted">
                        bootstrap: dialed seed1.intelnav.net:4001
                    </TerminalLine>
                    <div className="h-2" />
                    <TerminalLine tag="peer" tone="accent">
                        accepted chain · cid=AEaibo2n…  layers [0..7)
                    </TerminalLine>
                    <TerminalLine tag="peer" tone="muted">
                        forward 12 → 24 (28 ms)
                    </TerminalLine>
                    <TerminalLine tag="peer" tone="muted">
                        forward 24 → 48 (29 ms)
                    </TerminalLine>
                    <TerminalLine tag="peer" tone="muted">
                        <Typewriter
                            text={[
                                "forward 48 → 96 (28 ms)",
                                "forward 96 → 144 (30 ms)",
                                "forward 144 → 192 (29 ms)",
                                "forward 192 → 240 (28 ms)",
                            ]}
                            delay={20}
                            pause={1400}
                        />
                    </TerminalLine>
                </TerminalMock>
            </div>
        </section>
    );
}

/* ────────────────────────────────────────────────────────────────── */

function NetworkSection() {
    return (
        <section id="chain" className="max-w-6xl mx-auto px-6 py-12 sm:py-20 lg:py-28">
            <SectionHeader
                eyebrow="Try it"
                title="A model is a chain of layers. So is the network."
                lede={
                    <>
                        The bar below is one Qwen-class model: 24
                        transformer blocks, partitioned across four
                        peers. Click a peer to switch its connection
                        tier. Drag a divider to reassign which layers
                        each peer owns. Latency and throughput recompute
                        as you go, so the tradeoff stays visible: a
                        bigger slice means more compute on that peer; a
                        longer chain means more network hops.
                    </>
                }
            />
            <InteractiveChain />
        </section>
    );
}

/* ────────────────────────────────────────────────────────────────── */

function Features() {
    return (
        <section className="max-w-6xl mx-auto px-6 py-12 sm:py-20 lg:py-24">
            <SectionHeader
                eyebrow="Architecture"
                title="Built so the cost of joining stays small."
                lede={null}
            />
            <div className="grid md:grid-cols-2 gap-4">
                {features.map((f, i) => (
                    <FeatureCard key={f.title} feature={f} delay={i * 0.06} />
                ))}
            </div>
        </section>
    );
}

function FeatureCard({
    feature,
    delay,
}: {
    feature: { title: string; body: string; tag: string };
    delay: number;
}) {
    return (
        <motion.div
            initial={{ y: 16, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -2 }}
            className="rounded-2xl p-6 transition-colors group"
            style={{
                background: "var(--panel)",
                border: "1px solid var(--line)",
            }}
        >
            <p
                className="text-xs tracking-[0.2em] uppercase mb-3 font-mono transition-colors"
                style={{ color: "var(--accent)" }}
            >
                {feature.tag}
            </p>
            <h3
                className="font-serif text-xl mb-2 tracking-tight"
                style={{ color: "var(--strong)" }}
            >
                {feature.title}
            </h3>
            <p style={{ color: "var(--muted)" }}>{feature.body}</p>
        </motion.div>
    );
}

const features = [
    {
        tag: "01",
        title: "Pipeline-parallel",
        body: "Each peer owns a contiguous layer range. Hidden states travel through every hop in turn, and the head samples a token at the end.",
    },
    {
        tag: "02",
        title: "Kademlia DHT",
        body: "Provider records advertise (model_cid, layer_range). The chat client fans out per-range lookups and assembles a chain on demand.",
    },
    {
        tag: "03",
        title: "Mandatory contribution",
        body: "Every peer hosts a slice or runs as a DHT relay. There is no plain reader mode; the network is what its participants put in.",
    },
    {
        tag: "04",
        title: "Two binaries",
        body: "intelnav drives the chat. intelnav-node hosts the slices. Closing the chat client leaves your hosted slices online.",
    },
];

/* ────────────────────────────────────────────────────────────────── */

function InstallStrip() {
    return (
        <section className="relative max-w-6xl mx-auto px-6 py-10 my-6 sm:py-16 sm:my-10 lg:py-20 lg:my-16">
            <div
                className="rounded-3xl px-5 py-12 sm:px-12 sm:py-20 lg:py-24 text-center relative overflow-hidden"
                style={{
                    background: "var(--panel)",
                    border: "1px solid var(--line)",
                }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 -z-10 grid-bg"
                    style={{ opacity: 0.6 }}
                />
                <h2
                    className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight max-w-2xl mx-auto"
                    style={{ color: "var(--strong)" }}
                >
                    Three lines on Linux. Pick a slice. Chat.
                </h2>
                <div className="mt-10 mx-auto max-w-xl flex justify-center">
                    <CopyableShell text="curl -fsSL https://intelnav.net/install.sh | sh" />
                </div>
                <p className="mt-4 text-sm font-mono" style={{ color: "var(--faint)" }}>
                    then <code style={{ color: "var(--strong)" }}>intelnav</code>{" "}
                    →{" "}
                    <code style={{ color: "var(--accent)" }}>/models</code>{" "}
                    → press <code style={{ color: "var(--strong)" }}>c</code>{" "}
                    on a row to host.
                </p>
                <div className="mt-10 flex flex-wrap justify-center gap-3">
                    <Link
                        href="/install/"
                        className="px-5 py-3 rounded-full text-[15px] font-medium transition-all hover:scale-[1.03]"
                        style={{
                            background: "var(--accent)",
                            color: "#ffffff",
                            boxShadow: "0 8px 24px -8px rgba(99, 102, 241, 0.55)",
                        }}
                    >
                        Full install guide
                    </Link>
                    <a
                        href="https://github.com/IntelNav/intelnav"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-3 rounded-full text-[15px] font-medium"
                        style={{
                            background: "transparent",
                            color: "var(--strong)",
                            border: "1px solid var(--line-2)",
                        }}
                    >
                        Source on GitHub →
                    </a>
                </div>
            </div>
        </section>
    );
}

/* ────────────────────────────────────────────────────────────────── */

function SectionHeader({
    eyebrow,
    title,
    lede,
}: {
    eyebrow: string;
    title: string;
    lede: React.ReactNode;
}) {
    return (
        <motion.div
            initial={{ y: 14, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl mb-8 sm:mb-12"
        >
            <p
                className="text-[12px] tracking-[0.2em] uppercase mb-4 font-mono"
                style={{ color: "var(--accent)" }}
            >
                {eyebrow}
            </p>
            <h2
                className="font-serif text-3xl sm:text-4xl leading-tight tracking-tight"
                style={{ color: "var(--strong)" }}
            >
                {title}
            </h2>
            {lede && (
                <p className="mt-4 text-lg leading-relaxed" style={{ color: "var(--muted)" }}>
                    {lede}
                </p>
            )}
        </motion.div>
    );
}
