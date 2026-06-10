export type AchievementCondition =
  | { type: "discoverCount"; count: number }
  | { type: "discoverAllBase" }
  | { type: "favoriteCount"; count: number }
  | { type: "favoriteAllBase" }
  | { type: "storyFragmentCount"; count: number }
  | { type: "storyAllRead" }
  | { type: "catchUpCount"; count: number }
  | { type: "catchUpAll" }
  | { type: "customCount"; count: number }
  | { type: "tapeCount"; count: number }
  | { type: "anomalyTapeCount"; count: number }
  | { type: "allAchievements" };

export type Achievement = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  condition: AchievementCondition;
  isHidden?: boolean;
};

export type AchievementSave = {
  version: number;
  unlocked: string[];
  unlockedAt: Record<string, number>;
};

const STORAGE_VERSION = 1;
const STORAGE_KEY = "hxwl-4-achievements";

const BASE_STATION_IDS = ["rain", "salt", "train", "green"];

export const achievements: Achievement[] = [
  {
    id: "first-discover",
    title: "初遇电波",
    subtitle: "第一次发现一个电台",
    icon: "📡",
    color: "#8cc9df",
    condition: { type: "discoverCount", count: 1 }
  },
  {
    id: "discover-all-base",
    title: "频段探索者",
    subtitle: "发现全部 4 个基础电台",
    icon: "🔭",
    color: "#61a5c2",
    condition: { type: "discoverAllBase" }
  },
  {
    id: "first-favorite",
    title: "星标收藏家",
    subtitle: "第一次收藏一个电台",
    icon: "⭐",
    color: "#e8c36a",
    condition: { type: "favoriteCount", count: 1 }
  },
  {
    id: "favorite-all-base",
    title: "全频段珍藏",
    subtitle: "收藏全部 4 个基础电台",
    icon: "🌟",
    color: "#c2a06a",
    condition: { type: "favoriteAllBase" }
  },
  {
    id: "first-story-read",
    title: "故事入门",
    subtitle: "阅读第一个故事片段",
    icon: "📖",
    color: "#c9a8ea",
    condition: { type: "storyFragmentCount", count: 1 }
  },
  {
    id: "story-5-read",
    title: "故事爱好者",
    subtitle: "阅读 5 个故事片段",
    icon: "📚",
    color: "#a06cd5",
    condition: { type: "storyFragmentCount", count: 5 }
  },
  {
    id: "story-all-read",
    title: "故事全览",
    subtitle: "阅读完所有故事片段",
    icon: "📜",
    color: "#8a5ac5",
    condition: { type: "storyAllRead" }
  },
  {
    id: "first-catchup",
    title: "回溯过往",
    subtitle: "第一次补听错过的广播",
    icon: "⏰",
    color: "#ff9090",
    condition: { type: "catchUpCount", count: 1 }
  },
  {
    id: "catchup-3",
    title: "怀旧听众",
    subtitle: "补听 3 期错过的广播",
    icon: "📻",
    color: "#e88080",
    condition: { type: "catchUpCount", count: 3 }
  },
  {
    id: "first-custom",
    title: "私人频率",
    subtitle: "创建第一个自定义电台",
    icon: "⚗️",
    color: "#8cc9df",
    condition: { type: "customCount", count: 1 }
  },
  {
    id: "custom-3",
    title: "频段工程师",
    subtitle: "创建 3 个自定义电台",
    icon: "🔧",
    color: "#61a5c2",
    condition: { type: "customCount", count: 3 }
  },
  {
    id: "first-tape",
    title: "信号收藏家",
    subtitle: "录制第一段录音带",
    icon: "📼",
    color: "#e8c36a",
    condition: { type: "tapeCount", count: 1 }
  },
  {
    id: "tape-5",
    title: "录音室常客",
    subtitle: "录制 5 段录音带",
    icon: "🎙️",
    color: "#c2826a",
    condition: { type: "tapeCount", count: 5 }
  },
  {
    id: "first-anomaly-tape",
    title: "异常猎手",
    subtitle: "捕捉一段异常广播到录音带",
    icon: "⚠️",
    color: "#d46a6a",
    condition: { type: "anomalyTapeCount", count: 1 }
  },
  {
    id: "anomaly-tape-3",
    title: "异常档案员",
    subtitle: "捕捉 3 段异常广播到录音带",
    icon: "🚨",
    color: "#ff5050",
    condition: { type: "anomalyTapeCount", count: 3 }
  },
  {
    id: "all-achievements",
    title: "调频大师",
    subtitle: "解锁所有成就",
    icon: "👑",
    color: "#ffd700",
    condition: { type: "allAchievements" },
    isHidden: true
  }
];

