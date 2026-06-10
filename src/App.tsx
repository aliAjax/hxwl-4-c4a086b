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
    return JSON.parse(localStorage.getItem(storageKey) || "") as RadioSave;
  } catch {
    return { discovered: [], favorites: [] };
  }
}

function signalFor(frequency: number, station: Station) {
  return Math.max(0, 100 - Math.abs(frequency - station.frequency) * 80);
}

export default function App() {
  const [frequency, setFrequency] = useState(90.1);
  const [save, setSave] = useState<RadioSave>(loadSave);

  const tuned = useMemo(
    () => stations.map((station) => ({ station, signal: signalFor(frequency, station) })).sort((a, b) => b.signal - a.signal)[0],
    [frequency]
  );
  const currentStation = tuned.signal >= 74 ? tuned.station : null;
  const noise = Math.round(100 - tuned.signal);

  useEffect(() => {
    if (currentStation && !save.discovered.includes(currentStation.id)) {
      setSave((current) => ({ ...current, discovered: [...current.discovered, currentStation.id] }));
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

  return (
    <main className="radio">
      <section className="hero">
        <p className="eyebrow">频段缝隙</p>
        <h1>旋进没人值守的电台</h1>
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
      </section>
    </main>
  );
}
