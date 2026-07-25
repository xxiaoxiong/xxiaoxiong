import { documentStart, escapeXml, palette, type Theme } from "./lib/svg.js";

export function renderHero(theme: Theme): string {
  const color = palette[theme];
  const nodes = [
    [900, 100, "PLAN"],
    [1030, 175, "RUN"],
    [940, 260, "VERIFY"],
    [820, 208, "STATE"]
  ] as const;
  const connections = [
    [900, 100, 1030, 175],
    [1030, 175, 940, 260],
    [940, 260, 820, 208],
    [820, 208, 900, 100],
    [900, 100, 940, 260]
  ] as const;

  return `${documentStart(1200, 430, "Nicholas Xiong — Agentic Systems Engineer", "Midnight agent control system with a governed task graph.")}
  <defs>
    <linearGradient id="beam" x1="0" x2="1">
      <stop offset="0" stop-color="${color.cyan}" stop-opacity="0.08"/>
      <stop offset="0.5" stop-color="${color.cyan}" stop-opacity="0.9"/>
      <stop offset="1" stop-color="${color.violet}" stop-opacity="0.15"/>
    </linearGradient>
    <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
      <path d="M32 0H0V32" fill="none" stroke="${color.grid}" stroke-width="1"/>
    </pattern>
    <style>
      text{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      .mono{font-family:"SFMono-Regular",Consolas,"Liberation Mono",monospace}
      .pulse{animation:pulse 3.6s ease-in-out infinite}
      .packet{animation:packet 5.5s linear infinite}
      @keyframes pulse{0%,100%{opacity:.45}50%{opacity:1}}
      @keyframes packet{0%{transform:translateX(-90px);opacity:0}15%,75%{opacity:1}100%{transform:translateX(380px);opacity:0}}
      @media (prefers-reduced-motion:reduce){.pulse,.packet{animation:none}}
    </style>
  </defs>
  <rect width="1200" height="430" rx="22" fill="${color.background}"/>
  <rect width="1200" height="430" rx="22" fill="url(#grid)" opacity="0.72"/>
  <path d="M0 350 C240 310 380 420 620 360 S950 290 1200 350 V430 H0Z" fill="${color.cyan}" opacity="0.025"/>
  <rect x="44" y="38" width="1112" height="354" rx="16" fill="none" stroke="${color.grid}"/>
  <g transform="translate(74 74)">
    <rect width="66" height="66" rx="14" fill="${color.surface}" stroke="${color.cyan}" stroke-width="1.5"/>
    <path d="M16 49V17h7l20 22V17h8v32h-7L24 27v22z" fill="${color.text}"/>
    <circle cx="55" cy="11" r="4" fill="${color.green}" class="pulse" filter="url(#glow)"/>
  </g>
  <text x="74" y="188" fill="${color.muted}" font-size="14" letter-spacing="4" class="mono">NICHOLAS / AGENTIC SYSTEMS</text>
  <text x="74" y="242" fill="${color.text}" font-size="40" font-weight="760" letter-spacing="1">${escapeXml("AGENTIC SYSTEMS ENGINEER")}</text>
  <text x="74" y="282" fill="${color.text}" font-size="20">I build governed multi-agent runtimes, local AI platforms,</text>
  <text x="74" y="312" fill="${color.text}" font-size="20">and production-grade knowledge systems.</text>
  <text x="74" y="356" fill="${color.cyan}" font-size="14" class="mono">MULTI-AGENT RUNTIME · AI INFRASTRUCTURE · RAG · OPEN SOURCE</text>
  <g>
    ${connections
      .map(
        ([x1, y1, x2, y2]) =>
          `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="url(#beam)" stroke-width="2"/>`
      )
      .join("\n    ")}
    <circle cx="850" cy="154" r="3.5" fill="${color.cyan}" class="packet" filter="url(#glow)"/>
    ${nodes
      .map(
        ([x, y, label], index) => `<g>
      <circle cx="${x}" cy="${y}" r="${index === 0 ? 28 : 23}" fill="${color.surface}" stroke="${index % 2 === 0 ? color.cyan : color.violet}" stroke-width="1.5"/>
      <circle cx="${x}" cy="${y}" r="5" fill="${index === 2 ? color.green : color.cyan}" opacity="0.9"/>
      <text x="${x}" y="${y + 45}" fill="${color.muted}" text-anchor="middle" font-size="10" letter-spacing="1.6" class="mono">${label}</text>
    </g>`
      )
      .join("\n    ")}
  </g>
  <g transform="translate(940 338)">
    <circle cx="0" cy="-4" r="5" fill="${color.green}" class="pulse"/>
    <text x="15" y="0" fill="${color.green}" font-size="12" letter-spacing="2" class="mono">SYSTEM ONLINE</text>
  </g>
</svg>
`;
}
