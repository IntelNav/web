"use client";

import { useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";

/* Interactive chain explorer.
 *
 * The widget visualises one Qwen-class model (24 blocks) split into
 * four ranges, one per peer. Click a peer to switch its tier. Drag
 * a divider to reassign layer ranges between adjacent peers.
 * Below the bar, three numbers update live: first-token latency,
 * steady-state tokens/sec, and which peer caps the throughput.
 */

const N_BLOCKS = 24;
const COMPUTE_PER_BLOCK_MS = 3.2;

type Tier = "lan" | "cont" | "wan";
const TIERS: Record<Tier, { label: string; rtt: number }> = {
    lan:  { label: "LAN",       rtt: 4   },
    cont: { label: "Continent", rtt: 32  },
    wan:  { label: "WAN",       rtt: 110 },
};
const NEXT_TIER: Record<Tier, Tier> = { lan: "cont", cont: "wan", wan: "lan" };

type Peer = { id: string; name: string; tier: Tier };
type ChainStats = {
    ranges:         ReadonlyArray<readonly [number, number]>;
    peerCompute:    number[];
    hopRtts:        number[];
    networkMs:      number;
    computeMs:      number;
    firstTokenMs:   number;
    bottleneckIdx:  number;
    tokPerSec:      number;
};
const INITIAL_PEERS: Peer[] = [
    { id: "you", name: "you",    tier: "lan"  },
    { id: "a",   name: "peer A", tier: "lan"  },
    { id: "b",   name: "peer B", tier: "cont" },
    { id: "c",   name: "tail",   tier: "wan"  },
];
const INITIAL_SPLITS = [6, 12, 18];   // four ranges: [0,6) [6,12) [12,18) [18,24)

/* Indigo gradient that saturates from "you" to "tail" so the eye
 * follows hidden state from "you" (lightest) to "tail" (deepest). */
const PEER_COLORS = ["#a5b4fc", "#818cf8", "#6366f1", "#4338ca"];

export function InteractiveChain() {
    const [peers, setPeers]   = useState(INITIAL_PEERS);
    const [splits, setSplits] = useState(INITIAL_SPLITS);
    const [dragIdx, setDragIdx] = useState<number | null>(null);
    const barRef = useRef<HTMLDivElement>(null);

    /* Derive everything from (peers, splits). */
    const stats = useMemo<ChainStats>(() => {
        const ranges = peers.map((_, i) => {
            const start = i === 0 ? 0 : splits[i - 1];
            const end   = i === splits.length ? N_BLOCKS : splits[i];
            return [start, end] as const;
        });
        const peerCompute = ranges.map(([s, e]) => (e - s) * COMPUTE_PER_BLOCK_MS);
        const hopRtts = peers.slice(1).map((p, i) =>
            Math.max(TIERS[peers[i].tier].rtt, TIERS[p.tier].rtt));
        const networkMs    = hopRtts.reduce((a, b) => a + b, 0);
        const computeMs    = peerCompute.reduce((a, b) => a + b, 0);
        const firstTokenMs = networkMs + computeMs;
        /* Per-peer "stage time" = compute + outbound RTT. The peer
         * with the largest stage time caps steady-state throughput. */
        const stageMs = peers.map((_, i) => peerCompute[i] + (hopRtts[i] ?? 0));
        const bottleneckIdx = stageMs.indexOf(Math.max(...stageMs));
        const tokPerSec = 1000 / stageMs[bottleneckIdx];
        return { ranges, peerCompute, hopRtts, networkMs, computeMs,
                 firstTokenMs, bottleneckIdx, tokPerSec };
    }, [peers, splits]);

    const cycleTier = (id: string) => {
        if (dragIdx !== null) return;
        setPeers((ps) => ps.map((p) =>
            p.id === id ? { ...p, tier: NEXT_TIER[p.tier] } : p));
    };

    /* Drag a divider. Constraint: each peer keeps ≥ 1 block. */
    const onDividerDown = (i: number) => (e: React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragIdx(i);
        (e.currentTarget as Element).setPointerCapture(e.pointerId);
    };
    const onDividerMove = (i: number) => (e: React.PointerEvent) => {
        if (dragIdx !== i || !barRef.current) return;
        const rect = barRef.current.getBoundingClientRect();
        const blockX = Math.round(((e.clientX - rect.left) / rect.width) * N_BLOCKS);
        const min = i === 0                  ? 1            : splits[i - 1] + 1;
        const max = i === splits.length - 1  ? N_BLOCKS - 1 : splits[i + 1] - 1;
        const next = Math.max(min, Math.min(max, blockX));
        setSplits((s) => s[i] === next ? s : s.map((v, k) => k === i ? next : v));
    };
    const onDividerUp = (e: React.PointerEvent) => {
        (e.currentTarget as Element).releasePointerCapture(e.pointerId);
        setDragIdx(null);
    };

    return (
        <div className="space-y-5">
            {/* Layer-stack bar */}
            <div className="select-none">
                <div className="flex justify-between text-[10px] font-mono mb-2"
                     style={{ color: "var(--faint)" }}>
                    <span>layer 0</span>
                    <span>{N_BLOCKS} (head)</span>
                </div>

                <div ref={barRef} className="relative" style={{ height: 88 }}>
                    {/* The bar itself: four colored sections, click to flip tier. */}
                    <div className="flex w-full overflow-hidden rounded-xl"
                         style={{ height: 88, border: "1px solid var(--line)" }}>
                        {peers.map((p, i) => {
                            const [s, e] = stats.ranges[i];
                            const w = ((e - s) / N_BLOCKS) * 100;
                            const isBottleneck = i === stats.bottleneckIdx;
                            return (
                                <button
                                    key={p.id}
                                    onClick={() => cycleTier(p.id)}
                                    aria-label={`${p.name}: layers ${s} to ${e}, ${TIERS[p.tier].label}. Click to change tier.`}
                                    className="relative flex flex-col justify-center items-center text-center cursor-pointer transition-[filter,opacity] hover:brightness-110"
                                    style={{
                                        width: `${w}%`,
                                        minWidth: 0,
                                        background: PEER_COLORS[i],
                                        color: "#fff",
                                        boxShadow: isBottleneck
                                            ? "inset 0 0 0 2px rgba(255,255,255,0.85), inset 0 0 0 4px rgba(0,0,0,0.15)"
                                            : "none",
                                    }}
                                >
                                    {/* Subtle layer ticks: one faint line per block boundary inside this peer. */}
                                    <LayerTicks count={e - s} />

                                    <span className="relative font-serif text-[15px] sm:text-[17px] truncate w-full px-2 leading-tight">
                                        {p.name}
                                    </span>
                                    <span className="relative mt-1 font-mono text-[10px] tracking-[0.12em] uppercase opacity-90 truncate w-full px-2">
                                        {s}..{e} · {TIERS[p.tier].label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Draggable dividers, overlaid at the boundaries. */}
                    {splits.map((sx, i) => (
                        <div
                            key={i}
                            onPointerDown={onDividerDown(i)}
                            onPointerMove={onDividerMove(i)}
                            onPointerUp={onDividerUp}
                            onPointerCancel={onDividerUp}
                            role="separator"
                            aria-label={`Boundary at layer ${sx}. Drag to re-slice.`}
                            aria-valuenow={sx}
                            aria-valuemin={i === 0 ? 1 : splits[i - 1] + 1}
                            aria-valuemax={i === splits.length - 1 ? N_BLOCKS - 1 : splits[i + 1] - 1}
                            className="absolute top-0 -translate-x-1/2 cursor-ew-resize touch-none flex items-center justify-center"
                            style={{
                                left: `${(sx / N_BLOCKS) * 100}%`,
                                width: 22,
                                height: 88,
                            }}
                        >
                            <div className="absolute h-full transition-[width,background]"
                                 style={{
                                     width:      dragIdx === i ? 4 : 2,
                                     background: dragIdx === i ? "var(--accent)" : "rgba(255,255,255,0.6)",
                                 }}
                            />
                            <div className="rounded-full transition-[width,height,border-color,box-shadow]"
                                 style={{
                                     width:        dragIdx === i ? 18 : 14,
                                     height:       dragIdx === i ? 18 : 14,
                                     background:   "var(--bg)",
                                     border:       `2px solid ${dragIdx === i ? "var(--accent)" : "var(--line-2)"}`,
                                     boxShadow:    dragIdx === i
                                         ? "0 0 0 4px rgba(99, 102, 241, 0.18)"
                                         : "0 1px 4px rgba(0, 0, 0, 0.18)",
                                     position:     "relative",
                                 }}
                            />
                        </div>
                    ))}
                </div>

                <p className="mt-3 text-xs font-mono" style={{ color: "var(--faint)" }}>
                    click a peer to flip its tier · drag a divider to re-slice the model
                </p>
            </div>

            {/* One-sentence readout */}
            <Readout stats={stats} peers={peers} />
        </div>
    );
}

/* Faint vertical hairlines marking each block boundary inside a peer's
 * range. Makes layer counts visible without crowding the label. */
function LayerTicks({ count }: { count: number }) {
    if (count <= 1) return null;
    const ticks = Array.from({ length: count - 1 }, (_, i) => (i + 1) / count);
    return (
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
            {ticks.map((p, i) => (
                <div key={i} className="absolute top-1 bottom-1"
                     style={{
                         left: `${p * 100}%`,
                         width: 1,
                         background: "rgba(255, 255, 255, 0.16)",
                     }}
                />
            ))}
        </div>
    );
}

function Readout({
    stats, peers,
}: {
    stats: ChainStats;
    peers: Peer[];
}) {
    const bn = peers[stats.bottleneckIdx];
    return (
        <div
            className="rounded-2xl px-5 py-4 grid sm:grid-cols-[1fr_1fr_auto] gap-x-6 gap-y-3 items-baseline"
            style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
        >
            <Metric
                label="Time to first token"
                value={`${stats.firstTokenMs.toFixed(0)} ms`}
                hint={`${stats.networkMs.toFixed(0)} ms wire + ${stats.computeMs.toFixed(0)} ms compute`}
            />
            <Metric
                label="Steady-state throughput"
                value={`${stats.tokPerSec.toFixed(1)} tok/s`}
                hint={`limited by ${bn.name}`}
            />
            <div>
                <div className="text-[10px] tracking-[0.18em] uppercase font-mono mb-1"
                     style={{ color: "var(--muted)" }}>
                    Bottleneck
                </div>
                <div className="font-serif text-[17px] tracking-tight"
                     style={{ color: "var(--strong)" }}>
                    {bn.name}
                </div>
                <div className="text-[12px] mt-0.5" style={{ color: "var(--faint)" }}>
                    {TIERS[bn.tier].label} · {TIERS[bn.tier].rtt} ms RTT
                </div>
            </div>
        </div>
    );
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
    return (
        <div>
            <div className="text-[10px] tracking-[0.18em] uppercase font-mono mb-1"
                 style={{ color: "var(--muted)" }}>
                {label}
            </div>
            <motion.div
                key={value}
                initial={{ opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className="font-serif text-[22px] tracking-tight"
                style={{ color: "var(--accent)" }}
            >
                {value}
            </motion.div>
            <div className="text-[12px] mt-0.5" style={{ color: "var(--faint)" }}>
                {hint}
            </div>
        </div>
    );
}

