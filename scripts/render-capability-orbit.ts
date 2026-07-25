import type { Capabilities } from "./lib/schema.js";
import { documentStart, escapeXml, palette, type Theme } from "./lib/svg.js";

type Language = "en" | "zh-CN";

const chineseNames = [
  "智能体系统",
  "AI 基础设施",
  "知识与 RAG",
  "后端与平台",
  "产品体验",
  "工程质量"
] as const;

const keywords = [
  ["LangGraph", "TaskGraph", "Verifier"],
  ["vLLM", "LiteLLM", "Observability"],
  ["RAG", "Hybrid Search", "Evidence"],
  ["FastAPI", "Databases", "SSE"],
  ["Vue 3", "Three.js", "Bilingual"],
  ["Tests", "CI", "Fail-closed"]
] as const;

export function renderCapabilityOrbit(
  capabilities: Capabilities,
  theme: Theme,
  language: Language = "zh-CN"
): string {
  const color = palette[theme];
  const positions = [
    [248, 108],
    [600, 76],
    [952, 108],
    [952, 302],
    [600, 334],
    [248, 302]
  ] as const;
  const labels =
    language === "zh-CN"
      ? { title: "能力轨道", center: "AI 系统工程", sub: "从模型服务到产品交付" }
      : {
          title: "CAPABILITY ORBIT",
          center: "AI SYSTEMS",
          sub: "From model serving to product delivery"
        };

  const nodes = capabilities.groups
    .map((group, index) => {
      const position = positions[index];
      if (!position) return "";
      const [x, y] = position;
      const title = language === "zh-CN" ? chineseNames[index] ?? group.name : group.name;
      return `<g transform="translate(${x} ${y})">
      <rect x="-132" y="-42" width="264" height="84" rx="17" fill="${color.surface}" stroke="${index % 2 === 0 ? color.cyan : color.violet}" stroke-opacity=".65"/>
      <circle cx="-104" cy="-13" r="5" fill="${index % 2 === 0 ? color.cyan : color.violet}" class="orbitPulse"/>
      <text x="-88" y="-7" fill="${color.text}" font-size="15" font-weight="720">${escapeXml(title)}</text>
      <text x="0" y="22" fill="${color.muted}" font-size="10.5" text-anchor="middle" class="mono">${escapeXml(keywords[index]?.join(" · ") ?? "")}</text>
    </g>`;
    })
    .join("\n  ");

  return `${documentStart(1200, 420, labels.title, labels.sub)}
  <defs>
    <radialGradient id="coreGlow">
      <stop offset="0" stop-color="${color.cyan}" stop-opacity=".28"/>
      <stop offset="1" stop-color="${color.cyan}" stop-opacity="0"/>
    </radialGradient>
    <filter id="orbitGlow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <style>
      text{font-family:Inter,"Noto Sans SC","Microsoft YaHei",ui-sans-serif,system-ui,sans-serif}
      .mono{font-family:"SFMono-Regular",Consolas,"Noto Sans Mono CJK SC",monospace}
      .orbitPulse{animation:orbitPulse 3s ease-in-out infinite}
      .orbitSpin{transform-origin:600px 210px;animation:orbitSpin 20s linear infinite}
      @keyframes orbitPulse{0%,100%{opacity:.35}50%{opacity:1}}
      @keyframes orbitSpin{to{transform:rotate(360deg)}}
      @media (prefers-reduced-motion:reduce){.orbitPulse,.orbitSpin{animation:none}}
    </style>
  </defs>
  <rect width="1200" height="420" rx="22" fill="${color.background}"/>
  <text x="40" y="43" fill="${color.text}" font-size="17" font-weight="760">${escapeXml(labels.title)}</text>
  <text x="1160" y="43" fill="${color.muted}" font-size="10.5" text-anchor="end" letter-spacing="1.4" class="mono">MODEL → RUNTIME → PRODUCT</text>
  <ellipse cx="600" cy="210" rx="420" ry="145" fill="none" stroke="${color.grid}" stroke-width="1.2" stroke-dasharray="5 8"/>
  <ellipse cx="600" cy="210" rx="270" ry="104" fill="none" stroke="${color.grid}" stroke-width="1" opacity=".7"/>
  <g stroke="${color.grid}" stroke-width="1.2">
    ${positions.map(([x, y]) => `<line x1="600" y1="210" x2="${x}" y2="${y}"/>`).join("\n    ")}
  </g>
  <circle cx="600" cy="210" r="118" fill="url(#coreGlow)"/>
  <circle cx="600" cy="210" r="72" fill="${color.surface}" stroke="${color.cyan}" stroke-width="1.7" filter="url(#orbitGlow)"/>
  <text x="600" y="205" fill="${color.text}" font-size="18" font-weight="760" text-anchor="middle">${escapeXml(labels.center)}</text>
  <text x="600" y="231" fill="${color.muted}" font-size="11.5" text-anchor="middle">${escapeXml(labels.sub)}</text>
  <g class="orbitSpin">
    <circle cx="870" cy="210" r="5" fill="${color.green}" filter="url(#orbitGlow)"/>
    <circle cx="330" cy="210" r="4" fill="${color.violet}" filter="url(#orbitGlow)"/>
  </g>
  ${nodes}
</svg>
`;
}
