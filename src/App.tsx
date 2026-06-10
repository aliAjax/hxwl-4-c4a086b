import { useEffect, useMemo, useState } from "react";

type Station = {
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
const NOTE_MAX_LENGTH = 200;

const stations: Station[] = [
  { id: "rain", name: "雨棚旧讯号", frequency: 88.7, color: "#61a5c2", message: "今晚的雨会绕过屋顶，落在所有没寄出的信上。" },
  { id: "salt", name: "盐湖观测站", frequency: 93.4, color: "#e8c36a", message: "湖面亮度稳定，南岸有三次短暂闪烁，原因未明。" },
  { id: "train", name: "末班列车台", frequency: 101.2, color: "#a06cd5", message: "下一站无人下车，但有人把一枚纽扣留在座位上。" },
  { id: "green", name: "温室低语", frequency: 106.6, color: "#5aa86a", message: "第七盆植物在凌晨两点转向了没有窗的墙。" }
];

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

function signalFor(frequency: number, station: Station) {
  return Math.max(0, 100 - Math.abs(frequency - station.frequency) * 80);
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

export default function App() {
  const [frequency, setFrequency] = useState(90.1);
  const [save, setSave] = useState<RadioSave>(loadSave);
  const [expandedArchive, setExpandedArchive] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanDirection, setScanDirection] = useState<1 | -1>(1);
  const [scanPaused, setScanPaused] = useState(false);

  const tuned = useMemo(
    () => stations.map((station) => ({ station, signal: signalFor(frequency, station) })).sort((a, b) => b.signal - a.signal)[0],
    [frequency]
  );
  const currentStation = tuned.signal >= 74 ? tuned.station : null;
  const noise = Math.round(100 - tuned.signal);

  const favoriteStations = useMemo(
    () =>
      stations
        .filter((station) => save.favorites.includes(station.id))
        .sort((a, b) => {
          const aTime = save.lastListenedAt[a.id] ?? 0;
          const bTime = save.lastListenedAt[b.id] ?? 0;
          return bTime - aTime;
        }),
    [save.favorites, save.lastListenedAt]
  );

  const lastListenedStation = useMemo(() => {
    if (favoriteStations.length === 0) return null;
    return favoriteStations[0];
  }, [favoriteStations]);

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

  return (
    <main className="radio">
      <section className="hero">
        <p className="eyebrow">频段缝隙</p>
        <div className="hero-header">
          <h1>旋进没人值守的电台</h1>
          <button className="favorites-trigger" onClick={() => setDrawerOpen(true)}>
            <span className="favorites-trigger-icon">★</span>
            <span>收藏电台</span>
            {favoriteStations.length > 0 && <span className="favorites-count">{favoriteStations.length}</span>}
          </button>
        </div>
      </section>

      <section className="console">
        <div className="dial-panel">
          <div className={`screen ${isScanning ? "scanning" : ""} ${scanPaused ? "paused" : ""}`} style={{ "--noise": `${noise}%` } as React.CSSProperties}>
            <span>
              {frequency.toFixed(1)} MHz
              {isScanning && <em className="scan-indicator">{scanPaused ? "信号驻留" : "扫描中"}</em>}
            </span>
            <strong>{currentStation ? currentStation.name : "沙沙声"}</strong>
            <p>{currentStation ? currentStation.message : isScanning ? "扫描频段中，信号接近电台时会自动停留。" : "信号还没有咬住频段，慢慢调到更清晰的位置。"}</p>
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
            {stations.map((station) => {
              const found = save.discovered.includes(station.id);
              const note = save.notes[station.id];
              const isEditing = editingNoteId === station.id;
              return (
                <article key={station.id} className={found ? "found" : ""}>
                  <span style={{ background: station.color }}>{found ? station.frequency.toFixed(1) : "??"}</span>
                  <div>
                    <strong>{found ? station.name : "未识别频段"}</strong>
                    <p>{found ? station.message : "继续调频寻找它。"}</p>
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
            {stations.map((station) => {
              const found = save.discovered.includes(station.id);
              const isExpanded = expandedArchive === station.id;
              const isFavorite = save.favorites.includes(station.id);
              const discoveredAt = save.discoveredAt[station.id];

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
                      <strong>{found ? station.name : "未知记录"}</strong>
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
                        <label>广播文本</label>
                        <p className="broadcast-text">{station.message}</p>
                      </div>
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
                      <strong>{station.name}</strong>
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
    </main>
  );
}
