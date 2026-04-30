// ===== FIREBASE INIT =====
firebase.initializeApp({
  databaseURL: 'https://travel-sf-hawaii-default-rtdb.asia-southeast1.firebasedatabase.app'
});
const fbChecklist = firebase.database().ref('checklist');

// ===== TRIP DATA =====
const TRIP_DATA = {
  title: "旧金山 + 夏威夷 9日行程",
  dateRange: "5/01 – 5/10",
  flights: [
    { date: "5/01", code: "UA862", from: "HKG", fromName: "香港", to: "SFO", toName: "旧金山", depart: "11:45", arrive: "09:20" },
    { date: "5/04", code: "UA1175", from: "SFO", fromName: "旧金山", to: "HNL", toName: "檀香山", depart: "09:20", arrive: "11:58" },
    { date: "5/06", code: "AS1072", from: "HNL", fromName: "檀香山", to: "ITO", toName: "希洛", depart: "13:35", arrive: "14:31" },
    { date: "5/07", code: "AS1091", from: "ITO", fromName: "希洛", to: "HNL", toName: "檀香山", depart: "17:59", arrive: "18:54" },
    { date: "5/09", code: "KE054", from: "HNL", fromName: "檀香山", to: "ICN", toName: "首尔", depart: "12:35", arrive: "5/10 17:45" },
    { date: "5/10", code: "KE2011", from: "ICN", fromName: "首尔", to: "HKG", toName: "香港", depart: "19:45", arrive: "22:45" }
  ],
  hotels: [
    { dates: "5/01–5/03", nights: 2, name: "Holiday Inn Express & Suites Fisherman's Wharf", location: "550 North Point St, San Francisco, CA 94133", note: "☎️+1-415-409-4600，无障碍特大床房（带浴缸）；💰到店付 $65 (resort $55.23 + 税 $9.77)", city: "sfo" },
    { dates: "5/03–5/04", nights: 1, name: "Bay Landing Hotel", location: "1550 Old Bayshore Hwy, Burlingame, CA 94010", note: "含5/04早餐，☎️+1-650-259-9000；💰无到店付", city: "sfo" },
    { dates: "5/04–5/06", nights: 2, name: "Hilton Hawaiian Village Waikiki Beach Resort", location: "2005 Kālia Rd, Honolulu, HI 96815", note: "16:00后入住，11:00前离店，☎️+1-808-949-4321，5/1前免费取消；💰到店付 $130.58 (resort)", city: "hnl" },
    { dates: "5/07–5/09", nights: 2, name: "Aston Waikiki Sunset", location: "229 Paoakalani Ave, Honolulu, HI 96815", note: "15:00后入住，12:00前离店，☎️+1-808-922-0511；💰到店付 $83.10", city: "hnl" },
    { dates: "5/06–5/07", nights: 1, name: "Hilo Reeds Bay Hotel", location: "175 Banyan Dr, Hilo", note: "入住15:00起，离店11:00前，☎️+1-808-934-7277；💰无到店付", city: "hilo" }
  ],
  carRentals: [
    { date: "5/03", location: "旧金山", detail: "市区取车 → SFO/机场附近还车", duration: "1天" },
    { date: "5/06–5/07", location: "大岛 Hilo", detail: "下午机场取车 → Mauna Kea → 次日火山公园 → 傍晚机场还车", duration: "2天" },
    { date: "5/08", location: "欧胡岛", detail: "不租车：Kaneohe Bay Sandbar → Kualoa Hollywood Tour → 平等院/张学良墓（打车串联）", duration: "1天" }
  ],
  bookingChecklist: [
    "✅ 珍珠港 USS Arizona — 已订！5/05 1:45PM，2人，订单 0881274317-1",
    "🔴 恶魔岛船票 — 尽快订，周六场次抢手",
    "🟡 Diamond Head 预约（9am 场）— 4/6 开放，30天前放票",
    "🟡 Kualoa Ranch Hollywood Movie Sites Tour — 尽早订，4-6周前常售罄",
    "🟡 珍珠港 Passport to Pearl Harbor 套票（$89/人，含 Missouri+Bowfin+航空博物馆）",
    "✅ 5/06 AS1072 HNL 13:35→ITO 14:31 + 5/07 AS1091 ITO 17:59→HNL 18:54 已订",
    "✅ 5/06 Hilo Reeds Bay Hotel（1晚）已订",
    "🟢 5/03 旧金山租车（市区取→机场附近还）",
    "🟢 5/06 Hilo 租车（机场取，确认能开 Mauna Kea Saddle Road）",
    "🟡 5/08 Kaneohe Bay Sandbar → Kualoa Hollywood Tour → 平等院/张学良墓（不租车，打车串联）",
    "✅ Waikiki 酒店已订：5/04–5/06 Hilton Hawaiian Village + 5/07–5/09 Aston Waikiki Sunset"
  ],
  days: [
    {
      id: "d1", day: 1, date: "5/01", weekday: "周五",
      title: "抵达旧金山｜缆车坡 + 唐人街 + 渔人码头",
      region: "sfo", color: "#E8913A",
      weather: { icon: "⛅", high: 18, low: 11, desc: "多云转晴" },
      coverImg: "images/d1-chinatown.jpg",
      flight: { code: "UA862", from: "HKG", to: "SFO", time: "11:45→09:20" },
      hotel: "Holiday Inn Express & Suites Fisherman's Wharf",
      activities: [
        { time: "09:20", end: "10:40", name: "抵达 SFO / 入境取行李", lat: 37.6213, lng: -122.3790, icon: "airport" },
        { time: "10:40", end: "11:30", name: "前往酒店（先寄存行李）", lat: 37.8060, lng: -122.4154 },
        { time: "11:30", end: "13:00", name: "午餐 + 缓冲", lat: 37.8060, lng: -122.4154 },
        { time: "13:30", end: "14:00", name: "California St & Powell St（缆车坡）", lat: 37.7916, lng: -122.4088, icon: "sight",
          subs: [
            { name: "《盗梦空间》取景点，看复古缆车爬坡", duration: "打卡" },
            { name: "站坡顶可远眺海湾大桥", duration: "拍照" }
          ]
        },
        { time: "14:00", end: "14:40", name: "唐人街（顺坡走下去）", lat: 37.7941, lng: -122.4078, icon: "sight",
          subs: [
            { name: "不用特意打卡，穿过感受旧时光氛围", duration: "随逛" }
          ]
        },
        { time: "14:40", end: "15:10", name: "孙中山相关纪念点", lat: 37.7935, lng: -122.4060, icon: "sight" },
        { time: "16:30", name: "回酒店办理入住/休息", lat: 37.8060, lng: -122.4154 },
        { time: "18:00", end: "19:30", name: "渔人码头海边散步 + 晚餐", lat: 37.8080, lng: -122.4177, icon: "food" },
        { time: "21:00", name: "休息" }
      ]
    },
    {
      id: "d2", day: 2, date: "5/02", weekday: "周六",
      title: "恶魔岛 + Coit Tower + 艺术宫 + Ferry Building",
      region: "sfo", color: "#E8913A",
      weather: { icon: "⛅", high: 18, low: 11, desc: "多云转晴" },
      coverImg: "images/d2-alcatraz.jpg",
      hotel: "Holiday Inn Express & Suites Fisherman's Wharf",
      activities: [
        { time: "07:30", name: "早餐" },
        { time: "08:35", name: "到达 Pier 33 Alcatraz Landing（提前 45min）", lat: 37.8083, lng: -122.4098 },
        { time: "09:20", end: "11:50", name: "恶魔岛 Day Tour（9:20 船次）", lat: 37.8267, lng: -122.4230, icon: "sight",
          subs: [
            { name: "含往返渡轮（15min）+ 岛上门票 + 音频导览（中文）", duration: "包含" },
            { name: "码头→监狱走 400m 爬 40m（≈13 层楼），路宽有休息点", duration: "⚠️" },
            { name: "穿舒服的平底鞋，必须带外套（岛上风大天气多变）", duration: "⚠️" },
            { name: "退票/改签需提前 72 小时", duration: "退票" }
          ]
        },
        { time: "13:00", name: "午餐", icon: "food" },
        { time: "14:30", end: "15:30", name: "Coit Tower（城市全景）", lat: 37.8024, lng: -122.4058, icon: "sight" },
        { time: "15:30", end: "16:30", name: "艺术宫 Palace of Fine Arts", lat: 37.8020, lng: -122.4486, icon: "sight",
          subs: [
            { name: "免费，欧式圆顶石柱建筑，适合散步", duration: "1h" },
            { name: "坐 30 路公交从 Coit Tower 过去约 20min", duration: "交通" }
          ]
        },
        { time: "17:00", end: "18:30", name: "Ferry Building（逛+晚餐）", lat: 37.7955, lng: -122.3937, icon: "food",
          subs: [
            { name: "周六有农夫市集（Farmer's Market）", duration: "bonus" },
            { name: "里面有很多餐厅和美食摊位", duration: "晚餐" },
            { name: "吃完走路回酒店约 30min", duration: "交通" }
          ]
        },
        { time: "19:00", name: "走路回酒店，休息" }
      ]
    },
    {
      id: "d3", day: 3, date: "5/03", weekday: "周日",
      title: "金门大桥拍照 + 硅谷（山景城）",
      region: "sfo", color: "#E8913A",
      weather: { icon: "⛅", high: 18, low: 11, desc: "多云转晴" },
      coverImg: "images/d3-golden-gate.jpg",
      hotel: "Bay Landing Hotel（Burlingame）",
      carRental: "旧金山租车（市区取→机场附近还）",
      activities: [
        { time: "07:30", name: "退房准备" },
        { time: "08:30", name: "市区取车", lat: 37.8060, lng: -122.4154 },
        { time: "09:15", end: "10:30", name: "金门大桥拍照", lat: 37.8199, lng: -122.4783, icon: "sight",
          subs: [
            { name: "Battery Spencer（北侧山上）最佳拍照点", duration: "推荐" },
            { name: "车内不要放任何东西，防砸窗", duration: "⚠️" }
          ]
        },
        { time: "10:30", end: "12:00", name: "开车去南湾" },
        { time: "12:00", end: "16:30", name: "硅谷打卡（Google/Apple/Stanford）", lat: 37.4220, lng: -122.0841, icon: "sight",
          subs: [
            { name: "Apple Park Visitor Center（纪念品店+天台）", duration: "1h" },
            { name: "Googleplex（Android 雕塑花园+外观）", duration: "30min" },
            { name: "Stanford 校园（胡佛塔 $5 登顶）", duration: "1.5h" }
          ]
        },
        { time: "17:30", name: "前往 Burlingame" },
        { time: "18:00", name: "机场附近还车", lat: 37.5771, lng: -122.3480 },
        { time: "18:30", name: "入住 Bay Landing", lat: 37.5930, lng: -122.3660 },
        { time: "19:30", name: "晚餐 + 早睡", icon: "food" }
      ]
    },
    {
      id: "d4", day: 4, date: "5/04", weekday: "周一",
      title: "SFO → HNL｜孙中山公园 + Chinatown",
      region: "hnl", color: "#2E86AB",
      weather: { icon: "🌤", high: 29, low: 23, desc: "晴间多云" },
      coverImg: "images/d4-waikiki.jpg",
      flight: { code: "UA1175", from: "SFO", to: "HNL", time: "09:20→11:58" },
      hotel: "Hilton Hawaiian Village（2005 Kālia Rd）",
      activities: [
        { time: "06:30", name: "起床" },
        { time: "07:00", end: "07:30", name: "酒店早餐" },
        { time: "07:45", name: "出发去 SFO", lat: 37.6213, lng: -122.3790, icon: "airport" },
        { time: "09:20", name: "起飞", icon: "airport" },
        { time: "11:58", name: "到达 HNL", lat: 21.3187, lng: -157.9225, icon: "airport" },
        { time: "12:00", end: "14:30", name: "取行李 + 去 Waikiki（入住/寄存）", lat: 21.2766, lng: -157.8278 },
        { time: "15:00", name: "Uber 去 Downtown", lat: 21.3069, lng: -157.8583 },
        { time: "15:20", end: "15:40", name: "ʻIolani Palace（外观拍照·周一闭馆）", lat: 21.3069, lng: -157.8583, icon: "sight" },
        { time: "15:45", end: "16:10", name: "Dr. Sun Yat-sen Memorial Park", lat: 21.3128, lng: -157.8608, icon: "sight" },
        { time: "16:15", end: "16:45", name: "Honolulu Chinatown 逛逛", lat: 21.3133, lng: -157.8631, icon: "food" },
        { time: "16:45", name: "Uber 回 Waikiki" },
        { time: "17:30", name: "日落散步", lat: 21.2766, lng: -157.8278, icon: "sight" },
        { time: "19:00", name: "晚餐", icon: "food" },
        { time: "21:00", name: "休息" }
      ]
    },
    {
      id: "d5", day: 5, date: "5/05", weekday: "周二",
      title: "Diamond Head + 珍珠港深度游",
      region: "hnl", color: "#2E86AB",
      weather: { icon: "🌤", high: 29, low: 23, desc: "晴间多云" },
      coverImg: "images/d5-diamond-head.jpg",
      hotel: "Hilton Hawaiian Village（2005 Kālia Rd）",
      activities: [
        { time: "06:45", name: "起床" },
        { time: "07:00", name: "酒店简单早餐（咖啡 + 水果，垫一下）", icon: "food" },
        { time: "08:00", name: "Uber 去 Diamond Head（~10 min）" },
        { time: "08:30", end: "10:00", name: "Diamond Head 8:30 入场 + 山顶拍照", lat: 21.2614, lng: -157.8059, icon: "sight",
          subs: [
            { name: "30-min 入场窗口预约制，准时到", duration: "⚠️" },
            { name: "山顶眺望 Waikiki + 钻石头海岸线", duration: "拍照" },
            { name: "1.5h 含拍照（快爬 1h）", duration: "时长" }
          ]
        },
        { time: "10:00", end: "10:45", name: "Brunch — Diamond Head Market & Grill", lat: 21.2691, lng: -157.8167, icon: "food",
          subs: [
            { name: "3158 Monsarrat Ave，离登山口 5 min，开 7am", duration: "本地名店" },
            { name: "Plate lunch / 烤鱼 / 椰子水，patio 座位，下山即坐", duration: "推荐" }
          ]
        },
        { time: "10:45", name: "Uber → Pearl Harbor（早高峰反向 ~30-40 min）" },
        { time: "11:20", name: "抵 PH Visitor Center + 安检", lat: 21.3649, lng: -157.9517,
          subs: [
            { name: "不能带包！相机/水瓶/钱包/手机可以，门口有付费寄存", duration: "⚠️" }
          ]
        },
        { time: "11:30", name: "搭 Ford Island shuttle" },
        { time: "11:45", end: "13:15", name: "USS Missouri 密苏里号（完整 1.5h）", lat: 21.3636, lng: -157.9529, icon: "sight",
          subs: [
            { name: "Acoustiguide 自助音频导览（中/英/日/韩），~2h 完整版", duration: "推荐" },
            { name: "Mighty Mo 35-min 英文导览（Surrender Deck 精华）", duration: "替代" },
            { name: "必看：投降甲板 + 神风机弹坑 + 主炮塔", duration: "亮点" },
            { name: "8am–4pm，4pm 准点闭馆", duration: "时间" }
          ]
        },
        { time: "13:15", name: "Shuttle 回 Visitor Center" },
        { time: "13:35", name: "USS Arizona Theater 扫码签到（QR）", lat: 21.3649, lng: -157.9517 },
        { time: "13:45", end: "15:00", name: "USS Arizona Memorial（已订 1:45PM）", lat: 21.3649, lng: -157.9517, icon: "sight",
          subs: [
            { name: "订单 0881274317-1，2 人，手机出示 Recreation.gov 邮件 QR 码", duration: "取票" },
            { name: "23 min 纪录片 + 渡轮 + 纪念馆 + 渡轮回程，~75 min", duration: "流程" },
            { name: "不能带包！门口付费寄存", duration: "⚠️" }
          ]
        },
        { time: "15:00", name: "Uber 返 Waikiki（~30-40 min）" },
        { time: "15:30", name: "回酒店冲澡休息" },
        { time: "19:00", name: "晚餐", icon: "food",
          subs: [
            { name: "🌮 今天是 Cinco de Mayo（5/5）— Waikiki 墨西哥餐厅有氛围", duration: "可选" },
            { name: "Buho Cocina y Cantina（屋顶）、Lulu's Waikiki（海景）走进去就有", duration: "推荐" },
            { name: "不用提前订，氛围就是随机加入", duration: "tip" }
          ]
        }
      ]
    },
    {
      id: "d6", day: 6, date: "5/06", weekday: "周三",
      title: "飞大岛 → Mauna Kea 观星",
      region: "hilo", color: "#2E86AB",
      weather: { icon: "🌤", high: 29, low: 23, desc: "晴间多云" },
      coverImg: "images/d6-mauna-kea.jpg",
      flight: { code: "AS1072", from: "HNL", to: "ITO", time: "13:35→14:31" },
      hotel: "Hilo Reeds Bay Hotel（175 Banyan Dr）",
      carRental: "大岛 Hilo 租车（机场取）",
      activities: [
        { time: "08:00", name: "起床 + 早餐" },
        { time: "09:30", end: "10:30", name: "整理行李、退房寄存大件" },
        { time: "11:00", name: "出发去 HNL 机场 T1", icon: "airport" },
        { time: "13:35", name: "起飞 AS1072", lat: 19.7204, lng: -155.0483, icon: "airport" },
        { time: "14:31", end: "15:00", name: "抵达 ITO / 取行李 + 取车" },
        { time: "15:30", name: "直奔 Mauna Kea（约1h车程）" },
        { time: "16:30", name: "抵达 Mauna Kea Visitor Station（2,800m）", lat: 19.7584, lng: -155.4553, icon: "sight" },
        { time: "17:00", end: "20:00", name: "Visitor Station 观星（不上山顶，轻松看星空）", lat: 19.7584, lng: -155.4553, icon: "activity",
          subs: [
            { name: "山上 2–10°C，带厚外套/帽子/手套", duration: "⚠️" },
            { name: "提前 1.5h 到抢车位（先到先得）", duration: "提醒" },
            { name: "带食物和水，山上没餐厅", duration: "提醒" }
          ]
        },
        { time: "20:30", name: "下山回 Hilo（约1h）" },
        { time: "21:30", name: "入住 Hilo Reeds Bay Hotel（175 Banyan Dr）", lat: 19.7241, lng: -155.0868 },
        { time: "22:00", name: "休息" }
      ]
    },
    {
      id: "d7", day: 7, date: "5/07", weekday: "周四",
      title: "火山国家公园整天 → 晚飞回 Oʻahu",
      region: "hilo", color: "#A23B34",
      weather: { icon: "🌦", high: 27, low: 20, desc: "局部阵雨" },
      coverImg: "images/d7-volcano.jpg",
      flight: { code: "AS1091", from: "ITO", to: "HNL", time: "17:59→18:54" },
      hotel: "Aston Waikiki Sunset（229 Paoakalani Ave）",
      carRental: "大岛 Hilo 租车（前日已取）",
      activities: [
        { time: "08:30", name: "早餐" },
        { time: "09:30", name: "Hilo 出发（行李放车上）" },
        { time: "10:30", end: "12:30", name: "火山核心三件套", lat: 19.4194, lng: -155.2874, icon: "sight",
          subs: [
            { name: "Kilauea Caldera 火山口观景台", duration: "30min" },
            { name: "Steam Vents 蒸汽口", duration: "15min" },
            { name: "Nahuku (Thurston) Lava Tube 熔岩隧道", duration: "30min" }
          ]
        },
        { time: "12:30", end: "13:30", name: "午餐/补给", icon: "food" },
        { time: "13:30", end: "14:30", name: "Chain of Craters Road（开车观景·缩短版）", lat: 19.3097, lng: -155.1000, icon: "sight",
          subs: [
            { name: "19 英里海岸线下坡公路，选 1-2 个点停车拍照", duration: "1h" },
            { name: "出发前加满油，园内没有加油站", duration: "⚠️" },
            { name: "回程航班提前，不要开到底，中途折返", duration: "⚠️" }
          ]
        },
        { time: "14:30", name: "回撤" },
        { time: "15:30", name: "回到 Hilo" },
        { time: "15:30", end: "16:30", name: "加油/还车/机场办理", lat: 19.7204, lng: -155.0483, icon: "airport" },
        { time: "17:59", name: "起飞 AS1091", icon: "airport" },
        { time: "18:54", name: "抵达 HNL" },
        { time: "19:30", name: "回到 Waikiki", lat: 21.2766, lng: -157.8278 },
        { time: "20:30", name: "晚餐 + 休息" }
      ]
    },
    {
      id: "d8", day: 8, date: "5/08", weekday: "周五",
      title: "Kaneohe Bay Sandbar + Kualoa + 平等院",
      region: "hnl", color: "#2E86AB",
      weather: { icon: "🌤", high: 29, low: 23, desc: "晴间多云" },
      coverImg: "images/d8-kualoa.jpg",
      hotel: "Aston Waikiki Sunset（229 Paoakalani Ave）",
      activities: [
        { time: "07:45", name: "从 Waikiki 打车去 Heʻeia Kea Harbor", lat: 21.2766, lng: -157.8278 },
        { time: "09:30", end: "13:00", name: "Kaneohe Bay Sandbar Adventure（Morning）", lat: 21.4305, lng: -157.8048, icon: "activity",
          subs: [
            { name: "Heʻeia Kea Harbor 出发，活动约 3.5h", duration: "Morning" },
            { name: "可玩浮潜 / Kayak / SUP / Sandbar 平台", duration: "包含" },
            { name: "以官网实际可订场次为准", duration: "待订" }
          ]
        },
        { time: "13:00", name: "打车去 Kualoa Ranch（约20min）" },
        { time: "13:30", end: "14:15", name: "午饭 + Kualoa check-in", icon: "food" },
        { time: "14:30", end: "16:00", name: "Hollywood Movie Sites Tour（下午场）", lat: 21.5213, lng: -157.8374, icon: "activity",
          subs: [
            { name: "侏罗纪公园/侏罗纪世界取景地", duration: "打卡" },
            { name: "金刚：骷髅岛骨架场景", duration: "打卡" },
            { name: "以下午实际可订场次为准", duration: "待订" }
          ]
        },
        { time: "16:00", name: "打车去平等院（约20min）" },
        { time: "16:30", end: "17:10", name: "平等院 Byodo-In Temple + 张学良墓", lat: 21.4300, lng: -157.8320, icon: "sight",
          subs: [
            { name: "入口敲 Bon-sho 钟（净化心灵）", duration: "仪式" },
            { name: "锦鲤池 + 日式庭园", duration: "15min" },
            { name: "张学良赵一荻合葬墓（园区内步行）", duration: "10min" }
          ]
        },
        { time: "17:15", name: "打车回 Waikiki（约45–60min）" },
        { time: "18:15", name: "回酒店冲澡休息" },
        { time: "19:30", name: "最后一晚晚餐", icon: "food",
          subs: [
            { name: "🎶 挑一家有现场夏威夷音乐的,告别 Waikiki 仪式感", duration: "建议" },
            { name: "Duke's Waikiki — 海景 + 乐队,晚场 ~7–9pm 有 live", duration: "首推" },
            { name: "Mai Tai Bar @ Royal Hawaiian — 粉色酒店海景,乐队 6–10pm", duration: "替代" },
            { name: "Tiki's Grill & Bar — 屋顶 + live 7–10pm,氛围轻松", duration: "替代" },
            { name: "House Without a Key(夕阳 hula 经典)只到 8pm,要去得 18:15 直奔不洗澡", duration: "⚠️" }
          ]
        },
        { time: "21:00", name: "休息" }
      ]
    },
    {
      id: "d9", day: 9, date: "5/09", weekday: "周六",
      title: "HNL → ICN（中午起飞）",
      region: "hnl", color: "#2E86AB",
      weather: { icon: "🌤", high: 29, low: 23, desc: "晴间多云" },
      coverImg: "images/d9-airplane.jpg",
      flight: { code: "KE054", from: "HNL", to: "ICN", time: "12:35→5/10 17:45" },
      activities: [
        { time: "07:30", name: "起床 + 打包" },
        { time: "09:00", name: "退房" },
        { time: "09:30", name: "出发去机场", lat: 21.3187, lng: -157.9225, icon: "airport" },
        { time: "12:35", name: "起飞 KE054", icon: "airport" }
      ]
    }
  ],
  cities: {
    overview: { center: [30, 180], zoom: 2 },
    sfo: { center: [37.75, 237.58], zoom: 12, name: "旧金山" },
    hnl: { center: [21.35, 202.12], zoom: 11, name: "欧胡岛" },
    hilo: { center: [19.60, 204.80], zoom: 10, name: "大岛" }
  },
  flightRoutes: [
    { order: 1, from: [22.3080, 113.9185], to: [37.6213, -122.3790], label: "HKG→SFO", color: "#E53935", date: "5/01" },
    { order: 2, from: [37.6213, -122.3790], to: [21.3187, -157.9225], label: "SFO→HNL", color: "#1E88E5", date: "5/04" },
    { order: 3, from: [21.3187, -157.9225], to: [19.7204, -155.0483], label: "HNL→ITO", color: "#43A047", date: "5/06" },
    { order: 4, from: [19.7204, -155.0483], to: [21.3187, -157.9225], label: "ITO→HNL", color: "#00897B", date: "5/07" },
    { order: 5, from: [21.3187, -157.9225], to: [37.5665, 126.9780], label: "HNL→ICN", color: "#8E24AA", date: "5/09" },
    { order: 6, from: [37.5665, 126.9780], to: [22.3080, 113.9185], label: "ICN→HKG", color: "#F4511E", date: "5/10" }
  ]
};

