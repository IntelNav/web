"use client";

import { useEffect, useRef } from "react";

/** Embed an asciinema cast as an interactive terminal player.
 *
 * `asciinema-player` ships its own CSS and a `create()` helper that
 * mounts inside a host element. We dynamic-import both because:
 *   - the CSS is shipped as a side-effect import (`import "...css"`)
 *     and Next + tailwind's `output: 'export'` is happier when CSS
 *     side-effects are scoped to client components.
 *   - the player is fairly heavy (~80 KB); deferring keeps it off
 *     the rest of the site. */
export function AsciinemaPlayer({
    src,
    autoplay = true,
    loop = true,
    speed = 1.4,
    cols = 120,
    rows = 32,
    poster = "npt:0:5",
    theme = "monokai",
}: {
    src: string;
    autoplay?: boolean;
    loop?: boolean;
    /** Playback rate multiplier. Demos read better a hair faster than
     * real-time so the user doesn't lose interest. */
    speed?: number;
    cols?: number;
    rows?: number;
    /** First-frame snapshot. `npt:0:5` shows the frame at 5 s in. */
    poster?: string;
    /** Built-in themes: asciinema · solarized-dark · solarized-light
     * · monokai · tango. Pass `intelnav` for our custom CSS-vars set
     * declared in globals.css. */
    theme?: string;
}) {
    const hostRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let player: { dispose?: () => void } | null = null;
        let cancelled = false;

        (async () => {
            const [{ create }] = await Promise.all([
                import("asciinema-player"),
                // CSS side-effect; client-only.
                import("asciinema-player/dist/bundle/asciinema-player.css"),
            ]);
            if (cancelled || !hostRef.current) return;
            player = create(src, hostRef.current, {
                autoPlay: autoplay,
                loop,
                speed,
                cols,
                rows,
                poster,
                theme,
                fit: "width",
                preload: true,
                idleTimeLimit: 2,
            });
        })();

        return () => {
            cancelled = true;
            try { player?.dispose?.(); } catch { /* */ }
        };
    }, [src, autoplay, loop, speed, cols, rows, poster, theme]);

    return (
        <div
            ref={hostRef}
            className="rounded-xl overflow-hidden"
            style={{
                background: "#0a0a13",
                border: "1px solid var(--line)",
                minHeight: 320,
            }}
        />
    );
}
