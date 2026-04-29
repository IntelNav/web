/** Minimal declarations for `asciinema-player`. The package ships
 * untyped; we only use `create()`, so a hand-rolled module
 * declaration is plenty. */
declare module "asciinema-player" {
    export interface PlayerInstance {
        play():  void;
        pause(): void;
        seek(value: number | string): void;
        getCurrentTime(): number;
        getDuration():    number;
        dispose():        void;
    }

    export interface CreateOptions {
        /** Auto-start playback (default false). */
        autoPlay?:       boolean;
        /** Loop after the last frame. */
        loop?:           boolean | number;
        /** Playback rate multiplier (1 = real-time). */
        speed?:          number;
        /** Initial start time (seconds). */
        startAt?:        number | string;
        /** Override geometry (default = recorded). */
        cols?:           number;
        rows?:           number;
        /** Snapshot frame to show before playback (e.g. "npt:0:5"). */
        poster?:         string;
        /** Built-in theme name or custom token used in CSS. */
        theme?:          string;
        /** "width" | "height" | "both" | "none" — fit policy. */
        fit?:            "width" | "height" | "both" | "none" | false;
        /** Pre-fetch the cast on mount instead of on play. */
        preload?:        boolean;
        /** Idle frames > this many seconds get compressed. */
        idleTimeLimit?:  number;
    }

    export function create(
        src: string | { url: string },
        host: HTMLElement,
        opts?: CreateOptions,
    ): PlayerInstance;
}

declare module "asciinema-player/dist/bundle/asciinema-player.css";
