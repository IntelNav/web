"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ────────────────────────────────────────────────────────────────────
 * Interactive chain explorer.
 *
 * A real-feeling simulator of the IntelNav forward path. Every peer
 * node is clickable; clicking cycles its deployment tier through
 * LAN → Continent → WAN. The packet flying through the chain
 * automatically retimes to match — slow when most hops are WAN, fast
 * when most are LAN — and a stats panel below derives end-to-end
 * latency + tok/s + security posture live.
 *
 * Numbers are realistic but illustrative. They're tuned to convey
 * the *shape* of the trade-off (LAN beats WAN by an order of
 * magnitude on tok/s, security posture is the same regardless), not
 * to be a benchmark.
 * ────────────────────────────────────────────────────────────────── */

type Tier = "lan" | "cont" | "wan";

type Peer = {
    id: string;
    x: number; y: number;
    label: string; sub: string;
    role: "client" | "peer" | "tail";
    tier: Tier;
};

const TIERS: Record<Tier, { label: string; rtt: number; color: string; desc: string }> = {
    lan:  { label: "LAN",       rtt: 5,   color: "#22c55e", desc: "Same network · ~5ms" },
    cont: { label: "Continent", rtt: 50,  color: "#eab308", desc: "Same region · ~50ms" },
    wan:  { label: "WAN",       rtt: 200, color: "#ef4444", desc: "Cross-ocean · ~200ms" },
};

/** Per-hop compute cost (ms). The peer has to actually run a forward
 * pass through its layer slice; this is the baseline irrespective of
 * network tier. Bumped slightly up to keep tok/s honest with what
 * we'd see on consumer GPUs running a 7B-class slice. */
const COMPUTE_PER_HOP_MS = 35;

const INITIAL_PEERS: Peer[] = [
    { id: "client", x: 90,  y: 200, label: "you",    sub: "layers 0..6",   role: "client", tier: "lan" },
    { id: "a",      x: 260, y: 110, label: "peer A", sub: "layers 6..12",  role: "peer",   tier: "lan" },
    { id: "b",      x: 470, y: 80,  label: "peer B", sub: "layers 12..18", role: "peer",   tier: "cont" },
    { id: "c",      x: 680, y: 110, label: "peer C", sub: "layers 18..24", role: "peer",   tier: "cont" },
    { id: "tail",   x: 830, y: 200, label: "peer D", sub: "layers 24..28", role: "tail",   tier: "lan" },
];

const EDGES: [string, string][] = [
    ["client", "a"], ["a", "b"], ["b", "c"], ["c", "tail"],
];

const TIER_ORDER: Tier[] = ["lan", "cont", "wan"];
const cycle = (t: Tier): Tier => TIER_ORDER[(TIER_ORDER.indexOf(t) + 1) % TIER_ORDER.length];

/** Edge RTT is the worst tier of either endpoint: a packet spends
 * its time on the slowest link, not an average. */
function edgeRtt(a: Peer, b: Peer): number {
    return Math.max(TIERS[a.tier].rtt, TIERS[b.tier].rtt);
}

