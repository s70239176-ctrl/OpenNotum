/** Purely decorative — abstract nodes/lines, not tied to any live per-validator data we don't have. */
export function NetworkGraph() {
  const nodes = [
    [60, 40],
    [180, 20],
    [300, 55],
    [100, 110],
    [230, 120],
    [340, 95],
    [170, 70],
  ];
  const edges: Array<[number, number]> = [
    [0, 6],
    [1, 6],
    [2, 6],
    [3, 6],
    [4, 6],
    [5, 6],
    [0, 3],
    [2, 5],
  ];

  return (
    <svg viewBox="0 0 400 150" className="h-full w-full" aria-hidden>
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a][0]}
          y1={nodes[a][1]}
          x2={nodes[b][0]}
          y2={nodes[b][1]}
          stroke="var(--color-line-strong)"
          strokeWidth={1}
        />
      ))}
      {nodes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === 6 ? 5 : 3.5} fill={i === 6 ? "var(--color-accent)" : "var(--color-ink-muted)"} />
      ))}
    </svg>
  );
}