export function loadAchievementSave(): AchievementSave {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createNewSave();
    }

    const data = JSON.parse(raw) as Partial<AchievementSave> & { version?: number };

    if (!data.version || data.version < STORAGE_VERSION) {
      return migrateSave(data);
    }

    return {
      version: STORAGE_VERSION,
      unlocked: data.unlocked || [],
      unlockedAt: data.unlockedAt || {}
    };
  } catch {
    return createNewSave();
  }
}

function createNewSave(): AchievementSave {
  return {
    version: STORAGE_VERSION,
    unlocked: [],
    unlockedAt: {}
  };
}

function migrateSave(data: Partial<AchievementSave> & { version?: number }): AchievementSave {
  return {
    version: STORAGE_VERSION,
    unlocked: data.unlocked || [],
    unlockedAt: data.unlockedAt || {}
  };
}

export function saveAchievementSave(save: AchievementSave): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
}

export type AchievementContext = {
  discoveredStations: string[];
  favoriteStations: string[];
  readStoryFragments: string[];
  allStoryFragmentIds: string[];
  catchUpCompleted: string[];
  availableMissedCount: number;
  customStationsCount: number;
  tapesCount: number;
  anomalyTapesCount: number;
};

function checkCondition(
  condition: AchievementCondition,
  ctx: AchievementContext,
  currentUnlockedCount: number
): boolean {
  switch (condition.type) {
    case "discoverCount":
      return ctx.discoveredStations.length >= condition.count;
    case "discoverAllBase":
      return BASE_STATION_IDS.every((id) => ctx.discoveredStations.includes(id));
    case "favoriteCount":
      return ctx.favoriteStations.length >= condition.count;
    case "favoriteAllBase":
      return BASE_STATION_IDS.every((id) => ctx.favoriteStations.includes(id));
    case "storyFragmentCount":
      return ctx.readStoryFragments.length >= condition.count;
    case "storyAllRead":
      return (
        ctx.allStoryFragmentIds.length > 0 &&
        ctx.allStoryFragmentIds.every((id) => ctx.readStoryFragments.includes(id))
      );
    case "catchUpCount":
      return ctx.catchUpCompleted.length >= condition.count;
    case "catchUpAll":
      return ctx.availableMissedCount === 0 && ctx.catchUpCompleted.length > 0;
    case "customCount":
      return ctx.customStationsCount >= condition.count;
    case "tapeCount":
      return ctx.tapesCount >= condition.count;
    case "anomalyTapeCount":
      return ctx.anomalyTapesCount >= condition.count;
    case "allAchievements":
      const nonAllIds = achievements.filter((a) => a.condition.type !== "allAchievements").map((a) => a.id);
      return nonAllIds.length > 0 && nonAllIds.every((id) => currentUnlockedCount >= nonAllIds.length || id === "");
    default:
      return false;
  }
}

export function checkNewlyUnlocked(
  save: AchievementSave,
  ctx: AchievementContext
): Achievement[] {
  const newly: Achievement[] = [];
  const nonAllAchievements = achievements.filter((a) => a.condition.type !== "allAchievements");

  for (const achievement of nonAllAchievements) {
    if (!save.unlocked.includes(achievement.id)) {
      if (checkCondition(achievement.condition, ctx, save.unlocked.length)) {
        newly.push(achievement);
      }
    }
  }

  const allAch = achievements.find((a) => a.condition.type === "allAchievements");
  if (allAch && !save.unlocked.includes(allAch.id)) {
    const nonAllIds = nonAllAchievements.map((a) => a.id);
    const allNonAllUnlocked = nonAllIds.every(
      (id) => save.unlocked.includes(id) || newly.some((n) => n.id === id)
    );
    if (allNonAllUnlocked) {
      newly.push(allAch);
    }
  }

  return newly;
}

export function unlockAchievements(
  save: AchievementSave,
  newlyUnlocked: Achievement[]
): AchievementSave {
  if (newlyUnlocked.length === 0) return save;

  const now = Date.now();
  const next: AchievementSave = {
    ...save,
    unlocked: [...save.unlocked],
    unlockedAt: { ...save.unlockedAt }
  };

  for (const ach of newlyUnlocked) {
    if (!next.unlocked.includes(ach.id)) {
      next.unlocked.push(ach.id);
      next.unlockedAt[ach.id] = now;
    }
  }

  return next;
}

