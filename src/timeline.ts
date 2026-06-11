import { storyChapters, type StoryChapter, type StorylineSave } from "./storyline";
import { dailyBroadcasts, getAnomalyLevelLabel, getAnomalyLevelColor, type DailyBroadcast, type DailyBroadcastSave } from "./dailyBroadcast";
import { signalPuzzles, type SignalPuzzle, type SignalPuzzleSave } from "./signalPuzzle";
import type { SignalTape, SignalTapeSave } from "./signalTape";

export type TimelineItemType = "story" | "daily" | "puzzle" | "tape";

export type TimelineItem = {
  id: string;
  type: TimelineItemType;
  timestamp: number;
  title: string;
  subtitle: string;
  color: string;
  icon: string;
  isUnread: boolean;
  anomalyLevel?: "normal" | "unusual" | "anomaly" | "critical";
  anomalyLabel?: string;
  anomalyColor?: string;
  stationIds: string[];
  stationNames: string[];
  isRecorded?: boolean;
  target:
    | { type: "story"; chapterId: string; fragmentId: string | null }
    | { type: "daily"; broadcastId: string; fragmentId: string | null }
    | { type: "puzzle"; puzzleId: string }
    | { type: "tape"; tapeId: string };
};

export type ReadingTimelineResult =
  | { type: "story"; data: { chapterId: string; fragmentId: string } }
  | { type: "daily"; data: { broadcastId: string; fragmentId: string } }
  | null;

const stationNameMap: Record<string, string> = {
  rain: "雨棚旧讯号",
  salt: "盐湖观测站",
  train: "末班列车台",
  green: "温室低语",
};

function getStationName(id: string): string {
  return stationNameMap[id] || id;
}

function isContentRecorded(stationIds: string[], title: string, tapes: SignalTape[]): boolean {
  return tapes.some((tape) => {
    if (!stationIds.includes(tape.stationId)) return false;
    if (tape.scheduleName && tape.scheduleName.includes(title)) return true;
    if (title && tape.content.includes(title.slice(0, 20))) return true;
    return false;
  });
}

function getStoryChapterStationIds(chapter: StoryChapter): string[] {
  const map: Record<string, string[]> = {
    prologue: ["rain", "salt", "train", "green"],
    "chapter-rain": ["rain"],
    "chapter-salt": ["salt"],
    "chapter-train": ["train"],
    "chapter-green": ["green"],
    "chapter-resonance": ["rain", "salt", "train", "green"],
    "hidden-collector": ["rain", "salt", "train", "green"],
    "hidden-archivist": ["rain", "salt", "train", "green"],
    "combo-rain-train": ["rain", "train"],
    "combo-salt-green": ["salt", "green"],
    "combo-favorites-rain-salt": ["rain", "salt"],
    "combo-favorites-train-green": ["train", "green"],
    "combo-grand": ["rain", "salt", "train", "green"],
  };
  return map[chapter.id] || [];
}

function buildStoryItems(
  chapters: StoryChapter[],
  storylineSave: StorylineSave,
  tapes: SignalTape[]
): TimelineItem[] {
  const items: TimelineItem[] = [];

  for (const chapter of chapters) {
    if (!storylineSave.unlockedChapters.includes(chapter.id)) continue;

    const unlockedAt = storylineSave.unlockedAt[chapter.id] || 0;
    const stationIds = getStoryChapterStationIds(chapter);
    const stationNames = stationIds.map(getStationName);
    const isRecorded = isContentRecorded(stationIds, chapter.title, tapes);

    const firstUnreadFragment = chapter.fragments.find(
      (f) => !storylineSave.readFragments.includes(f.id)
    );

    const allRead = chapter.fragments.every((f) =>
      storylineSave.readFragments.includes(f.id)
    );

    items.push({
      id: `story-${chapter.id}`,
      type: "story",
      timestamp: unlockedAt,
      title: chapter.title,
      subtitle: chapter.subtitle,
      color: chapter.color,
      icon: "📖",
      isUnread: !allRead,
      stationIds,
      stationNames,
      isRecorded,
      target: {
        type: "story",
        chapterId: chapter.id,
        fragmentId: firstUnreadFragment?.id || chapter.fragments[0]?.id || null,
      },
    });
  }

  return items;
}

