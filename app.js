const { useState, useEffect, useRef, useCallback, useMemo } = React;
const { motion, AnimatePresence, useScroll, useTransform, useSpring } = window.Motion || window.framerMotion || {};

// Fallback if framer-motion UMD doesn't expose hooks the same way
const FM = window.Motion || window.framerMotion;

// ============================================================================
// Shared data
// ============================================================================

const WANDERING_QUESTIONS = [
  "What future is waiting for you?",
  "What grows between answers?",
  "Which dream deserves another chance?",
  "What if you already know?",
  "Where do beginnings hide?",
  "What are you almost ready for?",
  "Who are you becoming?",
  "What if the question is the answer?",
  "How will you know when you're ready?",
  "What if you never try?",
  "Is it enough to wonder?",
  "Why now, of all moments?",
];

const TREE_QUESTIONS = [
  "Why now?", "Is it enough?", "Will I belong?", "How will I know?",
  "Where do I begin?", "What if I never?", "Who am I becoming?",
];

// ============================================================================
// Hook: collected questions (the persistent thread through the journey)
// ============================================================================

function useCollectedQuestions() {
  const [collected, setCollected] = useState([]);

  const catchQuestion = useCallback((text) => {
    setCollected((prev) => {
      if (prev.some((q) => q.text === text)) return prev;
      return [...prev, { text, id: Date.now() + Math.random() }];
    });
  }, []);

  return { collected, catchQuestion };
}

// ============================================================================
// Hook: scroll-linked reveal (IntersectionObserver based, lightweight)
// ============================================================================

function useInView(threshold = 0.25) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, inView];
}

// ============================================================================
// Component: FloatingFragment — a single drifting glowing question
// ============================================================================

function FloatingFragment({ text, style, onCatch, caught }) {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    if (clicked || caught) return;
    setClicked(true);
    onCatch(text);
  };

  return (
    <button
      onClick={handleClick}
      disabled={clicked}
      style={{
        ...style,
        transition: 'opacity 1.1s ease-out, transform 1.1s ease-out, color 0.4s ease',
        opacity: clicked ? 0 : 1,
        transform: clicked ? 'translateY(-420px) scale(0.4)' : 'translateY(0) scale(1)',
      }}
      className="absolute font-display italic text-mist/90 select-none cursor-pointer
        hover:text-gold hover:scale-110 bg-transparent border-none p-0
        text-glow drop-shadow-[0_0_10px_rgba(219,228,243,0.4)]"
      aria-label={`Catch the question: ${text}`}
    >
      {text}
    </button>
  );
}

// ============================================================================
// Component: RegionLabel — small uppercase wayfinding tag
// ============================================================================

function RegionLabel({ icon, children }) {
  return (
    <div className="flex items-center gap-2 region-label">
      <span aria-hidden="true">{icon}</span>
      <span>{children}</span>
    </div>
  );
}

// ============================================================================
// Component: SectionHeading
// ============================================================================