// ===== MAP INITIALIZATION =====
const map = L.map('map', {
  center: [30, 180],
  zoom: 2,
  zoomControl: true,
  worldCopyJump: false,
  maxBounds: [[-85, -30], [85, 390]],
  maxBoundsViscosity: 1.0,
  minZoom: 2
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap',
  maxZoom: 18,
  noWrap: false
}).addTo(map);

// ===== CITY MARKERS =====
const cityCoords = {
  hkg: { lat: 22.3080, lng: 113.9185, name: "香港", color: "#666" },
  sfo: { lat: 37.6213, lng: 237.621, name: "旧金山", color: "#E8913A" },
  hnl: { lat: 21.3187, lng: 202.0775, name: "檀香山", color: "#2E86AB" },
  hilo: { lat: 19.7204, lng: 204.9517, name: "希洛", color: "#A23B34" },
  icn: { lat: 37.5665, lng: 126.9780, name: "首尔", color: "#666" }
};

Object.values(cityCoords).forEach(city => {
  const icon = L.divIcon({
    className: 'city-marker',
    html: `<div style="background:${city.color};color:#fff;padding:2px 10px;border-radius:999px;font-size:0.75rem;font-weight:600;white-space:nowrap;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,0.3)">${city.name}</div>`,
    iconSize: [null, null],
    iconAnchor: [30, 12]
  });
  L.marker([city.lat, city.lng], { icon }).addTo(map);
});

