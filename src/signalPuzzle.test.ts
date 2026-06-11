import { describe, it, expect, beforeEach } from "vitest";
import {
  checkMorseAnswer,
  checkSequenceAnswer,
  checkFrequencyAnswer,
  incrementAttempt,
  getAttemptCount,
  getCurrentHint,
  solvePuzzle,
  isPuzzleUnlocked,
  getPuzzleUnlockHint,
  type SignalPuzzle,
  type SignalPuzzleSave,
  signalPuzzles,
} from "./signalPuzzle";

const emptySave: SignalPuzzleSave = {
  version: 2,
  solvedPuzzles: [],
  solvedAt: {},
  attemptedPuzzles: [],
  attemptCounts: {},
};

const morsePuzzle = signalPuzzles.find((p) => p.id === "puzzle-salt-morse")!;
const sequencePuzzle = signalPuzzles.find((p) => p.id === "puzzle-train-sequence")!;
const frequencyPuzzle = signalPuzzles.find((p) => p.id === "puzzle-green-frequency")!;

describe("信号谜题 - 答案校验", () => {
  describe("checkMorseAnswer", () => {
    it("正确答案应返回 true", () => {
      expect(checkMorseAnswer(morsePuzzle, "SOS")).toBe(true);
    });

    it("小写答案自动转换为大写", () => {
      expect(checkMorseAnswer(morsePuzzle, "sos")).toBe(true);
    });

    it("前后空格自动去除", () => {
      expect(checkMorseAnswer(morsePuzzle, "  SOS  ")).toBe(true);
    });

    it("中间空格自动去除", () => {
      expect(checkMorseAnswer(morsePuzzle, "S O S")).toBe(true);
    });

    it("错误答案应返回 false", () => {
      expect(checkMorseAnswer(morsePuzzle, "ABC")).toBe(false);
    });

    it("非 Morse 类型谜题始终返回 false", () => {
      expect(checkMorseAnswer(sequencePuzzle, "SOS")).toBe(false);
    });
  });

  describe("checkSequenceAnswer", () => {
    it("正确顺序应返回 true", () => {
      expect(
        checkSequenceAnswer(sequencePuzzle, ["button", "letter", "umbrella", "flower"])
      ).toBe(true);
    });

    it("错误顺序应返回 false", () => {
      expect(
        checkSequenceAnswer(sequencePuzzle, ["letter", "button", "umbrella", "flower"])
      ).toBe(false);
    });

    it("长度不匹配应返回 false", () => {
      expect(checkSequenceAnswer(sequencePuzzle, ["button", "letter"])).toBe(false);
    });

    it("非 Sequence 类型谜题始终返回 false", () => {
      expect(
        checkSequenceAnswer(morsePuzzle, ["button", "letter", "umbrella", "flower"])
      ).toBe(false);
    });
  });

  describe("checkFrequencyAnswer", () => {
    it("正确顺序应返回 true", () => {
      expect(
        checkFrequencyAnswer(frequencyPuzzle, ["freq-green", "freq-salt", "freq-train", "freq-rain"])
      ).toBe(true);
    });

    it("错误顺序应返回 false", () => {
      expect(
        checkFrequencyAnswer(frequencyPuzzle, ["freq-rain", "freq-salt", "freq-train", "freq-green"])
      ).toBe(false);
    });

    it("长度不匹配应返回 false", () => {
      expect(checkFrequencyAnswer(frequencyPuzzle, ["freq-green"])).toBe(false);
    });

    it("非 Frequency 类型谜题始终返回 false", () => {
      expect(
        checkFrequencyAnswer(morsePuzzle, ["freq-green", "freq-salt", "freq-train", "freq-rain"])
      ).toBe(false);
    });
  });
});

