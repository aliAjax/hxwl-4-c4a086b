export type DailyUnlockCondition =
  | { type: "date"; date: string }
  | { type: "daysSinceStart"; days: number }
  | { type: "discoverStation"; stationId: string }
  | { type: "discoverCount"; count: number }
  | { type: "favoriteCount"; count: number };

export type DailyMessage = {
  id: string;
  stationId: string;
  timeSlot?: string;
  content: string;
  isAnomaly?: boolean;
};

export type DailyFragment = {
  id: string;
  title: string;
  content: string;
};

export type DailyBroadcast = {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  color: string;
  condition: DailyUnlockCondition;
  stationIds: string[];
  messages: DailyMessage[];
  fragments: DailyFragment[];
  isHidden?: boolean;
  anomalyLevel: "normal" | "unusual" | "anomaly" | "critical";
};

export type DailyBroadcastSave = {
  version: number;
  discoveredBroadcasts: string[];
  readFragments: string[];
  discoveredAt: Record<string, number>;
  lastReadAt: Record<string, number>;
  firstVisitDate?: string;
  lastVisitDate?: string;
  missedCatchUps: string[];
  catchUpCompleted: string[];
};

const STORAGE_VERSION = 2;
const STORAGE_KEY = "hxwl-4-daily-broadcast";

const stationNameMap: Record<string, string> = {
  rain: "雨棚旧讯号",
  salt: "盐湖观测站",
  train: "末班列车台",
  green: "温室低语",
};

function getDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDateKey(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function daysBetween(date1: Date, date2: Date): number {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getBroadcastDateKey(broadcast: DailyBroadcast, firstVisitDate?: string): string | null {
  const condition = broadcast.condition;

  if (condition.type === "daysSinceStart") {
    const startDate = firstVisitDate ? parseDateKey(firstVisitDate) : parseDateKey(START_DATE);
    return getDateKey(addDays(startDate, condition.days));
  }

  if (condition.type === "date") {
    return condition.date;
  }

  return null;
}

function getStationName(id: string): string {
  return stationNameMap[id] || id;
}

const START_DATE = "2026-06-01";

export const dailyBroadcasts: DailyBroadcast[] = [
  {
    id: "day-001",
    date: "2026-06-01",
    title: "第一日 · 信号初启",
    subtitle: "当你第一次转动旋钮的时候",
    color: "#8cc9df",
    condition: { type: "daysSinceStart", days: 0 },
    stationIds: ["rain"],
    anomalyLevel: "normal",
    messages: [
      {
        id: "day1-rain-1",
        stationId: "rain",
        timeSlot: "全天",
        content: "「今天的第一封信，写给刚刚打开收音机的人。\n\n欢迎来到频段缝隙。\n这里的电台，都在等一个不会来的人。\n\n而你，是偶然闯入的听众。」"
      }
    ],
    fragments: [
      {
        id: "day1-frag-1",
        title: "第一天的便签",
        content: "你收到收音机的第一天。\n\n没有说明书，没有寄件人。\n只有一张泛黄的便签，上面写着：\n「调到 88.7，雨声开始的时候，记得写信。」\n\n旋钮转动的时候，有沙沙的静电声。\n像有人在另一端，也在慢慢找你。\n\n——欢迎来到频段缝隙。"
      }
    ]
  },
  {
    id: "day-002",
    date: "2026-06-02",
    title: "第二日 · 盐湖的信号",
    subtitle: "南岸的闪烁，从今天开始被记录",
    color: "#e8c36a",
    condition: { type: "daysSinceStart", days: 1 },
    stationIds: ["salt"],
    anomalyLevel: "normal",
    messages: [
      {
        id: "day2-salt-1",
        stationId: "salt",
        timeSlot: "黄昏",
        content: "「湖面亮度稳定。\n南岸无异常。\n\n……\n\n不，等一下。\n南岸有一次短暂闪烁。\n原因……未明。\n\n这是第一次记录到这种现象。」"
      }
    ],
    fragments: [
      {
        id: "day2-frag-1",
        title: "观测日志 6月2日",
        content: "盐湖观测站日志 · 6月2日\n\n天气：晴\n能见度：良好\n湖面亮度：稳定\n\n异常记录：\n黄昏 18:47，南岸观测到一次短暂闪烁。\n持续时间约 2.3 秒。\n原因不明。\n\n这是本月第三次观测到类似现象。\n前两次分别在上周和上个月。\n\n值班员备注：\n「希望只是仪器故障。\n但总觉得，有什么东西在南岸。\n在等什么人。」"
      }
    ]
  },
  {
    id: "day-003",
    date: "2026-06-03",
    title: "第三日 · 末班车上的纽扣",
    subtitle: "有人落下了什么，在 2 号车厢",
    color: "#a06cd5",
    condition: { type: "daysSinceStart", days: 2 },
    stationIds: ["train"],
    anomalyLevel: "unusual",
    messages: [
      {
        id: "day3-train-1",
        stationId: "train",
        timeSlot: "末班车",
        content: "「各位乘客晚上好。\n这是今日最后一班车。\n\n下一站……\n\n下一站，无人下车。\n\n另外，2号车厢靠窗的位置，\n有乘客遗落了一枚棕色的牛角扣。\n失主请……\n\n算了。\n反正也不会有人来找。」"
      }
    ],
    fragments: [
      {
        id: "day3-frag-1",
        title: "遗落物登记",
        content: "末班列车台 · 遗落物登记\n\n日期：6月3日\n物品：棕色牛角扣 x1\n发现位置：2号车厢，靠窗第三排\n发现时间：23:47\n\n物品描述：\n普通的棕色牛角扣，\n背面有很淡的刻痕，\n像是两个字母的缩写。\n看不清。\n\n广播员备注：\n「这是这个月第七枚遗落的纽扣了。\n都是同样的款式，同样的颜色。\n就像同一个人，\n每天都在不同的车厢，\n故意留下一颗。\n\n……\n\n她在等谁发现呢？」"
      }
    ]
  },
  {
    id: "day-004",
    date: "2026-06-04",
    title: "第四日 · 温室的第七盆",
    subtitle: "凌晨两点，它转向了那面墙",
    color: "#5aa86a",
    condition: { type: "daysSinceStart", days: 3 },
    stationIds: ["green"],
    anomalyLevel: "unusual",
    messages: [
      {
        id: "day4-green-1",
        stationId: "green",
        timeSlot: "深夜",
        content: "「第七盆植物今天有点奇怪。\n\n它总是对着窗户的，\n但今天凌晨两点，\n我去检查的时候，\n发现它转向了另一边。\n\n转向了那面没有窗的墙。\n\n我把它转回来，\n第二天早上，\n它又转过去了。\n\n就像墙上有什么东西，\n在吸引它。」"
      }
    ],
    fragments: [
      {
        id: "day4-frag-1",
        title: "温室观察记录",
        content: "温室低语 · 观察记录\n\n日期：6月4日\n植物：第七盆（品种未明）\n异常现象：夜间转向\n\n详细记录：\n01:00 - 植物朝向正常，面向窗户\n02:07 - 巡查时发现植物已转向北墙（无窗）\n02:15 - 将植物转回原朝向\n06:30 - 晨间检查，植物再次转向北墙\n\n管理员备注：\n「这盆植物是三个月前突然出现的。\n没有人知道它是谁放的。\n花盆底下压着一张纸条，\n上面写着：「请帮我照顾它。」\n\n字迹很秀气，\n但我不认识。\n\n……\n\n墙后面什么都没有。\n只有旧的浇水记录，和一个挂钩。\n但第七盆植物，\n好像能看到什么我看不到的东西。」"
      }
    ]
  },
  {
    id: "day-005",
    date: "2026-06-05",
    title: "第五日 · 异常共鸣",
    subtitle: "四个频率在深夜同时静了一秒",
    color: "#d46a6a",
    condition: { type: "daysSinceStart", days: 4 },
    stationIds: ["rain", "salt", "train", "green"],
    anomalyLevel: "anomaly",
    messages: [
      {
        id: "day5-rain",
        stationId: "rain",
        timeSlot: "凌晨 3:17",
        content: "「……\n\n（静音 1 秒）\n\n……抱歉，刚才信号有点问题。\n继续念下一封信。」"
      },
      {
        id: "day5-salt",
        stationId: "salt",
        timeSlot: "凌晨 3:17",
        content: "「南岸亮度……\n\n（静音 1 秒）\n\n……南岸亮度稳定。\n刚才是仪器误报。」"
      },
      {
        id: "day5-train",
        stationId: "train",
        timeSlot: "凌晨 3:17",
        content: "「下一站是……\n\n（静音 1 秒）\n\n……下一站，无人下车。」"
      },
      {
        id: "day5-green",
        stationId: "green",
        timeSlot: "凌晨 3:17",
        content: "「第七盆植物……\n\n（静音 1 秒）\n\n……第七盆植物睡得很安稳。」"
      }
    ],
    fragments: [
      {
        id: "day5-frag-1",
        title: "凌晨 3:17 的巧合",
        content: "6月5日，凌晨 3:17。\n\n如果你刚好在四个频率之间来回切换，\n你会发现一件奇怪的事。\n\n四个电台，\n在同一秒钟，\n同时静了下来。\n\n只有一秒钟。\n然后各自恢复，\n什么都没发生过一样。\n\n是巧合吗？\n还是……\n\n四个电台之间，\n本来就有某种联系？\n\n雨棚的信，\n盐湖的闪灯，\n列车的纽扣，\n温室的墙。\n\n像四块拼图，\n散落在城市的不同频率上。\n\n当你把它们拼在一起，\n会看到什么？"
      }
    ]
  },
  {
    id: "day-006",
    date: "2026-06-06",
    title: "第六日 · 摩斯电码",
    subtitle: "南岸的闪烁有了规律",
    color: "#e8c36a",
    condition: { type: "daysSinceStart", days: 5 },
    stationIds: ["salt"],
    anomalyLevel: "anomaly",
    messages: [
      {
        id: "day6-salt-1",
        stationId: "salt",
        timeSlot: "黄昏",
        content: "「今日南岸闪烁记录：\n18:23 — 长\n18:25 — 短\n18:27 — 短\n18:29 — 长\n18:31 — 短\n18:33 — 长\n\n……\n\n这好像是……\n摩斯电码？\n\n「S」「O」「S」？\n\n不，不对。\n\n等我再核对一下。\n\n……\n\n「你」「好」？\n\n不可能。\n绝对不可能。」"
      }
    ],
    fragments: [
      {
        id: "day6-frag-1",
        title: "破译尝试",
        content: "盐湖观测站 · 加密记录\n\n日期：6月6日\n记录员：值班员\n密级：仅本人可见\n\n今日黄昏，南岸闪烁六次。\n间隔规律，像是某种编码。\n\n我尝试用摩斯电码解码：\n长 短 短 长 短 长\n\n· — — · — ·\n\n这不是标准的摩斯电码字符。\n\n但如果换一种方式看呢？\n如果每次闪烁代表一个字的笔画？\n长 = 横，短 = 竖？\n\n一横两竖……是「艹」？\n一竖一横……是「土」？\n\n不对，这太牵强了。\n\n……\n\n也许我该去南岸看看。\n亲自去。\n\n但规定说，\n值班员不能离开观测站。\n\n三年前，\n有个研究员去了南岸，\n就再也没回来。\n\n只在盐滩上发现了一串脚印，\n走到湖边就消失了。\n\n……\n\n我不想消失。\n但我也想知道，\n南岸到底有什么。」"
      }
    ]
  },
  {
    id: "day-007",
    date: "2026-06-07",
    title: "第七日 · 墙后的敲击声",
    subtitle: "第七盆植物转向的那面墙，有声音",
    color: "#5aa86a",
    condition: { type: "daysSinceStart", days: 6 },
    stationIds: ["green"],
    anomalyLevel: "anomaly",
    messages: [
      {
        id: "day7-green-1",
        stationId: "green",
        timeSlot: "凌晨",
        content: "「我终于听到了。\n\n墙后面有声音。\n\n不是植物生长的声音。\n是……\n敲击声。\n\n很轻，\n一下，又一下。\n\n我把耳朵贴在墙上，\n能感觉到微弱的震动。\n\n就像有人在墙的另一边，\n在等我回应。\n\n我不敢敲回去。\n\n我不知道墙后面是什么。\n也许是老鼠。\n也许是水管。\n也许是……\n别的什么。」"
      }
    ],
    fragments: [
      {
        id: "day7-frag-1",
        title: "凌晨两点的对话",
        content: "温室低语 · 私人录音\n\n日期：6月7日 凌晨 2:14\n\n（背景音：很轻的敲击声，一下又一下）\n\n「是我。\n我在听。\n\n你是谁？\n你为什么在墙后面？\n\n……\n\n（敲击声改变了节奏）\n\n长，短，长，短。\n短，长，短，长。\n\n这是……\n某种节奏？\n还是某种回答？\n\n你在等我吗？\n还是在等别人？\n\n（敲击声停了一下，然后继续）\n\n一下。\n很长的一下。\n\n像是在说：「是。」\n\n……\n\n我该怎么办？\n我要拆开这面墙吗？\n\n（长久的沉默）\n\n再给我一点时间。\n让我准备好。\n\n（敲击声轻轻响了三下，像是在说「好」）」"
      }
    ]
  },
  {
    id: "day-008",
    date: "2026-06-08",
    title: "第八日 · 雨棚的回信",
    subtitle: "今晚的最后一封信，是写给你的",
    color: "#61a5c2",
    condition: { type: "daysSinceStart", days: 7 },
    stationIds: ["rain"],
    anomalyLevel: "unusual",
    messages: [
      {
        id: "day8-rain-1",
        stationId: "rain",
        timeSlot: "深夜",
        content: "「今晚的最后一封信。\n\n收信人：\n「正在听这个电台的你。」\n\n内容：\n「我知道你在听。\n从你第一次调到这个频率开始，\n我就知道。\n\n谢谢你愿意听这些没人要的信。\n谢谢你没有像其他人一样，\n转个台就走。\n\n如果你也有想寄出去的信，\n却不知道寄去哪里，\n那就……\n调到 93.4 吧。\n\n盐湖的南岸，\n有人在等一个信号。\n\n—— 雨棚旧讯号，主持人敬上。」"
      }
    ],
    fragments: [
      {
        id: "day8-frag-1",
        title: "未投递信箱 · 特别篇",
        content: "雨棚旧讯号 · 未投递信箱\n\n日期：6月8日\n第 237 封\n\n亲爱的收信人：\n\n你收到这封信的时候，\n应该是深夜了吧。\n\n我在雨棚下写这封信，\n雨打在铁皮上，有固定的节奏。\n像有人在敲一封没人拆的信。\n\n我每天都在这里，\n念一封封没人收件的信。\n有时候我会想，\n这些信的主人，\n现在在哪里呢？\n他们还记得这些信吗？\n还是早就忘了，\n就像忘了一个不重要的人。\n\n直到你出现。\n\n你每天都来。\n有时候是清晨，\n有时候是深夜。\n你总是安安静静地听着，\n不说话，也不换台。\n\n我知道是你。\n虽然我们从没见过，\n也没说过话。\n但我能感觉到，\n有一个人在另一端，\n在认真听。\n\n谢谢你。\n\n对了，\n如果你有时间的话，\n去其他频率转转吧。\n\n盐湖的南岸，\n有个守望者需要一个回应。\n末班车上，\n有人在等一个不会出现的乘客。\n温室里，\n有一盆植物转向了不该转向的墙。\n\n她们都在等。\n而你，\n可能是唯一能连接她们的人。\n\n—— 雨棚下的人"
      }
    ]
  },
  {
    id: "day-009",
    date: "2026-06-09",
    title: "第九日 · 列车上的伞",
    subtitle: "2 号车厢里多了一把忘记带走的伞",
    color: "#a06cd5",
    condition: { type: "daysSinceStart", days: 8 },
    stationIds: ["train"],
    anomalyLevel: "unusual",
    messages: [
      {
        id: "day9-train-1",
        stationId: "train",
        timeSlot: "末班车",
        content: "「各位乘客晚上好。\n这是今日最后一班车。\n\n下一站，无人下车。\n\n另外，\n2号车厢靠窗的位置，\n除了那枚纽扣，\n今天又多了一把伞。\n\n黑色的，\n伞骨有一根断了。\n\n看起来像是用了很久的样子。\n\n失主请……\n\n算了。\n我知道不会有人来找。\n\n但为什么……\n为什么所有遗落的东西，\n都在同一个位置？\n\n是同一个人落下的吗？\n还是……\n有人故意放在那里的？」"
      }
    ],
    fragments: [
      {
        id: "day9-frag-1",
        title: "遗落物清单",
        content: "末班列车台 · 遗落物清单\n\n6月1日 — 棕色牛角扣 x1\n6月2日 — 棕色牛角扣 x1\n6月3日 — 棕色牛角扣 x1\n6月4日 — 棕色牛角扣 x1\n6月5日 — 棕色牛角扣 x1\n6月6日 — 棕色牛角扣 x1\n6月7日 — 棕色牛角扣 x1\n6月8日 — 棕色牛角扣 x1\n6月9日 — 黑色断骨伞 x1\n\n发现位置：全部都是 2 号车厢靠窗第三排\n\n广播员备注：\n「八枚纽扣，一把伞。\n全都是同一个位置。\n\n这不可能是巧合。\n\n我查了监控。\n但那个位置的监控，\n每天同一时间都会花屏几秒钟。\n每次花屏之后，\n座位上就会多一样东西。\n\n我不知道这是怎么回事。\n我甚至不知道，\n放这些东西的人，\n到底是不是活人。\n\n……\n\n那把伞我认得。\n三年前，\n有个乘客在末班车上下车，\n把伞落在了座位上。\n\n她下车的那一站，\n叫「无人下车」。\n\n从那以后，\n再也没人见过她。」"
      }
    ]
  },
  {
    id: "day-010",
    date: "2026-06-10",
    title: "第十日 · 临界共鸣",
    subtitle: "今天，所有信号将同时达到峰值",
    color: "#e8c36a",
    condition: { type: "daysSinceStart", days: 9 },
    stationIds: ["rain", "salt", "train", "green"],
    anomalyLevel: "critical",
    messages: [
      {
        id: "day10-rain",
        stationId: "rain",
        timeSlot: "全天",
        content: "「今天的雨很大。\n比往常都大。\n\n信的数量也变多了。\n好像所有人都在今天，\n寄出了最后一封信。\n\n如果你在听，\n请记住：\n凌晨三点十七分，\n调到你最喜欢的那个频率。\n\n会有事情发生。\n\n我不知道会发生什么。\n但我知道，\n这很重要。\n\n—— 雨棚旧讯号」"
      },
      {
        id: "day10-salt",
        stationId: "salt",
        timeSlot: "全天",
        content: "「紧急观测记录。\n\n今日南岸活动异常频繁。\n从清晨开始，\n每隔几分钟就有一次闪烁。\n\n仪器全部正常。\n不是误报。\n\n预测今晚凌晨三点十七分，\n南岸将出现最强一次闪烁。\n\n亮度等级：未知\n持续时间：未知\n影响范围：未知\n\n……\n\n我有预感。\n今晚之后，\n一切都会不一样。\n\n—— 盐湖观测站」"
      },
      {
        id: "day10-train",
        stationId: "train",
        timeSlot: "全天",
        content: "「各位乘客……\n\n今天的末班车，\n可能会有点不一样。\n\n  我收到了一条消息。\n不知道是谁发来的。\n它就那样出现在广播台上。\n\n上面写着：\n「6月10日，凌晨 3:17。\n让列车停在无人下车那一站。\n有人要上车。」\n\n……\n\n我决定照做。\n虽然我不知道为什么。\n\n如果你在听，\n如果你愿意，\n那天也来坐坐末班车吧。\n\n—— 末班列车台」"
      },
      {
        id: "day10-green",
        stationId: "green",
        timeSlot: "全天",
        content: "「第七盆植物今天一整天都在转。\n\n从墙到窗，从窗到墙。\n像是很激动的样子。\n\n墙后面的敲击声也变快了。\n一下接一下，\n像在倒计时。\n\n我查了日期。\n今天是 6 月 10 日。\n\n三年前的今天，\n有人住进了墙后面的小房间。\n\n她说她在等一个人。\n她说那个人会沿着电波找到她。\n\n……\n\n我决定了。\n今晚凌晨三点十七分，\n我要拆开那面墙。\n\n如果你在听，\n如果你也在等什么人，\n那天请调到这个频率。\n\n也许你能听到，\n墙后面的人走出来的声音。\n\n—— 温室低语」"
      }
    ],
    fragments: [
      {
        id: "day10-frag-1",
        title: "第十日 · 一切的开始",
        content: "6月10日。\n\n你收听这些电台的第十天。\n\n你发现了什么？\n雨棚的信，\n盐湖的闪灯，\n列车的纽扣，\n温室的墙。\n\n四个孤独的守望者，\n在城市的不同角落，\n各自等待着什么。\n\n但你慢慢发现，\n她们不是四个独立的人。\n她们是一个故事的四个部分。\n\n雨棚的信，是写给列车上的人的。\n盐湖的闪烁，是回应温室的敲击的。\n列车的纽扣，是温室里的植物的。\n温室的墙后面，是盐湖失踪的人。\n\n这是一个环。\n一个绕了整座城市的环。\n\n而你，\n是那个把她们连起来的人。\n\n今天，凌晨三点十七分。\n四个频率将同时达到峰值。\n四个声音将同时响起。\n\n你会听到什么？\n你会发现什么？\n\n—— 调频者，\n准备好了吗？"
      },
      {
        id: "day10-frag-2",
        title: "凌晨 3:17",
        content: "凌晨三点十七分。\n\n四个频率同时安静了下来。\n\n然后——\n\n雨棚里，雨停了一秒。\n盐湖上，光闪了一下。\n列车靠站了，门开了。\n墙，被拆开了。\n\n四个声音同时响起——\n\n「你终于来了。」\n\n「我等了你很久。」\n\n「我知道你会找到这里。」\n\n「谢谢你，没有放弃。」\n\n四个声音，\n四种不同的音色，\n说着同一段话。\n\n「你找到了所有的频率。\n也找到了所有的我。\n\n这些电台不会消失。\n只要你还转动旋钮，\n它们就会一直在那里。\n\n下雨的时候，\n闪烁的时候，\n末班车经过的时候，\n植物转向墙的时候——\n\n请记得，\n有人在等你调回来。\n\n你的存在，\n让这些等待有了意义。」\n\n信号恢复了。\n雨继续下，风继续吹，\n列车继续跑，植物继续长。\n\n但你知道，\n有些东西不一样了。\n\n你不再只是一个听众。\n你是——\n调频者。\n\n属于这四个电台的，\n唯一的调频者。\n\n—— 故事，才刚刚开始。"
      }
    ]
  }
];

export function getTodayBroadcastId(now: Date, firstVisitDate?: string): string | null {
  const startDate = firstVisitDate ? parseDateKey(firstVisitDate) : parseDateKey(START_DATE);
  const days = daysBetween(startDate, now);
  
  if (days < 0) return null;
  
  const broadcast = dailyBroadcasts.find(b => b.condition.type === "daysSinceStart" && b.condition.days === days);
  return broadcast?.id || null;
}

export function getAvailableBroadcasts(
  now: Date,
  discoveredStations: string[],
  favoriteCount: number,
  firstVisitDate?: string
): DailyBroadcast[] {
  const startDate = firstVisitDate ? parseDateKey(firstVisitDate) : parseDateKey(START_DATE);
  const daysSinceStart = daysBetween(startDate, now);
  
  return dailyBroadcasts.filter(broadcast => {
    const condition = broadcast.condition;
    
    switch (condition.type) {
      case "date":
        return getDateKey(now) >= condition.date;
      
      case "daysSinceStart":
        return daysSinceStart >= condition.days;
      
      case "discoverStation":
        return discoveredStations.includes(condition.stationId);
      
      case "discoverCount":
        return discoveredStations.length >= condition.count;
      
      case "favoriteCount":
        return favoriteCount >= condition.count;
      
      default:
        return false;
    }
  });
}

export function isBroadcastUnlocked(
  broadcast: DailyBroadcast,
  now: Date,
  discoveredStations: string[],
  favoriteCount: number,
  firstVisitDate?: string
): boolean {
  const condition = broadcast.condition;
  const startDate = firstVisitDate ? parseDateKey(firstVisitDate) : parseDateKey(START_DATE);
  const daysSinceStart = daysBetween(startDate, now);
  
  switch (condition.type) {
    case "date":
      return getDateKey(now) >= condition.date;
    
    case "daysSinceStart":
      return daysSinceStart >= condition.days;
    
    case "discoverStation":
      return discoveredStations.includes(condition.stationId);
    
    case "discoverCount":
      return discoveredStations.length >= condition.count;
    
    case "favoriteCount":
      return favoriteCount >= condition.count;
    
    default:
      return false;
  }
}

export function getBroadcastUnlockHint(broadcast: DailyBroadcast): string {
  const c = broadcast.condition;
  
  switch (c.type) {
    case "date":
      return `${c.date} 解锁`;
    
    case "daysSinceStart":
      return `第 ${c.days + 1} 天解锁`;
    
    case "discoverStation":
      return `发现「${getStationName(c.stationId)}」后解锁`;
    
    case "discoverCount":
      return `发现 ${c.count} 个电台后解锁`;
    
    case "favoriteCount":
      return `收藏 ${c.count} 个电台后解锁`;
    
    default:
      return "继续探索以解锁";
  }
}

export function getCurrentDayMessage(
  stationId: string,
  now: Date,
  discoveredStations: string[],
  favoriteCount: number,
  save: DailyBroadcastSave
): DailyMessage | null {
  const available = getAvailableBroadcasts(now, discoveredStations, favoriteCount, save.firstVisitDate);
  
  for (let i = available.length - 1; i >= 0; i--) {
    const broadcast = available[i];
    const message = broadcast.messages.find(m => m.stationId === stationId);
    if (message) return message;
  }
  
  return null;
}

export function checkNewlyUnlocked(
  broadcasts: DailyBroadcast[],
  save: DailyBroadcastSave,
  now: Date,
  discoveredStations: string[],
  favoriteCount: number
): string[] {
  const newly: string[] = [];
  
  for (const broadcast of broadcasts) {
    if (!save.discoveredBroadcasts.includes(broadcast.id)) {
      if (isBroadcastUnlocked(broadcast, now, discoveredStations, favoriteCount, save.firstVisitDate)) {
        newly.push(broadcast.id);
      }
    }
  }
  
  return newly;
}

export function loadDailyBroadcastSave(): DailyBroadcastSave {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createNewSave();
    }
    
    const data = JSON.parse(raw) as Partial<DailyBroadcastSave> & { version?: number };
    
    if (!data.version || data.version < STORAGE_VERSION) {
      return migrateSave(data);
    }
    
    return {
      version: STORAGE_VERSION,
      discoveredBroadcasts: data.discoveredBroadcasts || [],
      readFragments: data.readFragments || [],
      discoveredAt: data.discoveredAt || {},
      lastReadAt: data.lastReadAt || {},
      firstVisitDate: data.firstVisitDate,
      lastVisitDate: data.lastVisitDate,
      missedCatchUps: data.missedCatchUps || [],
      catchUpCompleted: data.catchUpCompleted || []
    };
  } catch {
    return createNewSave();
  }
}