// ===== HOTEL MARKERS =====
const hotelCoords = [
  { lat: 37.8060, lng: 237.5846, name: "Holiday Inn Express", dates: "5/01–5/03", color: "#E8913A" },
  { lat: 37.5930, lng: 237.6340, name: "Bay Landing Hotel", dates: "5/03–5/04", color: "#E8913A" },
  { lat: 21.2836, lng: 202.1630, name: "Hilton Hawaiian Village", dates: "5/04–5/06", color: "#2E86AB" },
  { lat: 19.7241, lng: 204.9132, name: "Hilo Reeds Bay Hotel", dates: "5/06–5/07", color: "#A23B34" },
  { lat: 21.2740, lng: 202.1780, name: "Aston Waikiki Sunset", dates: "5/07–5/09", color: "#2E86AB" }
];
const hotelLayer = L.layerGroup();
hotelCoords.forEach(h => {
  const icon = L.divIcon({
    className: 'city-marker',
    html: `<div style="background:#fff;color:${h.color};padding:2px 8px;border-radius:6px;font-size:0.68rem;font-weight:600;white-space:nowrap;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,0.25);border:2px solid ${h.color}">🏨 ${h.name}</div>`,
    iconSize: [null, null],
    iconAnchor: [50, 12]
  });
  L.marker([h.lat, h.lng], { icon })
    .bindTooltip(`${h.dates} ${h.name}`, { direction: 'top', offset: [0, -10] })
    .addTo(hotelLayer);
});