describe("信号谜题 - 尝试次数递增", () => {
  let save: SignalPuzzleSave;

  beforeEach(() => {
    save = { ...emptySave };
  });

  it("首次尝试应添加到 attemptedPuzzles 并计数为 1", () => {
    const result = incrementAttempt(save, "puzzle-salt-morse");
    expect(result.attemptedPuzzles).toContain("puzzle-salt-morse");
    expect(result.attemptCounts["puzzle-salt-morse"]).toBe(1);
  });

  it("第二次尝试应保持在 attemptedPuzzles 并计数为 2", () => {
    const first = incrementAttempt(save, "puzzle-salt-morse");
    const second = incrementAttempt(first, "puzzle-salt-morse");
    expect(second.attemptedPuzzles).toEqual(["puzzle-salt-morse"]);
    expect(second.attemptCounts["puzzle-salt-morse"]).toBe(2);
  });

  it("多次尝试应正确递增计数", () => {
    let result = save;
    for (let i = 0; i < 5; i++) {
      result = incrementAttempt(result, "puzzle-salt-morse");
    }
    expect(result.attemptCounts["puzzle-salt-morse"]).toBe(5);
  });

  it("不同谜题的尝试计数独立", () => {
    let result = incrementAttempt(save, "puzzle-salt-morse");
    result = incrementAttempt(result, "puzzle-train-sequence");
    result = incrementAttempt(result, "puzzle-salt-morse");
    expect(result.attemptCounts["puzzle-salt-morse"]).toBe(2);
    expect(result.attemptCounts["puzzle-train-sequence"]).toBe(1);
    expect(result.attemptedPuzzles).toContain("puzzle-salt-morse");
    expect(result.attemptedPuzzles).toContain("puzzle-train-sequence");
  });

  it("getAttemptCount 对未尝试过的谜题返回 0", () => {
    expect(getAttemptCount(save, "puzzle-salt-morse")).toBe(0);
  });

  it("getAttemptCount 对已尝试过的谜题返回正确计数", () => {
    const result = incrementAttempt(incrementAttempt(save, "puzzle-salt-morse"), "puzzle-salt-morse");
    expect(getAttemptCount(result, "puzzle-salt-morse")).toBe(2);
  });

  it("incrementAttempt 不应修改原 save 对象", () => {
    const originalAttempts = [...save.attemptedPuzzles];
    const originalCounts = { ...save.attemptCounts };
    incrementAttempt(save, "puzzle-salt-morse");
    expect(save.attemptedPuzzles).toEqual(originalAttempts);
    expect(save.attemptCounts).toEqual(originalCounts);
  });
});