export function InteractiveChain() {
    const [peers, setPeers] = useState<Peer[]>(INITIAL_PEERS);
    const [showSecurity, setShowSecurity] = useState(false);

    const byId = useMemo(
        () => Object.fromEntries(peers.map((p) => [p.id, p])),
        [peers]
    );

    /** Sum of RTTs across the chain. Each hop = one RTT (request +
     * response on a single TCP session). The tail then has to send
     * the token back upstream — symmetric, so we double the chain
     * length for prompt-to-token latency. */
    const stats = useMemo(() => {
        const hopRtts = EDGES.map(([from, to]) => edgeRtt(byId[from], byId[to]));
        const networkMs = hopRtts.reduce((s, r) => s + r, 0);
        const computeMs = peers.length * COMPUTE_PER_HOP_MS;
        const firstTokenMs = networkMs + computeMs;
        // Steady-state: each subsequent token only re-traverses the
        // chain (no first-time loads). 1000 / firstTokenMs ≈ tok/s.
        const tokPerSec = 1000 / firstTokenMs;
        const worstTier = peers.reduce<Tier>((w, p) => {
            return TIERS[p.tier].rtt > TIERS[w].rtt ? p.tier : w;
        }, "lan");
        return { hopRtts, networkMs, computeMs, firstTokenMs, tokPerSec, worstTier };
    }, [peers, byId]);

    const togglePeerTier = (id: string) => {
        setPeers((prev) =>
            prev.map((p) => (p.id === id ? { ...p, tier: cycle(p.tier) } : p))
        );
    };

    /** Animation duration matched to real RTTs. Capped so the user
     * doesn't have to wait 5 seconds to see a WAN packet land. */
    const packetCycleSec = Math.max(2.4, Math.min(8, stats.firstTokenMs / 250));

    return (
        <div className="space-y-4">
            <div
                className="relative w-full overflow-hidden rounded-2xl"
                style={{
                    background: "var(--panel)",
                    border: "1px solid var(--line)",
                }}
            >
                <svg
                    viewBox="0 0 920 320"
                    className="w-full h-auto block"
                    style={{ color: "var(--muted)" }}
                >
                    <defs>
                        <radialGradient id="ic-packet" cx="50%" cy="50%" r="50%">
                            <stop offset="0%"  stopColor="var(--accent-2)" stopOpacity="1" />
                            <stop offset="60%" stopColor="var(--accent)"   stopOpacity="0.6" />
                            <stop offset="100%" stopColor="var(--accent)"  stopOpacity="0" />
                        </radialGradient>
                    </defs>

                    {/* Edges. Color reflects the dominant tier of the
                      * two endpoints — visual cue for which leg is
                      * the bottleneck. */}
                    {EDGES.map(([from, to], i) => {
                        const a = byId[from], b = byId[to];
                        const tier = TIERS[a.tier].rtt >= TIERS[b.tier].rtt ? a.tier : b.tier;
                        const rtt = stats.hopRtts[i];
                        return (
                            <g key={`${from}-${to}`}>
                                <motion.line
                                    x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                                    stroke={TIERS[tier].color}
                                    strokeOpacity={0.55}
                                    strokeWidth={2}
                                    initial={false}
                                    animate={{ stroke: TIERS[tier].color }}
                                    transition={{ duration: 0.3 }}
                                />
                                {/* RTT badge on each edge. Position
                                  * = midpoint, slightly above the
                                  * line. */}
                                <g transform={`translate(${(a.x + b.x) / 2}, ${(a.y + b.y) / 2 - 14})`}>
                                    <rect
                                        x={-22} y={-9} width={44} height={18} rx={9}
                                        fill="var(--bg)"
                                        stroke={TIERS[tier].color}
                                        strokeOpacity={0.6}
                                    />
                                    <text
                                        x={0} y={4}
                                        textAnchor="middle"
                                        fontSize={10}
                                        fontFamily="var(--font-mono)"
                                        style={{ fill: "var(--strong)" }}
                                    >
                                        {rtt}ms
                                    </text>
                                </g>
                                {/* Security badge — only when the
                                  * overlay is on. */}
                                {showSecurity && (
                                    <g transform={`translate(${(a.x + b.x) / 2}, ${(a.y + b.y) / 2 + 18})`}>
                                        <rect
                                            x={-44} y={-9} width={88} height={18} rx={9}
                                            fill="var(--accent)"
                                            fillOpacity={0.12}
                                            stroke="var(--accent)"
                                            strokeOpacity={0.4}
                                        />
                                        <text
                                            x={0} y={4}
                                            textAnchor="middle"
                                            fontSize={9}
                                            fontFamily="var(--font-mono)"
                                            style={{ fill: "var(--accent)" }}
                                        >
                                            {i === 0 ? "X25519 + Noise XX" : "Noise XX"}
                                        </text>
                                    </g>
                                )}
                            </g>
                        );
                    })}

                    {/* Flowing packet — retimes whenever cycle changes. */}
                    <FlowingPacket
                        peers={peers}
                        edges={EDGES}
                        cycleSec={packetCycleSec}
                    />

                    {/* Peer nodes. */}
                    {peers.map((p) => (
                        <PeerNode
                            key={p.id}
                            peer={p}
                            onClick={() => togglePeerTier(p.id)}
                        />
                    ))}
                </svg>

                <div
                    className="px-5 py-3 text-xs flex flex-wrap gap-x-5 gap-y-2 items-center"
                    style={{
                        borderTop: "1px solid var(--line)",
                        color: "var(--muted)",
                    }}
                >
                    <span style={{ color: "var(--strong)" }}>
                        Click a peer to change its deployment tier.
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: TIERS.lan.color }} />
                        LAN
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: TIERS.cont.color }} />
                        Continent
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: TIERS.wan.color }} />
                        WAN
                    </span>
                    <div className="flex-1" />
                    <button
                        onClick={() => setShowSecurity((v) => !v)}
                        className="text-[12px] px-3 py-1 rounded-full transition-colors"
                        style={{
                            background: showSecurity ? "var(--accent)" : "var(--panel-2)",
                            color: showSecurity ? "#ffffff" : "var(--muted)",
                            border: "1px solid var(--line-2)",
                        }}
                    >
                        {showSecurity ? "✓ Security overlay" : "Show security"}
                    </button>
                    <button
                        onClick={() => setPeers(INITIAL_PEERS)}
                        className="text-[12px] px-3 py-1 rounded-full transition-colors"
                        style={{
                            background: "var(--panel-2)",
                            color: "var(--muted)",
                            border: "1px solid var(--line-2)",
                        }}
                    >
                        Reset
                    </button>
                </div>
            </div>

            <StatsPanel stats={stats} />

            <AnimatePresence>
                {showSecurity && <SecurityPanel />}
            </AnimatePresence>
        </div>
    );
}