// ===== FLIGHT ROUTE POLYLINES =====
// Convert coordinates to Pacific-centered (lng 0-360 range, Asia ~110-130, Americas ~200-240)
function toPacificLng(lng) {
  return lng < 0 ? lng + 360 : lng;
}

function getCurvedPoints(from, to, numPoints) {
  const points = [];
  const fromLng = toPacificLng(from[1]);
  const toLng = toPacificLng(to[1]);
  const lngDiff = toLng - fromLng;
  const latDiff = to[0] - from[0];
  const dist = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
  const offset = dist * 0.12;
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const lat = from[0] + latDiff * t + Math.sin(Math.PI * t) * offset;
    const lng = fromLng + lngDiff * t;
    points.push([lat, lng]);
  }
  return points;
}

const flightLayer = L.layerGroup().addTo(map);
TRIP_DATA.flightRoutes.forEach(route => {
  const curvedPts = getCurvedPoints(route.from, route.to, 60);
  L.polyline(curvedPts, {
    color: route.color,
    weight: 2.5,
    dashArray: '10, 6',
    opacity: 0.8
  }).addTo(flightLayer);

  // Add numbered label at midpoint of curve
  const mid = curvedPts[Math.floor(curvedPts.length / 2)];
  const numIcon = L.divIcon({
    className: 'route-num-marker',
    html: `<div style="background:${route.color};color:#fff;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700;box-shadow:0 1px 4px rgba(0,0,0,0.4);border:2px solid #fff">${route.order}</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
  L.marker(mid, { icon: numIcon, interactive: true })
    .bindTooltip(`${route.order}. ${route.label}  ${route.date}`, { direction: 'top', offset: [0, -12] })
    .addTo(flightLayer);
});

// ===== ACTIVITY MARKERS + DAY LAYERS =====
const dayLayers = {};
// Store per-day numbered activities for timeline rendering
const dayActivityNumbers = {};

// Narrow viewports get thinner day-route lines so the colored arc doesn't
// dominate the screen at city zoom. Sampled once at init — toggling view
// mode after won't re-render polylines, which is fine.
const NARROW_VIEWPORT = window.innerWidth <= 768;
const ROUTE_OUTLINE_WEIGHT = NARROW_VIEWPORT ? 7 : 10;
const ROUTE_COLOR_WEIGHT = NARROW_VIEWPORT ? 4 : 6;

TRIP_DATA.days.forEach(day => {
  const layerGroup = L.layerGroup();
  dayLayers[day.id] = layerGroup;

  // --- Collect geo-activities with numbering & dedup ---
  const geoActivities = [];
  const actNumMap = new Map(); // activityIndex -> display number
  let num = 0;
  day.activities.forEach((a, idx) => {
    if (!a.lat) return;
    const mapLng = a.lng < 0 ? a.lng + 360 : a.lng;
    // Merge with previous if same location (< 0.002°)
    const prev = geoActivities[geoActivities.length - 1];
    if (prev && Math.abs(prev.lat - a.lat) < 0.002 && Math.abs(prev.mapLng - mapLng) < 0.002) {
      // Same location — share the previous number
      actNumMap.set(idx, prev.num);
      prev.names.push({ name: a.name, time: a.end ? `${a.time}–${a.end}` : a.time });
      return;
    }
    num++;
    actNumMap.set(idx, num);
    geoActivities.push({ lat: a.lat, mapLng, num, names: [{ name: a.name, time: a.end ? `${a.time}–${a.end}` : a.time }] });
  });
  dayActivityNumbers[day.id] = actNumMap;

  // --- Numbered markers ---
  geoActivities.forEach(ga => {
    const icon = L.divIcon({
      className: 'activity-num-marker',
      html: `<div class="activity-num-icon" style="color:${day.color}">${ga.num}</div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
    const marker = L.marker([ga.lat, ga.mapLng], { icon });
    const popupLines = ga.names.map(n => `<b>${n.name}</b><br>${n.time}`).join('<hr style="margin:4px 0">');
    marker.bindPopup(popupLines);
    layerGroup.addLayer(marker);
  });

  // --- Filter route points (remove round-trips) ---
  const rawPts = geoActivities.map(ga => [ga.lat, ga.mapLng]);
  const routePoints = [];
  for (let i = 0; i < rawPts.length; i++) {
    const pt = rawPts[i];
    // A->B->A round-trip filter: skip if current point matches two positions back
    if (routePoints.length >= 2) {
      const backBack = routePoints[routePoints.length - 2];
      if (Math.abs(pt[0] - backBack[0]) < 0.002 && Math.abs(pt[1] - backBack[1]) < 0.002) {
        continue;
      }
    }
    // Deduplicate consecutive same location
    const last = routePoints[routePoints.length - 1];
    if (!last || Math.abs(last[0] - pt[0]) > 0.002 || Math.abs(last[1] - pt[1]) > 0.002) {
      routePoints.push(pt);
    }
  }

  // --- Build large curved segments between stops ---
  function curveSegment(p1, p2, nPts) {
    const pts = [];
    const dlat = p2[0] - p1[0];
    const dlng = p2[1] - p1[1];
    const dist = Math.sqrt(dlat * dlat + dlng * dlng);
    const arcOffset = dist * 0.3;
    for (let j = 0; j <= nPts; j++) {
      const t = j / nPts;
      const lat = p1[0] + dlat * t + Math.sin(Math.PI * t) * arcOffset;
      const lng = p1[1] + dlng * t;
      pts.push([lat, lng]);
    }
    return pts;
  }

  if (routePoints.length >= 2) {
    // Pass 1: white solid outline (bottom layer)
    for (let i = 0; i < routePoints.length - 1; i++) {
      const seg = curveSegment(routePoints[i], routePoints[i + 1], 24);
      layerGroup.addLayer(L.polyline(seg, {
        color: '#fff',
        weight: ROUTE_OUTLINE_WEIGHT,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
      }));
    }
    // Pass 2: colored dashed arcs (top layer)
    for (let i = 0; i < routePoints.length - 1; i++) {
      const seg = curveSegment(routePoints[i], routePoints[i + 1], 24);
      layerGroup.addLayer(L.polyline(seg, {
        color: day.color,
        weight: ROUTE_COLOR_WEIGHT,
        opacity: 1,
        dashArray: '16, 10',
        lineCap: 'round',
        lineJoin: 'round'
      }));
    }
  }
});