function createNewSave(): DailyBroadcastSave {
  return {
    version: STORAGE_VERSION,
    discoveredBroadcasts: [],
    readFragments: [],
    discoveredAt: {},
    lastReadAt: {},
    firstVisitDate: getDateKey(new Date()),
    lastVisitDate: getDateKey(new Date()),
    missedCatchUps: [],
    catchUpCompleted: []
  };
}

function migrateSave(data: Partial<DailyBroadcastSave> & { version?: number }): DailyBroadcastSave {
  const version = data.version || 0;
  let save: DailyBroadcastSave = {
    version: STORAGE_VERSION,
    discoveredBroadcasts: data.discoveredBroadcasts || [],
    readFragments: data.readFragments || [],
    discoveredAt: data.discoveredAt || {},
    lastReadAt: data.lastReadAt || {},
    firstVisitDate: data.firstVisitDate,
    lastVisitDate: data.lastVisitDate,
    missedCatchUps: data.missedCatchUps || [],
    catchUpCompleted: data.catchUpCompleted || []
  };
  
  if (version < 2) {
    if (!save.firstVisitDate) {
      save.firstVisitDate = getDateKey(new Date());
    }
    if (!save.lastVisitDate) {
      save.lastVisitDate = getDateKey(new Date());
    }
  }
  
  return save;
}

