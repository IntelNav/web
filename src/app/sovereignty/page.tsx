import Link from "next/link";

export const metadata = {
    title: "Sovereignty",
    description:
        "Why decentralized AI matters: the threat model, the cryptography, " +
        "and why a network with worse latency today will be faster than the " +
        "datacenter tomorrow.",
};

export default function Sovereignty() {
    return (
        <article className="max-w-3xl mx-auto px-6 py-16 space-y-16">
            <header>
                <p className="text-sm tracking-[0.2em] uppercase mb-3 font-mono"
                   style={{ color: "var(--accent)" }}>
                    Sovereignty
                </p>
                <h1 className="font-serif text-4xl sm:text-5xl leading-tight tracking-tight"
                    style={{ color: "var(--strong)" }}>
                    Why decentralized AI matters.
                </h1>
                <p className="mt-4 text-lg leading-relaxed"
                   style={{ color: "var(--muted)" }}>
                    Centralized inference puts every prompt in the world
                    through the same handful of companies. Code, medical
                    questions, financial plans, drafts of resignation
                    letters, half-formed political opinions, the things you
                    &ldquo;just want to ask before bed.&rdquo; All of it,
                    logged, retrievable, subpoena-able, used to train the
                    next model. This is unprecedented data centralization
                    — larger than search, larger than email, because the
                    queries reveal intent, not just interest.
                </p>
                <p className="mt-4 text-lg leading-relaxed"
                   style={{ color: "var(--muted)" }}>
                    IntelNav is an attempt to give that workload back to
                    its owner. The model isn&apos;t held by anyone. It runs
                    in pieces, on volunteer hardware, with cryptographic
                    boundaries between every hop. It is slower today. It
                    will not be slower forever.
                </p>
            </header>

            <section className="space-y-5">
                <h2 className="font-serif text-3xl tracking-tight"
                    style={{ color: "var(--strong)" }}>
                    The threat model
                </h2>
                <p style={{ color: "var(--fg)" }}>
                    Be specific about what we&apos;re defending against and
                    what we aren&apos;t. Vague privacy claims rot fast.
                </p>

                <h3 className="font-serif text-xl tracking-tight pt-2"
                    style={{ color: "var(--strong)" }}>
                    What no single peer sees
                </h3>
                <p>
                    A chain is at minimum four parties: you, an entry peer
                    (front layers), middle peers (interior layers), a tail
                    peer (the head and sampler). The entry peer sees the
                    plaintext prompt — it has to, to embed it. From layer{" "}
                    <code>k</code> onward, every peer in the chain sees only
                    a hidden-state tensor: a vector of floats produced by
                    the previous layer. That tensor is not text. There is
                    no published method for reconstructing the prompt from
                    a mid-layer hidden state of a modern transformer; the
                    embedding has been folded through{" "}
                    <em>k</em> non-linear blocks.
                </p>
                <p>
                    The chain is therefore the privacy boundary. <em>One</em>{" "}
                    peer sees your prompt. The other peers see opaque math.
                    An adversary who controls all the peers in your chain
                    sees everything; an adversary who controls one of them
                    sees only their slice.
                </p>

                <h3 className="font-serif text-xl tracking-tight pt-2"
                    style={{ color: "var(--strong)" }}>
                    What the wire looks like
                </h3>
                <ul className="space-y-3 list-disc pl-5">
                    <li>
                        <strong style={{ color: "var(--strong)" }}>
                            Noise XX
                        </strong>{" "}
                        between every peer pair: ephemeral X25519 ECDH for
                        the handshake, AES-256-GCM for the bulk transport.
                        Forward secrecy by default — compromising a peer
                        tomorrow doesn&apos;t decrypt a chain it was on
                        yesterday.
                    </li>
                    <li>
                        <strong style={{ color: "var(--strong)" }}>
                            Ed25519
                        </strong>{" "}
                        identities. Peers are addressed by their public
                        key. There are no bearer tokens or session cookies
                        — no centralized issuer that can rotate keys, log
                        sign-ins, or revoke identities behind your back.
                    </li>
                    <li>
                        <strong style={{ color: "var(--strong)" }}>
                            Signed slice advertisements.
                        </strong>{" "}
                        When a peer announces &ldquo;I host layers <em>k..m</em>{" "}
                        of model <em>cid</em>,&rdquo; the DHT record is signed.
                        Routing isn&apos;t a place anyone can lie quietly.
                    </li>
                    <li>
                        <strong style={{ color: "var(--strong)" }}>
                            CBOR-framed messages.
                        </strong>{" "}
                        No JSON, no string parsing on the hot path.
                        Length-prefixed, fixed-schema, easy to audit.
                    </li>
                </ul>

                <h3 className="font-serif text-xl tracking-tight pt-2"
                    style={{ color: "var(--strong)" }}>
                    What we don&apos;t defend against (yet)
                </h3>
                <ul className="space-y-3 list-disc pl-5">
                    <li>
                        <strong style={{ color: "var(--strong)" }}>
                            The entry peer.
                        </strong>{" "}
                        It sees your prompt in plaintext. Choose entry
                        peers you trust, or run your own (the front slice
                        is the cheapest to host).
                    </li>
                    <li>
                        <strong style={{ color: "var(--strong)" }}>
                            Traffic analysis.
                        </strong>{" "}
                        Hidden-state sizes leak the model architecture.
                        Timing leaks token rate. Onion-routed transport is
                        on the roadmap; today the chain is fast point-to-point,
                        not anonymous.
                    </li>
                    <li>
                        <strong style={{ color: "var(--strong)" }}>
                            All-peers-collude.
                        </strong>{" "}
                        If every peer in your chain is the same operator,
                        you have one operator, not a chain. Diverse peer
                        selection is your job and the routing layer&apos;s.
                    </li>
                    <li>
                        <strong style={{ color: "var(--strong)" }}>
                            The model itself.
                        </strong>{" "}
                        We don&apos;t pretend the model can&apos;t memorize
                        training data, or that a sufficiently dedicated
                        attacker can&apos;t probe it. That&apos;s a model
                        problem, not a transport problem.
                    </li>
                </ul>
            </section>

            <section className="space-y-5">
                <h2 className="font-serif text-3xl tracking-tight"
                    style={{ color: "var(--strong)" }}>
                    The performance argument
                </h2>
                <p>
                    A four-hop chain has more round-trips than a single
                    datacenter call. That cost is real and we won&apos;t
                    hide it. What changes the calculus is the network
                    effect: every new peer makes the chain shorter,
                    closer, and more parallelizable.
                </p>

                <div className="rounded-2xl p-6 space-y-4"
                     style={{ background: "var(--panel)", border: "1px solid var(--line)" }}>
                    <p className="font-mono text-sm tracking-[0.15em] uppercase"
                       style={{ color: "var(--accent)" }}>
                        Tor, 2003
                    </p>
                    <p>
                        Hidden-services were unusable for casual browsing.
                        Pages took fifteen seconds. The relay network had
                        a few hundred volunteers in two countries. Today
                        Tor has &gt; 7,000 relays across &gt; 80 countries,
                        and a typical onion service loads in under a second.
                        The bottleneck wasn&apos;t the protocol; it was
                        the population.
                    </p>
                </div>

                <div className="rounded-2xl p-6 space-y-4"
                     style={{ background: "var(--panel)", border: "1px solid var(--line)" }}>
                    <p className="font-mono text-sm tracking-[0.15em] uppercase"
                       style={{ color: "var(--accent)" }}>
                        BitTorrent, 2002
                    </p>
                    <p>
                        First releases hit single-digit kbps for popular
                        files. By 2010 a popular torrent saturated home
                        broadband. Today BitTorrent moves more data than
                        most CDNs on a typical day. Same observation:
                        peer-density wins.
                    </p>
                </div>

                <div className="rounded-2xl p-6 space-y-4"
                     style={{ background: "var(--panel)", border: "1px solid var(--line)" }}>
                    <p className="font-mono text-sm tracking-[0.15em] uppercase"
                       style={{ color: "var(--accent)" }}>
                        IntelNav, today
                    </p>
                    <p>
                        A handful of peers, mostly on the same continent.
                        A 7B model needs 3 hops; a 33B needs 8. RTTs
                        dominate over the math on small models. We&apos;re
                        in the same place Tor was when nobody used it
                        for the open web.
                    </p>
                </div>

                <h3 className="font-serif text-xl tracking-tight pt-2"
                    style={{ color: "var(--strong)" }}>
                    What gets faster as the network grows
                </h3>
                <ul className="space-y-3 list-disc pl-5">
                    <li>
                        <strong style={{ color: "var(--strong)" }}>
                            Geographic locality.
                        </strong>{" "}
                        With 10 hosts of layers <em>0..6</em> on your
                        continent instead of one in another hemisphere,
                        first-hop RTT drops from 200ms to 20ms. Stack
                        that across the chain.
                    </li>
                    <li>
                        <strong style={{ color: "var(--strong)" }}>
                            Parallel chains.
                        </strong>{" "}
                        With redundant hosts of every slice, a chat client
                        can run two chains in parallel and accept the
                        first response — same trick CDNs use against
                        single-origin tail latency.
                    </li>
                    <li>
                        <strong style={{ color: "var(--strong)" }}>
                            Slice replication.
                        </strong>{" "}
                        Popular models accumulate redundant hosts.
                        Unpopular slices stay rare, but you also use them
                        rarely. The market self-balances.
                    </li>
                    <li>
                        <strong style={{ color: "var(--strong)" }}>
                            Speculative decoding.
                        </strong>{" "}
                        A small fast model on the chat client drafts
                        tokens; the chain only verifies. The wire stays
                        warm; the perceived latency drops.
                    </li>
                </ul>
                <p>
                    The asymptote isn&apos;t &ldquo;as fast as a datacenter.&rdquo;
                    For most queries it&apos;s &ldquo;fast enough that
                    you stop noticing,&rdquo; which is the bar the
                    centralized providers actually clear today.
                </p>
            </section>

            <section className="space-y-5">
                <h2 className="font-serif text-3xl tracking-tight"
                    style={{ color: "var(--strong)" }}>
                    The political case in one paragraph
                </h2>
                <p>
                    A society where the most useful tool for thinking is
                    rented from three companies, who log every use, who
                    can revoke access, who decide what the tool is allowed
                    to discuss — that is not a society where the tool
                    belongs to its users. It belongs to the renters. We
                    have built decentralized money, decentralized
                    publishing, decentralized file delivery, decentralized
                    name resolution. The model is the next thing that
                    needs to be the network.
                </p>
            </section>

            <div className="flex flex-wrap gap-3 pt-4">
                <Link
                    href="/how-it-works/"
                    className="px-5 py-3 rounded-full text-[15px] font-medium transition-all hover:scale-[1.03]"
                    style={{
                        background: "var(--accent)",
                        color: "#ffffff",
                        boxShadow: "0 8px 24px -8px rgba(99, 102, 241, 0.55)",
                    }}
                >
                    How a chat turn flows →
                </Link>
                <Link
                    href="/install/"
                    className="px-5 py-3 rounded-full text-[15px] font-medium"
                    style={{
                        background: "transparent",
                        color: "var(--strong)",
                        border: "1px solid var(--line-2)",
                    }}
                >
                    Install
                </Link>
                <a
                    href="https://github.com/IntelNav/intelnav/blob/main/docs/architecture.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 rounded-full text-[15px] font-medium"
                    style={{
                        background: "transparent",
                        color: "var(--strong)",
                        border: "1px solid var(--line-2)",
                    }}
                >
                    architecture.md →
                </a>
            </div>
        </article>
    );
}