// ===== ZOOM-DEPENDENT LAYER VISIBILITY =====
const ACTIVITY_MIN_ZOOM = 9;
let activeDayId = null;

function syncLayerVisibility() {
  const zoom = map.getZoom();
  // Show/hide daily activity layer based on zoom
  if (activeDayId && dayLayers[activeDayId]) {
    const layer = dayLayers[activeDayId];
    if (zoom >= ACTIVITY_MIN_ZOOM && !map.hasLayer(layer)) {
      layer.addTo(map);
    } else if (zoom < ACTIVITY_MIN_ZOOM && map.hasLayer(layer)) {
      map.removeLayer(layer);
    }
  }
  // Hide flight routes when zoomed into city detail, show when zoomed out
  if (zoom >= ACTIVITY_MIN_ZOOM && map.hasLayer(flightLayer)) {
    map.removeLayer(flightLayer);
  } else if (zoom < ACTIVITY_MIN_ZOOM && !map.hasLayer(flightLayer)) {
    flightLayer.addTo(map);
  }
  // Show hotel markers when zoomed into city detail
  if (zoom >= ACTIVITY_MIN_ZOOM && !map.hasLayer(hotelLayer)) {
    hotelLayer.addTo(map);
  } else if (zoom < ACTIVITY_MIN_ZOOM && map.hasLayer(hotelLayer)) {
    map.removeLayer(hotelLayer);
  }
}

map.on('zoomend', syncLayerVisibility);

// ===== SHOW OVERVIEW =====
function showOverview() {
  activeDayId = null;
  Object.values(dayLayers).forEach(l => map.removeLayer(l));
  if (map.hasLayer(hotelLayer)) map.removeLayer(hotelLayer);
  if (!map.hasLayer(flightLayer)) flightLayer.addTo(map);
  map.setView(TRIP_DATA.cities.overview.center, TRIP_DATA.cities.overview.zoom);
  document.querySelectorAll('.day-card').forEach(c => c.classList.remove('active'));
}

// ===== ZOOM TO REGION =====
function zoomToRegion(region, dayId) {
  Object.values(dayLayers).forEach(l => map.removeLayer(l));
  activeDayId = dayId;
  if (dayLayers[dayId]) dayLayers[dayId].addTo(map);
  const city = TRIP_DATA.cities[region];
  if (city) map.setView(city.center, city.zoom, { animate: true });
  document.querySelectorAll('.day-card').forEach(c => c.classList.remove('active'));
  const card = document.getElementById('card-' + dayId);
  if (card) card.classList.add('active');
}

// ===== TIMELINE ITEM CLICK DELEGATION =====
document.addEventListener('click', function(e) {
  const item = e.target.closest('.timeline-item.has-location');
  if (!item) return;
  const lat = parseFloat(item.dataset.lat);
  const lng = parseFloat(item.dataset.lng);
  const mapLng = lng < 0 ? lng + 360 : lng;
  const dayId = item.dataset.day;
  activeDayId = dayId;
  if (dayLayers[dayId] && !map.hasLayer(dayLayers[dayId])) {
    Object.values(dayLayers).forEach(l => map.removeLayer(l));
    dayLayers[dayId].addTo(map);
  }
  map.setView([lat, mapLng], 14, { animate: true });
  dayLayers[dayId].eachLayer(marker => {
    const mll = marker.getLatLng && marker.getLatLng();
    if (mll && Math.abs(mll.lat - lat) < 0.001 && Math.abs(mll.lng - mapLng) < 0.001) {
      marker.openPopup();
    }
  });
});