describe("信号谜题 - 提示逐步显示", () => {
  it("尝试次数为 0 时返回 null", () => {
    expect(getCurrentHint(morsePuzzle, 0)).toBeNull();
  });

  it("第 1 次尝试后显示第 1 条提示", () => {
    expect(getCurrentHint(morsePuzzle, 1)).toBe(
      "长的是 — ，短的是 · 。试着把它们拼成字母。"
    );
  });

  it("第 2 次尝试后显示第 2 条提示", () => {
    expect(getCurrentHint(morsePuzzle, 2)).toBe(
      "这段电码有三个字母，第一个字母是 S。"
    );
  });

  it("第 3 次尝试后显示第 3 条提示", () => {
    expect(getCurrentHint(morsePuzzle, 3)).toBe(
      "第二个字母是 O，第三个字母又是 S。合起来是国际通用求救信号。"
    );
  });

  it("尝试次数超过提示数量时显示最后一条提示", () => {
    expect(getCurrentHint(morsePuzzle, 10)).toBe(
      "第二个字母是 O，第三个字母又是 S。合起来是国际通用求救信号。"
    );
  });

  it("sequence 谜题的提示也按尝试次数逐步显示", () => {
    expect(getCurrentHint(sequencePuzzle, 1)).toBe(
      "纽扣是最早出现的，花是最后出现的。信出现在伞之前。"
    );
    expect(getCurrentHint(sequencePuzzle, 2)).toBe(
      "第一个是纽扣，最后一个是花。中间还有两样东西。"
    );
    expect(getCurrentHint(sequencePuzzle, 3)).toBe(
      "顺序是：纽扣 → 信 → 伞 → 花。试着调整一下顺序吧。"
    );
  });

  it("frequency 谜题的提示也按尝试次数逐步显示", () => {
    expect(getCurrentHint(frequencyPuzzle, 1)).toBe(
      "从最低到最高？不对。植物最先转向的是它所在的温室，然后是最远的雨棚。它在按照某种顺序问候每一个电台。"
    );
    expect(getCurrentHint(frequencyPuzzle, 2)).toBe(
      "第一个是温室低语，最后一个是雨棚旧讯号。中间还有两个电台。"
    );
    expect(getCurrentHint(frequencyPuzzle, 3)).toBe(
      "顺序是：温室低语 → 盐湖观测站 → 末班列车台 → 雨棚旧讯号。"
    );
  });

  it("没有 hints 数组但有单个 hint 字段时，尝试 1 次后显示 hint", () => {
    const customPuzzle: SignalPuzzle = {
      ...morsePuzzle,
      data: {
        type: "morse",
        morseCode: "··· --- · ···",
        hint: "这是单个提示",
        answer: "SOS",
      },
    };
    expect(getCurrentHint(customPuzzle, 1)).toBe("这是单个提示");
  });

  it("没有任何提示时返回 null", () => {
    const customPuzzle: SignalPuzzle = {
      ...morsePuzzle,
      data: {
        type: "morse",
        morseCode: "··· --- · ···",
        answer: "SOS",
      },
    };
    expect(getCurrentHint(customPuzzle, 1)).toBeNull();
  });
});