export function getAchievementUnlockHint(
  achievement: Achievement,
  ctx: AchievementContext
): string {
  const c = achievement.condition;
  switch (c.type) {
    case "discoverCount": {
      const current = ctx.discoveredStations.length;
      const remaining = Math.max(0, c.count - current);
      return remaining > 0 ? `再发现 ${remaining} 个电台解锁` : "条件即将达成";
    }
    case "discoverAllBase": {
      const remaining = BASE_STATION_IDS.filter((id) => !ctx.discoveredStations.includes(id)).length;
      return remaining > 0 ? `还有 ${remaining} 个基础电台未发现` : "条件即将达成";
    }
    case "favoriteCount": {
      const current = ctx.favoriteStations.length;
      const remaining = Math.max(0, c.count - current);
      return remaining > 0 ? `再收藏 ${remaining} 个电台解锁` : "条件即将达成";
    }
    case "favoriteAllBase": {
      const remaining = BASE_STATION_IDS.filter((id) => !ctx.favoriteStations.includes(id)).length;
      return remaining > 0 ? `还有 ${remaining} 个基础电台未收藏` : "条件即将达成";
    }
    case "storyFragmentCount": {
      const current = ctx.readStoryFragments.length;
      const remaining = Math.max(0, c.count - current);
      return remaining > 0 ? `再阅读 ${remaining} 个故事片段解锁` : "条件即将达成";
    }
    case "storyAllRead": {
      const remaining = ctx.allStoryFragmentIds.filter((id) => !ctx.readStoryFragments.includes(id)).length;
      return remaining > 0 ? `还有 ${remaining} 个故事片段未阅读` : "条件即将达成";
    }
    case "catchUpCount": {
      const current = ctx.catchUpCompleted.length;
      const remaining = Math.max(0, c.count - current);
      return remaining > 0 ? `再补听 ${remaining} 期广播解锁` : "条件即将达成";
    }
    case "catchUpAll":
      return ctx.availableMissedCount > 0 ? `还有 ${ctx.availableMissedCount} 期可补听` : "条件即将达成";
    case "customCount": {
      const current = ctx.customStationsCount;
      const remaining = Math.max(0, c.count - current);
      return remaining > 0 ? `再创建 ${remaining} 个自定义电台解锁` : "条件即将达成";
    }
    case "tapeCount": {
      const current = ctx.tapesCount;
      const remaining = Math.max(0, c.count - current);
      return remaining > 0 ? `再录制 ${remaining} 段录音带解锁` : "条件即将达成";
    }
    case "anomalyTapeCount": {
      const current = ctx.anomalyTapesCount;
      const remaining = Math.max(0, c.count - current);
      return remaining > 0 ? `再捕捉 ${remaining} 段异常广播解锁` : "条件即将达成";
    }
    case "allAchievements":
      return "完成其他所有成就解锁";
    default:
      return "继续探索以解锁";
  }
}

export function getAchievementProgress(
  achievement: Achievement,
  ctx: AchievementContext
): { current: number; total: number } | null {
  const c = achievement.condition;
  switch (c.type) {
    case "discoverCount":
      return { current: Math.min(ctx.discoveredStations.length, c.count), total: c.count };
    case "discoverAllBase":
      return {
        current: BASE_STATION_IDS.filter((id) => ctx.discoveredStations.includes(id)).length,
        total: BASE_STATION_IDS.length
      };
    case "favoriteCount":
      return { current: Math.min(ctx.favoriteStations.length, c.count), total: c.count };
    case "favoriteAllBase":
      return {
        current: BASE_STATION_IDS.filter((id) => ctx.favoriteStations.includes(id)).length,
        total: BASE_STATION_IDS.length
      };
    case "storyFragmentCount":
      return { current: Math.min(ctx.readStoryFragments.length, c.count), total: c.count };
    case "storyAllRead":
      return {
        current: ctx.allStoryFragmentIds.filter((id) => ctx.readStoryFragments.includes(id)).length,
        total: Math.max(ctx.allStoryFragmentIds.length, 1)
      };
    case "catchUpCount":
      return { current: Math.min(ctx.catchUpCompleted.length, c.count), total: c.count };
    case "catchUpAll":
      return {
        current: ctx.catchUpCompleted.length,
        total: Math.max(ctx.catchUpCompleted.length + ctx.availableMissedCount, 1)
      };
    case "customCount":
      return { current: Math.min(ctx.customStationsCount, c.count), total: c.count };
    case "tapeCount":
      return { current: Math.min(ctx.tapesCount, c.count), total: c.count };
    case "anomalyTapeCount":
      return { current: Math.min(ctx.anomalyTapesCount, c.count), total: c.count };
    case "allAchievements":
      const nonAll = achievements.filter((a) => a.condition.type !== "allAchievements").length;
      return { current: nonAll, total: nonAll };
    default:
      return null;
  }
}

export function formatUnlockedTime(timestamp: number | undefined): string {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}
