import type { GeneratedData } from "./lib/schema.js";
import { documentStart, palette, type Theme } from "./lib/svg.js";

const levelOpacity = {
  NONE: 0.08,
  FIRST_QUARTILE: 0.3,
  SECOND_QUARTILE: 0.5,
  THIRD_QUARTILE: 0.72,
  FOURTH_QUARTILE: 1
} as const;

export function renderContributionSwarm(
  data: GeneratedData,
  theme: Theme,
  language: "en" | "zh-CN" = "zh-CN"
): string {
  const color = palette[theme];
  const copy =
    language === "zh-CN"
      ? {
          title: "开源贡献脉冲",
          verified: "已验证的 GitHub 公共数据",
          pending: "等待首次公共数据刷新",
          empty: "运行 UPDATE PROFILE 工作流以载入公开贡献日历",
          metrics: ["总贡献", "活跃天数", "当前连续", "最长连续"]
        }
      : {
          title: "OPEN-SOURCE CONTRIBUTION PULSE",
          verified: "VERIFIED PUBLIC API DATA",
          pending: "VERIFIED DATA REFRESH PENDING",
          empty: "RUN UPDATE PROFILE TO LOAD THE PUBLIC CONTRIBUTION CALENDAR",
          metrics: ["TOTAL", "ACTIVE DAYS", "CURRENT STREAK", "LONGEST STREAK"]
        };
  const days = data.contributionSummary.weeks.flatMap((week, weekIndex) =>
    week.days.map((day, dayIndex) => ({ ...day, weekIndex, dayIndex }))
  );
  const cells =
    days.length > 0
      ? days
          .map(
            (day) =>
              `<rect x="${72 + day.weekIndex * 19}" y="${92 + day.dayIndex * 19}" width="13" height="13" rx="3" fill="${color.green}" opacity="${levelOpacity[day.level]}"><title>${day.date}: ${day.count} contributions</title></rect>`
          )
          .join("\n  ")
      : Array.from({ length: 53 * 7 }, (_, index) => {
          const week = Math.floor(index / 7);
          const day = index % 7;
          return `<rect x="${72 + week * 19}" y="${92 + day * 19}" width="13" height="13" rx="3" fill="${color.grid}" opacity="0.45"/>`;
        }).join("\n  ");

  const activePoints = days.filter((day) => day.count > 0);
  const pathPoints = activePoints
    .slice(-18)
    .map((day) => `${78.5 + day.weekIndex * 19},${98.5 + day.dayIndex * 19}`)
    .join(" ");
  const hasVerifiedCalendar = activePoints.length > 1;
  const metrics = [
    [copy.metrics[0], data.contributionSummary.totalContributions],
    [copy.metrics[1], data.contributionSummary.activeDays],
    [copy.metrics[2], data.contributionSummary.currentStreak],
    [copy.metrics[3], data.contributionSummary.longestStreak]
  ] as const;

  return `${documentStart(1200, 330, copy.title, "A GitHub contribution calendar rendered only from verified API data, with a last-known-good fallback.")}
  <defs>
    <filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <style>
      text{font-family:Inter,"Noto Sans SC","Microsoft YaHei",ui-sans-serif,system-ui,sans-serif}.mono{font-family:"SFMono-Regular",Consolas,"Noto Sans Mono CJK SC",monospace}
      @media (prefers-reduced-motion:reduce){.agent-motion{display:none}}
    </style>
  </defs>
  <rect width="1200" height="330" rx="20" fill="${color.background}"/>
  <rect x="36" y="34" width="1128" height="262" rx="15" fill="${color.surface}" stroke="${color.grid}"/>
  <text x="68" y="67" fill="${color.text}" font-size="16" font-weight="700">${copy.title}</text>
  <text x="1132" y="67" fill="${hasVerifiedCalendar ? color.green : color.muted}" font-size="11" text-anchor="end" letter-spacing="${language === "zh-CN" ? 0.5 : 1.5}" class="mono">${hasVerifiedCalendar ? copy.verified : copy.pending}</text>
  ${cells}
  ${
    hasVerifiedCalendar
      ? `<polyline id="route" points="${pathPoints}" fill="none" stroke="${color.cyan}" stroke-width="1.2" opacity="0.35"/>
  ${[0, 1, 2]
    .map(
      (index) => `<circle cx="${78.5 + (activePoints.at(-1)?.weekIndex ?? 0) * 19}" cy="${98.5 + (activePoints.at(-1)?.dayIndex ?? 0) * 19}" r="${index === 0 ? 4 : 3}" fill="${index === 1 ? color.violet : color.cyan}" filter="url(#glow)" class="agent-motion">
    <animateMotion dur="${8 + index * 2}s" begin="-${index * 2}s" repeatCount="indefinite" path="M${pathPoints.replaceAll(" ", " L")}"/>
  </circle>`
    )
    .join("\n  ")}`
      : `<text x="575" y="170" fill="${color.muted}" text-anchor="middle" font-size="13" class="mono">${copy.empty}</text>`
  }
  ${metrics
    .map(([label, value], index) => {
      const x = 80 + index * 278;
      return `<text x="${x}" y="270" fill="${color.muted}" font-size="10" letter-spacing="1.2" class="mono">${label}</text>
  <text x="${x + 118}" y="270" fill="${color.text}" font-size="13" text-anchor="end" class="mono">${value ?? "—"}</text>`;
    })
    .join("\n  ")}
</svg>
`;
}