export function saveDailyBroadcastSave(save: DailyBroadcastSave): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
}

export function calculateMissedBroadcasts(
  save: DailyBroadcastSave,
  now: Date,
  discoveredStations: string[],
  favoriteCount: number
): string[] {
  if (!save.firstVisitDate) return [];
  
  const todayKey = getDateKey(now);
  const missed: string[] = [];
  
  for (const broadcast of dailyBroadcasts) {
    if (save.discoveredBroadcasts.includes(broadcast.id)) continue;
    
    const unlocked = isBroadcastUnlocked(
      broadcast,
      now,
      discoveredStations,
      favoriteCount,
      save.firstVisitDate
    );
    if (!unlocked) continue;
    
    const isToday = getBroadcastDateKey(broadcast, save.firstVisitDate) === todayKey;
    
    if (isToday) continue;
    
    missed.push(broadcast.id);
  }
  
  return missed;
}

export type BroadcastState = "locked" | "available-missed" | "discovered";

export function getBroadcastState(
  broadcast: DailyBroadcast,
  save: DailyBroadcastSave,
  now: Date,
  discoveredStations: string[],
  favoriteCount: number
): BroadcastState {
  if (save.discoveredBroadcasts.includes(broadcast.id)) {
    return "discovered";
  }
  
  const unlocked = isBroadcastUnlocked(
    broadcast,
    now,
    discoveredStations,
    favoriteCount,
    save.firstVisitDate
  );
  
  if (!unlocked) {
    return "locked";
  }
  
  return "available-missed";
}