function SectionHeading({ eyebrow, icon, title, sub }) {
  const [ref, inView] = useInView(0.2);
  return (
    <div
      ref={ref}
      className={`max-w-2xl transition-all duration-1000 ease-out ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <RegionLabel icon={icon}>{eyebrow}</RegionLabel>
      <h2 className="font-display text-5xl md:text-7xl mt-3 mb-4 text-mist text-glow leading-[1.05]">
        {title}
      </h2>
      {sub && <p className="text-mistdim text-base md:text-lg leading-relaxed font-light max-w-xl">{sub}</p>}
    </div>
  );
}

// ============================================================================
// Section 0: Sky Gate — the entrance
// ============================================================================

function SkyGate({ onEnter }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative h-screen w-full flex flex-col items-center justify-center px-6 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 30%, rgba(155,127,224,0.18), transparent 60%), radial-gradient(ellipse 60% 40% at 50% 80%, rgba(255,154,86,0.10), transparent 60%)',
        }}
      />

      <div
        className={`relative z-10 text-center transition-all duration-[1400ms] ease-out ${
          show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <p className="region-label mb-6">A garden suspended in the sky</p>
        <h1 className="font-display text-6xl sm:text-7xl md:text-8xl tracking-wide text-mist text-glow leading-none">
          The Garden of
        </h1>
        <h1 className="font-display italic text-6xl sm:text-7xl md:text-8xl tracking-wide text-gold glow-gold leading-none mt-1">
          Unanswered Questions
        </h1>
        <p className="text-mistdim font-light text-base md:text-lg mt-8 max-w-md mx-auto leading-relaxed">
          You will not find answers here. You will find places — grown from
          every question that never got one.
        </p>
      </div>

      <div
        className={`relative z-10 mt-16 transition-all duration-1000 delay-700 ${
          show ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button
          onClick={onEnter}
          className="group flex flex-col items-center gap-3 text-mistdim hover:text-gold transition-colors duration-500"
        >
          <span className="text-xs uppercase tracking-[0.3em]">Begin the descent</span>
          <span
            className="w-px h-10 bg-gradient-to-b from-mistdim to-transparent group-hover:from-gold"
            style={{ animation: 'pulse-slow 2.4s ease-in-out infinite' }}
          />
        </button>
      </div>
    </section>
  );
}

// ============================================================================
// Section 1: Cloud of Overthinking
// ============================================================================

const CLOUD_QUESTIONS = [
  "What if I fail?", "Why now?", "Is it enough?", "Will I belong?",
  "How will I know?", "What if I never try?", "Where do I begin?",
  "What if I'm not ready?", "Who said it has to be perfect?",
  "What if I already know the answer?",
];

function CloudOfOverthinking({ onCatch, caughtSet }) {
  const [ref, inView] = useInView(0.15);
  const positions = useMemo(
    () =>
      CLOUD_QUESTIONS.map((_, i) => ({
        top: `${10 + ((i * 37) % 75)}%`,
        left: `${5 + ((i * 53) % 85)}%`,
        animationDelay: `${(i % 5) * 0.7}s`,
        animationDuration: `${7 + (i % 4)}s`,
        fontSize: i % 3 === 0 ? '1.6rem' : '1.15rem',
      })),
    []
  );

  return (
    <section
      ref={ref}
      className="relative min-h-[140vh] w-full px-6 md:px-16 pt-32 pb-24 overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 20% 20%, rgba(141,150,179,0.14), transparent 65%)',
        }}
      />

      <SectionHeading
        eyebrow="Where the journey begins"
        icon="☁"
        title="Cloud of Overthinking"
        sub="Questions drift here as fragments of thought, circling without landing. Touch one — watch where it goes."
      />

      <div className="relative h-[70vh] mt-10 w-full">
        {CLOUD_QUESTIONS.map((q, i) => (
          <div
            key={q}
            className="absolute"
            style={{
              top: positions[i].top,
              left: positions[i].left,
              animation: inView
                ? `drift ${positions[i].animationDuration} ease-in-out infinite`
                : 'none',
              animationDelay: positions[i].animationDelay,
              fontSize: positions[i].fontSize,
            }}
          >
            <FloatingFragment
              text={q}
              caught={caughtSet.has(q)}
              onCatch={onCatch}
              style={{}}
            />
          </div>
        ))}
      </div>

      <p className="text-center text-mistdim text-sm font-light mt-4">
        Every question you catch travels with you — and finds its place later, on the Tree.
      </p>
    </section>
  );
}

// ============================================================================
// Section 2: River of Possibilities
// ============================================================================

function RiverOfPossibilities() {
  const [ref, inView] = useInView(0.15);

  const branches = [
    { path: "M0,160 C150,140 250,180 400,150 C550,120 650,160 800,130", delay: "0s" },
    { path: "M0,200 C160,220 280,190 420,210 C560,230 680,200 800,220", delay: "0.4s" },
    { path: "M0,120 C140,90 260,110 400,80 C540,50 660,90 800,60", delay: "0.8s" },
  ];

  return (
    <section
      ref={ref}
      className="relative min-h-[120vh] w-full px-6 md:px-16 pt-32 pb-24 overflow-hidden flex flex-col justify-center"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 90% 50% at 50% 55%, rgba(126,200,255,0.10), transparent 70%)',
        }}
      />

      <SectionHeading
        eyebrow="Where futures branch"
        icon="〜"
        title="River of Possibilities"
        sub="No path here is the only path. Every branch is a future that hasn't happened yet — and might still."
      />

      <div className="relative w-full mt-12 h-[40vh] md:h-[50vh]">
        <svg
          viewBox="0 0 800 280"
          className="w-full h-full"
          preserveAspectRatio="none"
          role="img"
          aria-label="A luminous river branching into multiple paths"
        >
          <defs>
            <linearGradient id="riverGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7ec8ff" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#7ec8ff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ffd97a" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          {branches.map((b, i) => (
            <path
              key={i}
              d={b.path}
              fill="none"
              stroke="url(#riverGrad)"
              strokeWidth={i === 1 ? 3 : 1.6}
              strokeLinecap="round"
              opacity={inView ? 1 : 0}
              style={{
                transition: 'opacity 1.4s ease-out',
                transitionDelay: b.delay,
                filter: 'drop-shadow(0 0 6px rgba(126,200,255,0.5))',
              }}
            />
          ))}
        </svg>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-4xl">
        {["What future is waiting for you?", "What grows between answers?", "Which dream deserves another chance?"].map(
          (q) => (
            <div
              key={q}
              className="glass rounded-2xl px-5 py-4 text-mist/90 font-display italic text-lg leading-snug"
            >
              {q}
            </div>
          )
        )}
      </div>
    </section>
  );
}

// ============================================================================
// Section 3: Valley of Almost
// ============================================================================

function ValleyOfAlmost() {
  const [ref, inView] = useInView(0.15);
  const almosts = [
    "The novel you started in March.",
    "The call you almost made.",
    "The class you almost signed up for.",
    "The version of you that almost spoke up.",
    "The trip you almost booked.",
  ];

  return (
    <section
      ref={ref}
      className="relative min-h-[110vh] w-full px-6 md:px-16 pt-32 pb-24 overflow-hidden flex flex-col justify-center"
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-70"
        style={{
          background:
            'linear-gradient(to bottom, transparent, rgba(155,127,224,0.07), rgba(10,14,31,0.3))',
        }}
      />

      <SectionHeading
        eyebrow="Where unfinished things rest"
        icon="≈"
        title="Valley of Almost"
        sub="Not every idea needs to finish to matter. Some things simply wait here, half-formed, in good company."
      />

      <div className="mt-12 flex flex-wrap gap-4 max-w-3xl">
        {almosts.map((a, i) => (
          <div
            key={a}
            className={`px-5 py-3 rounded-full border border-mistdim/20 text-mistdim/80 text-sm font-light
              transition-all duration-700 ease-out hover:border-violet/50 hover:text-mist
              ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{
              transitionDelay: `${i * 120}ms`,
              backdropFilter: 'blur(2px)',
            }}
          >
            {a}
          </div>
        ))}
      </div>

      <p className="text-mistdim/70 font-display italic text-xl mt-12 max-w-lg">
        "Almost" is not a failure to arrive. It's a place that's still warm.
      </p>
    </section>
  );
}