// ===== RENDER SUMMARY =====
function renderSummary() {
  const panel = document.getElementById('itinerary-panel');

  // Flight table — flight code links to the airline's check-in page.
  const CHECKIN_URLS = {
    UA: 'https://www.united.com/en/us/checkin',
    AS: 'https://www.alaskaair.com/checkin',
    KE: 'https://www.koreanair.com/global/en/booking/check-in'
  };
  function flightCodeCell(code) {
    const prefix = code.match(/^[A-Z]+/);
    const url = prefix && CHECKIN_URLS[prefix[0]];
    if (!url) return `<strong>${code}</strong>`;
    return `<a class="flight-code" href="${url}" target="_blank" rel="noopener" title="打开${prefix[0]}在线值机"><strong>${code}</strong> ↗</a>`;
  }
  let flightRows = TRIP_DATA.flights.map(f =>
    `<tr>
      <td>${f.date}</td>
      <td>${flightCodeCell(f.code)}</td>
      <td>${f.fromName}(${f.from}) → ${f.toName}(${f.to})</td>
      <td>${f.depart} → ${f.arrive}</td>
    </tr>`
  ).join('');

  // Hotel table
  let hotelRows = TRIP_DATA.hotels.map(h =>
    `<tr>
      <td>${h.dates}<br><small>${h.nights}晚</small></td>
      <td>${h.name}</td>
      <td>${h.note || ''}</td>
    </tr>`
  ).join('');

  // Car rental table
  let carRows = TRIP_DATA.carRentals.map(c =>
    `<tr>
      <td>${c.date}</td>
      <td>${c.location}</td>
      <td>${c.detail}</td>
    </tr>`
  ).join('');

  // Checklist (render unchecked first, Firebase will update)
  let checklistItems = TRIP_DATA.bookingChecklist.map((item, i) => {
    return `<li><label><input type="checkbox" data-idx="${i}"><span>${item}</span></label></li>`;
  }).join('');

  panel.innerHTML = `
    <div class="summary-section">
      <h2>✈️ 航班总览</h2>
      <table class="summary-table">
        <thead>
          <tr><th>日期</th><th>航班</th><th>航线</th><th>时间</th></tr>
        </thead>
        <tbody>${flightRows}</tbody>
      </table>
    </div>

    <div class="summary-section">
      <h2>🏨 酒店总览</h2>
      <table class="summary-table">
        <thead>
          <tr><th>日期/晚数</th><th>酒店</th><th>备注</th></tr>
        </thead>
        <tbody>${hotelRows}</tbody>
      </table>
    </div>

    <div class="summary-section">
      <h2>🚗 租车总览</h2>
      <table class="summary-table">
        <thead>
          <tr><th>日期</th><th>地点</th><th>详情</th></tr>
        </thead>
        <tbody>${carRows}</tbody>
      </table>
    </div>

    <div class="summary-section">
      <h2>📋 待预订清单</h2>
      <ul class="checklist">${checklistItems}</ul>
    </div>

    <div class="summary-section">
      <h2>🆘 紧急联系</h2>
      <div class="emergency-grid">
        <div class="emergency-card">
          <div class="em-title">中国驻旧金山总领事馆</div>
          <div class="em-detail">📞 <a href="tel:+14158525900">+1-415-852-5900</a></div>
          <div class="em-detail">📍 1450 Laguna St, San Francisco</div>
        </div>
        <div class="emergency-card">
          <div class="em-title">中国驻洛杉矶总领事馆（管辖夏威夷）</div>
          <div class="em-detail">📞 <a href="tel:+12138078088">+1-213-807-8088</a></div>
        </div>
        <div class="emergency-card">
          <div class="em-title">美国紧急电话</div>
          <div class="em-detail">🚨 <a href="tel:911">911</a>（警察/消防/急救）</div>
        </div>
        <div class="emergency-card">
          <div class="em-title">航司客服</div>
          <div class="em-detail">United Airlines: <a href="tel:+18008648331">+1-800-864-8331</a></div>
          <div class="em-detail">Alaska Airlines: <a href="tel:+18002527522">+1-800-252-7522</a></div>
          <div class="em-detail">Korean Air: <a href="tel:+18004385000">+1-800-438-5000</a></div>
        </div>
        <div class="emergency-card">
          <div class="em-title">携程客服（订单 / 改签）</div>
          <div class="em-detail">🌐 国际（在美打这个）: <a href="tel:+862134064888">+86-21-3406-4888</a></div>
          <div class="em-detail">🇭🇰 香港: <a href="tel:+85230083295">(852) 3008-3295</a></div>
          <div class="em-detail">🇨🇳 大陆: 95010（短号，仅大陆内可拨）</div>
        </div>
      </div>
    </div>

    <div id="day-cards"></div>
  `;

  // Checklist: write to Firebase on change
  panel.querySelectorAll('.checklist input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', e => {
      const idx = e.target.dataset.idx;
      if (e.target.checked) {
        fbChecklist.child(idx).set(true);
      } else {
        fbChecklist.child(idx).remove();
      }
    });
  });

  // Checklist: listen to Firebase for real-time sync
  fbChecklist.on('value', snap => {
    const data = snap.val() || {};
    panel.querySelectorAll('.checklist input[type="checkbox"]').forEach(cb => {
      const idx = cb.dataset.idx;
      const isChecked = !!data[idx];
      cb.checked = isChecked;
      if (isChecked) {
        cb.closest('li').classList.add('done');
      } else {
        cb.closest('li').classList.remove('done');
      }
    });
  });
}

