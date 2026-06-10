import { useEffect, useMemo, useState } from "react";

type Schedule = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  message: string;
};

type Station = {
  id: string;
  name: string;
  frequency: number;
  color: string;
  message: string;
  schedules: Schedule[];
  isCustom?: boolean;
};

type CustomStation = {
  id: string;
  name: string;
  frequency: number;
  color: string;
  message: string;
};

type RadioSave = {
  discovered: string[];
  favorites: string[];
  discoveredAt: Record<string, number>;
  lastListenedAt: Record<string, number>;
  notes: Record<string, string>;
};

const storageKey = "hxwl-4-radio";
const customStationsKey = "hxwl-4-custom-stations";
const NOTE_MAX_LENGTH = 200;
const MIN_FREQ_GAP = 0.5;

const stations: Station[] = [
  {
    id: "rain",
    name: "雨棚旧讯号",
    frequency: 88.7,
    color: "#61a5c2",
    message: "今晚的雨会绕过屋顶，落在所有没寄出的信上。",
    schedules: [
      { id: "rain-morning", name: "清晨微雨", startTime: "06:00", endTime: "09:00", message: "晨雨打在镀锌铁皮上，像有人在敲一封没人拆的信。" },
      { id: "rain-noon", name: "午后阵雨", startTime: "12:00", endTime: "14:00", message: "午后阵雨把街道洗干净，也把昨天的脚印冲散了。" },
      { id: "rain-evening", name: "傍晚密雨", startTime: "17:30", endTime: "20:00", message: "傍晚的雨丝里裹着饭菜香，有人在窗边等一个不会来的人。" },
      { id: "rain-night", name: "深夜夜雨", startTime: "23:00", endTime: "03:00", message: "夜雨绕过屋顶，落在所有没寄出的信上，字迹慢慢晕开。" }
    ]
  },
  {
    id: "salt",
    name: "盐湖观测站",
    frequency: 93.4,
    color: "#e8c36a",
    message: "湖面亮度稳定，南岸有三次短暂闪烁，原因未明。",
    schedules: [
      { id: "salt-dawn", name: "黎明观测", startTime: "04:00", endTime: "07:00", message: "东方地平线泛白，湖面开始反射第一缕光，能见度在上升。" },
      { id: "salt-noon", name: "正午强光", startTime: "11:00", endTime: "14:30", message: "湖面亮度峰值，盐晶反射出上千个小太阳，记得戴墨镜。" },
      { id: "salt-dusk", name: "黄昏闪光", startTime: "18:00", endTime: "20:30", message: "南岸有三次短暂闪烁，像是某种摩斯电码，但我们解码不出。" },
      { id: "salt-late", name: "深夜静息", startTime: "00:30", endTime: "03:30", message: "湖面陷入绝对黑暗，只有仪器的小红灯在轻轻闪烁。" }
    ]
  },
  {
    id: "train",
    name: "末班列车台",
    frequency: 101.2,
    color: "#a06cd5",
    message: "下一站无人下车，但有人把一枚纽扣留在座位上。",
    schedules: [
      { id: "train-morning", name: "早班通勤", startTime: "06:30", endTime: "09:30", message: "早班列车载着困倦的人，每个人都在补昨晚没睡够的觉。" },
      { id: "train-evening", name: "晚高峰", startTime: "17:00", endTime: "19:30", message: "晚高峰的车厢里挤满了想回家的人，广播在提醒注意脚下。" },
      { id: "train-last", name: "末班车", startTime: "22:00", endTime: "00:30", message: "这是今日最后一班车。下一站无人下车，但有人把一枚纽扣留在座位上。" },
      { id: "train-empty", name: "凌晨空车", startTime: "02:00", endTime: "04:30", message: "空列车在线路上来回跑，像在等一个永远不会出现的乘客。" }
    ]
  },
  {
    id: "green",
    name: "温室低语",
    frequency: 106.6,
    color: "#5aa86a",
    message: "第七盆植物在凌晨两点转向了没有窗的墙。",
    schedules: [
      { id: "green-morning", name: "晨间舒展", startTime: "07:00", endTime: "10:00", message: "晨光穿过玻璃，叶片们慢慢舒展开，像是在集体伸懒腰。" },
      { id: "green-afternoon", name: "午后生长", startTime: "13:00", endTime: "16:00", message: "生长的声音很轻，你得凑近才能听见——像骨头在轻轻响。" },
      { id: "green-dusk", name: "黄昏浇灌", startTime: "18:00", endTime: "19:30", message: "浇水时间到了。水珠落在叶片上，每一棵都在说谢谢。" },
      { id: "green-night", name: "深夜转向", startTime: "01:00", endTime: "03:30", message: "第七盆植物在凌晨两点转向了没有窗的墙，它在看什么？" }
    ]
  }
];

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function isTimeInSlot(currentMinutes: number, startMinutes: number, endMinutes: number): boolean {
  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }
  return currentMinutes >= startMinutes || currentMinutes < endMinutes;
}