// ============================================================================
// Section 4: Forest of First Steps
// ============================================================================

function ForestOfFirstSteps() {
  const [ref, inView] = useInView(0.15);
  const trees = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, i) => ({
        left: `${4 + i * 13.5}%`,
        height: 80 + ((i * 37) % 90),
        delay: `${i * 0.15}s`,
        sway: `${4 + (i % 3)}s`,
      })),
    []
  );

  return (
    <section
      ref={ref}
      className="relative min-h-[110vh] w-full px-6 md:px-16 pt-32 pb-32 overflow-hidden flex flex-col justify-center"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 90% 40% at 50% 100%, rgba(61,220,151,0.12), transparent 70%)',
        }}
      />

      <SectionHeading
        eyebrow="Where courage takes root"
        icon="↟"
        title="Forest of First Steps"
        sub="Every tree here began as someone's smallest, most uncertain step forward. Most of them grew anyway."
      />

      <div className="relative h-[42vh] md:h-[48vh] mt-12 w-full">
        {trees.map((t, i) => (
          <div
            key={i}
            className="absolute bottom-0"
            style={{
              left: t.left,
              transformOrigin: 'bottom center',
              animation: inView ? `sway ${t.sway} ease-in-out infinite` : 'none',
              opacity: inView ? 1 : 0,
              transition: `opacity 1s ease-out ${t.delay}`,
            }}
          >
            <svg width="50" height={t.height} viewBox="0 0 50 100" preserveAspectRatio="none">
              <line x1="25" y1="100" x2="25" y2="35" stroke="#2a3a2e" strokeWidth="4" strokeLinecap="round" />
              <circle cx="25" cy="22" r="22" fill="#1d3a2c" opacity="0.85" />
              <circle cx="25" cy="22" r="22" fill="none" stroke="#3ddc97" strokeWidth="0.6" opacity="0.5" />
              {[...Array(6)].map((_, j) => (
                <circle
                  key={j}
                  cx={25 + Math.cos((j / 6) * Math.PI * 2) * 13}
                  cy={22 + Math.sin((j / 6) * Math.PI * 2) * 13}
                  r="1.6"
                  fill="#ffd97a"
                  style={{
                    animation: `flicker ${2 + j * 0.3}s ease-in-out infinite`,
                    animationDelay: `${j * 0.2}s`,
                  }}
                />
              ))}
            </svg>
          </div>
        ))}
      </div>

      <p className="text-mist font-display italic text-2xl md:text-3xl mt-6 max-w-xl text-glow">
        The forest doesn't ask if you're ready. It only asks if you're willing.
      </p>
    </section>
  );
}