function buildDailyItems(
  broadcasts: DailyBroadcast[],
  dailySave: DailyBroadcastSave,
  tapes: SignalTape[]
): TimelineItem[] {
  const items: TimelineItem[] = [];

  for (const broadcast of broadcasts) {
    if (!dailySave.discoveredBroadcasts.includes(broadcast.id)) continue;

    const discoveredAt = dailySave.discoveredAt[broadcast.id] || 0;
    const stationNames = broadcast.stationIds.map(getStationName);
    const isRecorded = isContentRecorded(broadcast.stationIds, broadcast.title, tapes);

    const firstUnreadFragment = broadcast.fragments.find(
      (f) => !dailySave.readFragments.includes(f.id)
    );

    const allRead = broadcast.fragments.every((f) =>
      dailySave.readFragments.includes(f.id)
    );

    items.push({
      id: `daily-${broadcast.id}`,
      type: "daily",
      timestamp: discoveredAt,
      title: broadcast.title,
      subtitle: broadcast.subtitle,
      color: broadcast.color,
      icon: "📡",
      isUnread: !allRead,
      anomalyLevel: broadcast.anomalyLevel,
      anomalyLabel: getAnomalyLevelLabel(broadcast.anomalyLevel),
      anomalyColor: getAnomalyLevelColor(broadcast.anomalyLevel),
      stationIds: broadcast.stationIds,
      stationNames,
      isRecorded,
      target: {
        type: "daily",
        broadcastId: broadcast.id,
        fragmentId: firstUnreadFragment?.id || broadcast.fragments[0]?.id || null,
      },
    });
  }

  return items;
}

function buildPuzzleItems(
  puzzles: SignalPuzzle[],
  puzzleSave: SignalPuzzleSave
): TimelineItem[] {
  const items: TimelineItem[] = [];

  for (const puzzle of puzzles) {
    if (!puzzleSave.solvedPuzzles.includes(puzzle.id)) continue;

    const solvedAt = puzzleSave.solvedAt[puzzle.id] || 0;
    const stationName = getStationName(puzzle.stationId);

    items.push({
      id: `puzzle-${puzzle.id}`,
      type: "puzzle",
      timestamp: solvedAt,
      title: `谜题奖励 · ${puzzle.title}`,
      subtitle: puzzle.reward.title,
      color: puzzle.color,
      icon: "🧩",
      isUnread: false,
      stationIds: [puzzle.stationId],
      stationNames: [stationName],
      target: {
        type: "puzzle",
        puzzleId: puzzle.id,
      },
    });
  }

  return items;
}

function buildTapeItems(tapes: SignalTape[]): TimelineItem[] {
  const items: TimelineItem[] = [];

  for (const tape of tapes) {
    items.push({
      id: `tape-${tape.id}`,
      type: "tape",
      timestamp: tape.savedAt,
      title: `录音带 · ${tape.stationName}`,
      subtitle: tape.scheduleName || tape.content.slice(0, 50) + (tape.content.length > 50 ? "…" : ""),
      color: tape.color,
      icon: "📼",
      isUnread: false,
      anomalyLevel: tape.isAnomaly ? "anomaly" : "normal",
      anomalyLabel: tape.isAnomaly ? "异常广播" : "正常广播",
      anomalyColor: tape.isAnomaly ? "#e89b6a" : "#5aa86a",
      stationIds: [tape.stationId],
      stationNames: [tape.stationName],
      isRecorded: true,
      target: {
        type: "tape",
        tapeId: tape.id,
      },
    });
  }

  return items;
}

export function buildTimeline(
  storylineSave: StorylineSave,
  dailySave: DailyBroadcastSave,
  puzzleSave: SignalPuzzleSave,
  tapeSave: SignalTapeSave
): TimelineItem[] {
  const tapes = tapeSave.tapes;
  const storyItems = buildStoryItems(storyChapters, storylineSave, tapes);
  const dailyItems = buildDailyItems(dailyBroadcasts, dailySave, tapes);
  const puzzleItems = buildPuzzleItems(signalPuzzles, puzzleSave);
  const tapeItems = buildTapeItems(tapes);

  const allItems = [...storyItems, ...dailyItems, ...puzzleItems, ...tapeItems];

  allItems.sort((a, b) => b.timestamp - a.timestamp);

  return allItems;
}

export function getTimelineUnreadCount(items: TimelineItem[]): number {
  return items.filter((item) => item.isUnread).length;
}

export function getLatestUnreadItem(items: TimelineItem[]): TimelineItem | null {
  const unreadItems = items.filter((item) => item.isUnread);
  if (unreadItems.length === 0) return null;
  return unreadItems.sort((a, b) => b.timestamp - a.timestamp)[0];
}

export function getTimelineContinueReading(
  items: TimelineItem[]
): ReadingTimelineResult {
  const latestUnread = getLatestUnreadItem(items);
  if (!latestUnread) return null;

  if (latestUnread.type === "story" && latestUnread.target.type === "story" && latestUnread.target.fragmentId) {
    return {
      type: "story",
      data: {
        chapterId: latestUnread.target.chapterId,
        fragmentId: latestUnread.target.fragmentId,
      },
    };
  }

  if (latestUnread.type === "daily" && latestUnread.target.type === "daily" && latestUnread.target.fragmentId) {
    return {
      type: "daily",
      data: {
        broadcastId: latestUnread.target.broadcastId,
        fragmentId: latestUnread.target.fragmentId,
      },
    };
  }

  return null;
}

export function formatTimelineTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "刚刚";
  if (diffMins < 60) return `${diffMins} 分钟前`;
  if (diffHours < 24) return `${diffHours} 小时前`;
  if (diffDays < 7) return `${diffDays} 天前`;

  return date.toLocaleDateString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTimelineDetailTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString("zh-CN");
}
