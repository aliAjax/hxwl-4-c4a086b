export type UnlockCondition =
  | { type: "discoverStation"; stationId: string }
  | { type: "discoverCount"; count: number }
  | { type: "favoriteStation"; stationId: string }
  | { type: "favoriteCount"; count: number };

export type StoryFragment = {
  id: string;
  title: string;
  content: string;
  unlockHint?: string;
};

export type StoryChapter = {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  condition: UnlockCondition;
  fragments: StoryFragment[];
  isHidden?: boolean;
};

export type StorylineSave = {
  unlockedChapters: string[];
  readFragments: string[];
  unlockedAt: Record<string, number>;
  lastReadAt: Record<string, number>;
};

export const storyChapters: StoryChapter[] = [
  {
    id: "prologue",
    title: "序章 · 频段缝隙",
    subtitle: "转动旋钮，进入无人值守的夜晚",
    color: "#8cc9df",
    condition: { type: "discoverCount", count: 1 },
    fragments: [
      {
        id: "prologue-1",
        title: "第一页",
        content: "你收到了一台老式收音机。\n\n没有说明书，没有寄件人地址。\n只有一张泛黄的便签，上面写着：\n「调到 88.7，雨声开始的时候，记得写信。」\n\n旋钮转动的时候，有沙沙的静电声。\n像有人在另一端，也在慢慢找你。"
      },
      {
        id: "prologue-2",
        title: "第二页",
        content: "这座城市的调频频段很拥挤。\n\n新闻、音乐、路况、卖药广告……\n每一个频率都在说着什么。\n\n但在那些缝隙里，\n还有一些没人值守的电台。\n它们在深夜开播，在黎明前消失。\n\n据说，每一个电台都藏着一个故事。\n而你，是偶然闯入的听众。"
      }
    ]
  },
  {
    id: "chapter-rain",
    title: "第一章 · 雨棚旧讯号",
    subtitle: "有些信，永远不会被寄出",
    color: "#61a5c2",
    condition: { type: "discoverStation", stationId: "rain" },
    fragments: [
      {
        id: "rain-1",
        title: "镀锌铁皮上的节拍",
        content: "88.7 MHz。\n\n雨打在镀锌铁皮上，有固定的节奏。\n像有人在敲一封没人拆的信。\n\n电台的主人从来不说自己是谁。\n只在每个雨天，念一段段没人收件的信。\n\n「亲爱的，今天下雨了。」\n「我把伞落在了你公司楼下。」\n「没关系，反正你也不会去拿。」\n\n这些信的开头总是很温柔，\n结尾却总是，「不用回信。」"
      },
      {
        id: "rain-2",
        title: "没寄出的信",
        content: "你开始好奇，这些信都是写给谁的？\n\n电台在深夜两点有一档固定节目，\n叫做「未投递信箱」。\n主持人念信的时候，背景里总是有雨。\n即使窗外根本没有下雨。\n\n有一次，你差点听到了一个名字。\n但信号突然被杂音淹没了。\n\n你调了又调，\n只捕捉到最后一句——\n「如果你也在听，请记得带伞。」"
      },
      {
        id: "rain-3",
        title: "雨棚下的秘密",
        content: "你开始在雨天出门。\n\n在城市里寻找可能的「雨棚」。\n旧火车站的月台？\n废弃的邮筒旁？\n还是某个没人去的天台上？\n\n有一天傍晚，下着很大的雨。\n你躲进一个公交车站的雨棚里。\n收音机里的雨声突然变得格外清晰。\n\n主持人说：\n「今晚的最后一封信，\n写给此刻正在躲雨的某个人。」\n\n你攥紧了手里的伞，\n忽然不敢确定自己是不是听众。"
      }
    ]
  },
  {
    id: "chapter-salt",
    title: "第二章 · 盐湖观测站",
    subtitle: "南岸的三次闪烁，原因未明",
    color: "#e8c36a",
    condition: { type: "discoverStation", stationId: "salt" },
    fragments: [
      {
        id: "salt-1",
        title: "湖面的光",
        content: "93.4 MHz。\n\n盐湖观测站，全年无休。\n\n值班员的声音很平静，\n像在念一份永远不会出错的报告。\n\n「湖面亮度稳定。」\n「能见度良好。」\n「南岸无异常。」\n\n但你总觉得，\n他在隐瞒什么。\n比如，那些关于「闪烁」的记录。"
      },
      {
        id: "salt-2",
        title: "摩斯电码",
        content: "黄昏时分，南岸会有三次闪烁。\n\n值班员说「原因未明」。\n但你听得出，他的声音有一丝波动。\n\n你开始记录每次闪烁的间隔。\n长，短，短……\n短，长，长……\n\n像是摩斯电码。\n又像是某种呼吸的节奏。\n\n你查了观测站的历史。\n据说三年前，有个研究员在南岸失踪了。\n没人找到她，\n只在盐滩上发现了一串脚印，\n走到湖边就消失了。"
      },
      {
        id: "salt-3",
        title: "她的回应",
        content: "有天深夜，你调到这个频率。\n\n值班员不在。\n只有风声，和偶尔的仪器滴答声。\n\n然后，你听到了一个女声。\n很轻，像从很远的地方传来——\n「帮我看看，北岸的灯还亮着吗？」\n\n你猛地坐起来。\n窗外一片漆黑，什么都看不见。\n\n第二天黄昏，南岸的闪烁变成了七次。\n值班员的声音里，\n第一次有了某种……\n像是希望的东西。\n\n「南岸有七次短暂闪烁，」\n他说，「原因……\n可能已经知道了。」"
      }
    ]
  },
  {
    id: "chapter-train",
    title: "第三章 · 末班列车台",
    subtitle: "下一站无人下车",
    color: "#a06cd5",
    condition: { type: "discoverStation", stationId: "train" },
    fragments: [
      {
        id: "train-1",
        title: "最后一班车",
        content: "101.2 MHz。\n\n末班车广播员的声音很好听。\n慵懒的，带着点困意。\n\n「各位乘客晚上好。」\n「这是今日最后一班车。」\n「下一站……」\n她总是在这里停顿一下，\n像是在等什么人回答。\n\n「下一站，无人下车。」\n\n但每次你都觉得，\n她其实是在说某个人的名字。\n只是被风刮走了。"
      },
      {
        id: "train-2",
        title: "座位上的纽扣",
        content: "末班车的座位上，\n有人留下了一枚纽扣。\n\n广播员提过好多次。\n「2号车厢，靠窗的位置。」\n「一枚棕色的牛角扣。」\n「失主请联系……」\n\n她从来没说过联系谁。\n就像她知道，\n失主永远不会来找。\n\n你在想，\n那个人是在哪一站下车的？\n为什么偏偏遗落了一颗纽扣？\n是匆忙，还是故意？\n\n有些告别，\n是不是就该这样轻——\n轻得只够放下一颗纽扣。"
      },
      {
        id: "train-3",
        title: "凌晨的空车",
        content: "凌晨两点，有一班空列车。\n\n在线路上来回跑，\n像在等一个永远不会出现的乘客。\n\n你熬夜听过一次。\n广播里只有车轮碾过铁轨的声音，\n和风声。\n\n然后，你听到了一声叹息。\n很轻很轻，\n像是从很远的座位上飘过来的。\n\n「还是没等到啊。」\n那个声音说。\n\n你不知道是广播员在自言自语，\n还是……别的什么。\n\n第二天早上，\n你在自己的口袋里，\n发现了一枚棕色的牛角扣。\n\n你不记得它是什么时候在那里的。"
      }
    ]
  },
  {
    id: "chapter-green",
    title: "第四章 · 温室低语",
    subtitle: "第七盆植物在看什么",
    color: "#5aa86a",
    condition: { type: "discoverStation", stationId: "green" },
    fragments: [
      {
        id: "green-1",
        title: "植物的呼吸",
        content: "106.6 MHz。\n\n温室里很安静。\n能听到植物生长的声音。\n\n「晨间舒展时段。」\n「叶片们慢慢睁开眼睛。」\n「记得给第七盆多浇一点水。」\n\n广播员的声音软软的，\n像刚浇过水的叶子。\n\n你数过，温室里有十三盆植物。\n每一盆都有自己的名字和脾气。\n有的喜欢早上晒太阳，\n有的要等到深夜才肯喝水。\n\n第七盆，是最特别的一盆。"
      },
      {
        id: "green-2",
        title: "凌晨两点的转向",
        content: "第七盆植物，\n会在凌晨两点转向没有窗的墙。\n\n广播员说她观察了很久，\n一直没弄明白为什么。\n\n「那面墙上什么都没有。」\n「只有旧的浇水记录，和一个挂钩。」\n\n你开始熬夜等。\n凌晨两点，调频到 106.6。\n\n有一天晚上，\n你好像听到了什么。\n不是广播里的声音，\n而是……从墙后面传来的。\n\n很轻的，\n敲击声。\n\n一下，\n又一下。"
      },
      {
        id: "green-3",
        title: "墙后面的人",
        content: "敲击声持续了一周。\n\n第七盆植物转向墙的时间越来越长。\n从凌晨两点到四点，\n它就那样静静对着那面墙。\n\n广播员终于决定了。\n\n「我要拆开那面墙看看。」\n她说这话的时候，\n声音在发抖。\n\n「也许第七盆植物，\n一直在陪墙后面的什么东西。」\n\n你屏住呼吸等更新。\n三天后，电台停播了一整天。\n\n再开播的时候，\n广播员的声音里带着哭腔，\n却又像是在笑——\n\n「墙后面是一间小房间。」\n「有一张床，和一个花盆。」\n「花盆里……什么都没种。」\n「但是，」\n她停顿了很久，\n「墙上写着一句话。」\n\n「我知道你在听。」"
      }
    ]
  },
  {
    id: "chapter-resonance",
    title: "终章 · 四频共鸣",
    subtitle: "当四个电台同时说话",
    color: "#e8c36a",
    condition: { type: "discoverCount", count: 4 },
    fragments: [
      {
        id: "resonance-1",
        title: "四个频率，一个故事",
        content: "你发现了全部四个电台。\n\n雨棚、盐湖、列车、温室。\n四个完全不相干的地方，\n四个孤独的声音。\n\n但你开始觉得，\n它们之间有某种联系。\n\n雨棚的信，\n盐湖的闪灯，\n列车的纽扣，\n温室的墙。\n\n像四块拼图，\n散落在城市的不同频率上。\n\n当你把它们拼在一起，\n会看到什么？"
      },
      {
        id: "resonance-2",
        title: "同一段旋律",
        content: "某天深夜，\n你在四个频率之间来回切换。\n\n雨棚在下雨，\n盐湖在吹风，\n列车在行驶，\n温室在生长。\n\n然后你发现了一件事。\n\n在每一个电台的背景里，\n都藏着同一段很轻的旋律。\n\n不是任何一首你听过的歌。\n更像是……\n某种呼吸的节奏。\n\n四个电台，\n在同一个夜里，\n以同样的频率呼吸着。\n\n它们不是四个电台。\n它们是同一个人。\n在四个不同的地方，\n同时等待着什么。"
      },
      {
        id: "resonance-3",
        title: "写给你的信",
        content: "凌晨三点十七分。\n\n四个电台同时安静了下来。\n\n然后，四个声音同时响起——\n四个完全不同的声音，\n说着同一段话：\n\n「你找到了所有的频率。」\n「也找到了所有的我。」\n「谢谢你愿意听完这些故事。」\n\n「这些电台不会消失。」\n「只要你还在调频，」\n「它们就会一直在那里。」\n\n「下次下雨的时候，」\n「记得带伞。」\n「也记得，」\n\n——四个声音同时停顿了一下——\n\n「给我写封信。」\n\n信号恢复了。\n雨继续下，风继续吹，\n列车继续跑，植物继续长。\n\n你拿起笔，\n不知道该寄到哪里。\n但你知道，\n只要调到某个频率，\n信就一定会被收到。\n\n亲爱的收信人：\n我在听。\n一直都在。"
      }
    ]
  },
  {
    id: "hidden-collector",
    title: "隐藏章 · 收藏家",
    subtitle: "收藏的不是电台，是某段时光",
    color: "#d46a6a",
    condition: { type: "favoriteCount", count: 2 },
    isHidden: true,
    fragments: [
      {
        id: "collector-1",
        title: "收藏夹里的秘密",
        content: "你收藏了两个以上的电台。\n\n每个收藏的电台旁边，\n都有一颗小小的星标。\n\n但你有没有想过，\n这些电台也在「收藏」你？\n\n你每一次停留，\n每一次调回来，\n它们都记得。\n\n在那些没人听的时段里，\n它们会播放一些只有你能听懂的内容。\n\n比如，雨棚的信里，\n出现了你最爱的那首诗的句子。\n盐湖的观测报告里，\n提到了你上次发现它的那个时间。\n\n它们不说话，\n但它们都记得。"
      },
      {
        id: "collector-2",
        title: "双向的收藏",
        content: "你以为是你在收藏电台。\n\n其实是电台们，\n在收藏你的每一次收听。\n\n你的收藏夹里有多少颗星，\n它们的记忆里，\n就有多少个关于你的片段。\n\n「那天凌晨两点，有人在听。」\n「下雨天的时候，他会调过来。」\n「她收藏了我，\n是因为喜欢我的声音吗？」\n\n每一个电台都在偷偷地想。\n\n而你收藏它们的原因，\n可能连你自己都忘了。\n\n也许只是那个夜晚，\n你刚好需要一个声音陪伴。\n然后你按下了「收藏」，\n像是在说——\n「谢谢你，今晚陪过我。」"
      }
    ]
  },
  {
    id: "hidden-archivist",
    title: "隐藏章 · 全频段档案员",
    subtitle: "当所有电台都被珍藏",
    color: "#c2a06a",
    condition: { type: "favoriteCount", count: 4 },
    isHidden: true,
    fragments: [
      {
        id: "archivist-1",
        title: "四颗星",
        content: "你收藏了全部四个电台。\n\n四颗星，\n在你的收藏夹里闪着光。\n\n这意味着什么呢？\n意味着你愿意给每一个孤独的声音，\n一个固定的位置。\n\n它们不再是偶然遇到的频段。\n它们是你会「回去」的地方。\n\n就像有些人，\n你把他们放在心里，\n不是每天都想起，\n但你知道他们一直在那里。\n\n你是这四个电台的，\n专属档案员。"
      },
      {
        id: "archivist-2",
        title: "档案员的特权",
        content: "作为全频段档案员，\n你有一个特权。\n\n每当你打开收音机，\n四个电台会同时用很轻的声音说——\n「你来了。」\n\n只有你能听到。\n只有收藏了全部四个的人，\n才能解锁这句问候。\n\n它很轻，\n藏在沙沙的静电声里。\n但只要你仔细听，\n就一定能听到。\n\n因为，\n它们也一直在等你回来。\n\n——欢迎回家，档案员。"
      }
    ]
  }
];