/* ────────────────────────────────────────────────────────────────── */

function PeerNode({ peer, onClick }: { peer: Peer; onClick: () => void }) {
    const tier = TIERS[peer.tier];
    const fill =
        peer.role === "client" ? "var(--accent)" :
        peer.role === "tail"   ? "var(--accent-2)" :
                                 "var(--panel-2)";
    const stroke = tier.color;

    return (
        <motion.g
            style={{ cursor: "pointer", transformOrigin: `${peer.x}px ${peer.y}px` }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            onClick={onClick}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
            {/* Pulse halo for client + tail. */}
            {peer.role !== "peer" && (
                <motion.circle
                    cx={peer.x} cy={peer.y} r={28}
                    fill={fill} opacity={0.18}
                    animate={{ r: [26, 36, 26], opacity: [0.25, 0.05, 0.25] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
            )}
            <circle cx={peer.x} cy={peer.y} r={22} fill={fill} stroke={stroke} strokeWidth={2.5} />

            {/* Tier badge — small pill on top-right of the node. */}
            <g transform={`translate(${peer.x + 14}, ${peer.y - 24})`}>
                <rect
                    x={-22} y={-9} width={44} height={18} rx={9}
                    fill={stroke}
                />
                <text
                    x={0} y={4}
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight={700}
                    fontFamily="var(--font-mono)"
                    style={{ fill: "#ffffff" }}
                >
                    {tier.label}
                </text>
            </g>

            <text
                x={peer.x} y={peer.y - 38}
                textAnchor="middle"
                fontSize={13}
                fontWeight={600}
                style={{ fill: "var(--strong)", fontFamily: "var(--font-sans)" }}
            >
                {peer.label}
            </text>
            <text
                x={peer.x} y={peer.y + 38}
                textAnchor="middle"
                fontSize={11}
                style={{ fill: "var(--muted)", fontFamily: "var(--font-mono)" }}
            >
                {peer.sub}
            </text>
        </motion.g>
    );
}

/* ────────────────────────────────────────────────────────────────── */

function FlowingPacket({
    peers, edges, cycleSec,
}: {
    peers: Peer[];
    edges: [string, string][];
    cycleSec: number;
}) {
    const byId = Object.fromEntries(peers.map((p) => [p.id, p]));

    // Build per-segment data + their relative durations weighted by
    // tier RTT so the packet "feels" slow on WAN legs and quick on
    // LAN legs.
    const segments = edges.map(([from, to]) => {
        const a = byId[from], b = byId[to];
        const rtt = edgeRtt(a, b);
        return { ax: a.x, ay: a.y, bx: b.x, by: b.y, weight: rtt };
    });
    const totalWeight = segments.reduce((s, seg) => s + seg.weight, 0);

    // Build keyframes for cx, cy. `times` walks 0 → 1 with breakpoints
    // at each segment boundary, weighted by RTT.
    const xKeys: number[] = [];
    const yKeys: number[] = [];
    const tKeys: number[] = [0];
    let acc = 0;
    segments.forEach((s) => {
        xKeys.push(s.ax);
        yKeys.push(s.ay);
        acc += s.weight;
        tKeys.push(acc / totalWeight);
    });
    const last = segments[segments.length - 1];
    xKeys.push(last.bx);
    yKeys.push(last.by);

    return (
        <motion.circle
            r={11}
            fill="url(#ic-packet)"
            initial={false}
            animate={{ cx: xKeys, cy: yKeys }}
            transition={{
                cx: { duration: cycleSec, repeat: Infinity, ease: "linear", times: tKeys },
                cy: { duration: cycleSec, repeat: Infinity, ease: "linear", times: tKeys },
            }}
        />
    );
}

/* ────────────────────────────────────────────────────────────────── */

function StatsPanel({
    stats,
}: {
    stats: {
        hopRtts: number[];
        networkMs: number;
        computeMs: number;
        firstTokenMs: number;
        tokPerSec: number;
        worstTier: Tier;
    };
}) {
    return (
        <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl"
            style={{
                background: "var(--panel)",
                border: "1px solid var(--line)",
            }}
        >
            <Stat
                label="Network RTT"
                value={`${stats.networkMs.toFixed(0)}ms`}
                hint={`${stats.hopRtts.length} hops`}
            />
            <Stat
                label="Compute"
                value={`${stats.computeMs.toFixed(0)}ms`}
                hint={`${COMPUTE_PER_HOP_MS}ms × ${stats.hopRtts.length + 1} peers`}
            />
            <Stat
                label="Time to first token"
                value={`${stats.firstTokenMs.toFixed(0)}ms`}
                hint="prompt → first token"
                emphasized
            />
            <Stat
                label="Steady-state"
                value={`${stats.tokPerSec.toFixed(1)} tok/s`}
                hint={`bottleneck: ${TIERS[stats.worstTier].label}`}
                emphasized
            />
        </motion.div>
    );
}

function Stat({
    label, value, hint, emphasized = false,
}: {
    label: string; value: string; hint?: string; emphasized?: boolean;
}) {
    return (
        <div>
            <div
                className="text-[11px] tracking-[0.15em] uppercase font-mono mb-1"
                style={{ color: emphasized ? "var(--accent)" : "var(--muted)" }}
            >
                {label}
            </div>
            <motion.div
                key={value}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="font-serif text-2xl tracking-tight"
                style={{ color: "var(--strong)" }}
            >
                {value}
            </motion.div>
            {hint && (
                <div className="text-[12px] mt-0.5" style={{ color: "var(--faint)" }}>
                    {hint}
                </div>
            )}
        </div>
    );
}

/* ────────────────────────────────────────────────────────────────── */

function SecurityPanel() {
    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl p-6 grid md:grid-cols-3 gap-5"
            style={{
                background: "var(--panel)",
                border: "1px solid var(--line)",
            }}
        >
            <SecurityCard
                title="Identity"
                detail="Each peer carries a long-lived Ed25519 keypair. The peer ID is multihash(pubkey)."
            />
            <SecurityCard
                title="Prompt confidentiality"
                detail="Ephemeral X25519 between client and entry peer. The prompt body is AES-256-GCM-encrypted; mid-chain peers see only hidden states."
            />
            <SecurityCard
                title="Transport"
                detail="Every libp2p hop runs Noise XX with the peer's static keypair as long-term identity. RTT and tier don't change the security posture — it's the same crypto end-to-end."
            />
        </motion.div>
    );
}

function SecurityCard({ title, detail }: { title: string; detail: string }) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-2">
                <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "var(--accent)" }}
                />
                <h4 className="font-serif text-base" style={{ color: "var(--strong)" }}>
                    {title}
                </h4>
            </div>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
                {detail}
            </p>
        </div>
    );
}
