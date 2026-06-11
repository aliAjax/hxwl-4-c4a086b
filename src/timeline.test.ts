import { describe, it, expect } from "vitest";
import {
  buildTimeline,
  getTimelineUnreadCount,
  getLatestUnreadItem,
  getTimelineContinueReading,
  type TimelineItem,
} from "./timeline";
import type { StorylineSave } from "./storyline";
import type { DailyBroadcastSave } from "./dailyBroadcast";
import type { SignalPuzzleSave } from "./signalPuzzle";
import type { SignalTapeSave } from "./signalTape";
import { storyChapters } from "./storyline";
import { dailyBroadcasts } from "./dailyBroadcast";
import { signalPuzzles } from "./signalPuzzle";

const BASE_TIME = 1700000000000;

const emptyStorylineSave: StorylineSave = {
  unlockedChapters: [],
  readFragments: [],
  unlockedAt: {},
  lastReadAt: {},
};

const emptyDailySave: DailyBroadcastSave = {
  version: 2,
  discoveredBroadcasts: [],
  readFragments: [],
  discoveredAt: {},
  lastReadAt: {},
  missedCatchUps: [],
  catchUpCompleted: [],
};

const emptyPuzzleSave: SignalPuzzleSave = {
  version: 2,
  solvedPuzzles: [],
  solvedAt: {},
  attemptedPuzzles: [],
  attemptCounts: {},
};

const emptyTapeSave: SignalTapeSave = {
  version: 2,
  tapes: [],
};

