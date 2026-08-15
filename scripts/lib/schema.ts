import { z } from "zod";

const url = z.url();

export const profileSchema = z.object({
  name: z.string().min(1),
  github: z.string().regex(/^[A-Za-z0-9-]+$/),
  role: z.string().min(1),
  roleZh: z.string().min(1),
  statement: z.string().min(1),
  statementZh: z.string().min(1),
  signature: z
    .array(
      z.object({
        title: z.string().min(1),
        titleZh: z.string().min(1),
        detail: z.string().min(1),
        detailZh: z.string().min(1)
      })
    )
    .length(3),
  currentFocus: z.array(z.string().min(1)).min(1),
  currentFocusZh: z.array(z.string().min(1)).min(1),
  links: z.object({
    portfolio: url,
    github: url,
    megaDeepagents: url,
    deepSeekCourse: url,
    multiAgentAtlas: url,
    openSource: url
  }),
  contact: z.object({
    email: z.email()
  }),
  display: z.object({
    language: z.enum(["en", "zh-CN"]),
    theme: z.string().min(1),
    motion: z.enum(["none", "restrained"])
  })
});

export const projectSchema = z.object({
  repository: z.string().regex(/^[^/]+\/[^/]+$/),
  title: z.string().min(1),
  description: z.string().min(1),
  problem: z.string().min(1),
  architecture: z.string().min(1),
  evidence: z.array(z.string().min(1)).min(1),
  liveUrl: url.nullable(),
  repositoryUrl: url,
  technologies: z.array(z.string().min(1)).min(1),
  priority: z.number().int().positive(),
  pinRecommendation: z.boolean(),
  originality: z.enum(["original", "fork"]),
  readmeQuality: z.enum(["strong", "good", "adequate", "needs-work", "upstream"]),
  hasDemo: z.boolean(),
  hasTests: z.boolean(),
  hasCI: z.boolean(),
  license: z.string().min(1),
  issues: z.array(z.string().min(1)),
  improvements: z.array(z.string().min(1))
});

export const projectsSchema = z.object({
  projects: z.array(projectSchema).min(1).superRefine((projects, context) => {
    const repositories = new Set<string>();
    const priorities = new Set<number>();
    for (const project of projects) {
      if (repositories.has(project.repository)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate repository: ${project.repository}`
        });
      }
      if (priorities.has(project.priority)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate priority: ${project.priority}`
        });
      }
      repositories.add(project.repository);
      priorities.add(project.priority);
    }
  })
});

export const capabilitiesSchema = z.object({
  groups: z
    .array(
      z.object({
        name: z.string().min(1),
        evidence: z.array(z.string().min(1)).min(2)
      })
    )
    .length(6)
});

export const pullRequestSchema = z.object({
  repository: z.string().regex(/^[^/]+\/[^/]+$/),
  number: z.number().int().positive(),
  title: z.string().min(1),
  category: z.enum([
    "Agent Runtime",
    "AI Gateway",
    "Backend",
    "Frontend",
    "Infrastructure",
    "Documentation",
    "Finance",
    "Testing",
    "Security",
    "Engineering"
  ]),
  url,
  state: z.literal("MERGED"),
  mergedAt: z.iso.datetime().optional()
});

export const contributionDaySchema = z.object({
  date: z.iso.date(),
  count: z.number().int().nonnegative(),
  level: z.enum(["NONE", "FIRST_QUARTILE", "SECOND_QUARTILE", "THIRD_QUARTILE", "FOURTH_QUARTILE"])
});

export const generatedSchema = z.object({
  generatedAt: z.iso.datetime(),
  source: z.object({
    provider: z.literal("GitHub API"),
    query: z.string().min(1),
    cachePolicy: z.literal("last-known-good")
  }),
  recentMergedPullRequests: z.array(pullRequestSchema).max(12),
  contributionSummary: z.object({
    totalContributions: z.number().int().nonnegative().nullable(),
    activeDays: z.number().int().nonnegative().nullable(),
    currentStreak: z.number().int().nonnegative().nullable(),
    longestStreak: z.number().int().nonnegative().nullable(),
    weeks: z.array(z.object({ days: z.array(contributionDaySchema).max(7) })).max(54)
  }),
  repositorySummary: z.array(
    z.object({
      repository: z.string().regex(/^[^/]+\/[^/]+$/),
      defaultBranch: z.string().min(1),
      isFork: z.boolean(),
      license: z.string().nullable(),
      hasReadme: z.boolean(),
      hasCI: z.boolean(),
      hasDemo: z.boolean()
    })
  ),
  previousSuccessfulGeneration: z.object({
    generatedAt: z.iso.datetime(),
    recordCount: z.number().int().nonnegative()
  })
});

export type Profile = z.infer<typeof profileSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Capabilities = z.infer<typeof capabilitiesSchema>;
export type GeneratedData = z.infer<typeof generatedSchema>;
export type MergedPullRequest = z.infer<typeof pullRequestSchema>;
