import Link from "next/link";

export const metadata = {
    title: "Sovereignty",
    description:
        "Why a decentralized model matters. The threat model, the wire " +
        "format, and what changes when there are more peers.",
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
                    Why a decentralized model matters.
                </h1>
                <p className="mt-4 text-lg leading-relaxed"
                   style={{ color: "var(--muted)" }}>
                    Every prompt sent to a hosted model is logged by the
                    company that hosts it. Code that didn&apos;t compile.
                    Medical questions you wouldn&apos;t put to your GP.
                    Drafts of resignation letters. Half-formed political
                    opinions. The things you ask before bed because nobody
                    else is awake. All retained, retrievable, and useful
                    for training the next model. Search engines saw what
                    you were curious about. Inference providers see what
                    you intend to do.
                </p>
                <p className="mt-4 text-lg leading-relaxed"
                   style={{ color: "var(--muted)" }}>
                    IntelNav approaches the problem from a different
                    angle. Rather than ask the host to behave, it removes
                    the host. The model runs in pieces, on volunteer
                    machines, with cryptographic boundaries between every
                    pair of peers. It is slower today than a datacenter
                    call. That changes as more people run nodes.
                </p>
            </header>

            <section className="space-y-5">
                <h2 className="font-serif text-3xl tracking-tight"
                    style={{ color: "var(--strong)" }}>
                    Threat model
                </h2>
                <p style={{ color: "var(--fg)" }}>
                    Specific is better than aspirational. The list below
                    states what the design defends against and what it
                    doesn&apos;t.
                </p>

                <h3 className="font-serif text-xl tracking-tight pt-2"
                    style={{ color: "var(--strong)" }}>
                    What no single peer sees
                </h3>
                <p>
                    A chain has at minimum four parties: a chat client,
                    an entry peer that owns the front layers, one or more
                    middle peers, and a tail peer that owns the lm-head.
                    Only the entry peer ever holds the prompt as text;
                    it has to, in order to embed it. From layer{" "}
                    <code>k</code> onward, what travels between peers is
                    a tensor of activations: a vector of floats that
                    came out of the previous block.
                </p>
                <p>
                    That tensor is not text. There is no published method
                    for inverting a mid-layer hidden state of a modern
                    transformer back to its prompt; the embedding has
                    been pushed through <em>k</em> non-linear blocks by
                    the time it leaves the chat client. So the chain is
                    the privacy boundary. One peer sees plaintext. The
                    rest see opaque math. An adversary who controls every
                    peer in your chain sees everything; an adversary who
                    controls one of them sees only their slice.
                </p>

                <h3 className="font-serif text-xl tracking-tight pt-2"
                    style={{ color: "var(--strong)" }}>
                    What runs on the wire
                </h3>
                <ul className="space-y-3 list-disc pl-5">
                    <li>
                        <strong style={{ color: "var(--strong)" }}>
                            Noise XX
                        </strong>{" "}
                        between every peer pair. Ephemeral X25519 ECDH
                        for the handshake, AES-256-GCM for the bulk
                        transport. Forward secrecy is on by default;
                        seizing a peer tomorrow doesn&apos;t reveal a
                        chain it carried yesterday.
                    </li>
                    <li>
                        <strong style={{ color: "var(--strong)" }}>
                            Ed25519
                        </strong>{" "}
                        identities. A peer is its public key. There is
                        no central issuer rotating tokens, logging
                        sign-ins, or quietly revoking accounts.
                    </li>
                    <li>
                        <strong style={{ color: "var(--strong)" }}>
                            Signed slice advertisements.
                        </strong>{" "}
                        Every &ldquo;I host layers <em>k..m</em> of
                        model <em>cid</em>&rdquo; record on the DHT
                        carries a signature. Routing isn&apos;t
                        somewhere a third party can lie quietly.
                    </li>
                    <li>
                        <strong style={{ color: "var(--strong)" }}>
                            CBOR-framed messages.
                        </strong>{" "}
                        Length-prefixed, fixed-schema, no string
                        parsing on the hot path. Easy to audit; easy
                        to fuzz.
                    </li>
                </ul>

                <h3 className="font-serif text-xl tracking-tight pt-2"
                    style={{ color: "var(--strong)" }}>
                    What this design doesn&apos;t defend against (yet)
                </h3>
                <ul className="space-y-3 list-disc pl-5">
                    <li>
                        <strong style={{ color: "var(--strong)" }}>
                            The entry peer.
                        </strong>{" "}
                        Plaintext stops there. If you don&apos;t trust
                        any of the entry candidates, host the front
                        slice yourself; it&apos;s the cheapest one to
                        run.
                    </li>
                    <li>
                        <strong style={{ color: "var(--strong)" }}>
                            Traffic analysis.
                        </strong>{" "}
                        Hidden-state shapes leak the model. Token
                        timing leaks throughput. The chain is fast
                        point-to-point; it isn&apos;t anonymous.
                        Onion-routed transport is on the list, not in
                        the box.
                    </li>
                    <li>
                        <strong style={{ color: "var(--strong)" }}>
                            All-peers-collude.
                        </strong>{" "}
                        A chain whose peers are all the same operator
                        is one operator wearing four hats. Diverse
                        peer selection is the chat client&apos;s job
                        and the routing layer&apos;s job.
                    </li>
                    <li>
                        <strong style={{ color: "var(--strong)" }}>
                            The model itself.
                        </strong>{" "}
                        Memorization, prompt extraction, jailbreaks,
                        these are model problems. Splitting the
                        weights across peers does nothing about them.
                    </li>
                </ul>
            </section>

            <section className="space-y-5">
                <h2 className="font-serif text-3xl tracking-tight"
                    style={{ color: "var(--strong)" }}>
                    Performance, today vs. later
                </h2>
                <p>
                    Four hops cost more round-trips than one datacenter
                    call. That cost is real and we won&apos;t hide it.
                    What changes is population: every additional peer
                    makes chains shorter, closer, and easier to
                    parallelise.
                </p>

                <div className="rounded-2xl p-6 space-y-3"
                     style={{ background: "var(--panel)", border: "1px solid var(--line)" }}>
                    <p className="font-mono text-sm tracking-[0.15em] uppercase"
                       style={{ color: "var(--accent)" }}>
                        Tor, 2003
                    </p>
                    <p>
                        Hidden services were unusable for casual
                        browsing. Pages took fifteen seconds. The relay
                        network was a few hundred volunteers in two
                        countries. Today: 7,000+ relays in 80+
                        countries, onion services that load in under a
                        second. Protocol unchanged. Population
                        different.
                    </p>
                </div>

                <div className="rounded-2xl p-6 space-y-3"
                     style={{ background: "var(--panel)", border: "1px solid var(--line)" }}>
                    <p className="font-mono text-sm tracking-[0.15em] uppercase"
                       style={{ color: "var(--accent)" }}>
                        BitTorrent, 2002
                    </p>
                    <p>
                        First releases were single-digit kbps for
                        popular files. By 2010, popular torrents
                        saturated home broadband. Today, more bytes
                        flow over BitTorrent on a normal evening than
                        through most CDNs. Same shape of curve.
                    </p>
                </div>

                <div className="rounded-2xl p-6 space-y-3"
                     style={{ background: "var(--panel)", border: "1px solid var(--line)" }}>
                    <p className="font-mono text-sm tracking-[0.15em] uppercase"
                       style={{ color: "var(--accent)" }}>
                        IntelNav, now
                    </p>
                    <p>
                        A handful of peers, mostly on one continent.
                        A 7B model wants three hops; a 33B wants
                        eight. RTTs dominate compute on small models.
                        We&apos;re in the same place Tor was before
                        anyone used it for the open web.
                    </p>
                </div>

                <h3 className="font-serif text-xl tracking-tight pt-2"
                    style={{ color: "var(--strong)" }}>
                    What gets faster with population
                </h3>
                <ul className="space-y-3 list-disc pl-5">
                    <li>
                        <strong style={{ color: "var(--strong)" }}>
                            Geographic locality.
                        </strong>{" "}
                        With ten hosts of layers <em>0..6</em> on
                        your continent instead of one in another
                        hemisphere, first-hop RTT goes from 200&nbsp;ms
                        to 20&nbsp;ms. Stack that across the chain.
                    </li>
                    <li>
                        <strong style={{ color: "var(--strong)" }}>
                            Parallel chains.
                        </strong>{" "}
                        Redundant hosts let the chat client race two
                        chains and accept the first response.
                        It&apos;s the same trick CDNs use against
                        single-origin tail latency.
                    </li>
                    <li>
                        <strong style={{ color: "var(--strong)" }}>
                            Slice replication.
                        </strong>{" "}
                        Popular models pick up redundant hosts on
                        their own. Unpopular slices stay rare, but
                        you also use them rarely. The market handles
                        the balance.
                    </li>
                    <li>
                        <strong style={{ color: "var(--strong)" }}>
                            Speculative decoding.
                        </strong>{" "}
                        A small fast model on the chat client drafts
                        tokens; the chain verifies them. The wire
                        stays warm and perceived latency falls.
                    </li>
                </ul>
                <p>
                    The asymptote isn&apos;t &ldquo;as fast as a
                    datacenter&rdquo;. It&apos;s &ldquo;fast enough
                    that you stop noticing&rdquo;, which is also the
                    bar centralized providers actually clear in
                    practice.
                </p>
            </section>

            <section className="space-y-5">
                <h2 className="font-serif text-3xl tracking-tight"
                    style={{ color: "var(--strong)" }}>
                    Why bother
                </h2>
                <p>
                    A useful tool for thinking, rented from three
                    vendors who log every use, who can revoke access,
                    who decide what the tool may discuss, isn&apos;t
                    a tool the user owns. It&apos;s a tool the user
                    rents. We already have decentralised money,
                    publishing, file delivery, and name resolution.
                    The model is the next piece.
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
