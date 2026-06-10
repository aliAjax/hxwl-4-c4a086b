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
};

const storageKey = "hxwl-4-radio";

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
      lastListenedAt: data.lastListenedAt || {}
    };
  } catch {
    return { discovered: [], favorites: [], discoveredAt: {}, lastListenedAt: {} };
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

export default function App() {
  const [frequency, setFrequency] = useState(90.1);
  const [save, setSave] = useState<RadioSave>(loadSave);
  const [expandedArchive, setExpandedArchive] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
          <div className="screen" style={{ "--noise": `${noise}%` } as React.CSSProperties}>
            <span>{frequency.toFixed(1)} MHz</span>
            <strong>{currentStation ? currentStation.name : "沙沙声"}</strong>
            <p>{currentStation ? currentStation.message : "信号还没有咬住频段，慢慢调到更清晰的位置。"}</p>
          </div>
          <input min="87.5" max="108" step="0.1" value={frequency} onChange={(event) => setFrequency(Number(event.target.value))} type="range" />
          <div className="meter">
            <i style={{ width: `${Math.round(tuned.signal)}%`, background: currentStation?.color ?? "#9aa0a6" }} />
          </div>
        </div>

        <aside className="log-panel">
          <h2>发现记录</h2>
          <div className="stations">
            {stations.map((station) => {
              const found = save.discovered.includes(station.id);
              return (
                <article key={station.id} className={found ? "found" : ""}>
                  <span style={{ background: station.color }}>{found ? station.frequency.toFixed(1) : "??"}</span>
                  <div>
                    <strong>{found ? station.name : "未识别频段"}</strong>
                    <p>{found ? station.message : "继续调频寻找它。"}</p>
                  </div>
                  {found && (
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
