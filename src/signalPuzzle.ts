export type PuzzleUnlockCondition =
  | { type: "discoverStation"; stationId: string }
  | { type: "readChapterFragment"; chapterId: string; fragmentIndex: number }
  | { type: "discoveredBroadcast"; broadcastId: string }
  | { type: "solvePuzzle"; puzzleId: string };

export type PuzzleType = "morse" | "sequence" | "frequency";

export type PuzzleReward = {
  title: string;
  content: string;
};

export type MorsePuzzleData = {
  type: "morse";
  morseCode: string;
  hint?: string;
  hints?: string[];
  answer: string;
};

export type SequencePuzzleData = {
  type: "sequence";
  items: { id: string; name: string; icon: string; description: string }[];
  correctOrder: string[];
  hint?: string;
  hints?: string[];
};

export type FrequencyPuzzleData = {
  type: "frequency";
  options: { id: string; freq: string; name: string; icon: string; color: string }[];
  correctOrder: string[];
  hint?: string;
  hints?: string[];
};

export type PuzzleData = MorsePuzzleData | SequencePuzzleData | FrequencyPuzzleData;

export type SignalPuzzle = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  stationId: string;
  color: string;
  icon: string;
  condition: PuzzleUnlockCondition;
  data: PuzzleData;
  reward: PuzzleReward;
  isHidden?: boolean;
};

export type SignalPuzzleSave = {
  version: number;
  solvedPuzzles: string[];
  solvedAt: Record<string, number>;
  attemptedPuzzles: string[];
  attemptCounts: Record<string, number>;
};

const STORAGE_VERSION = 2;
const STORAGE_KEY = "hxwl-4-signal-puzzles";

const stationNameMap: Record<string, string> = {
  rain: "雨棚旧讯号",
  salt: "盐湖观测站",
  train: "末班列车台",
  green: "温室低语",
};

function getStationName(id: string): string {
  return stationNameMap[id] || id;
}

export const signalPuzzles: SignalPuzzle[] = [
  {
    id: "puzzle-salt-morse",
    title: "南岸的密码",
    subtitle: "破译盐湖闪烁的摩斯电码",
    description:
      "盐湖观测站的南岸黄昏时分会有规律的闪烁。值班员说像是摩斯电码，但他一直没能破译。也许你能解开这个秘密。",
    stationId: "salt",
    color: "#e8c36a",
    icon: "🔦",
    condition: { type: "discoverStation", stationId: "salt" },
    data: {
      type: "morse",
      morseCode: "··· --- · ···",
      hint: "长的是 — ，短的是 · 。试着把它们拼成字母。",
      hints: [
        "长的是 — ，短的是 · 。试着把它们拼成字母。",
        "这段电码有三个字母，第一个字母是 S。",
        "第二个字母是 O，第三个字母又是 S。合起来是国际通用求救信号。"
      ],
      answer: "SOS",
    },
    reward: {
      title: "破译成功 · 南岸的回应",
      content:
        "你破译了摩斯电码——「SOS」。\n\n就在你确认答案的那一刻，\n盐湖的南岸突然亮了起来。\n\n不是一次闪烁，\n是一整片光亮。\n\n像有人在湖底点亮了一盏灯，\n又像有什么东西，\n终于回应了你的存在。\n\n值班员的声音在颤抖：\n「南岸……南岸有回应了！\n她……她在说……\n「我知道你在听。」」\n\n盐晶在月光下闪闪发亮，\n每一颗都像一颗星星，\n落在了人间。",
    },
  },
  {
    id: "puzzle-train-sequence",
    title: "遗落物的顺序",
    subtitle: "排列末班车上遗落物品的先后",
    description:
      "末班车的2号车厢靠窗座位上，每天都会出现新的遗落物。广播员记录了它们出现的顺序，但记录被打乱了。你能根据线索还原正确的顺序吗？",
    stationId: "train",
    color: "#a06cd5",
    icon: "🧳",
    condition: { type: "discoverStation", stationId: "train" },
    data: {
      type: "sequence",
      items: [
        {
          id: "button",
          name: "棕色牛角扣",
          icon: "🔘",
          description: "第一枚出现的遗落物，背面有模糊的刻痕",
        },
        {
          id: "letter",
          name: "未寄出的信",
          icon: "✉️",
          description: "信封上写着「给不会收到的你」",
        },
        {
          id: "umbrella",
          name: "黑色断骨伞",
          icon: "☂️",
          description: "伞骨断了一根，看起来用了很久",
        },
        {
          id: "flower",
          name: "干枯的花",
          icon: "🌸",
          description: "不知道是什么花，花瓣还保留着淡紫色",
        },
      ],
      correctOrder: ["button", "letter", "umbrella", "flower"],
      hint: "纽扣是最早出现的，花是最后出现的。信出现在伞之前。",
      hints: [
        "纽扣是最早出现的，花是最后出现的。信出现在伞之前。",
        "第一个是纽扣，最后一个是花。中间还有两样东西。",
        "顺序是：纽扣 → 信 → 伞 → 花。试着调整一下顺序吧。"
      ],
    },
    reward: {
      title: "排列正确 · 时间的痕迹",
      content:
        "你还原了遗落物出现的顺序——\n纽扣、信、伞、花。\n\n每一样东西，\n都代表着一段故事的片段。\n\n广播员沉默了很久。\n然后她说：\n「谢谢你。\n这些东西，\n都是同一个人留下的。\n\n她每天都坐末班车，\n每天都在同一个位置，\n每天遗落一样东西。\n\n就像在……\n一点一点地消失。」\n\n末班车的铁轨声在夜色中回响，\n你忽然觉得，\n那个遗落了一切的人，\n也许正在某个站台，\n等着你发现她的故事。",
    },
  },
  {
    id: "puzzle-green-frequency",
    title: "第七盆的频率",
    subtitle: "选择植物转向的正确频率组合",
    description:
      "温室的第七盆植物会在特定频率转向墙。管理员记录了几个可能的频率，但只有按正确顺序组合，才能解开墙后面的秘密。",
    stationId: "green",
    color: "#5aa86a",
    icon: "🌱",
    condition: { type: "discoverStation", stationId: "green" },
    data: {
      type: "frequency",
      options: [
        { id: "freq-rain", freq: "88.7 MHz", name: "雨棚旧讯号", icon: "🌧️", color: "#6aa8d5" },
        { id: "freq-salt", freq: "93.4 MHz", name: "盐湖观测站", icon: "🧂", color: "#e8c36a" },
        { id: "freq-train", freq: "101.2 MHz", name: "末班列车台", icon: "🚂", color: "#a06cd5" },
        { id: "freq-green", freq: "106.6 MHz", name: "温室低语", icon: "🌱", color: "#5aa86a" },
      ],
      correctOrder: ["freq-green", "freq-salt", "freq-train", "freq-rain"],
      hint:
        "从最低到最高？不对。植物最先转向的是它所在的温室，然后是最远的雨棚。它在按照某种顺序问候每一个电台。",
      hints: [
        "从最低到最高？不对。植物最先转向的是它所在的温室，然后是最远的雨棚。它在按照某种顺序问候每一个电台。",
        "第一个是温室低语，最后一个是雨棚旧讯号。中间还有两个电台。",
        "顺序是：温室低语 → 盐湖观测站 → 末班列车台 → 雨棚旧讯号。"
      ],
    },
    reward: {
      title: "频率共鸣 · 墙后的声音",
      content:
        "你按照正确的顺序调整了频率。\n\n第七盆植物开始轻轻颤动，\n像是在回应什么。\n\n然后——\n墙后面的敲击声变了。\n不再是杂乱的节奏，\n而是一段清晰的旋律。\n\n四个频率，\n四段旋律，\n交织在一起。\n\n你听到一个声音，\n很轻很轻，\n从墙后面传来——\n\n「谢谢你找到我。\n我等了很久。\n\n我叫……\n\n」\n\n声音被风吹散了，\n但你知道，\n墙后面的那个人，\n终于不再孤单了。\n\n第七盆植物转向了你，\n叶片轻轻晃动，\n像是在说——\n「欢迎来到我们的故事。」",
    },
  },
];