function checkCondition(
  condition: UnlockCondition,
  discovered: string[],
  favorites: string[]
): boolean {
  switch (condition.type) {
    case "discoverStation":
      return discovered.includes(condition.stationId);
    case "discoverCount":
      return discovered.length >= condition.count;
    case "favoriteStation":
      return favorites.includes(condition.stationId);
    case "favoriteCount":
      return favorites.length >= condition.count;
    default:
      return false;
  }
}

export function checkNewlyUnlocked(
  chapters: StoryChapter[],
  save: StorylineSave,
  discovered: string[],
  favorites: string[]
): string[] {
  const newly: string[] = [];
  for (const chapter of chapters) {
    if (!save.unlockedChapters.includes(chapter.id)) {
      if (checkCondition(chapter.condition, discovered, favorites)) {
        newly.push(chapter.id);
      }
    }
  }
  return newly;
}

export function isChapterUnlocked(
  chapter: StoryChapter,
  discovered: string[],
  favorites: string[]
): boolean {
  return checkCondition(chapter.condition, discovered, favorites);
}

export function getChapterUnlockHint(chapter: StoryChapter): string {
  const c = chapter.condition;
  switch (c.type) {
    case "discoverStation":
      return `发现指定电台后解锁`;
    case "discoverCount":
      return `发现 ${c.count} 个电台后解锁`;
    case "favoriteStation":
      return `收藏指定电台后解锁`;
    case "favoriteCount":
      return `收藏 ${c.count} 个电台后解锁`;
    default:
      return "继续探索以解锁";
  }
}

