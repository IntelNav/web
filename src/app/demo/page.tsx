import Link from "next/link";
import { AsciinemaPlayer } from "@/components/AsciinemaPlayer";

export const metadata = { title: "Demo" };

export default function Demo() {
    return (
        <article className="max-w-4xl mx-auto px-6 py-16 space-y-14">
            <header>
                <p className="text-sm tracking-[0.2em] uppercase mb-3 font-mono"
                   style={{ color: "var(--accent)" }}>
                    Live demo
                </p>
                <h1 className="font-serif text-4xl sm:text-5xl leading-tight tracking-tight"
                    style={{ color: "var(--strong)" }}>
                    What it actually looks like.
                </h1>
                <p className="mt-4 text-lg" style={{ color: "var(--muted)" }}>
                    A real <code>intelnav</code> session: preflight check,
                    pick a Qwen 0.5B model, run a prompt, watch tokens stream
                    back. No editing — same binary as <Link href="/install/"
                    style={{ color: "var(--accent)" }}>install</Link> ships.
                </p>
            </header>

            <section>
                <AsciinemaPlayer src="/demo.cast" />
                <p className="mt-3 text-sm font-mono" style={{ color: "var(--faint)" }}>
                    asciicast · 25s · loops automatically
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="font-serif text-2xl tracking-tight"
                    style={{ color: "var(--strong)" }}>
                    What works today
                </h2>
                <ul className="space-y-2 list-none pl-0">
                    <Item ok>
                        <strong>Linux</strong> — chat client + host daemon, RX 6600
                        verified for ROCm, CPU + Vulkan + CUDA tarballs ship too.
                    </Item>
                    <Item ok>
                        <strong>Inference end-to-end</strong> — Qwen 2.5 family
                        (0.5B · 1.5B · 3B · 7B-coder), local mode, network-mode
                        chains across multiple peers.
                    </Item>
                    <Item ok>
                        <strong>Bootstrap network</strong> — one seed peer at{" "}
                        <code>seed1.intelnav.net:4001</code>, fetched from a
                        signed JSON manifest in the GitHub release.
                    </Item>
                    <Item ok>
                        <strong>The full UX flow</strong> — auto-config, gate,
                        contribute, drain, systemd lifecycle. No hand-editing
                        config files.
                    </Item>
                    <Item soon>
                        <strong>macOS &amp; Windows</strong> — tarballs build,
                        runtime path WIP. Linux first.
                    </Item>
                    <Item soon>
                        <strong>More seed peers</strong> — single-seed today.
                        Expanding once a few volunteers stand up nodes.
                    </Item>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="font-serif text-2xl tracking-tight"
                    style={{ color: "var(--strong)" }}>
                    Try it yourself
                </h2>
                <p style={{ color: "var(--muted)" }}>
                    The whole stack is open source under Apache-2.0. Clone,
                    build, host a slice — that's what makes it work.
                </p>
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
                    <a
                        href="https://github.com/IntelNav/intelnav"
                        target="_blank" rel="noopener noreferrer"
                        className="px-5 py-3 rounded-full text-[15px] font-medium"
                        style={{
                            background: "transparent",
                            color: "var(--strong)",
                            border: "1px solid var(--line-2)",
                        }}
                    >
                        Source on GitHub →
                    </a>
                    <Link
                        href="/#chain"
                        className="px-5 py-3 rounded-full text-[15px] font-medium"
                        style={{
                            background: "transparent",
                            color: "var(--strong)",
                            border: "1px solid var(--line-2)",
                        }}
                    >
                        Try the chain explorer
                    </Link>
                </div>
            </section>
        </article>
    );
}

function Item({
    children,
    ok = false,
    soon = false,
}: {
    children: React.ReactNode;
    ok?: boolean;
    soon?: boolean;
}) {
    const glyph = ok ? "✓" : soon ? "→" : "·";
    const color = ok ? "var(--accent)" : soon ? "var(--muted)" : "var(--faint)";
    return (
        <li className="flex gap-3" style={{ color: "var(--fg)" }}>
            <span className="shrink-0 w-5 font-mono text-[14px]" style={{ color }}>
                {glyph}
            </span>
            <span>{children}</span>
        </li>
    );
}