describe("时间线 - 合并排序", () => {
  it("空数据应返回空数组", () => {
    const result = buildTimeline(
      emptyStorylineSave,
      emptyDailySave,
      emptyPuzzleSave,
      emptyTapeSave
    );
    expect(result).toEqual([]);
  });

  it("仅故事章节应正确生成时间线项", () => {
    const storylineSave: StorylineSave = {
      ...emptyStorylineSave,
      unlockedChapters: ["prologue", "chapter-rain"],
      unlockedAt: {
        prologue: BASE_TIME,
        "chapter-rain": BASE_TIME + 1000,
      },
      readFragments: [],
    };

    const result = buildTimeline(
      storylineSave,
      emptyDailySave,
      emptyPuzzleSave,
      emptyTapeSave
    );

    expect(result.length).toBe(2);
    expect(result[0].type).toBe("story");
    expect(result[0].id).toBe("story-chapter-rain");
    expect(result[0].timestamp).toBe(BASE_TIME + 1000);
    expect(result[1].type).toBe("story");
    expect(result[1].id).toBe("story-prologue");
    expect(result[1].timestamp).toBe(BASE_TIME);
  });

  it("仅每日广播应正确生成时间线项", () => {
    const dailySave: DailyBroadcastSave = {
      ...emptyDailySave,
      discoveredBroadcasts: [dailyBroadcasts[0].id, dailyBroadcasts[1].id],
      discoveredAt: {
        [dailyBroadcasts[0].id]: BASE_TIME + 2000,
        [dailyBroadcasts[1].id]: BASE_TIME + 3000,
      },
      readFragments: [],
    };

    const result = buildTimeline(
      emptyStorylineSave,
      dailySave,
      emptyPuzzleSave,
      emptyTapeSave
    );

    expect(result.length).toBe(2);
    expect(result[0].type).toBe("daily");
    expect(result[0].timestamp).toBe(BASE_TIME + 3000);
    expect(result[1].type).toBe("daily");
    expect(result[1].timestamp).toBe(BASE_TIME + 2000);
  });

  it("仅已解决谜题应正确生成时间线项", () => {
    const puzzleSave: SignalPuzzleSave = {
      ...emptyPuzzleSave,
      solvedPuzzles: ["puzzle-salt-morse", "puzzle-train-sequence"],
      solvedAt: {
        "puzzle-salt-morse": BASE_TIME + 4000,
        "puzzle-train-sequence": BASE_TIME + 5000,
      },
    };

    const result = buildTimeline(
      emptyStorylineSave,
      emptyDailySave,
      puzzleSave,
      emptyTapeSave
    );

    expect(result.length).toBe(2);
    expect(result[0].type).toBe("puzzle");
    expect(result[0].id).toBe("puzzle-puzzle-train-sequence");
    expect(result[0].timestamp).toBe(BASE_TIME + 5000);
    expect(result[1].type).toBe("puzzle");
    expect(result[1].id).toBe("puzzle-puzzle-salt-morse");
    expect(result[1].timestamp).toBe(BASE_TIME + 4000);
  });

  it("仅录音带应正确生成时间线项", () => {
    const tapeSave: SignalTapeSave = {
      version: 2,
      tapes: [
        {
          id: "tape-1",
          stationId: "rain",
          stationName: "雨棚旧讯号",
          frequency: 88.7,
          color: "#6aa8d5",
          scheduleName: "测试节目",
          scheduleStartTime: "20:00",
          scheduleEndTime: "21:00",
          content: "测试内容1",
          savedAt: BASE_TIME + 6000,
          isAnomaly: false,
        },
        {
          id: "tape-2",
          stationId: "salt",
          stationName: "盐湖观测站",
          frequency: 93.4,
          color: "#e8c36a",
          scheduleName: null,
          scheduleStartTime: null,
          scheduleEndTime: null,
          content: "测试内容2",
          savedAt: BASE_TIME + 7000,
          isAnomaly: true,
        },
      ],
    };

    const result = buildTimeline(
      emptyStorylineSave,
      emptyDailySave,
      emptyPuzzleSave,
      tapeSave
    );

    expect(result.length).toBe(2);
    expect(result[0].type).toBe("tape");
    expect(result[0].id).toBe("tape-tape-2");
    expect(result[0].timestamp).toBe(BASE_TIME + 7000);
    expect(result[0].anomalyLevel).toBe("anomaly");
    expect(result[1].type).toBe("tape");
    expect(result[1].id).toBe("tape-tape-1");
    expect(result[1].timestamp).toBe(BASE_TIME + 6000);
    expect(result[1].anomalyLevel).toBe("normal");
  });

  it("四种类型混合应按时间倒序排列", () => {
    const storylineSave: StorylineSave = {
      ...emptyStorylineSave,
      unlockedChapters: ["prologue"],
      unlockedAt: { prologue: BASE_TIME },
      readFragments: [],
    };

    const dailySave: DailyBroadcastSave = {
      ...emptyDailySave,
      discoveredBroadcasts: [dailyBroadcasts[0].id],
      discoveredAt: { [dailyBroadcasts[0].id]: BASE_TIME + 2000 },
      readFragments: [],
    };

    const puzzleSave: SignalPuzzleSave = {
      ...emptyPuzzleSave,
      solvedPuzzles: ["puzzle-salt-morse"],
      solvedAt: { "puzzle-salt-morse": BASE_TIME + 4000 },
    };

    const tapeSave: SignalTapeSave = {
      version: 2,
      tapes: [
        {
          id: "tape-1",
          stationId: "rain",
          stationName: "雨棚旧讯号",
          frequency: 88.7,
          color: "#6aa8d5",
          scheduleName: null,
          scheduleStartTime: null,
          scheduleEndTime: null,
          content: "测试内容",
          savedAt: BASE_TIME + 6000,
          isAnomaly: false,
        },
      ],
    };

    const result = buildTimeline(
      storylineSave,
      dailySave,
      puzzleSave,
      tapeSave
    );

    expect(result.length).toBe(4);
    expect(result[0].type).toBe("tape");
    expect(result[0].timestamp).toBe(BASE_TIME + 6000);
    expect(result[1].type).toBe("puzzle");
    expect(result[1].timestamp).toBe(BASE_TIME + 4000);
    expect(result[2].type).toBe("daily");
    expect(result[2].timestamp).toBe(BASE_TIME + 2000);
    expect(result[3].type).toBe("story");
    expect(result[3].timestamp).toBe(BASE_TIME);
  });

  it("相同时间戳的项目顺序应稳定", () => {
    const storylineSave: StorylineSave = {
      ...emptyStorylineSave,
      unlockedChapters: ["prologue"],
      unlockedAt: { prologue: BASE_TIME },
      readFragments: [],
    };

    const dailySave: DailyBroadcastSave = {
      ...emptyDailySave,
      discoveredBroadcasts: [dailyBroadcasts[0].id],
      discoveredAt: { [dailyBroadcasts[0].id]: BASE_TIME },
      readFragments: [],
    };

    const result = buildTimeline(
      storylineSave,
      dailySave,
      emptyPuzzleSave,
      emptyTapeSave
    );

    expect(result.length).toBe(2);
    expect(result[0].timestamp).toBe(BASE_TIME);
    expect(result[1].timestamp).toBe(BASE_TIME);
  });
});