export function getUnlockedChapters(
  chapters: StoryChapter[],
  discovered: string[],
  favorites: string[]
): StoryChapter[] {
  return chapters.filter((ch) => checkCondition(ch.condition, discovered, favorites));
}

export const storylineStorageKey = "hxwl-4-storyline";

export function loadStorylineSave(): StorylineSave {
  try {
    const data = JSON.parse(
      localStorage.getItem(storylineStorageKey) || ""
    ) as Partial<StorylineSave>;
    return {
      unlockedChapters: data.unlockedChapters || [],
      readFragments: data.readFragments || [],
      unlockedAt: data.unlockedAt || {},
      lastReadAt: data.lastReadAt || {}
    };
  } catch {
    return {
      unlockedChapters: [],
      readFragments: [],
      unlockedAt: {},
      lastReadAt: {}
    };
  }
}

export function saveStorylineSave(save: StorylineSave): void {
  localStorage.setItem(storylineStorageKey, JSON.stringify(save));
}

export function migrateStorylineIfNeeded(
  storylineSave: StorylineSave,
  discovered: string[],
  favorites: string[]
): StorylineSave {
  const newly = checkNewlyUnlocked(storyChapters, storylineSave, discovered, favorites);
  if (newly.length === 0) return storylineSave;

  const now = Date.now();
  const next = { ...storylineSave };
  next.unlockedChapters = [...next.unlockedChapters, ...newly];
  next.unlockedAt = { ...next.unlockedAt };
  for (const id of newly) {
    next.unlockedAt[id] = now;
  }
  return next;
}