// ============================================================================
// Section 5: Tree of Unfinished Answers — the centerpiece
// ============================================================================

function TreeOfUnfinishedAnswers({ collected, onCatch }) {
  const [ref, inView] = useInView(0.1);
  const [hovered, setHovered] = useState(null);

  // permanent tree-questions + anything the visitor caught along the way
  const allLeaves = useMemo(() => {
    const base = TREE_QUESTIONS.map((t) => ({ text: t, source: 'tree' }));
    const caught = collected.map((c) => ({ text: c.text, source: 'caught' }));
    return [...base, ...caught];
  }, [collected]);

  const leafPositions = useMemo(
    () =>
      allLeaves.map((_, i) => {
        const angle = (i / Math.max(allLeaves.length, 1)) * Math.PI * 2;
        const radius = 130 + ((i * 17) % 70);
        return {
          x: 250 + Math.cos(angle) * radius * 0.9,
          y: 130 + Math.sin(angle) * radius * 0.55 - 40,
          delay: `${(i % 8) * 0.18}s`,
        };
      }),
    [allLeaves.length]
  );

  return (
    <section
      ref={ref}
      className="relative min-h-[140vh] w-full px-6 md:px-16 pt-32 pb-32 overflow-hidden flex flex-col items-center justify-center text-center"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(255,217,122,0.10), transparent 65%)',
        }}
      />

      <RegionLabel icon="✦">The heart of the garden</RegionLabel>
      <h2 className="font-display text-5xl md:text-7xl mt-3 mb-3 text-mist text-glow leading-[1.05]">
        Tree of Unfinished Answers
      </h2>
      <p className="text-mistdim text-base md:text-lg font-light max-w-xl mb-4">
        Thousands of questions hang here, none of them resolved, all of them
        still glowing. {collected.length > 0 && (
          <span className="text-gold">
            {collected.length} of them are questions you carried here yourself.
          </span>
        )}
      </p>

      <div className="relative w-full max-w-2xl mt-6" style={{ aspectRatio: '500/420' }}>
        <svg viewBox="0 0 500 420" className="w-full h-full" role="img" aria-label="A glowing tree holding many unanswered questions">
          <defs>
            <radialGradient id="treeGlow" cx="50%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#ffd97a" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ffd97a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="250" cy="150" r="200" fill="url(#treeGlow)" />

          {/* trunk */}
          <path
            d="M250,420 C246,360 240,320 245,260 C248,220 255,200 250,160"
            fill="none"
            stroke="#1d2a3d"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* branches */}
          {[
            "M250,260 C220,230 190,220 150,190",
            "M250,260 C280,225 310,215 350,180",
            "M250,200 C225,175 200,165 165,140",
            "M250,200 C275,170 305,160 340,135",
            "M250,165 C250,140 250,120 250,95",
          ].map((d, i) => (
            <path key={i} d={d} fill="none" stroke="#243349" strokeWidth="5" strokeLinecap="round" opacity="0.9" />
          ))}

          {/* canopy glow blobs */}
          {[
            [165, 130, 70], [250, 90, 75], [335, 125, 70],
            [150, 185, 55], [350, 175, 55], [250, 160, 60],
          ].map(([cx, cy, r], i) => (
            <ellipse key={i} cx={cx} cy={cy} rx={r} ry={r * 0.7} fill="#16352b" opacity="0.85" />
          ))}

          {/* leaves = questions */}
          {allLeaves.map((leaf, i) => {
            const pos = leafPositions[i];
            const isHovered = hovered === i;
            return (
              <g
                key={i}
                style={{
                  cursor: 'default',
                  animation: inView ? `flicker ${2.2 + (i % 5) * 0.3}s ease-in-out infinite` : 'none',
                  animationDelay: pos.delay,
                }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isHovered ? 6 : leaf.source === 'caught' ? 4.5 : 3.2}
                  fill={leaf.source === 'caught' ? '#7ec8ff' : '#ffd97a'}
                  style={{
                    filter: `drop-shadow(0 0 ${isHovered ? 10 : 5}px ${
                      leaf.source === 'caught' ? 'rgba(126,200,255,0.8)' : 'rgba(255,217,122,0.7)'
                    })`,
                    transition: 'r 0.25s ease-out',
                  }}
                />
              </g>
            );
          })}
        </svg>

        {hovered !== null && allLeaves[hovered] && (
          <div className="absolute top-1 left-1/2 -translate-x-1/2 glass rounded-xl px-4 py-2 text-sm font-display italic text-mist whitespace-nowrap">
            "{allLeaves[hovered].text}"
          </div>
        )}
      </div>

      <p className="text-mistdim/70 text-sm font-light mt-6 max-w-md">
        Gold leaves have always been here. Blue leaves are the ones you brought.
      </p>
    </section>
  );
}