describe("时间线 - 未读状态与跳转", () => {
  describe("getTimelineUnreadCount", () => {
    it("空数组应返回 0", () => {
      expect(getTimelineUnreadCount([])).toBe(0);
    });

    it("全部已读应返回 0", () => {
      const items: TimelineItem[] = [
        {
          id: "item-1",
          type: "story",
          timestamp: BASE_TIME,
          title: "测试",
          subtitle: "测试",
          color: "#000",
          icon: "📖",
          isUnread: false,
          stationIds: ["rain"],
          stationNames: ["雨棚旧讯号"],
          target: { type: "story", chapterId: "prologue", fragmentId: "prologue-1" },
        },
      ];
      expect(getTimelineUnreadCount(items)).toBe(0);
    });

    it("混合已读未读应正确计数", () => {
      const items: TimelineItem[] = [
        {
          id: "item-1",
          type: "story",
          timestamp: BASE_TIME,
          title: "测试1",
          subtitle: "测试",
          color: "#000",
          icon: "📖",
          isUnread: true,
          stationIds: ["rain"],
          stationNames: ["雨棚旧讯号"],
          target: { type: "story", chapterId: "prologue", fragmentId: "prologue-1" },
        },
        {
          id: "item-2",
          type: "daily",
          timestamp: BASE_TIME + 1000,
          title: "测试2",
          subtitle: "测试",
          color: "#000",
          icon: "📡",
          isUnread: false,
          stationIds: ["salt"],
          stationNames: ["盐湖观测站"],
          target: { type: "daily", broadcastId: "broadcast-1", fragmentId: "fragment-1" },
        },
        {
          id: "item-3",
          type: "story",
          timestamp: BASE_TIME + 2000,
          title: "测试3",
          subtitle: "测试",
          color: "#000",
          icon: "📖",
          isUnread: true,
          stationIds: ["train"],
          stationNames: ["末班列车台"],
          target: { type: "story", chapterId: "chapter-rain", fragmentId: "rain-1" },
        },
      ];
      expect(getTimelineUnreadCount(items)).toBe(2);
    });
  });

  describe("getLatestUnreadItem", () => {
    it("空数组应返回 null", () => {
      expect(getLatestUnreadItem([])).toBeNull();
    });

    it("全部已读应返回 null", () => {
      const items: TimelineItem[] = [
        {
          id: "item-1",
          type: "story",
          timestamp: BASE_TIME,
          title: "测试",
          subtitle: "测试",
          color: "#000",
          icon: "📖",
          isUnread: false,
          stationIds: ["rain"],
          stationNames: ["雨棚旧讯号"],
          target: { type: "story", chapterId: "prologue", fragmentId: "prologue-1" },
        },
      ];
      expect(getLatestUnreadItem(items)).toBeNull();
    });

    it("应返回时间最新的未读项目", () => {
      const items: TimelineItem[] = [
        {
          id: "item-1",
          type: "story",
          timestamp: BASE_TIME,
          title: "较早的未读",
          subtitle: "测试",
          color: "#000",
          icon: "📖",
          isUnread: true,
          stationIds: ["rain"],
          stationNames: ["雨棚旧讯号"],
          target: { type: "story", chapterId: "prologue", fragmentId: "prologue-1" },
        },
        {
          id: "item-2",
          type: "story",
          timestamp: BASE_TIME + 2000,
          title: "最新的未读",
          subtitle: "测试",
          color: "#000",
          icon: "📖",
          isUnread: true,
          stationIds: ["salt"],
          stationNames: ["盐湖观测站"],
          target: { type: "story", chapterId: "chapter-rain", fragmentId: "rain-1" },
        },
        {
          id: "item-3",
          type: "story",
          timestamp: BASE_TIME + 1000,
          title: "中间的已读",
          subtitle: "测试",
          color: "#000",
          icon: "📖",
          isUnread: false,
          stationIds: ["train"],
          stationNames: ["末班列车台"],
          target: { type: "story", chapterId: "chapter-salt", fragmentId: "salt-1" },
        },
      ];
      const result = getLatestUnreadItem(items);
      expect(result).not.toBeNull();
      expect(result!.id).toBe("item-2");
      expect(result!.timestamp).toBe(BASE_TIME + 2000);
    });
  });

  describe("getTimelineContinueReading", () => {
    it("没有未读项目应返回 null", () => {
      const items: TimelineItem[] = [
        {
          id: "item-1",
          type: "story",
          timestamp: BASE_TIME,
          title: "测试",
          subtitle: "测试",
          color: "#000",
          icon: "📖",
          isUnread: false,
          stationIds: ["rain"],
          stationNames: ["雨棚旧讯号"],
          target: { type: "story", chapterId: "prologue", fragmentId: "prologue-1" },
        },
      ];
      expect(getTimelineContinueReading(items)).toBeNull();
    });

    it("最新未读是故事类型且有 fragmentId 应返回 story 跳转结果", () => {
      const items: TimelineItem[] = [
        {
          id: "story-latest",
          type: "story",
          timestamp: BASE_TIME + 2000,
          title: "最新未读故事",
          subtitle: "测试",
          color: "#000",
          icon: "📖",
          isUnread: true,
          stationIds: ["rain"],
          stationNames: ["雨棚旧讯号"],
          target: { type: "story", chapterId: "chapter-rain", fragmentId: "rain-2" },
        },
        {
          id: "daily-earlier",
          type: "daily",
          timestamp: BASE_TIME + 1000,
          title: "较早的未读广播",
          subtitle: "测试",
          color: "#000",
          icon: "📡",
          isUnread: true,
          stationIds: ["salt"],
          stationNames: ["盐湖观测站"],
          target: { type: "daily", broadcastId: "broadcast-1", fragmentId: "fragment-1" },
        },
      ];
      const result = getTimelineContinueReading(items);
      expect(result).toEqual({
        type: "story",
        data: {
          chapterId: "chapter-rain",
          fragmentId: "rain-2",
        },
      });
    });

    it("最新未读是广播类型且有 fragmentId 应返回 daily 跳转结果", () => {
      const items: TimelineItem[] = [
        {
          id: "daily-latest",
          type: "daily",
          timestamp: BASE_TIME + 2000,
          title: "最新未读广播",
          subtitle: "测试",
          color: "#000",
          icon: "📡",
          isUnread: true,
          stationIds: ["salt"],
          stationNames: ["盐湖观测站"],
          target: { type: "daily", broadcastId: "broadcast-2", fragmentId: "fragment-3" },
        },
        {
          id: "story-earlier",
          type: "story",
          timestamp: BASE_TIME + 1000,
          title: "较早的未读故事",
          subtitle: "测试",
          color: "#000",
          icon: "📖",
          isUnread: true,
          stationIds: ["rain"],
          stationNames: ["雨棚旧讯号"],
          target: { type: "story", chapterId: "prologue", fragmentId: "prologue-1" },
        },
      ];
      const result = getTimelineContinueReading(items);
      expect(result).toEqual({
        type: "daily",
        data: {
          broadcastId: "broadcast-2",
          fragmentId: "fragment-3",
        },
      });
    });

    it("最新未读是谜题类型应返回 null（谜题不支持继续阅读跳转）", () => {
      const items: TimelineItem[] = [
        {
          id: "puzzle-latest",
          type: "puzzle",
          timestamp: BASE_TIME + 2000,
          title: "谜题奖励",
          subtitle: "测试",
          color: "#000",
          icon: "🧩",
          isUnread: true,
          stationIds: ["salt"],
          stationNames: ["盐湖观测站"],
          target: { type: "puzzle", puzzleId: "puzzle-salt-morse" },
        },
      ];
      expect(getTimelineContinueReading(items)).toBeNull();
    });

    it("最新未读是录音带类型应返回 null（录音带不支持继续阅读跳转）", () => {
      const items: TimelineItem[] = [
        {
          id: "tape-latest",
          type: "tape",
          timestamp: BASE_TIME + 2000,
          title: "录音带",
          subtitle: "测试",
          color: "#000",
          icon: "📼",
          isUnread: true,
          stationIds: ["rain"],
          stationNames: ["雨棚旧讯号"],
          target: { type: "tape", tapeId: "tape-1" },
        },
      ];
      expect(getTimelineContinueReading(items)).toBeNull();
    });

    it("故事类型但 fragmentId 为 null 应返回 null", () => {
      const items: TimelineItem[] = [
        {
          id: "story-null-fragment",
          type: "story",
          timestamp: BASE_TIME,
          title: "测试",
          subtitle: "测试",
          color: "#000",
          icon: "📖",
          isUnread: true,
          stationIds: ["rain"],
          stationNames: ["雨棚旧讯号"],
          target: { type: "story", chapterId: "prologue", fragmentId: null },
        },
      ];
      expect(getTimelineContinueReading(items)).toBeNull();
    });

    it("广播类型但 fragmentId 为 null 应返回 null", () => {
      const items: TimelineItem[] = [
        {
          id: "daily-null-fragment",
          type: "daily",
          timestamp: BASE_TIME,
          title: "测试",
          subtitle: "测试",
          color: "#000",
          icon: "📡",
          isUnread: true,
          stationIds: ["salt"],
          stationNames: ["盐湖观测站"],
          target: { type: "daily", broadcastId: "broadcast-1", fragmentId: null },
        },
      ];
      expect(getTimelineContinueReading(items)).toBeNull();
    });
  });
});