describe("信号谜题 - 其他核心逻辑", () => {
  let save: SignalPuzzleSave;

  beforeEach(() => {
    save = { ...emptySave };
  });

  describe("solvePuzzle", () => {
    it("应将谜题添加到 solvedPuzzles", () => {
      const result = solvePuzzle(save, "puzzle-salt-morse");
      expect(result.solvedPuzzles).toContain("puzzle-salt-morse");
    });

    it("已解决的谜题不应重复添加", () => {
      const first = solvePuzzle(save, "puzzle-salt-morse");
      const second = solvePuzzle(first, "puzzle-salt-morse");
      expect(second.solvedPuzzles.filter((id) => id === "puzzle-salt-morse").length).toBe(1);
    });

    it("应记录解决时间", () => {
      const before = Date.now();
      const result = solvePuzzle(save, "puzzle-salt-morse");
      const after = Date.now();
      expect(result.solvedAt["puzzle-salt-morse"]).toBeGreaterThanOrEqual(before);
      expect(result.solvedAt["puzzle-salt-morse"]).toBeLessThanOrEqual(after);
    });

    it("应保留尝试记录", () => {
      const attempted = incrementAttempt(save, "puzzle-salt-morse");
      const solved = solvePuzzle(attempted, "puzzle-salt-morse");
      expect(solved.attemptedPuzzles).toContain("puzzle-salt-morse");
      expect(solved.attemptCounts["puzzle-salt-morse"]).toBe(1);
    });

    it("solvePuzzle 不应修改原 save 对象", () => {
      const originalSolved = [...save.solvedPuzzles];
      solvePuzzle(save, "puzzle-salt-morse");
      expect(save.solvedPuzzles).toEqual(originalSolved);
    });
  });

  describe("isPuzzleUnlocked", () => {
    const ctx = {
      discoveredStations: ["rain", "salt"],
      readFragments: ["prologue-1"],
      discoveredBroadcasts: ["broadcast-1"],
      solvedPuzzles: ["puzzle-1"],
    };

    it("discoverStation 条件：已发现的电台应解锁", () => {
      const puzzle: SignalPuzzle = {
        ...morsePuzzle,
        condition: { type: "discoverStation", stationId: "rain" },
      };
      expect(isPuzzleUnlocked(puzzle, ctx)).toBe(true);
    });

    it("discoverStation 条件：未发现的电台不应解锁", () => {
      const puzzle: SignalPuzzle = {
        ...morsePuzzle,
        condition: { type: "discoverStation", stationId: "green" },
      };
      expect(isPuzzleUnlocked(puzzle, ctx)).toBe(false);
    });

    it("readChapterFragment 条件：已阅读相关片段应解锁", () => {
      const puzzle: SignalPuzzle = {
        ...morsePuzzle,
        condition: { type: "readChapterFragment", chapterId: "prologue", fragmentIndex: 0 },
      };
      expect(isPuzzleUnlocked(puzzle, ctx)).toBe(true);
    });

    it("readChapterFragment 条件：未阅读相关片段不应解锁", () => {
      const puzzle: SignalPuzzle = {
        ...morsePuzzle,
        condition: { type: "readChapterFragment", chapterId: "chapter-rain", fragmentIndex: 0 },
      };
      expect(isPuzzleUnlocked(puzzle, ctx)).toBe(false);
    });

    it("discoveredBroadcast 条件：已发现的广播应解锁", () => {
      const puzzle: SignalPuzzle = {
        ...morsePuzzle,
        condition: { type: "discoveredBroadcast", broadcastId: "broadcast-1" },
      };
      expect(isPuzzleUnlocked(puzzle, ctx)).toBe(true);
    });

    it("discoveredBroadcast 条件：未发现的广播不应解锁", () => {
      const puzzle: SignalPuzzle = {
        ...morsePuzzle,
        condition: { type: "discoveredBroadcast", broadcastId: "broadcast-999" },
      };
      expect(isPuzzleUnlocked(puzzle, ctx)).toBe(false);
    });

    it("solvePuzzle 条件：已解决前置谜题应解锁", () => {
      const puzzle: SignalPuzzle = {
        ...morsePuzzle,
        condition: { type: "solvePuzzle", puzzleId: "puzzle-1" },
      };
      expect(isPuzzleUnlocked(puzzle, ctx)).toBe(true);
    });

    it("solvePuzzle 条件：未解决前置谜题不应解锁", () => {
      const puzzle: SignalPuzzle = {
        ...morsePuzzle,
        condition: { type: "solvePuzzle", puzzleId: "puzzle-999" },
      };
      expect(isPuzzleUnlocked(puzzle, ctx)).toBe(false);
    });
  });

  describe("getPuzzleUnlockHint", () => {
    it("discoverStation 条件应返回电台名称提示", () => {
      const puzzle: SignalPuzzle = {
        ...morsePuzzle,
        condition: { type: "discoverStation", stationId: "rain" },
      };
      expect(getPuzzleUnlockHint(puzzle)).toBe("发现「雨棚旧讯号」后解锁");
    });

    it("readChapterFragment 条件应返回阅读提示", () => {
      const puzzle: SignalPuzzle = {
        ...morsePuzzle,
        condition: { type: "readChapterFragment", chapterId: "prologue", fragmentIndex: 0 },
      };
      expect(getPuzzleUnlockHint(puzzle)).toBe("阅读相关故事片段后解锁");
    });

    it("discoveredBroadcast 条件应返回广播提示", () => {
      const puzzle: SignalPuzzle = {
        ...morsePuzzle,
        condition: { type: "discoveredBroadcast", broadcastId: "broadcast-1" },
      };
      expect(getPuzzleUnlockHint(puzzle)).toBe("收听对应每日广播后解锁");
    });

    it("solvePuzzle 条件应返回前置谜题提示", () => {
      const puzzle: SignalPuzzle = {
        ...morsePuzzle,
        condition: { type: "solvePuzzle", puzzleId: "puzzle-1" },
      };
      expect(getPuzzleUnlockHint(puzzle)).toBe("解开前置谜题后解锁");
    });
  });
});