// ============================================================================
// Section 6: The First Question — the poster blooms open
// ============================================================================

function TheFirstQuestion() {
  const [ref, inView] = useInView(0.2);
  const [bloomed, setBloomed] = useState(false);

  return (
    <section
      ref={ref}
      className="relative min-h-[130vh] w-full px-6 md:px-16 pt-32 pb-32 overflow-hidden flex flex-col items-center justify-center text-center"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 45%, rgba(255,154,86,0.12), transparent 65%)',
        }}
      />

      <RegionLabel icon="❀">Where the garden began</RegionLabel>
      <h2 className="font-display text-5xl md:text-7xl mt-3 mb-4 text-mist text-glow leading-[1.05]">
        The First Question
      </h2>
      <p className="text-mistdim text-base md:text-lg font-light max-w-xl mb-10">
        Every question in this garden grew from one. It rests here as a flower
        — closed, until you choose to open it.
      </p>

      {!bloomed ? (
        <button
          onClick={() => setBloomed(true)}
          className="group relative w-56 h-56 md:w-72 md:h-72 flex items-center justify-center"
          aria-label="Open the flower to reveal the first question"
        >
          <svg viewBox="0 0 200 200" className="w-full h-full transition-transform duration-700 group-hover:scale-105">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <ellipse
                key={i}
                cx="100"
                cy="60"
                rx="22"
                ry="48"
                fill="#ffd97a"
                opacity="0.85"
                transform={`rotate(${i * 60} 100 100)`}
                style={{
                  filter: 'drop-shadow(0 0 14px rgba(255,217,122,0.55))',
                  animation: `pulse-slow ${3 + i * 0.2}s ease-in-out infinite`,
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
            <circle cx="100" cy="100" r="20" fill="#ff9a56" style={{ filter: 'drop-shadow(0 0 12px rgba(255,154,86,0.7))' }} />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-display italic text-mist text-sm md:text-base">
            touch to bloom
          </span>
        </button>
      ) : (
        <div
          className="relative max-w-sm md:max-w-md w-full transition-all duration-[1200ms] ease-out"
          style={{
            opacity: bloomed ? 1 : 0,
            transform: bloomed ? 'scale(1)' : 'scale(0.7)',
          }}
        >
          <div className="rounded-3xl overflow-hidden border border-gold/30 shadow-2xl glow-gold">
            <img
              src="./first-question-poster.jpg"
              alt="The First Question — the origin poster of the Garden of Unanswered Questions, showing a girl on a floating island beneath a glowing tree of questions"
              className="w-full h-auto block"
            />
          </div>
          <p className="font-display italic text-xl md:text-2xl text-mist mt-6 text-glow">
            "What question are you willing to spend your life answering?"
          </p>
        </div>
      )}
    </section>
  );
}

