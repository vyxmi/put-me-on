function mulberry32(seed: number) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(h, 31) + seed.charCodeAt(i)) >>> 0;
  return h;
}

/** A smooth closed "contour" loop through jittered points around a center —
 * the elevation-line look, built from quadratic curves through midpoints
 * (classic organic-blob technique, no external curve library needed). */
function contourPath(rand: () => number, cx: number, cy: number, radius: number, points: number, wobble: number): string {
  const pts: [number, number][] = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const r = radius * (1 + (rand() - 0.5) * wobble);
    pts.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
  }
  let d = `M ${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)} `;
  for (let i = 0; i < pts.length; i++) {
    const p0 = pts[i];
    const p1 = pts[(i + 1) % pts.length];
    const mx = (p0[0] + p1[0]) / 2;
    const my = (p0[1] + p1[1]) / 2;
    d += `Q ${p0[0].toFixed(1)},${p0[1].toFixed(1)} ${mx.toFixed(1)},${my.toFixed(1)} `;
  }
  return `${d}Z`;
}

interface Node {
  x: number;
  y: number;
  r: number;
}

interface TopographicWebProps {
  seed: string;
  className?: string;
  /** contour "elevation" rings */
  contours?: boolean;
  /** scattered nodes + connecting lines */
  web?: boolean;
  nodeCount?: number;
  viewBoxSize?: number;
}

/** Ambient background texture: topographic contour rings plus a loose node
 * web, in the spirit of "taste moves through people like a network" —
 * decorative only, not a functional/interactive graph. Deterministic per
 * seed so it's stable across renders and hydration-safe. */
export function TopographicWeb({
  seed,
  className,
  contours = true,
  web = true,
  nodeCount = 9,
  viewBoxSize = 400,
}: TopographicWebProps) {
  const rand = mulberry32(hashSeed(seed));
  const cx = viewBoxSize * (0.35 + rand() * 0.3);
  const cy = viewBoxSize * (0.35 + rand() * 0.3);

  const ringCount = 5;
  const rings = contours
    ? Array.from({ length: ringCount }, (_, i) => {
        const radius = viewBoxSize * (0.14 + i * 0.09);
        return {
          d: contourPath(rand, cx, cy, radius, 9 + (i % 3), 0.22),
          opacity: 0.14 - i * 0.02,
        };
      })
    : [];

  let nodes: Node[] = [];
  let edges: { x1: number; y1: number; x2: number; y2: number; cx: number; cy: number }[] = [];
  if (web) {
    nodes = Array.from({ length: nodeCount }, () => ({
      x: rand() * viewBoxSize,
      y: rand() * viewBoxSize,
      r: 1.6 + rand() * 2.2,
    }));
    edges = nodes.map((n, i) => {
      // connect each node to its nearest neighbor for a loose constellation, not a dense mesh
      let nearest = -1;
      let best = Infinity;
      nodes.forEach((o, j) => {
        if (j === i) return;
        const dist = (o.x - n.x) ** 2 + (o.y - n.y) ** 2;
        if (dist < best) {
          best = dist;
          nearest = j;
        }
      });
      const o = nodes[nearest];
      const mx = (n.x + o.x) / 2 + (rand() - 0.5) * 40;
      const my = (n.y + o.y) / 2 + (rand() - 0.5) * 40;
      return { x1: n.x, y1: n.y, x2: o.x, y2: o.y, cx: mx, cy: my };
    });
  }

  return (
    <svg
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      className={className}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <g fill="none" stroke="currentColor" strokeWidth="0.7">
        {rings.map((ring, i) => (
          <path key={i} d={ring.d} opacity={ring.opacity} />
        ))}
      </g>
      <g stroke="currentColor" strokeWidth="0.6" fill="none">
        {edges.map((e, i) => (
          <path
            key={i}
            d={`M ${e.x1.toFixed(1)},${e.y1.toFixed(1)} Q ${e.cx.toFixed(1)},${e.cy.toFixed(1)} ${e.x2.toFixed(1)},${e.y2.toFixed(1)}`}
            opacity={0.18}
          />
        ))}
      </g>
      <g fill="currentColor">
        {nodes.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={n.r} opacity={0.32} />
        ))}
      </g>
    </svg>
  );
}