function getCurrentSchedule(station: Station, now: Date): Schedule | null {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  for (const schedule of station.schedules) {
    const start = timeToMinutes(schedule.startTime);
    const end = timeToMinutes(schedule.endTime);
    if (isTimeInSlot(currentMinutes, start, end)) {
      return schedule;
    }
  }
  return null;
}

function getStationMessage(station: Station, now: Date): { message: string; scheduleName: string | null } {
  const schedule = getCurrentSchedule(station, now);
  if (schedule) {
    return { message: schedule.message, scheduleName: schedule.name };
  }
  return { message: station.message, scheduleName: null };
}

function loadSave(): RadioSave {
  try {
    const data = JSON.parse(localStorage.getItem(storageKey) || "") as Partial<RadioSave>;
    return {
      discovered: data.discovered || [],
      favorites: data.favorites || [],
      discoveredAt: data.discoveredAt || {},
      lastListenedAt: data.lastListenedAt || {},
      notes: data.notes || {}
    };
  } catch {
    return { discovered: [], favorites: [], discoveredAt: {}, lastListenedAt: {}, notes: {} };
  }
}

function loadCustomStations(): CustomStation[] {
  try {
    const data = JSON.parse(localStorage.getItem(customStationsKey) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function signalFor(frequency: number, station: Station) {
  return Math.max(0, 100 - Math.abs(frequency - station.frequency) * 80);
}

function checkFrequencyConflict(
  freq: number,
  allStations: Station[],
  excludeId?: string
): { conflict: boolean; nearestStation: Station | null; gap: number } {
  let nearest: Station | null = null;
  let minGap = Infinity;
  for (const s of allStations) {
    if (s.id === excludeId) continue;
    const gap = Math.abs(freq - s.frequency);
    if (gap < minGap) {
      minGap = gap;
      nearest = s;
    }
  }
  return { conflict: minGap < MIN_FREQ_GAP, nearestStation: nearest, gap: minGap };
}

function isValidTimestamp(timestamp: number | undefined): timestamp is number {
  return typeof timestamp === "number" && Number.isFinite(timestamp);
}

function formatDiscoveredTime(timestamp: number | undefined): string {
  if (!isValidTimestamp(timestamp)) return "发现时间未记录";

  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "刚刚发现";
  if (diffMins < 60) return `${diffMins} 分钟前发现`;
  if (diffHours < 24) return `${diffHours} 小时前发现`;
  if (diffDays < 7) return `${diffDays} 天前发现`;

  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatArchiveDetailTime(timestamp: number | undefined): string {
  if (!isValidTimestamp(timestamp)) return "发现时间未记录";

  return new Date(timestamp).toLocaleString("zh-CN");
}

function formatLastListenedTime(timestamp: number | undefined): string {
  if (!isValidTimestamp(timestamp)) return "尚未收听";

  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "刚刚收听";
  if (diffMins < 60) return `${diffMins} 分钟前收听`;
  if (diffHours < 24) return `${diffHours} 小时前收听`;
  if (diffDays < 7) return `${diffDays} 天前收听`;

  return date.toLocaleDateString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

const SCAN_SPEED = 0.08;
const SCAN_INTERVAL = 60;
const SCAN_PAUSE_THRESHOLD = 55;
const SCAN_LOCK_THRESHOLD = 74;
const SCAN_PAUSE_DURATION = 1200;
const SCAN_LOCK_DURATION = 2500;

const PRESET_COLORS = [
  "#e8c36a",
  "#61a5c2",
  "#a06cd5",
  "#5aa86a",
  "#d46a6a",
  "#6ac2a0",
  "#c2826a",
  "#8a8cc2",
  "#c2a06a",
  "#6ab8c2"
];

export default function App() {
  const [frequency, setFrequency] = useState(90.1);
  const [save, setSave] = useState<RadioSave>(loadSave);
  const [customStations, setCustomStations] = useState<CustomStation[]>(loadCustomStations);
  const [expandedArchive, setExpandedArchive] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [labOpen, setLabOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanDirection, setScanDirection] = useState<1 | -1>(1);
  const [scanPaused, setScanPaused] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const [labName, setLabName] = useState("");
  const [labFreq, setLabFreq] = useState(90.0);
  const [labColor, setLabColor] = useState("#e8c36a");
  const [labMessage, setLabMessage] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const allStations = useMemo<Station[]>(() => {
    return [
      ...stations,
      ...customStations.map((cs) => ({
        ...cs,
        schedules: [] as Schedule[],
        isCustom: true as const,
      })),
    ];
  }, [customStations]);

  const tuned = useMemo(
    () => allStations.map((station) => ({ station, signal: signalFor(frequency, station) })).sort((a, b) => b.signal - a.signal)[0],
    [frequency, allStations]
  );
  const currentStation = tuned.signal >= 74 ? tuned.station : null;
  const noise = Math.round(100 - tuned.signal);

  const currentBroadcast = useMemo(() => {
    if (!currentStation) return null;
    return getStationMessage(currentStation, now);
  }, [currentStation, now]);

  const favoriteStations = useMemo(
    () =>
      allStations
        .filter((station) => save.favorites.includes(station.id))
        .sort((a, b) => {
          const aTime = save.lastListenedAt[a.id] ?? 0;
          const bTime = save.lastListenedAt[b.id] ?? 0;
          return bTime - aTime;
        }),
    [save.favorites, save.lastListenedAt, allStations]
  );

  const lastListenedStation = useMemo(() => {
    if (favoriteStations.length === 0) return null;
    return favoriteStations[0];
  }, [favoriteStations]);

  const labFreqConflict = useMemo(() => {
    return checkFrequencyConflict(labFreq, allStations);
  }, [labFreq, allStations]);

  useEffect(() => {
    if (currentStation && !save.discovered.includes(currentStation.id)) {
      setSave((current) => ({
        ...current,
        discovered: [...current.discovered, currentStation.id],
        discoveredAt: { ...current.discoveredAt, [currentStation.id]: Date.now() },
        lastListenedAt: { ...current.lastListenedAt, [currentStation.id]: Date.now() }
      }));
    } else if (currentStation) {
      setSave((current) => ({
        ...current,
        lastListenedAt: { ...current.lastListenedAt, [currentStation.id]: Date.now() }
      }));
    }
  }, [currentStation, save.discovered]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(save));
  }, [save]);

  useEffect(() => {
    localStorage.setItem(customStationsKey, JSON.stringify(customStations));
  }, [customStations]);

  useEffect(() => {
    if (!isScanning || scanPaused) return;

    const interval = setInterval(() => {
      setFrequency((prev) => {
        const next = prev + SCAN_SPEED * scanDirection;
        if (next >= 108) {
          setScanDirection(-1);
          return 108;
        }
        if (next <= 87.5) {
          setScanDirection(1);
          return 87.5;
        }
        return Number(next.toFixed(1));
      });
    }, SCAN_INTERVAL);

    return () => clearInterval(interval);
  }, [isScanning, scanPaused, scanDirection]);

  useEffect(() => {
    if (!isScanning) return;

    const signal = tuned.signal;
    if (signal >= SCAN_LOCK_THRESHOLD) {
      setScanPaused(true);
      const timer = setTimeout(() => setScanPaused(false), SCAN_LOCK_DURATION);
      return () => clearTimeout(timer);
    } else if (signal >= SCAN_PAUSE_THRESHOLD) {
      setScanPaused(true);
      const timer = setTimeout(() => setScanPaused(false), SCAN_PAUSE_DURATION);
      return () => clearTimeout(timer);
    }
  }, [tuned.signal, isScanning]);

  function toggleScan() {
    if (isScanning) {
      setIsScanning(false);
      setScanPaused(false);
    } else {
      setIsScanning(true);
      setScanPaused(false);
    }
  }

  function handleFrequencyChange(value: number) {
    if (isScanning) {
      setIsScanning(false);
      setScanPaused(false);
    }
    setFrequency(value);
  }

  function toggleFavorite(id: string) {
    setSave((current) => ({
      ...current,
      favorites: current.favorites.includes(id) ? current.favorites.filter((item) => item !== id) : [...current.favorites, id]
    }));
  }

  function tuneToStation(station: Station) {
    setFrequency(station.frequency);
    setDrawerOpen(false);
  }

  function startEditingNote(id: string) {
    setEditingNoteId(id);
    setNoteDraft(save.notes[id] || "");
  }

  function saveNote(id: string) {
    const trimmed = noteDraft.trim();
    setSave((current) => {
      const next = { ...current, notes: { ...current.notes } };
      if (trimmed) {
        next.notes[id] = trimmed;
      } else {
        delete next.notes[id];
      }
      return next;
    });
    setEditingNoteId(null);
    setNoteDraft("");
  }

  function cancelEditingNote() {
    setEditingNoteId(null);
    setNoteDraft("");
  }

  function addCustomStation() {
    if (!labName.trim() || !labMessage.trim()) return;
    if (labFreqConflict.conflict) return;
    if (labFreq < 87.5 || labFreq > 108.0) return;
    const newStation: CustomStation = {
      id: `custom-${Date.now()}`,
      name: labName.trim(),
      frequency: Number(labFreq.toFixed(1)),
      color: labColor,
      message: labMessage.trim(),
    };
    setCustomStations((prev) => [...prev, newStation]);
    setLabName("");
    setLabFreq(90.0);
    setLabColor("#e8c36a");
    setLabMessage("");
  }

  function deleteCustomStation(id: string) {
    setCustomStations((prev) => prev.filter((cs) => cs.id !== id));
    setSave((current) => {
      const next = { ...current };
      next.discovered = next.discovered.filter((d) => d !== id);
      next.favorites = next.favorites.filter((f) => f !== id);
      delete next.discoveredAt[id];
      delete next.lastListenedAt[id];
      delete next.notes[id];
      return next;
    });
  }

  function closeLab() {
    setLabOpen(false);
    setLabName("");
    setLabFreq(90.0);
    setLabColor("#e8c36a");
    setLabMessage("");
  }

  const canAddStation = labName.trim() && labMessage.trim() && !labFreqConflict.conflict && labFreq >= 87.5 && labFreq <= 108.0;

  return (
    <main className="radio">
      <section className="hero">
        <p className="eyebrow">频段缝隙</p>
        <div className="hero-header">
          <h1>旋进没人值守的电台</h1>
          <div className="hero-actions">
            <button className="lab-trigger" onClick={() => setLabOpen(true)}>
              <span className="lab-trigger-icon">⚗</span>
              <span>自定义电台实验室</span>
              {customStations.length > 0 && <span className="lab-count">{customStations.length}</span>}
            </button>
            <button className="favorites-trigger" onClick={() => setDrawerOpen(true)}>
              <span className="favorites-trigger-icon">★</span>
              <span>收藏电台</span>
              {favoriteStations.length > 0 && <span className="favorites-count">{favoriteStations.length}</span>}
            </button>
          </div>
        </div>
      </section>

      <section className="console">
        <div className="dial-panel">
          <div className={`screen ${isScanning ? "scanning" : ""} ${scanPaused ? "paused" : ""}`} style={{ "--noise": `${noise}%` } as React.CSSProperties}>
            <span>
              {frequency.toFixed(1)} MHz
              {isScanning && <em className="scan-indicator">{scanPaused ? "信号驻留" : "扫描中"}</em>}
              {currentBroadcast?.scheduleName && <em className="schedule-tag">▸ {currentBroadcast.scheduleName}</em>}
              {currentStation?.isCustom && <em className="custom-tag">自建</em>}
            </span>
            <strong>{currentStation ? currentStation.name : "沙沙声"}</strong>
            <p>{currentBroadcast ? currentBroadcast.message : isScanning ? "扫描频段中，信号接近电台时会自动停留。" : "信号还没有咬住频段，慢慢调到更清晰的位置。"}</p>
          </div>
          <div className="scan-controls">
            <button className={`scan-btn ${isScanning ? "active" : ""}`} onClick={toggleScan}>
              {isScanning ? "⏹ 停止扫描" : "▶ 信号扫描"}
            </button>
            <div className="scan-direction">
              <button
                className={`dir-btn ${scanDirection === 1 ? "" : "active"}`}
                onClick={() => isScanning && setScanDirection(-1)}
                disabled={!isScanning}
              >
                ◀
              </button>
              <button
                className={`dir-btn ${scanDirection === 1 ? "active" : ""}`}
                onClick={() => isScanning && setScanDirection(1)}
                disabled={!isScanning}
              >
                ▶
              </button>
            </div>
          </div>
          <input min="87.5" max="108" step="0.1" value={frequency} onChange={(event) => handleFrequencyChange(Number(event.target.value))} type="range" />
          <div className={`meter ${isScanning ? "scanning" : ""} ${scanPaused ? "pulsing" : ""}`}>
            <i style={{ width: `${Math.round(tuned.signal)}%`, background: currentStation?.color ?? "#9aa0a6" }} />
          </div>
        </div>

        <aside className="log-panel">
          <h2>发现记录</h2>
          <div className="stations">
            {allStations.map((station) => {
              const found = save.discovered.includes(station.id);
              const note = save.notes[station.id];
              const isEditing = editingNoteId === station.id;
              const stationBroadcast = found ? getStationMessage(station, now) : null;
              return (
                <article key={station.id} className={found ? "found" : ""}>
                  <span style={{ background: station.color }}>{found ? station.frequency.toFixed(1) : "??"}</span>
                  <div>
                    <strong>
                      {found ? station.name : "未识别频段"}
                      {stationBroadcast?.scheduleName && <em className="schedule-tag-inline">▸ {stationBroadcast.scheduleName}</em>}
                      {station.isCustom && <em className="custom-tag-inline">自建</em>}
                    </strong>
                    <p>{found ? stationBroadcast?.message ?? station.message : "继续调频寻找它。"}</p>
                    {found && note && !isEditing && (
                      <p className="note-preview">📝 {note.length > 30 ? note.slice(0, 30) + "…" : note}</p>
                    )}
                    {found && isEditing && (
                      <div className="note-editor" onClick={(e) => e.stopPropagation()}>
                        <textarea
                          className="note-textarea"
                          value={noteDraft}
                          onChange={(e) => setNoteDraft(e.target.value.slice(0, NOTE_MAX_LENGTH))}
                          placeholder="写一段私人备注…"
                          rows={3}
                          autoFocus
                        />
                        <div className="note-editor-footer">
                          <span className="note-counter">{noteDraft.length}/{NOTE_MAX_LENGTH}</span>
                          <div className="note-editor-actions">
                            <button className="note-cancel-btn" onClick={cancelEditingNote}>取消</button>
                            <button className="note-save-btn" onClick={() => saveNote(station.id)}>保存</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {found && !isEditing && (
                    <div className="station-actions">
                      <button className="note-trigger-btn" onClick={() => startEditingNote(station.id)}>
                        {note ? "📝" : "备忘"}
                      </button>
                      <button onClick={() => toggleFavorite(station.id)}>
                        {save.favorites.includes(station.id) ? "已收藏" : "收藏"}
                      </button>
                    </div>
                  )}
                  {found && isEditing && (
                    <button onClick={() => toggleFavorite(station.id)}>
                      {save.favorites.includes(station.id) ? "已收藏" : "收藏"}
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        </aside>

        <aside className="archive-panel">
          <h2>电台档案</h2>
          <div className="archive-list">
            {allStations.map((station) => {
              const found = save.discovered.includes(station.id);
              const isExpanded = expandedArchive === station.id;
              const isFavorite = save.favorites.includes(station.id);
              const discoveredAt = save.discoveredAt[station.id];
              const stationBroadcast = found ? getStationMessage(station, now) : null;

              return (
                <article
                  key={station.id}
                  className={`archive-item ${found ? "found" : ""} ${isExpanded ? "expanded" : ""}`}
                  onClick={() => found && setExpandedArchive(isExpanded ? null : station.id)}
                >
                  <header>
                    <span className="archive-freq" style={{ background: station.color }}>
                      {found ? station.frequency.toFixed(1) : "??"}
                    </span>
                    <div className="archive-info">
                      <strong>
                        {found ? station.name : "未知记录"}
                        {stationBroadcast?.scheduleName && <em className="schedule-tag-inline">▸ {stationBroadcast.scheduleName}</em>}
                        {station.isCustom && <em className="custom-tag-inline">自建</em>}
                      </strong>
                      {found ? (
                        <p className="archive-time">{formatDiscoveredTime(discoveredAt)}</p>
                      ) : (
                        <p className="archive-time">尚未发现</p>
                      )}
                    </div>
                    <div className="archive-meta">
                      {found && (
                        <span className={`favorite-badge ${isFavorite ? "active" : ""}`}>
                          {isFavorite ? "★ 已收藏" : "☆ 未收藏"}
                        </span>
                      )}
                      {found && <span className="expand-arrow">{isExpanded ? "▲" : "▼"}</span>}
                    </div>
                  </header>
                  {isExpanded && found && (
                    <div className="archive-details">
                      <div className="detail-row">
                        <label>频率</label>
                        <span>{station.frequency.toFixed(1)} MHz</span>
                      </div>
                      <div className="detail-row">
                        <label>名称</label>
                        <span>{station.name}</span>
                      </div>
                      <div className="detail-row">
                        <label>当前播报</label>
                        <p className="broadcast-text">
                          {stationBroadcast?.scheduleName && (
                            <em className="schedule-tag-inline schedule-tag-archive">▸ {stationBroadcast.scheduleName}</em>
                          )}
                          {stationBroadcast?.message ?? station.message}
                        </p>
                      </div>
                      {station.schedules.length > 0 && (
                        <div className="detail-row detail-row-schedules">
                          <label>节目时段</label>
                          <div className="schedules-list">
                            {station.schedules.map((schedule) => {
                              const isActive = stationBroadcast?.scheduleName === schedule.name;
                              return (
                                <div key={schedule.id} className={`schedule-item ${isActive ? "active" : ""}`}>
                                  <div className="schedule-item-header">
                                    <span className="schedule-name">{schedule.name}</span>
                                    <span className="schedule-time">{schedule.startTime} — {schedule.endTime}</span>
                                  </div>
                                  <p className="schedule-message">{schedule.message}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      <div className="detail-row">
                        <label>发现时间</label>
                        <span>{formatArchiveDetailTime(discoveredAt)}</span>
                      </div>
                      <div className="detail-row">
                        <label>收藏状态</label>
                        <button
                          className="detail-favorite-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(station.id);
                          }}
                        >
                          {isFavorite ? "取消收藏" : "收藏"}
                        </button>
                      </div>
                      <div className="detail-row">
                        <label>调频笔记</label>
                        <div className="note-detail-content">
                          {editingNoteId === station.id ? (
                            <div className="note-editor" onClick={(e) => e.stopPropagation()}>
                              <textarea
                                className="note-textarea"
                                value={noteDraft}
                                onChange={(e) => setNoteDraft(e.target.value.slice(0, NOTE_MAX_LENGTH))}
                                placeholder="写一段私人备注…"
                                rows={3}
                                autoFocus
                              />
                              <div className="note-editor-footer">
                                <span className="note-counter">{noteDraft.length}/{NOTE_MAX_LENGTH}</span>
                                <div className="note-editor-actions">
                                  <button className="note-cancel-btn" onClick={cancelEditingNote}>取消</button>
                                  <button className="note-save-btn" onClick={() => saveNote(station.id)}>保存</button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              {save.notes[station.id] ? (
                                <span className="note-detail-text">{save.notes[station.id]}</span>
                              ) : (
                                <span className="note-empty-hint">暂无备注</span>
                              )}
                              <button
                                className="note-detail-edit-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditingNote(station.id);
                                }}
                              >
                                {save.notes[station.id] ? "编辑" : "添加备注"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      {station.isCustom && (
                        <div className="detail-row">
                          <label>管理</label>
                          <button
                            className="detail-delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCustomStation(station.id);
                              setExpandedArchive(null);
                            }}
                          >
                            删除此电台
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </aside>
      </section>

      <div className={`drawer-overlay ${drawerOpen ? "open" : ""}`} onClick={() => setDrawerOpen(false)} />
      <aside className={`favorites-drawer ${drawerOpen ? "open" : ""}`}>
        <header className="drawer-header">
          <div>
            <h2>收藏电台</h2>
            <p className="drawer-subtitle">
              共 {favoriteStations.length} 个收藏
              {lastListenedStation && (
                <>
                  {" · 最近收听 "}
                  <span style={{ color: lastListenedStation.color }}>
                    {lastListenedStation.frequency.toFixed(1)} MHz
                  </span>
                </>
              )}
            </p>
          </div>
          <button className="drawer-close" onClick={() => setDrawerOpen(false)}>
            ✕
          </button>
        </header>

        <div className="drawer-content">
          {favoriteStations.length === 0 ? (
            <div className="drawer-empty">
              <div className="drawer-empty-icon">☆</div>
              <p>还没有收藏的电台</p>
              <p className="drawer-empty-hint">在发现记录或电台档案中点击「收藏」按钮</p>
            </div>
          ) : (
            <div className="favorite-list">
              {favoriteStations.map((station) => {
                const isTuned = currentStation?.id === station.id;
                const lastListened = save.lastListenedAt[station.id];
                return (
                  <article key={station.id} className={`favorite-item ${isTuned ? "tuned" : ""}`}>
                    <span className="favorite-freq" style={{ background: station.color }}>
                      {station.frequency.toFixed(1)}
                    </span>
                    <div className="favorite-info">
                      <strong>
                        {station.name}
                        {station.isCustom && <em className="custom-tag-inline">自建</em>}
                      </strong>
                      <p className="favorite-time">{formatLastListenedTime(lastListened)}</p>
                    </div>
                    <div className="favorite-actions">
                      <button
                        className="favorite-tune-btn"
                        onClick={() => tuneToStation(station)}
                        disabled={isTuned}
                      >
                        {isTuned ? "收听中" : "切换"}
                      </button>
                      <button
                        className="favorite-remove-btn"
                        onClick={() => toggleFavorite(station.id)}
                        title="取消收藏"
                      >
                        ★
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      <div className={`drawer-overlay ${labOpen ? "open" : ""}`} onClick={closeLab} />
      <aside className={`lab-drawer ${labOpen ? "open" : ""}`}>
        <header className="drawer-header">
          <div>
            <h2>自定义电台实验室</h2>
            <p className="drawer-subtitle">
              创建你的私人电台，加入调频系统
            </p>
          </div>
          <button className="drawer-close" onClick={closeLab}>
            ✕
          </button>
        </header>

        <div className="drawer-content">
          <div className="lab-form">
            <div className="lab-form-section">
              <h3 className="lab-form-title">新建电台</h3>

              <div className="lab-field">
                <label className="lab-label">电台名称</label>
                <input
                  className="lab-input"
                  type="text"
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  placeholder="为你的电台取个名字"
                  maxLength={20}
                />
              </div>

              <div className="lab-field">
                <label className="lab-label">频率 (MHz)</label>
                <div className="lab-freq-control">
                  <input
                    className="lab-input lab-freq-input"
                    type="number"
                    min="87.5"
                    max="108"
                    step="0.1"
                    value={labFreq}
                    onChange={(e) => setLabFreq(Number(e.target.value))}
                  />
                  <input
                    className="lab-freq-slider"
                    type="range"
                    min="87.5"
                    max="108"
                    step="0.1"
                    value={labFreq}
                    onChange={(e) => setLabFreq(Number(e.target.value))}
                  />
                </div>
                {labFreqConflict.conflict && labFreqConflict.nearestStation && (
                  <p className="lab-freq-warning">
                    ⚠ 与「{labFreqConflict.nearestStation.name}」({labFreqConflict.nearestStation.frequency.toFixed(1)} MHz) 仅距 {labFreqConflict.gap.toFixed(1)} MHz，信号会互相干扰（最小间隔 {MIN_FREQ_GAP} MHz）
                  </p>
                )}
                {!labFreqConflict.conflict && labFreq >= 87.5 && labFreq <= 108.0 && (
                  <p className="lab-freq-ok">
                    ✓ 频率可用，距最近电台 {labFreqConflict.nearestStation ? `${labFreqConflict.gap.toFixed(1)} MHz` : "无"}
                  </p>
                )}
                {(labFreq < 87.5 || labFreq > 108.0) && (
                  <p className="lab-freq-warning">
                    ⚠ 频率超出调频范围 (87.5 – 108.0 MHz)
                  </p>
                )}
              </div>

              <div className="lab-field">
                <label className="lab-label">标识颜色</label>
                <div className="lab-color-picker">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      className={`lab-color-swatch ${labColor === c ? "active" : ""}`}
                      style={{ background: c }}
                      onClick={() => setLabColor(c)}
                    />
                  ))}
                  <label className="lab-color-custom">
                    <input
                      type="color"
                      value={labColor}
                      onChange={(e) => setLabColor(e.target.value)}
                    />
                    <span className="lab-color-custom-label" style={{ borderColor: labColor }}>自定义</span>
                  </label>
                </div>
              </div>

              <div className="lab-field">
                <label className="lab-label">播报文本</label>
                <textarea
                  className="lab-textarea"
                  value={labMessage}
                  onChange={(e) => setLabMessage(e.target.value)}
                  placeholder="写下你的电台会播出的内容…"
                  rows={3}
                  maxLength={200}
                />
                <span className="lab-char-count">{labMessage.length}/200</span>
              </div>

              <button
                className="lab-add-btn"
                onClick={addCustomStation}
                disabled={!canAddStation}
              >
                加入调频系统
              </button>
            </div>

            {customStations.length > 0 && (
              <div className="lab-form-section">
                <h3 className="lab-form-title">已创建的自定义电台</h3>
                <div className="lab-existing-list">
                  {customStations.map((cs) => {
                    const found = save.discovered.includes(cs.id);
                    const isFav = save.favorites.includes(cs.id);
                    return (
                      <article key={cs.id} className="lab-existing-item">
                        <span className="lab-existing-freq" style={{ background: cs.color }}>
                          {cs.frequency.toFixed(1)}
                        </span>
                        <div className="lab-existing-info">
                          <strong>{cs.name}</strong>
                          <p>{cs.message.length > 40 ? cs.message.slice(0, 40) + "…" : cs.message}</p>
                          <div className="lab-existing-badges">
                            {found && <span className="lab-badge lab-badge-found">已发现</span>}
                            {!found && <span className="lab-badge lab-badge-unfound">未发现</span>}
                            {isFav && <span className="lab-badge lab-badge-fav">已收藏</span>}
                          </div>
                        </div>
                        <button
                          className="lab-delete-btn"
                          onClick={() => deleteCustomStation(cs.id)}
                          title="删除此电台"
                        >
                          ✕
                        </button>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </main>
  );
}
