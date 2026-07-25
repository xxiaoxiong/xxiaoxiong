import type { Project } from "./lib/schema.js";
import { documentStart, escapeXml, palette, type Theme } from "./lib/svg.js";

type Language = "en" | "zh-CN";

const projectCopy: Record<
  string,
  { zh: readonly [string, string]; en: readonly [string, string] }
> = {
  "xxiaoxiong/MegaDeepagents": {
    zh: ["多智能体运行平台", "治理 · 状态 · 验证 · 恢复"],
    en: ["Multi-Agent Runtime", "Govern · Persist · Verify · Recover"]
  },
  "xxiaoxiong/3DHomepage": {
    zh: ["空间 AI 作品世界", "Three.js · 6 个交互区域"],
    en: ["Spatial AI World", "Three.js · 6 Interactive Zones"]
  },
  "xxiaoxiong/awesome-multi-agent-projects": {
    zh: ["多智能体开源图谱", "101 项目 · 21 个领域"],
    en: ["Multi-Agent Atlas", "101 Projects · 21 Domains"]
  },
  "xxiaoxiong/learn-hermes-agent": {
    zh: ["Hermes Agent 教学项目", "24 个机制 · 双语学习路径"],
    en: ["Hermes Agent Learning Lab", "24 Mechanisms · Bilingual Path"]
  },
  "xxiaoxiong/general-agent-frame": {
    zh: ["通用 Agent Runtime", "精简 · 稳定 · DeepAgents 原生"],
    en: ["General Agent Runtime", "Compact · Stable · DeepAgents Native"]
  },
  "xxiaoxiong/AI-GeneralPlat": {
    zh: ["企业级 AI 能力平台", "模型 · RAG · Agent · 工作流"],
    en: ["Enterprise AI Platform", "Models · RAG · Agents · Workflows"]
  }
};

export function renderProjectShowcase(
  projects: Project[],
  theme: Theme,
  language: Language = "zh-CN"
): string {
  const color = palette[theme];
  const flagship = [...projects].sort((a, b) => a.priority - b.priority).slice(0, 6);
  const labels =
    language === "zh-CN"
      ? { title: "旗舰系统", hint: "三个项目，一条完整的 AI 工程主线", view: "点击下方链接进入项目" }
      : {
          title: "FLAGSHIP SYSTEMS",
          hint: "Three projects, one end-to-end AI engineering story",
          view: "Open a project from the links below"
        };
  const cards = flagship
    .map((project, index) => {
      const column = index % 3;
      const row = Math.floor(index / 3);
      const x = 42 + column * 380;
      const y = 102 + row * 206;
      const copy = projectCopy[project.repository];
      const text = language === "zh-CN" ? copy?.zh : copy?.en;
      const technologies = project.technologies.slice(0, 3);
      return `<g transform="translate(${x} ${y})">
      <rect width="356" height="184" rx="18" fill="${color.surface}" stroke="${index < 3 ? color.cyan : color.grid}" stroke-width="${index < 3 ? 1.55 : 1.1}" stroke-opacity="${index < 3 ? 0.8 : 1}"/>
      <text x="22" y="32" fill="${index < 3 ? color.cyan : color.violet}" font-size="10.5" letter-spacing="1.8" class="mono">0${index + 1} / ${index < 3 ? "PRIMARY" : "CORE"}</text>
      <text x="22" y="66" fill="${color.text}" font-size="${project.title.length > 24 ? 17 : 21}" font-weight="760">${escapeXml(project.title)}</text>
      <text x="22" y="96" fill="${color.text}" font-size="14.5" font-weight="650">${escapeXml(text?.[0] ?? project.description)}</text>
      <text x="22" y="121" fill="${color.muted}" font-size="11.5">${escapeXml(text?.[1] ?? project.architecture)}</text>
      ${technologies
        .map((technology, technologyIndex) => {
          const chipX = 22 + technologyIndex * 104;
          const chipY = 142;
          return `<g transform="translate(${chipX} ${chipY})">
        <rect width="94" height="23" rx="11.5" fill="${color.surfaceAlt}" stroke="${color.grid}"/>
        <circle cx="11" cy="11.5" r="2.7" fill="${technologyIndex % 2 === 0 ? color.green : color.cyan}"/>
        <text x="20" y="15.2" fill="${color.muted}" font-size="${technology.length > 11 ? 8.4 : 9.5}" class="mono">${escapeXml(technology)}</text>
      </g>`;
        })
        .join("\n      ")}
    </g>`;
    })
    .join("\n  ");

  return `${documentStart(1200, 535, labels.title, labels.hint)}
  <defs>
    <linearGradient id="projectBeam" x1="0" x2="1">
      <stop offset="0" stop-color="${color.cyan}" stop-opacity=".15"/>
      <stop offset=".5" stop-color="${color.cyan}"/>
      <stop offset="1" stop-color="${color.violet}" stop-opacity=".15"/>
    </linearGradient>
    <filter id="projectGlow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="4" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <pattern id="projectGrid" width="30" height="30" patternUnits="userSpaceOnUse">
      <path d="M30 0H0V30" fill="none" stroke="${color.grid}" stroke-width="1"/>
    </pattern>
    <style>
      text{font-family:Inter,"Noto Sans SC","Microsoft YaHei",ui-sans-serif,system-ui,sans-serif}
      .mono{font-family:"SFMono-Regular",Consolas,"Noto Sans Mono CJK SC",monospace}
      .signal{animation:signal 3.8s ease-in-out infinite}
      @keyframes signal{0%,100%{opacity:.35}50%{opacity:1}}
      @media (prefers-reduced-motion:reduce){.signal{animation:none}}
    </style>
  </defs>
  <rect width="1200" height="535" rx="22" fill="${color.background}"/>
  <rect width="1200" height="535" rx="22" fill="url(#projectGrid)" opacity=".55"/>
  <text x="42" y="46" fill="${color.text}" font-size="17" font-weight="760">${escapeXml(labels.title)}</text>
  <text x="42" y="74" fill="${color.muted}" font-size="13">${escapeXml(labels.hint)}</text>
  <text x="1158" y="46" fill="${color.muted}" font-size="10.5" text-anchor="end" letter-spacing="1.4" class="mono">${escapeXml(labels.view)}</text>
  <path id="projectRoute" d="M42 88 C260 46 440 92 600 88 S940 46 1158 88" fill="none" stroke="url(#projectBeam)" stroke-width="2"/>
  ${[0, 1, 2]
    .map(
      (index) => `<circle r="${index === 0 ? 5 : 3.5}" fill="${index === 1 ? color.violet : color.cyan}" filter="url(#projectGlow)" class="signal">
    <animateMotion dur="${7 + index * 1.8}s" begin="-${index * 2}s" repeatCount="indefinite">
      <mpath href="#projectRoute"/>
    </animateMotion>
  </circle>`
    )
    .join("\n  ")}
  ${cards}
  <g transform="translate(538 510)">
    <circle r="4" fill="${color.green}" class="signal"/>
    <text x="14" y="4" fill="${color.green}" font-size="10.5" letter-spacing="1.7" class="mono">BUILD → VERIFY → SHIP</text>
  </g>
</svg>
`;
}
