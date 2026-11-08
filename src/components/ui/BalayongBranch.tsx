// A branch of balayong (Cassia javanica), Puerto Princesa's city tree, in
// bloom. Flowers are five-petaled and grow in loose clusters that shade
// from pale to deep pink as they age. Positions come from a seeded random
// walk so the drawing is irregular, like a hand sketch, but identical on
// every render.

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PINKS = ['#fbe3ec', '#f7c6d8', '#f09dbc', '#e66f9b', '#d94b7f'];

interface Flower {
  x: number;
  y: number;
  r: number;
  turn: number;
  color: string;
}

// Cluster anchors along the branch, as [x, y, flowers in cluster].
const CLUSTERS: [number, number, number][] = [
  [420, 40, 7],
  [330, 70, 6],
  [250, 118, 8],
  [170, 150, 5],
  [300, 160, 4],
  [96, 196, 5],
];

const rand = mulberry32(1734);
const FLOWERS: Flower[] = CLUSTERS.flatMap(([cx, cy, count]) =>
  Array.from({ length: count }, () => ({
    x: cx + (rand() - 0.5) * 70,
    y: cy + (rand() - 0.3) * 50,
    r: 9 + rand() * 7,
    turn: rand() * 72,
    color: PINKS[Math.floor(rand() * PINKS.length)],
  }))
);

// Loose petals drifting below the branch.
const PETALS = Array.from({ length: 7 }, () => ({
  x: 60 + rand() * 360,
  y: 230 + rand() * 110,
  turn: rand() * 180,
  color: PINKS[1 + Math.floor(rand() * 3)],
}));

function Blossom({ x, y, r, turn, color }: Flower) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${turn})`}>
      {[0, 72, 144, 216, 288].map(a => (
        <ellipse
          key={a}
          cx={0}
          cy={-r * 0.62}
          rx={r * 0.48}
          ry={r * 0.66}
          transform={`rotate(${a})`}
          fill={color}
        />
      ))}
      <circle r={r * 0.22} fill="#f6d27a" />
    </g>
  );
}

export default function BalayongBranch({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 360"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M492 6 C 430 30, 360 52, 300 96 S 190 150, 140 168 S 70 200, 40 222"
        fill="none"
        stroke="#7a4a3a"
        strokeWidth={5}
        strokeLinecap="round"
      />
      <path
        d="M300 96 C 316 120, 312 146, 300 162 M250 118 C 236 100, 214 92, 196 92"
        fill="none"
        stroke="#7a4a3a"
        strokeWidth={3}
        strokeLinecap="round"
      />
      {FLOWERS.map((f, i) => (
        <Blossom key={i} {...f} />
      ))}
      {PETALS.map((p, i) => (
        <ellipse
          key={i}
          cx={p.x}
          cy={p.y}
          rx={4.5}
          ry={7}
          transform={`rotate(${p.turn} ${p.x} ${p.y})`}
          fill={p.color}
        />
      ))}
    </svg>
  );
}
