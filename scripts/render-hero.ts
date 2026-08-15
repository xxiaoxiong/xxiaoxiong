import type { Profile } from "./lib/schema.js";
import { documentStart, escapeXml, palette, type Theme } from "./lib/svg.js";

type Language = "en" | "zh-CN";

function wrapStatement(
  value: string,
  language: Language,
): readonly [string, string] {
  const limit = language === "zh-CN" ? 27 : 58;
  if (value.length <= limit) return [value, ""];
  if (language === "zh-CN") {
    const splitAt = Math.max(
      value.lastIndexOf("，", limit),
      value.lastIndexOf("、", limit),
    );
    const index = splitAt > 12 ? splitAt + 1 : limit;
    return [value.slice(0, index).trim(), value.slice(index).trim()];
  }
  const words = value.split(/\s+/);
  let first = "";
  while (
    words.length > 0 &&
    `${first} ${words[0] ?? ""}`.trim().length <= limit
  ) {
    first = `${first} ${words.shift() ?? ""}`.trim();
  }
  return [first, words.join(" ")];
}

export function renderHero(
  profile: Profile,
  theme: Theme,
  language: Language = "zh-CN",
): string {
  const color = palette[theme];
  const isChinese = language === "zh-CN";
  const statement = wrapStatement(
    isChinese ? profile.statementZh : profile.statement,
    language,
  );
  const copy = isChinese
    ? {
        title: `${profile.name} — ${profile.roleZh}`,
        description: profile.statementZh,
        eyebrow: "NICHOLAS XIONG / BUILD · EXPLAIN · MAP",
        headline: "做系统，也把源码讲清楚",
        role: profile.roleZh,
        proof: "用公开项目证明能力，用源码证据支撑结论",
        status: "OPEN SOURCE · SOURCE VERIFIED",
      }
    : {
        title: `${profile.name} — ${profile.role}`,
        description: profile.statement,
        eyebrow: "NICHOLAS XIONG / BUILD · EXPLAIN · MAP",
        headline: "I build systems—and make source code clear.",
        role: profile.role,
        proof:
          "Public projects prove the work. Source anchors support the claims.",
        status: "OPEN SOURCE · SOURCE VERIFIED",
      };
  const laneKeys = ["BUILD", "EXPLAIN", "MAP"] as const;
  const lanes = profile.signature.map((item, index) => ({
    key: laneKeys[index] ?? `0${index + 1}`,
    title: isChinese ? item.titleZh : item.title,
    detail: isChinese ? item.detailZh : item.detail,
  }));

  return `${documentStart(1200, 480, copy.title, copy.description)}
  <defs>
    <linearGradient id="heroBeam" x1="0" x2="1">
      <stop offset="0" stop-color="${color.cyan}" stop-opacity=".08"/>
      <stop offset=".52" stop-color="${color.cyan}" stop-opacity=".92"/>
      <stop offset="1" stop-color="${color.violet}" stop-opacity=".18"/>
    </linearGradient>
    <linearGradient id="heroWash" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${color.cyan}" stop-opacity=".07"/>
      <stop offset=".6" stop-color="${color.background}" stop-opacity="0"/>
      <stop offset="1" stop-color="${color.violet}" stop-opacity=".07"/>
    </linearGradient>
    <filter id="heroGlow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <pattern id="heroGrid" width="32" height="32" patternUnits="userSpaceOnUse">
      <path d="M32 0H0V32" fill="none" stroke="${color.grid}" stroke-width="1"/>
    </pattern>
    <style>
      text{font-family:Inter,"Noto Sans SC","Microsoft YaHei",ui-sans-serif,system-ui,sans-serif}
      .mono{font-family:"SFMono-Regular",Consolas,"Noto Sans Mono CJK SC",monospace}
      .pulse{animation:heroPulse 3.8s ease-in-out infinite}
      .trace{animation:heroTrace 5.6s linear infinite}
      @keyframes heroPulse{0%,100%{opacity:.42}50%{opacity:1}}
      @keyframes heroTrace{0%{transform:translateY(-52px);opacity:0}18%,76%{opacity:1}100%{transform:translateY(230px);opacity:0}}
      @media (prefers-reduced-motion:reduce){.pulse,.trace{animation:none}}
    </style>
  </defs>
  <rect width="1200" height="480" rx="24" fill="${color.background}"/>
  <rect width="1200" height="480" rx="24" fill="url(#heroGrid)" opacity=".62"/>
  <rect width="1200" height="480" rx="24" fill="url(#heroWash)"/>
  <rect x="42" y="38" width="1116" height="404" rx="18" fill="none" stroke="${color.grid}"/>
  <g transform="translate(72 68)">
    <rect width="58" height="58" rx="14" fill="${color.surface}" stroke="${color.cyan}" stroke-width="1.5"/>
    <path d="M14 43V15h7l17 18V15h7v28h-6L21 24v19z" fill="${color.text}"/>
    <circle cx="49" cy="9" r="3.8" fill="${color.green}" class="pulse" filter="url(#heroGlow)"/>
  </g>
  <text x="150" y="88" fill="${color.muted}" font-size="12" letter-spacing="2.2" class="mono">${escapeXml(copy.eyebrow)}</text>
  <text x="150" y="116" fill="${color.cyan}" font-size="13" font-weight="650">${escapeXml(copy.role)}</text>
  <text x="72" y="192" fill="${color.text}" font-size="${isChinese ? 41 : 34}" font-weight="780" letter-spacing="${isChinese ? 1 : 0}">${escapeXml(copy.headline)}</text>
  <text x="72" y="238" fill="${color.text}" font-size="18.5">${escapeXml(statement[0])}</text>
  ${statement[1] ? `<text x="72" y="268" fill="${color.text}" font-size="18.5">${escapeXml(statement[1])}</text>` : ""}
  <line x1="72" y1="304" x2="650" y2="304" stroke="url(#heroBeam)" stroke-width="1.5"/>
  <text x="72" y="338" fill="${color.muted}" font-size="13.5">${escapeXml(copy.proof)}</text>
  <g transform="translate(72 382)">
    <circle cx="5" cy="-4" r="4.5" fill="${color.green}" class="pulse"/>
    <text x="20" y="0" fill="${color.green}" font-size="10.5" letter-spacing="1.8" class="mono">${escapeXml(copy.status)}</text>
  </g>
  <g>
    <line x1="742" y1="104" x2="742" y2="354" stroke="${color.grid}" stroke-width="2"/>
    <circle cx="742" cy="104" r="4" fill="${color.cyan}" class="trace" filter="url(#heroGlow)"/>
    ${lanes
      .map((lane, index) => {
        const y = 72 + index * 116;
        const accent =
          index === 1 ? color.violet : index === 2 ? color.green : color.cyan;
        return `<g transform="translate(770 ${y})">
      <rect width="350" height="92" rx="16" fill="${color.surface}" stroke="${accent}" stroke-opacity="${index === 1 ? ".72" : ".48"}"/>
      <rect x="18" y="18" width="70" height="22" rx="11" fill="${color.surfaceAlt}" stroke="${color.grid}"/>
      <circle cx="29" cy="29" r="3" fill="${accent}"/>
      <text x="39" y="33" fill="${accent}" font-size="9.5" letter-spacing="1.4" class="mono">${lane.key}</text>
      <text x="18" y="61" fill="${color.text}" font-size="15.5" font-weight="740">${escapeXml(lane.title)}</text>
      <text x="18" y="81" fill="${color.muted}" font-size="${isChinese ? 10.8 : 9.8}">${escapeXml(lane.detail)}</text>
    </g>`;
      })
      .join("\n    ")}
  </g>
</svg>
`;
}
