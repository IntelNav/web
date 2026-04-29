import Link from "next/link";
import { AsciinemaPlayer } from "@/components/AsciinemaPlayer";
import { CopyableShell } from "@/components/CopyableShell";

export const metadata = { title: "Demo" };

export default function Demo() {
    return (
        <article className="max-w-4xl mx-auto px-6 py-16 space-y-20">
            <header>
                <p className="text-sm tracking-[0.2em] uppercase mb-3 font-mono"
                   style={{ color: "var(--accent)" }}>
                    Live demo
                </p>
                <h1 className="font-serif text-4xl sm:text-5xl leading-tight tracking-tight"
                    style={{ color: "var(--strong)" }}>
                    A real chain, three peer daemons, one prompt.
                </h1>
                <p className="mt-4 text-lg" style={{ color: "var(--muted)" }}>
                    The interesting part of IntelNav isn&apos;t the chat
                    client. It&apos;s the <em>chain</em>: a transformer split
                    across multiple machines, each holding a contiguous range
                    of layers. Below, three <code>intelnav-node</code> daemons
                    cover layers 6..24 of Qwen 2.5 · 0.5B. The chat client
                    runs layers 0..6 locally and forwards through them.
                </p>
            </header>

            <section className="space-y-4">
                <p className="text-[12px] tracking-[0.2em] uppercase font-mono"
                   style={{ color: "var(--accent)" }}>
                    The chain
                </p>
                <AsciinemaPlayer src="/swarm.cast" cols={130} rows={38} speed={1.4} />
                <p className="mt-3 text-sm font-mono" style={{ color: "var(--faint)" }}>
                    asciicast · ~80s · loops automatically · driver layers 0..6 +
                    peers 6..12 / 12..18 / 18..24
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="font-serif text-2xl tracking-tight"
                    style={{ color: "var(--strong)" }}>
                    Run the same demo on your machine
                </h2>
                <p style={{ color: "var(--muted)" }}>
                    The recording above is one-line reproducible. Build the
                    binaries, run <code>local-swarm.sh setup</code> to prepare
                    the sandbox, <code>start</code> to spawn the three daemons,
                    <code>ask</code> to drive a prompt through the chain.
                </p>
                <CopyableShell text="bash scripts/local-swarm.sh setup && bash scripts/local-swarm.sh start && bash scripts/local-swarm.sh ask 'what is 17 squared?'" />
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                    The script lives at{" "}
                    <a href="https://github.com/IntelNav/intelnav/blob/main/scripts/local-swarm.sh"
                       target="_blank" rel="noopener noreferrer"
                       style={{ color: "var(--accent)" }}>
                        scripts/local-swarm.sh
                    </a>
                    . Every wire is the real protocol — the &ldquo;sandbox&rdquo;
                    is just the three peers running on the same box. Replace
                    the loopback addresses with real hosts and you have a
                    multi-machine swarm.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="font-serif text-2xl tracking-tight"
                    style={{ color: "var(--strong)" }}>
                    What you&apos;re looking at
                </h2>
                <ol className="space-y-3 list-decimal pl-5"
                    style={{ color: "var(--fg)" }}>
                    <li>
                        <code>local-swarm.sh setup</code> — writes three peer
                        directories under <code>/tmp/intelnav-swarm/peer-{`{a,b,c}`}/</code>,
                        each with its own config and a{" "}
                        <code>kept_ranges.json</code> sidecar declaring which
                        layer range it owns.
                    </li>
                    <li>
                        <code>start</code> — spawns three{" "}
                        <code>intelnav-node</code> processes on ports 17717,
                        17718, 17719. Each binds libp2p, wires up the control
                        RPC, and starts a forward listener for chain
                        sessions on its slice.
                    </li>
                    <li>
                        <code>ask</code> — runs <code>intelnav --mode network
                        ask</code> with a hardcoded <code>peers</code> list
                        (no DHT lookup needed for the sandbox). The chat
                        client loads the front slice (layers 0..6) locally,
                        opens TCP sessions to each peer, runs the chain.
                        Hidden states stream through every hop; the head
                        samples a token; the response comes back.
                    </li>
                    <li>
                        Tokens stream back. (Note: the demo uses Qwen 2.5 ·
                        0.5B because it&apos;s the smallest viable model —
                        its math accuracy is not guaranteed. The
                        infrastructure is what we&apos;re proving.)
                    </li>
                    <li>
                        <code>stop</code> — sends SIGTERM. The daemons drain
                        any in-flight chains (none here) and exit cleanly.
                    </li>
                </ol>
            </section>

            {/* Secondary cast: install / first-run flow as supporting evidence. */}
            <section className="space-y-4 pt-12"
                     style={{ borderTop: "1px solid var(--line)" }}>
                <p className="text-[12px] tracking-[0.2em] uppercase font-mono"
                   style={{ color: "var(--accent)" }}>
                    The first-run UX
                </p>
                <h2 className="font-serif text-2xl tracking-tight"
                    style={{ color: "var(--strong)" }}>
                    Fresh install, end to end.
                </h2>
                <p style={{ color: "var(--muted)" }}>
                    For completeness — what installing IntelNav from scratch
                    looks like before any of the network features matter.
                    Auto-config, contribution gate, /models picker, real
                    download from HuggingFace, real prompt.
                </p>
                <AsciinemaPlayer src="/demo.cast" cols={130} rows={38} speed={1.6} />
                <p className="mt-3 text-sm font-mono" style={{ color: "var(--faint)" }}>
                    asciicast · ~140s real time · loops automatically
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="font-serif text-2xl tracking-tight"
                    style={{ color: "var(--strong)" }}>
                    Try it yourself
                </h2>
                <div className="flex flex-wrap gap-3 mt-2">
                    <Link
                        href="/install/"
                        className="px-5 py-3 rounded-full text-[15px] font-medium transition-all hover:scale-[1.03]"
                        style={{
                            background: "var(--accent)",
                            color: "#ffffff",
                            boxShadow: "0 8px 24px -8px rgba(99, 102, 241, 0.55)",
                        }}
                    >
                        Install →
                    </Link>
                    <Link
                        href="/#chain"
                        className="px-5 py-3 rounded-full text-[15px] font-medium"
                        style={{
                            background: "transparent",
                            color: "var(--strong)",
                            border: "1px solid var(--line-2)",
                        }}
                    >
                        Interactive chain explorer
                    </Link>
                    <a
                        href="https://github.com/IntelNav/intelnav/blob/main/scripts/local-swarm.sh"
                        target="_blank" rel="noopener noreferrer"
                        className="px-5 py-3 rounded-full text-[15px] font-medium"
                        style={{
                            background: "transparent",
                            color: "var(--strong)",
                            border: "1px solid var(--line-2)",
                        }}
                    >
                        local-swarm.sh source →
                    </a>
                </div>
            </section>
        </article>
    );
}
