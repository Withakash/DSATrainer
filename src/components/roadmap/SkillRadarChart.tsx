import type { SkillDetail } from "@/roadmap/roadmapTypes";

// Radar (spider) chart of the core skills, drawn with SVG. Polygon vertices sit
// at each skill's 0–100 score.
export function SkillRadarChart({ details }: { details: SkillDetail[] }) {
  const core = details.filter((d) => d.core);
  const n = core.length;
  if (n < 3) return <p className="text-sm text-neutral-500">Practice more patterns to populate the skill graph.</p>;

  const size = 260, c = size / 2, R = size / 2 - 38;
  const angle = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / n;
  const pt = (i: number, r: number) => [c + r * Math.cos(angle(i)), c + r * Math.sin(angle(i))];
  const rings = [0.25, 0.5, 0.75, 1];

  const poly = core.map((d, i) => pt(i, R * (d.score / 100)).join(",")).join(" ");

  return (
    <div className="flex justify-center">
      <svg width={size} height={size}>
        {rings.map((rr, k) => (
          <polygon key={k} points={core.map((_, i) => pt(i, R * rr).join(",")).join(" ")} fill="none" stroke="#27272a" strokeWidth={1} />
        ))}
        {core.map((_, i) => { const [x, y] = pt(i, R); return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="#27272a" strokeWidth={1} />; })}
        <polygon points={poly} fill="rgba(99,102,241,0.25)" stroke="#818cf8" strokeWidth={2} />
        {core.map((d, i) => { const [x, y] = pt(i, R * (d.score / 100)); return <circle key={i} cx={x} cy={y} r={3} fill="#818cf8" />; })}
        {core.map((d, i) => {
          const [x, y] = pt(i, R + 18);
          return <text key={d.key} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill="#a1a1aa">{d.label.split(" ")[0]} {d.score}</text>;
        })}
      </svg>
    </div>
  );
}