// ============================================================================
// Section 7: The Wind of Questions — audio-reactive ambience
// ============================================================================

function WindOfQuestions({ playing, onToggle }) {
  const [ref, inView] = useInView(0.3);

  return (
    <section
      ref={ref}
      className="relative min-h-[80vh] w-full px-6 md:px-16 py-32 overflow-hidden flex flex-col items-center justify-center text-center"
    >
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{
          opacity: playing ? 1 : 0.4,
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(155,127,224,0.16), transparent 70%)',
        }}
      />

      <RegionLabel icon="≈">Let the garden breathe</RegionLabel>
      <h2 className="font-display text-5xl md:text-6xl mt-3 mb-6 text-mist text-glow">
        The Wind of Questions
      </h2>
      <p className="text-mistdim text-base md:text-lg font-light max-w-md mb-10">
        Some questions are best heard, not read. Let the wind carry this one
        through the whole garden behind you.
      </p>

      <button
        onClick={onToggle}
        className={`group relative w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center
          border transition-all duration-500
          ${playing ? 'border-gold bg-gold/10' : 'border-mistdim/30 bg-white/5'}`}
        aria-label={playing ? 'Pause the wind of questions soundtrack' : 'Play the wind of questions soundtrack'}
      >
        <span
          className="absolute inset-0 rounded-full"
          style={{
            border: playing ? '1px solid rgba(255,217,122,0.4)' : 'none',
            animation: playing ? 'pulse-slow 2.4s ease-in-out infinite' : 'none',
          }}
        />
        {playing ? (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <rect x="6" y="5" width="4" height="14" rx="1" fill="#ffd97a" />
            <rect x="14" y="5" width="4" height="14" rx="1" fill="#ffd97a" />
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M7 4L19 12L7 20V4Z" fill="#dbe4f3" />
          </svg>
        )}
      </button>
      <span className="text-xs uppercase tracking-[0.25em] text-mistdim mt-5">
        {playing ? 'Now drifting through the garden' : 'Press to release the wind'}
      </span>
    </section>
  );
}

// ============================================================================
// Section 8: Final Question — closing
// ============================================================================