export function loadPuzzleSave(): SignalPuzzleSave {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createNewSave();
    }

    const data = JSON.parse(raw) as Partial<SignalPuzzleSave> & { version?: number };

    if (!data.version || data.version < STORAGE_VERSION) {
      return migrateSave(data);
    }

    return {
      version: STORAGE_VERSION,
      solvedPuzzles: data.solvedPuzzles || [],
      solvedAt: data.solvedAt || {},
      attemptedPuzzles: data.attemptedPuzzles || [],
      attemptCounts: data.attemptCounts || {},
    };
  } catch {
    return createNewSave();
  }
}

function createNewSave(): SignalPuzzleSave {
  return {
    version: STORAGE_VERSION,
    solvedPuzzles: [],
    solvedAt: {},
    attemptedPuzzles: [],
    attemptCounts: {},
  };
}

function migrateSave(
  data: Partial<SignalPuzzleSave> & { version?: number }
): SignalPuzzleSave {
  const version = data.version || 0;
  let attemptCounts: Record<string, number> = { ...(data.attemptCounts || {}) };

  if (version < 2) {
    const attempted = data.attemptedPuzzles || [];
    for (const pid of attempted) {
      if (!attemptCounts[pid]) {
        attemptCounts[pid] = 1;
      }
    }
  }

  return {
    version: STORAGE_VERSION,
    solvedPuzzles: data.solvedPuzzles || [],
    solvedAt: data.solvedAt || {},
    attemptedPuzzles: data.attemptedPuzzles || [],
    attemptCounts,
  };
}

export function savePuzzleSave(save: SignalPuzzleSave): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
}

type PuzzleContext = {
  discoveredStations: string[];
  readFragments: string[];
  discoveredBroadcasts: string[];
  solvedPuzzles: string[];
};