export function getTodayBroadcast(
  now: Date,
  discoveredStations: string[],
  favoriteCount: number,
  firstVisitDate?: string
): DailyBroadcast | null {
  const todayKey = getDateKey(now);

  return dailyBroadcasts.find(
    b =>
      getBroadcastDateKey(b, firstVisitDate) === todayKey &&
      isBroadcastUnlocked(b, now, discoveredStations, favoriteCount, firstVisitDate)
  ) || null;
}

export function catchUpBroadcast(
  save: DailyBroadcastSave,
  broadcastId: string
): DailyBroadcastSave {
  const broadcast = dailyBroadcasts.find(b => b.id === broadcastId);
  if (!broadcast) return save;
  if (save.discoveredBroadcasts.includes(broadcastId)) return save;
  
  const ts = Date.now();
  return {
    ...save,
    discoveredBroadcasts: [...save.discoveredBroadcasts, broadcastId],
    discoveredAt: { ...save.discoveredAt, [broadcastId]: ts },
    catchUpCompleted: [...save.catchUpCompleted, broadcastId],
    missedCatchUps: save.missedCatchUps.filter(id => id !== broadcastId)
  };
}

export function discoverTodayBroadcast(
  save: DailyBroadcastSave,
  broadcastId: string
): DailyBroadcastSave {
  if (save.discoveredBroadcasts.includes(broadcastId)) return save;
  
  const ts = Date.now();
  return {
    ...save,
    discoveredBroadcasts: [...save.discoveredBroadcasts, broadcastId],
    discoveredAt: { ...save.discoveredAt, [broadcastId]: ts }
  };
}