function FinalQuestion() {
  const [ref, inView] = useInView(0.3);

  return (
    <section
      ref={ref}
      className="relative min-h-[100vh] w-full px-6 flex flex-col items-center justify-center text-center overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(255,217,122,0.08), transparent 70%)',
        }}
      />
      <div
        className={`relative z-10 max-w-2xl transition-all duration-[1400ms] ease-out ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <p className="region-label mb-8">Before you leave the garden</p>
        <h2 className="font-display italic text-4xl md:text-6xl text-mist text-glow leading-tight">
          What question are you willing<br />to spend your life answering?
        </h2>
        <p className="text-mistdim font-light text-sm md:text-base mt-10 tracking-wide">
          The garden will still be here. Questions don't expire.
        </p>
      </div>
    </section>
  );
}

// ============================================================================
// Persistent chrome: side progress dots
// ============================================================================

const REGIONS = [
  { id: 'gate', label: 'Sky Gate' },
  { id: 'cloud', label: 'Cloud of Overthinking' },
  { id: 'river', label: 'River of Possibilities' },
  { id: 'valley', label: 'Valley of Almost' },
  { id: 'forest', label: 'Forest of First Steps' },
  { id: 'tree', label: 'Tree of Unfinished Answers' },
  { id: 'flower', label: 'The First Question' },
  { id: 'wind', label: 'The Wind of Questions' },
  { id: 'final', label: 'The Final Question' },
];

function WayfindingDots({ active }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      className="fixed right-4 md:right-6 top-1/2 -translate-y-1/2 z-40 hidden sm:flex flex-col gap-3"
      aria-label="Garden regions"
    >
      {REGIONS.map((r) => (
        <button
          key={r.id}
          onClick={() => scrollTo(r.id)}
          className="group relative flex items-center justify-end"
          aria-label={`Go to ${r.label}`}
          aria-current={active === r.id ? 'true' : undefined}
        >
          <span
            className="absolute right-5 whitespace-nowrap text-xs text-mist bg-ink/80 backdrop-blur px-2.5 py-1 rounded-md opacity-0
              group-hover:opacity-100 transition-opacity duration-200 pointer-events-none border border-mistdim/15"
          >
            {r.label}
          </span>
          <span
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              active === r.id ? 'bg-gold scale-150 glow-gold' : 'bg-mistdim/40'
            }`}
          />
        </button>
      ))}
    </nav>
  );
}

// ============================================================================
// Main App
// ============================================================================

function App() {
  const [entered, setEntered] = useState(false);
  const [active, setActive] = useState('gate');
  const [playing, setPlaying] = useState(false);
  const { collected, catchQuestion } = useCollectedQuestions();
  const caughtSet = useMemo(() => new Set(collected.map((c) => c.text)), [collected]);
  const audioRef = useRef(null);

  // section visibility -> active dot + sky reactivity
  useEffect(() => {
    const sections = REGIONS.map((r) => document.getElementById(r.id)).filter(Boolean);
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { threshold: 0.5 }
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, [entered]);

  const handleEnter = () => {
    setEntered(true);
    const el = document.getElementById('cloud');
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const toggleWind = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      if (window.__gardenSky) window.__gardenSky.setWind(false);
    } else {
      audio.volume = 0.5;
      audio.play().catch(() => {});
      setPlaying(true);
      if (window.__gardenSky) window.__gardenSky.setWind(true);
    }
  };

  return (
    <div className="relative z-10">
      <audio ref={audioRef} src="./wind-of-questions.mp3" loop preload="auto" />

      {entered && <WayfindingDots active={active} />}

      {collected.length > 0 && entered && (
        <div className="fixed top-5 left-5 z-40 glass rounded-full px-4 py-2 flex items-center gap-2 text-xs text-mist">
          <span className="w-1.5 h-1.5 rounded-full bg-river glow-river" />
          {collected.length} question{collected.length === 1 ? '' : 's'} caught
        </div>
      )}

      <div id="gate">
        <SkyGate onEnter={handleEnter} />
      </div>

      <div id="cloud">
        <CloudOfOverthinking onCatch={catchQuestion} caughtSet={caughtSet} />
      </div>

      <div id="river">
        <RiverOfPossibilities />
      </div>

      <div id="valley">
        <ValleyOfAlmost />
      </div>

      <div id="forest">
        <ForestOfFirstSteps />
      </div>

      <div id="tree">
        <TreeOfUnfinishedAnswers collected={collected} onCatch={catchQuestion} />
      </div>

      <div id="flower">
        <TheFirstQuestion />
      </div>

      <div id="wind">
        <WindOfQuestions playing={playing} onToggle={toggleWind} />
      </div>

      <div id="final">
        <FinalQuestion />
      </div>

      <footer className="relative z-10 text-center pb-10 text-mistdim/50 text-xs font-light tracking-wide">
        The Garden of Unanswered Questions — grown, not built.
      </footer>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