export function isPuzzleUnlocked(
  puzzle: SignalPuzzle,
  ctx: PuzzleContext
): boolean {
  const condition = puzzle.condition;

  switch (condition.type) {
    case "discoverStation":
      return ctx.discoveredStations.includes(condition.stationId);
    case "readChapterFragment":
      return ctx.readFragments.some((f) => f.startsWith(condition.chapterId));
    case "discoveredBroadcast":
      return ctx.discoveredBroadcasts.includes(condition.broadcastId);
    case "solvePuzzle":
      return ctx.solvedPuzzles.includes(condition.puzzleId);
    default:
      return false;
  }
}

export function getPuzzleUnlockHint(puzzle: SignalPuzzle, _ctx?: PuzzleContext): string {
  const c = puzzle.condition;
  switch (c.type) {
    case "discoverStation":
      return `发现「${getStationName(c.stationId)}」后解锁`;
    case "readChapterFragment":
      return `阅读相关故事片段后解锁`;
    case "discoveredBroadcast":
      return `收听对应每日广播后解锁`;
    case "solvePuzzle":
      return `解开前置谜题后解锁`;
    default:
      return "继续探索以解锁";
  }
}

export function getUnlockedPuzzles(
  puzzles: SignalPuzzle[],
  ctx: PuzzleContext
): SignalPuzzle[] {
  return puzzles.filter((p) => isPuzzleUnlocked(p, ctx));
}

export function getUnsolvedPuzzles(
  puzzles: SignalPuzzle[],
  ctx: PuzzleContext
): SignalPuzzle[] {
  return getUnlockedPuzzles(puzzles, ctx).filter(
    (p) => !ctx.solvedPuzzles.includes(p.id)
  );
}

export function solvePuzzle(
  save: SignalPuzzleSave,
  puzzleId: string
): SignalPuzzleSave {
  if (save.solvedPuzzles.includes(puzzleId)) return save;

  const now = Date.now();
  const currentCount = save.attemptCounts[puzzleId] || 0;
  return {
    ...save,
    solvedPuzzles: [...save.solvedPuzzles, puzzleId],
    solvedAt: { ...save.solvedAt, [puzzleId]: now },
    attemptedPuzzles: save.attemptedPuzzles.includes(puzzleId)
      ? save.attemptedPuzzles
      : [...save.attemptedPuzzles, puzzleId],
    attemptCounts: {
      ...save.attemptCounts,
      [puzzleId]: currentCount,
    },
  };
}

export function incrementAttempt(
  save: SignalPuzzleSave,
  puzzleId: string
): SignalPuzzleSave {
  const currentCount = save.attemptCounts[puzzleId] || 0;
  const wasAttempted = save.attemptedPuzzles.includes(puzzleId);
  return {
    ...save,
    attemptedPuzzles: wasAttempted
      ? save.attemptedPuzzles
      : [...save.attemptedPuzzles, puzzleId],
    attemptCounts: {
      ...save.attemptCounts,
      [puzzleId]: currentCount + 1,
    },
  };
}

export function getAttemptCount(
  save: SignalPuzzleSave,
  puzzleId: string
): number {
  return save.attemptCounts[puzzleId] || 0;
}

export function getCurrentHint(
  puzzle: SignalPuzzle,
  attemptCount: number
): string | null {
  const data = puzzle.data;
  const hints = data.hints || [];

  if (attemptCount <= 0) return null;

  const hintIndex = Math.min(attemptCount - 1, hints.length - 1);
  if (hintIndex >= 0 && hints[hintIndex]) {
    return hints[hintIndex];
  }

  if (data.hint && attemptCount >= 1) {
    return data.hint;
  }

  return null;
}

export function checkMorseAnswer(puzzle: SignalPuzzle, userAnswer: string): boolean {
  if (puzzle.data.type !== "morse") return false;
  const normalizedUser = userAnswer.trim().toUpperCase().replace(/\s+/g, "");
  const normalizedAnswer = puzzle.data.answer.trim().toUpperCase().replace(/\s+/g, "");
  return normalizedUser === normalizedAnswer;
}

export function checkSequenceAnswer(
  puzzle: SignalPuzzle,
  userOrder: string[]
): boolean {
  if (puzzle.data.type !== "sequence") return false;
  const data = puzzle.data as SequencePuzzleData;
  if (userOrder.length !== data.correctOrder.length) return false;
  return userOrder.every((id, idx) => id === data.correctOrder[idx]);
}

export function checkFrequencyAnswer(
  puzzle: SignalPuzzle,
  userOrder: string[]
): boolean {
  if (puzzle.data.type !== "frequency") return false;
  const data = puzzle.data as FrequencyPuzzleData;
  if (userOrder.length !== data.correctOrder.length) return false;
  return userOrder.every((id, idx) => id === data.correctOrder[idx]);
}

export function getVisiblePuzzles(solvedIds: string[]): SignalPuzzle[] {
  return signalPuzzles.filter((p) => !p.isHidden || solvedIds.includes(p.id));
}

export function getTotalPuzzleCount(solvedIds: string[]): number {
  return getVisiblePuzzles(solvedIds).length;
}

export function getSolvedVisibleCount(solvedIds: string[]): number {
  return getVisiblePuzzles(solvedIds).filter((p) => solvedIds.includes(p.id)).length;
}

export function formatSolvedTime(timestamp: number | undefined): string {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