// ===== RENDER DAY CARDS =====
function renderDayCards() {
  const container = document.getElementById('day-cards');
  let html = '';

  TRIP_DATA.days.forEach(day => {
    // Build badges
    let badges = '';
    if (day.flight) {
      badges += `<span class="tag-flight">✈ ${day.flight.code} ${day.flight.from}→${day.flight.to}</span>`;
    }
    if (day.hotel) {
      badges += `<span class="tag-hotel">🏨 ${day.hotel}</span>`;
    }
    if (day.carRental) {
      badges += `<span class="tag-car">🚗 ${day.carRental}</span>`;
    }

    // Build timeline
    const actNums = dayActivityNumbers[day.id] || new Map();
    let timelineItems = day.activities.map((act, idx) => {
      const hasLoc = act.lat !== undefined && act.lng !== undefined;
      const timeStr = act.end ? `${act.time}–${act.end}` : act.time;
      const locAttrs = hasLoc
        ? ` data-lat="${act.lat}" data-lng="${act.lng}"`
        : '';
      const locClass = hasLoc ? ' has-location' : '';

      const dotStyle = hasLoc ? ` style="--dot-color: ${day.color}"` : '';
      const numBadge = actNums.has(idx)
        ? `<span class="tl-num" style="background:${day.color}">${actNums.get(idx)}</span>`
        : '';
      const subsHtml = act.subs
        ? `<ul class="tl-subs">${act.subs.map(s => `<li>${s.name}<span class="tl-sub-dur">${s.duration}</span></li>`).join('')}</ul>`
        : '';
      return `<div class="timeline-item${locClass}" data-day="${day.id}" data-act="${idx}"${locAttrs}${dotStyle}>
        <span class="tl-time">${numBadge}${timeStr}</span>
        <span class="tl-name">${act.name}</span>${subsHtml}
      </div>`;
    }).join('');

    html += `
      <div class="day-card" id="card-${day.id}" data-region="${day.region}" style="border-left: 4px solid ${day.color}">
        <div class="day-card-cover" style="background-image: url('${day.coverImg}')"></div>
        <div class="day-card-header" onclick="toggleCard('${day.id}')">
          <span class="day-num" style="color:${day.color}">D${day.day}</span>
          <div class="day-card-thumb" style="background-image:url('${day.coverImg}')"></div>
          <div class="day-info">
            <div class="day-title">${day.title}</div>
            <div class="day-date">${day.date} ${day.weekday}</div>
            <div class="day-weather" title="点击切换 °C / °F" onclick="event.stopPropagation(); toggleTempUnit();">${weatherText(day, getTempUnit())}</div>
          </div>
          <span class="expand-icon">▼</span>
        </div>
        <div class="day-card-badges">${badges}</div>
        <div class="day-card-body">
          <div class="timeline">
            ${timelineItems}
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// ===== TEMPERATURE UNIT =====
const TEMP_UNIT_KEY = 'travel-temp-unit';
function getTempUnit() {
  try { return localStorage.getItem(TEMP_UNIT_KEY) === 'f' ? 'f' : 'c'; }
  catch (err) { return 'c'; }
}
function setTempUnit(unit) {
  try { localStorage.setItem(TEMP_UNIT_KEY, unit); } catch (err) {}
}
function formatTemp(celsius, unit) {
  if (unit === 'f') return Math.round((celsius * 9) / 5 + 32) + '°F';
  return celsius + '°C';
}
function weatherText(day, unit) {
  return `${day.weather.icon} ${formatTemp(day.weather.high, unit)}/${formatTemp(day.weather.low, unit)} ${day.weather.desc}`;
}
function applyTempUnit() {
  const unit = getTempUnit();
  document.querySelectorAll('.day-weather').forEach(el => {
    const card = el.closest('.day-card');
    if (!card) return;
    const dayId = card.id.replace('card-', '');
    const day = TRIP_DATA.days.find(d => d.id === dayId);
    if (day) el.textContent = weatherText(day, unit);
  });
}
// Exposed on window so the inline onclick in the .day-weather span can reach
// it — keeps the stopPropagation + toggle one-liner.
window.toggleTempUnit = function() {
  setTempUnit(getTempUnit() === 'c' ? 'f' : 'c');
  applyTempUnit();
};

// ===== CURRENT MOMENT HIGHLIGHT =====
// Looks at the device's local clock (during the trip the device is always in
// the destination's timezone, matching how activity times are written) and
// returns { dayId, activityIdx } for the activity whose time window the user
// is currently inside, or null if outside the trip / between days.
function getCurrentActivity() {
  const now = new Date();
  const monthDay = `${now.getMonth() + 1}/${String(now.getDate()).padStart(2, '0')}`;
  const day = TRIP_DATA.days.find(d => d.date === monthDay);
  if (!day) return null;
  const parseHm = str => {
    const [h, m] = str.split(':').map(Number);
    return h * 60 + m;
  };
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const acts = day.activities;
  for (let i = 0; i < acts.length; i++) {
    const startMin = parseHm(acts[i].time);
    let endMin;
    if (acts[i].end) {
      endMin = parseHm(acts[i].end);
    } else if (i + 1 < acts.length) {
      endMin = parseHm(acts[i + 1].time);
    } else {
      endMin = 24 * 60;
    }
    if (nowMin >= startMin && nowMin < endMin) {
      return { dayId: day.id, activityIdx: i };
    }
  }
  return null;
}

function updateCurrentHighlight() {
  document.querySelectorAll('.timeline-item.now').forEach(el => el.classList.remove('now'));
  const cur = getCurrentActivity();
  if (!cur) return null;
  const el = document.querySelector(
    `.timeline-item[data-day="${cur.dayId}"][data-act="${cur.activityIdx}"]`
  );
  if (el) el.classList.add('now');
  return cur;
}

// ===== TOGGLE CARD =====
function toggleCard(dayId) {
  const card = document.getElementById('card-' + dayId);
  const wasOpen = card.classList.contains('open');

  // Close all cards first
  document.querySelectorAll('.day-card.open').forEach(c => {
    c.classList.remove('open');
  });

  // If it wasn't open, open it and zoom to region
  if (!wasOpen) {
    card.classList.add('open');
    const region = card.dataset.region;
    zoomToRegion(region, dayId);
    if (document.body.classList.contains('mobile-mode') && currentMapCollapsed) {
      applyMapCollapsed(false);
    } else if (document.body.classList.contains('mobile-mode')) {
      refreshMapIfVisible();
    }
    if (window.innerWidth <= 768) {
      setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  } else {
    // Card was open, now closing — show overview
    showOverview();
  }
}

// ===== COUNTDOWN =====
// Counts down to the next scheduled flight. Once a flight's departure is in
// the past, .find() skips to the one after it, so the countdown rolls forward
// automatically during the trip.
function updateCountdown() {
  const el = document.getElementById('countdown');
  const now = new Date();
  const flights = TRIP_DATA.flights
    .map(f => {
      const [month, day] = f.date.split('/').map(Number);
      const [h, m] = f.depart.split(':').map(Number);
      return { f, at: new Date(2026, month - 1, day, h, m) };
    })
    .sort((a, b) => a.at - b.at);
  const upcoming = flights.find(item => item.at > now);
  if (!upcoming) {
    el.textContent = '✅ 旅途已结束';
    return;
  }
  const diff = upcoming.at - now;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  let human;
  if (days > 0) human = `${days} 天 ${hours} 小时`;
  else if (hours > 0) human = `${hours} 小时 ${mins} 分钟`;
  else human = `${Math.max(mins, 0)} 分钟`;
  el.innerHTML = `距 ${upcoming.f.code} ${upcoming.f.from}→${upcoming.f.to} 还有 <span class="countdown-num">${human}</span>`;
}

// ===== THEME TOGGLE =====
function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  document.getElementById('theme-toggle').textContent = next === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('theme', next);
}

// ===== TRIP PROGRESS BAR =====
function renderProgress(activeDayNum) {
  const container = document.getElementById('trip-progress');
  const tripStart = new Date('2026-05-01');
  const now = new Date();
  const todayDayNum = Math.floor((now - tripStart) / (1000*60*60*24)) + 1;

  let html = '';
  TRIP_DATA.days.forEach((day, idx) => {
    const isPast = todayDayNum > day.day;
    const isToday = todayDayNum === day.day;
    const isActive = activeDayNum === day.day;
    let cls = 'prog-day';
    if (isPast) cls += ' past';
    if (isActive || isToday) cls += ' active';

    html += `<div class="${cls}" onclick="toggleCard('${day.id}')">
      <div class="prog-dot" style="${isActive ? 'border-color:' + day.color + ';background:' + day.color : ''}"></div>
      <span class="prog-label">D${day.day}</span>
    </div>`;
    if (idx < TRIP_DATA.days.length - 1) {
      html += `<div class="prog-line${isPast ? ' past' : ''}"></div>`;
    }
  });
  container.innerHTML = html;
}

// Patch toggleCard to update progress bar
const _origToggleCard = toggleCard;
toggleCard = function(dayId) {
  _origToggleCard(dayId);
  const day = TRIP_DATA.days.find(d => d.id === dayId);
  const card = document.getElementById('card-' + dayId);
  if (day && card && card.classList.contains('open')) {
    renderProgress(day.day);
  } else {
    renderProgress(null);
  }
};

// Patch showOverview to reset progress
const _origShowOverview = showOverview;
showOverview = function() {
  _origShowOverview();
  renderProgress(null);
};

let currentViewMode = getStoredViewMode() || getAutoViewMode();
let currentMapCollapsed = getStoredMapCollapsed();

function updateModeButtons() {
  document.querySelectorAll('.view-mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.viewMode === currentViewMode);
  });
}

function updateMapToggleButton() {
  const btn = document.getElementById('mobile-map-toggle');
  if (!btn) return;
  btn.textContent = currentMapCollapsed ? '展开' : '收起';
  btn.setAttribute('aria-expanded', currentMapCollapsed ? 'false' : 'true');
}

function refreshMapIfVisible() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      map.invalidateSize();
    });
  });
}

function applyViewMode(mode, persist = true) {
  currentViewMode = mode;
  document.body.classList.remove('mobile-mode', 'desktop-mode');
  document.body.classList.add(mode + '-mode');
  updateModeButtons();
  updateMapToggleButton();
  if (persist) setStoredViewMode(mode);
  if (mode === 'desktop' || !currentMapCollapsed) {
    refreshMapIfVisible();
  }
}

function applyMapCollapsed(collapsed, persist = true) {
  currentMapCollapsed = collapsed;
  document.body.classList.toggle('map-collapsed', collapsed);
  updateMapToggleButton();
  if (persist) setStoredMapCollapsed(collapsed);
  if (!collapsed) {
    refreshMapIfVisible();
  }
}

// ===== INIT =====
renderSummary();
renderDayCards();
updateCountdown();
renderProgress(null);

document.querySelectorAll('.view-mode-btn').forEach(btn => {
  btn.addEventListener('click', () => applyViewMode(btn.dataset.viewMode));
});

const mapToggleBtn = document.getElementById('mobile-map-toggle');
if (mapToggleBtn) {
  mapToggleBtn.addEventListener('click', () => applyMapCollapsed(!currentMapCollapsed));
}

applyMapCollapsed(currentMapCollapsed, false);
applyViewMode(currentViewMode, false);

window.addEventListener('resize', () => {
  if (!getStoredViewMode()) {
    applyViewMode(getAutoViewMode(), false);
  } else if (currentViewMode === 'desktop' || !currentMapCollapsed) {
    refreshMapIfVisible();
  }
});

// Sync theme toggle icon with the pre-paint resolved theme
if (document.documentElement.getAttribute('data-theme') === 'dark') {
  document.getElementById('theme-toggle').textContent = '☀️';
}

const currentActivity = updateCurrentHighlight();
toggleCard(currentActivity ? currentActivity.dayId : 'd1');
if (currentActivity) {
  // Wait for the day-card open transition, then center the "now" row.
  setTimeout(() => {
    const el = document.querySelector(
      `.timeline-item[data-day="${currentActivity.dayId}"][data-act="${currentActivity.activityIdx}"]`
    );
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 500);
}
setInterval(updateCurrentHighlight, 30000);
setInterval(updateCountdown, 60000);

// ===== OFFLINE MAP CONTROLLER =====
const OFFLINE_TILE_COUNT_KEY = 'travel-offline-tile-count';

const offlineBtn = document.getElementById('offline-map-btn');
const offlineDialog = document.getElementById('offline-map-dialog');
const actionsRow = document.getElementById('offline-actions-row');
const confirmRow = document.getElementById('offline-confirm-row');
const downloadBtn = document.getElementById('offline-download-btn');
const clearBtn = document.getElementById('offline-clear-btn');
const cancelBtn = document.getElementById('offline-cancel-btn');
const closeBtn = document.getElementById('offline-close-btn');
const confirmClearBtn = document.getElementById('offline-confirm-clear-btn');
const confirmCancelBtn = document.getElementById('offline-confirm-cancel-btn');
const progressFill = offlineDialog.querySelector('.offline-progress-fill');
const progressText = offlineDialog.querySelector('.offline-progress-text');
const regionItems = {
  sfo: offlineDialog.querySelector('li[data-region="sfo"] .offline-region-status'),
  oahu: offlineDialog.querySelector('li[data-region="oahu"] .offline-region-status'),
  hilo: offlineDialog.querySelector('li[data-region="hilo"] .offline-region-status')
};

const AVG_TILE_KB = 14;

function formatMB(tileCount) {
  const mb = (tileCount * AVG_TILE_KB) / 1024;
  return mb < 1 ? `${Math.round(mb * 1024)} KB` : `${mb.toFixed(1)} MB`;
}

function getLastKnownTileCount() {
  const raw = parseInt(localStorage.getItem(OFFLINE_TILE_COUNT_KEY) || '0', 10);
  return Number.isFinite(raw) ? raw : 0;
}

function setLastKnownTileCount(count) {
  try {
    localStorage.setItem(OFFLINE_TILE_COUNT_KEY, String(count));
  } catch (err) {}
}

function renderOfflineBtn() {
  const count = getLastKnownTileCount();
  offlineBtn.textContent = count > 0 ? `💾 ${formatMB(count)}` : '🗺️ 离线';
}

function renderOfflineBtnDownloading(percent) {
  offlineBtn.textContent = `⏬ ${percent}%`;
}

function refreshDialogState() {
  const count = getLastKnownTileCount();
  if (count > 0) {
    progressText.textContent = `已缓存 ${count} 片瓦片 · ~${formatMB(count)}`;
    progressFill.style.width = '100%';
    clearBtn.hidden = false;
    downloadBtn.textContent = '重新下载';
  } else {
    progressText.textContent = '未开始';
    progressFill.style.width = '0%';
    clearBtn.hidden = true;
    downloadBtn.textContent = '开始下载';
  }
  downloadBtn.hidden = false;
  cancelBtn.hidden = true;
  cancelBtn.disabled = false;
  cancelBtn.textContent = '取消下载';
  Object.values(regionItems).forEach(el => { el.textContent = count > 0 ? '已缓存' : '—'; });
}

let previousFocus = null;

function openDialog() {
  previousFocus = document.activeElement;
  offlineDialog.classList.remove('hidden');
  showActionsRow();
  refreshDialogState();
  // Focus the primary action so keyboard users land in the dialog.
  setTimeout(() => {
    const target = downloadBtn.hidden ? closeBtn : downloadBtn;
    target && target.focus();
  }, 0);
}
function closeDialog() {
  offlineDialog.classList.add('hidden');
  showActionsRow();
  if (previousFocus && typeof previousFocus.focus === 'function') {
    previousFocus.focus();
  }
}

function showActionsRow() {
  actionsRow.hidden = false;
  confirmRow.hidden = true;
}
function showConfirmRow() {
  actionsRow.hidden = true;
  confirmRow.hidden = false;
  setTimeout(() => confirmCancelBtn.focus(), 0);
}

function trapFocus(e) {
  if (e.key !== 'Tab') return;
  const focusables = Array.from(
    offlineDialog.querySelectorAll('button')
  ).filter(b => !b.hidden && !b.disabled && b.offsetParent !== null);
  if (focusables.length === 0) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    last.focus();
    e.preventDefault();
  } else if (!e.shiftKey && document.activeElement === last) {
    first.focus();
    e.preventDefault();
  }
}

offlineDialog.addEventListener('keydown', trapFocus);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !offlineDialog.classList.contains('hidden')) {
    closeDialog();
  }
});

function sendToSw(message) {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.ready.then(reg => {
    const target = reg.active || navigator.serviceWorker.controller;
    if (target) target.postMessage(message);
  }).catch(() => {});
}

offlineBtn.addEventListener('click', openDialog);
closeBtn.addEventListener('click', closeDialog);
offlineDialog.addEventListener('click', e => {
  if (e.target === offlineDialog) closeDialog();
});
downloadBtn.addEventListener('click', async () => {
  // Ask the browser not to evict the tile cache under storage pressure.
  // Safe to call every time — it's a no-op after the first grant, and it
  // silently falls back on browsers that lack the API.
  if (navigator.storage && typeof navigator.storage.persist === 'function') {
    try { await navigator.storage.persist(); } catch (err) {}
  }
  downloadBtn.hidden = true;
  cancelBtn.hidden = false;
  clearBtn.hidden = true;
  progressText.textContent = '准备中…';
  progressFill.style.width = '0%';
  Object.values(regionItems).forEach(el => { el.textContent = '排队'; });
  sendToSw({ type: 'PRECACHE_TILES_START' });
});
cancelBtn.addEventListener('click', () => {
  sendToSw({ type: 'PRECACHE_TILES_CANCEL' });
  cancelBtn.disabled = true;
  cancelBtn.textContent = '取消中…';
});
clearBtn.addEventListener('click', showConfirmRow);
confirmCancelBtn.addEventListener('click', showActionsRow);
confirmClearBtn.addEventListener('click', () => {
  sendToSw({ type: 'CLEAR_TILES' });
  showActionsRow();
});

navigator.serviceWorker.addEventListener('message', event => {
  const data = event.data;
  if (!data || typeof data !== 'object') return;
  if (data.type === 'PRECACHE_TILES_PROGRESS') {
    const percent = data.total ? Math.min(100, Math.round((data.done / data.total) * 100)) : 0;
    progressFill.style.width = percent + '%';
    progressText.textContent = `${data.done} / ${data.total}（失败 ${data.failed}）`;
    renderOfflineBtnDownloading(percent);
    if (data.regionId && regionItems[data.regionId] &&
        regionItems[data.regionId].textContent !== '已缓存') {
      regionItems[data.regionId].textContent = '下载中';
    }
  } else if (data.type === 'PRECACHE_TILES_REGION_DONE') {
    if (data.regionId && regionItems[data.regionId]) {
      regionItems[data.regionId].textContent = '已缓存';
    }
  } else if (data.type === 'PRECACHE_TILES_DONE') {
    setLastKnownTileCount(data.stored || 0);
    cancelBtn.disabled = false;
    cancelBtn.textContent = '取消下载';
    cancelBtn.hidden = true;
    downloadBtn.hidden = false;
    refreshDialogState();
    renderOfflineBtn();
    if (data.cancelled) {
      progressText.textContent = '已取消（已下载部分保留）';
    } else if (!data.ok) {
      progressText.textContent = `下载失败：${data.reason || 'unknown'}`;
    } else {
      progressText.textContent = `完成：${data.stored} 片 · ~${formatMB(data.stored)}`;
    }
  } else if (data.type === 'PRECACHE_TILES_BUSY') {
    progressText.textContent = '已在下载中…';
  } else if (data.type === 'TILE_STATS') {
    setLastKnownTileCount(data.count || 0);
    refreshDialogState();
    renderOfflineBtn();
  }
});

renderOfflineBtn();

// ===== EMERGENCY PLAYBOOK DIALOG =====
const emergencyToggle = document.getElementById('emergency-toggle');
const emergencyDialog = document.getElementById('emergency-dialog');
const emergencyCloseBtn = document.getElementById('emergency-close-btn');
let emergencyPreviousFocus = null;

function openEmergencyDialog() {
  emergencyPreviousFocus = document.activeElement;
  emergencyDialog.classList.remove('hidden');
  setTimeout(() => emergencyCloseBtn && emergencyCloseBtn.focus(), 0);
}
function closeEmergencyDialog() {
  emergencyDialog.classList.add('hidden');
  if (emergencyPreviousFocus && typeof emergencyPreviousFocus.focus === 'function') {
    emergencyPreviousFocus.focus();
  }
}

emergencyToggle.addEventListener('click', openEmergencyDialog);
emergencyCloseBtn.addEventListener('click', closeEmergencyDialog);
emergencyDialog.addEventListener('click', e => {
  if (e.target === emergencyDialog) closeEmergencyDialog();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !emergencyDialog.classList.contains('hidden')) {
    closeEmergencyDialog();
  }
});

// ===== SERVICE WORKER (offline cache) =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => {
      console.warn('Service worker registration failed:', err);
    });
    // sendToSw awaits navigator.serviceWorker.ready internally, so this
    // runs after the SW becomes active — works on first install too.
    sendToSw({ type: 'GET_TILE_STATS' });
  });
}
