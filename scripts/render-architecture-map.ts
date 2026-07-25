import { documentStart, escapeXml, palette, type Theme } from "./lib/svg.js";

const steps = [
  ["01", "PROBLEM", "Frame the outcome"],
  ["02", "ARCHITECTURE", "Choose boundaries"],
  ["03", "AGENTS + TOOLS", "Govern execution"],
  ["04", "RUNTIME + STATE", "Persist ownership"],
  ["05", "VERIFY + EVAL", "Demand evidence"],
  ["06", "DEPLOY + OBSERVE", "Operate safely"],
  ["07", "OPEN SOURCE", "Ship reproducibly"]
] as const;

export function renderArchitectureMap(theme: Theme): string {
  const color = palette[theme];
  const cards = steps
    .map(([number, title, detail], index) => {
      const column = index % 4;
      const row = Math.floor(index / 4);
      const x = 40 + column * 285 + (row === 1 ? 142 : 0);
      const y = 86 + row * 150;
      return `<g transform="translate(${x} ${y})">
      <rect width="246" height="102" rx="13" fill="${color.surface}" stroke="${index === 6 ? color.green : color.grid}"/>
      <text x="18" y="28" fill="${index === 6 ? color.green : color.cyan}" font-size="11" letter-spacing="2" class="mono">${number}</text>
      <text x="18" y="55" fill="${color.text}" font-size="15" font-weight="700">${escapeXml(title)}</text>
      <text x="18" y="79" fill="${color.muted}" font-size="12">${escapeXml(detail)}</text>
    </g>`;
    })
    .join("\n  ");

  return `${documentStart(1200, 380, "Engineering architecture map", "From problem framing through verifiable open-source delivery.")}
  <defs>
    <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
      <path d="M28 0H0V28" fill="none" stroke="${color.grid}" stroke-width="1"/>
    </pattern>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M0 0L10 5L0 10z" fill="${color.cyan}"/>
    </marker>
    <style>text{font-family:Inter,ui-sans-serif,system-ui,sans-serif}.mono{font-family:"SFMono-Regular",Consolas,monospace}</style>
  </defs>
  <rect width="1200" height="380" rx="20" fill="${color.background}"/>
  <rect width="1200" height="380" rx="20" fill="url(#grid)" opacity="0.6"/>
  <text x="40" y="43" fill="${color.text}" font-size="16" font-weight="700">ARCHITECTURE MAP</text>
  <text x="1160" y="43" fill="${color.muted}" font-size="11" text-anchor="end" letter-spacing="1.5" class="mono">EVIDENCE BEFORE CLAIMS</text>
  <path d="M286 137H321M571 137H606M856 137H891M1041 188V215H145V287H182M428 287H463M713 287H748" fill="none" stroke="${color.cyan}" stroke-width="1.4" opacity="0.7" marker-end="url(#arrow)"/>
  ${cards}
</svg>
`;
}
