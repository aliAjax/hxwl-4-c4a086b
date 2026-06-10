export type SignalTape = {
  id: string;
  stationId: string;
  stationName: string;
  frequency: number;
  color: string;
  scheduleName: string | null;
  scheduleStartTime: string | null;
  scheduleEndTime: string | null;
  content: string;
  savedAt: number;
  isAnomaly?: boolean;
};

export type SignalTapeSave = {
  version: number;
  tapes: SignalTape[];
};

const STORAGE_VERSION = 2;
const STORAGE_KEY = "hxwl-4-signal-tapes";

export function loadSignalTapes(): SignalTapeSave {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createNewSave();
    }

    const data = JSON.parse(raw) as Partial<SignalTapeSave> & { version?: number };

    if (!data.version || data.version < STORAGE_VERSION) {
      return migrateSave(data);
    }

    return {
      version: STORAGE_VERSION,
      tapes: data.tapes || []
    };
  } catch {
    return createNewSave();
  }
}

function createNewSave(): SignalTapeSave {
  return {
    version: STORAGE_VERSION,
    tapes: []
  };
}

function migrateSave(data: Partial<SignalTapeSave> & { version?: number }): SignalTapeSave {
  const migratedTapes = (data.tapes || []).map((tape) => ({
    ...tape,
    scheduleStartTime: (tape as SignalTape).scheduleStartTime ?? null,
    scheduleEndTime: (tape as SignalTape).scheduleEndTime ?? null
  }));

  return {
    version: STORAGE_VERSION,
    tapes: migratedTapes
  };
}

export function saveSignalTapes(save: SignalTapeSave): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
}

export function addSignalTape(save: SignalTapeSave, tape: Omit<SignalTape, "id" | "savedAt">): SignalTapeSave {
  const newTape: SignalTape = {
    ...tape,
    id: `tape-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    savedAt: Date.now()
  };

  return {
    ...save,
    tapes: [newTape, ...save.tapes]
  };
}

export function deleteSignalTape(save: SignalTapeSave, tapeId: string): SignalTapeSave {
  return {
    ...save,
    tapes: save.tapes.filter((t) => t.id !== tapeId)
  };
}

export function formatTapeTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "刚刚录制";
  if (diffMins < 60) return `${diffMins} 分钟前录制`;
  if (diffHours < 24) return `${diffHours} 小时前录制`;
  if (diffDays < 7) return `${diffDays} 天前录制`;

  return date.toLocaleDateString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function formatTapeDetailTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString("zh-CN");
}