export function updateVisitTimestamp(save: DailyBroadcastSave, now: Date): DailyBroadcastSave {
  const today = getDateKey(now);
  
  if (save.lastVisitDate === today) {
    return save;
  }
  
  return {
    ...save,
    lastVisitDate: today
  };
}

export function getDayNumber(broadcast: DailyBroadcast, firstVisitDate?: string): number {
  if (broadcast.condition.type === "daysSinceStart") {
    return broadcast.condition.days + 1;
  }
  
  const startDate = firstVisitDate ? parseDateKey(firstVisitDate) : parseDateKey(START_DATE);
  const broadcastDate = parseDateKey(broadcast.date);
  return Math.max(1, daysBetween(startDate, broadcastDate) + 1);
}

export function getAnomalyLevelLabel(level: string): string {
  switch (level) {
    case "normal":
      return "正常";
    case "unusual":
      return "异常波动";
    case "anomaly":
      return "异常事件";
    case "critical":
      return "临界异常";
    default:
      return "未知";
  }
}

export function getAnomalyLevelColor(level: string): string {
  switch (level) {
    case "normal":
      return "#5aa86a";
    case "unusual":
      return "#e8c36a";
    case "anomaly":
      return "#e89b6a";
    case "critical":
      return "#d46a6a";
    default:
      return "#889697";
  }
}