describe("时间线 - 集成场景", () => {
  it("完整集成场景：混合四种类型且包含已读未读状态", () => {
    const storylineSave: StorylineSave = {
      unlockedChapters: ["prologue", "chapter-rain", "chapter-salt"],
      unlockedAt: {
        prologue: BASE_TIME,
        "chapter-rain": BASE_TIME + 1000,
        "chapter-salt": BASE_TIME + 3000,
      },
      readFragments: ["prologue-1", "prologue-2", "rain-1"],
      lastReadAt: {},
    };

    const dailySave: DailyBroadcastSave = {
      ...emptyDailySave,
      discoveredBroadcasts: [dailyBroadcasts[0].id, dailyBroadcasts[1].id],
      discoveredAt: {
        [dailyBroadcasts[0].id]: BASE_TIME + 2000,
        [dailyBroadcasts[1].id]: BASE_TIME + 5000,
      },
      readFragments: [],
    };

    const puzzleSave: SignalPuzzleSave = {
      ...emptyPuzzleSave,
      solvedPuzzles: ["puzzle-salt-morse"],
      solvedAt: { "puzzle-salt-morse": BASE_TIME + 4000 },
    };

    const tapeSave: SignalTapeSave = {
      version: 2,
      tapes: [
        {
          id: "tape-1",
          stationId: "rain",
          stationName: "雨棚旧讯号",
          frequency: 88.7,
          color: "#6aa8d5",
          scheduleName: null,
          scheduleStartTime: null,
          scheduleEndTime: null,
          content: "测试录音内容",
          savedAt: BASE_TIME + 6000,
          isAnomaly: false,
        },
      ],
    };

    const timeline = buildTimeline(
      storylineSave,
      dailySave,
      puzzleSave,
      tapeSave
    );

    expect(timeline.length).toBe(7);
    expect(timeline[0].type).toBe("tape");
    expect(timeline[1].type).toBe("daily");
    expect(timeline[2].type).toBe("puzzle");
    expect(timeline[3].type).toBe("story");
    expect(timeline[4].type).toBe("daily");
    expect(timeline[5].type).toBe("story");
    expect(timeline[6].type).toBe("story");

    const unreadCount = getTimelineUnreadCount(timeline);
    expect(unreadCount).toBe(4);

    const latestUnread = getLatestUnreadItem(timeline);
    expect(latestUnread).not.toBeNull();
    expect(latestUnread!.type).toBe("daily");

    const continueReading = getTimelineContinueReading(timeline);
    expect(continueReading).not.toBeNull();
    expect(continueReading!.type).toBe("daily");
  });

  it("故事章节：全部已读的章节 isUnread 应为 false", () => {
    const chapter = storyChapters[0];
    const storylineSave: StorylineSave = {
      ...emptyStorylineSave,
      unlockedChapters: [chapter.id],
      unlockedAt: { [chapter.id]: BASE_TIME },
      readFragments: chapter.fragments.map((f) => f.id),
    };

    const result = buildTimeline(
      storylineSave,
      emptyDailySave,
      emptyPuzzleSave,
      emptyTapeSave
    );

    expect(result.length).toBe(1);
    expect(result[0].isUnread).toBe(false);
  });

  it("故事章节：部分已读的章节 isUnread 应为 true，target 指向第一个未读片段", () => {
    const chapter = storyChapters[0];
    const storylineSave: StorylineSave = {
      ...emptyStorylineSave,
      unlockedChapters: [chapter.id],
      unlockedAt: { [chapter.id]: BASE_TIME },
      readFragments: [chapter.fragments[0].id],
    };

    const result = buildTimeline(
      storylineSave,
      emptyDailySave,
      emptyPuzzleSave,
      emptyTapeSave
    );

    expect(result.length).toBe(1);
    expect(result[0].isUnread).toBe(true);
    expect(result[0].target.type).toBe("story");
    if (result[0].target.type === "story") {
      expect(result[0].target.fragmentId).toBe(chapter.fragments[1].id);
    }
  });

  it("每日广播：target 应指向第一个未读片段", () => {
    const broadcast = dailyBroadcasts[0];
    const dailySave: DailyBroadcastSave = {
      ...emptyDailySave,
      discoveredBroadcasts: [broadcast.id],
      discoveredAt: { [broadcast.id]: BASE_TIME },
      readFragments: broadcast.fragments.length > 0 ? [broadcast.fragments[0].id] : [],
    };

    const result = buildTimeline(
      emptyStorylineSave,
      dailySave,
      emptyPuzzleSave,
      emptyTapeSave
    );

    expect(result.length).toBe(1);
    expect(result[0].target.type).toBe("daily");
    if (result[0].target.type === "daily" && broadcast.fragments.length > 1) {
      expect(result[0].target.fragmentId).toBe(broadcast.fragments[1].id);
    }
  });

  it("已解决谜题：isUnread 始终为 false", () => {
    const puzzleSave: SignalPuzzleSave = {
      ...emptyPuzzleSave,
      solvedPuzzles: ["puzzle-salt-morse"],
      solvedAt: { "puzzle-salt-morse": BASE_TIME },
    };

    const result = buildTimeline(
      emptyStorylineSave,
      emptyDailySave,
      puzzleSave,
      emptyTapeSave
    );

    expect(result.length).toBe(1);
    expect(result[0].type).toBe("puzzle");
    expect(result[0].isUnread).toBe(false);
  });

  it("录音带：isUnread 始终为 false，isRecorded 始终为 true", () => {
    const tapeSave: SignalTapeSave = {
      version: 2,
      tapes: [
        {
          id: "tape-1",
          stationId: "rain",
          stationName: "雨棚旧讯号",
          frequency: 88.7,
          color: "#6aa8d5",
          scheduleName: null,
          scheduleStartTime: null,
          scheduleEndTime: null,
          content: "测试内容",
          savedAt: BASE_TIME,
          isAnomaly: false,
        },
      ],
    };

    const result = buildTimeline(
      emptyStorylineSave,
      emptyDailySave,
      emptyPuzzleSave,
      tapeSave
    );

    expect(result.length).toBe(1);
    expect(result[0].type).toBe("tape");
    expect(result[0].isUnread).toBe(false);
    expect(result[0].isRecorded).toBe(true);
  });
});
