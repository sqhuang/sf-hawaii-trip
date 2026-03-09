# Travel Itinerary Webpage Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a single-file interactive travel itinerary webpage with Leaflet map and day-by-day schedule for sharing with travel companions.

**Architecture:** Single self-contained HTML file with embedded CSS, JS, and JSON data. Leaflet.js loaded from CDN for the interactive map. Two-panel responsive layout (map left, itinerary right on desktop; stacked on mobile).

**Tech Stack:** Vanilla HTML/CSS/JS, Leaflet.js (CDN), OpenStreetMap tiles.

---

### Task 1: HTML Skeleton + Embedded JSON Data

**Files:**
- Create: `index.html`

**Step 1: Create the HTML file with doctype, head, and body structure**

Create `index.html` with:
- DOCTYPE, html lang="zh-CN"
- `<head>`: charset, viewport meta, title "旧金山 + 夏威夷 9日行程", Leaflet CSS CDN link
- `<body>`: empty `<header>`, `<main>` with `<div id="map-panel">` and `<div id="itinerary-panel">`, Leaflet JS CDN script

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>旧金山 + 夏威夷 9日行程</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>/* Task 2 */</style>
</head>
<body>
  <header id="trip-header"></header>
  <main id="app">
    <div id="map-panel"></div>
    <div id="itinerary-panel"></div>
  </main>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    // DATA and APP code go here
  </script>
</body>
</html>
```

**Step 2: Embed the complete itinerary data as a JS object**

Inside the `<script>` tag, define `const TRIP_DATA` containing:

```javascript
const TRIP_DATA = {
  title: "旧金山 + 夏威夷 9日行程",
  dateRange: "5/01 – 5/10",
  flights: [
    { date: "5/01", code: "UA862", from: "HKG", fromName: "香港", to: "SFO", toName: "旧金山", depart: "11:45", arrive: "09:20" },
    { date: "5/04", code: "UA1175", from: "SFO", fromName: "旧金山", to: "HNL", toName: "檀香山", depart: "09:20", arrive: "11:58" },
    { date: "5/06", code: "AS1112", from: "HNL", fromName: "檀香山", to: "ITO", toName: "希洛", depart: "19:35", arrive: "20:28" },
    { date: "5/07", code: "AS1111", from: "ITO", fromName: "希洛", to: "HNL", toName: "檀香山", depart: "19:44", arrive: "20:39" },
    { date: "5/09", code: "KE054", from: "HNL", fromName: "檀香山", to: "ICN", toName: "首尔", depart: "12:35", arrive: "5/10 17:45" },
    { date: "5/10", code: "KE2011", from: "ICN", fromName: "首尔", to: "HKG", toName: "香港", depart: "19:45", arrive: "22:45" }
  ],
  hotels: [
    { dates: "5/01–5/03", nights: 2, name: "Holiday Inn Express & Suites Fisherman's Wharf", location: "550 North Point St, San Francisco", city: "sfo" },
    { dates: "5/03–5/04", nights: 1, name: "Bay Landing Hotel", location: "Burlingame", note: "含5/04早餐", city: "sfo" },
    { dates: "5/04–5/06 + 5/07–5/09", nights: 4, name: "Waikiki市中心酒店", location: "Waikiki, Honolulu", note: "连住，大岛那晚只带过夜包", city: "hnl" },
    { dates: "5/06–5/07", nights: 1, name: "Hilo市区酒店", location: "Hilo, Big Island", city: "hilo" }
  ],
  carRentals: [
    { date: "5/03", location: "旧金山", detail: "市区取车 → SFO/机场附近还车", duration: "1天" },
    { date: "5/06–5/07", location: "大岛 Hilo", detail: "晚取车 → 次日傍晚还（火山国家公园必需）", duration: "1天" },
    { date: "5/08", location: "欧胡岛", detail: "Waikiki取车 → Kualoa UTV → Ko Olina观星 → Waikiki还车", duration: "1天" }
  ],
  bookingChecklist: [
    "Waikiki 市中心酒店（5/04–5/09 连住）",
    "5/05 海龟浮潜早班（早上、人少）",
    "5/06 ʻIolani Palace 门票/时段 + Diamond Head 预约",
    "5/06 Hilo 酒店（1晚）+ Hilo 租车（晚取车/次日傍晚还）",
    "5/08 Kualoa UTV 上午场（两人一车）",
    "5/08 Ko Olina 观星团（尽量订 19:00 左右场次）",
    "5/03 旧金山租车（市区取→机场附近还）+ 恶魔岛船票"
  ],
  days: [
    {
      id: "d1", day: 1, date: "5/01", weekday: "周五",
      title: "抵达旧金山｜悠闲开局：唐人街 + 孙中山相关",
      region: "sfo", color: "#E8913A",
      flight: { code: "UA862", from: "HKG", to: "SFO", time: "11:45→09:20" },
      hotel: "Holiday Inn Express & Suites Fisherman's Wharf",
      activities: [
        { time: "09:20", end: "10:40", name: "抵达 SFO / 入境取行李", lat: 37.6213, lng: -122.3790, icon: "airport" },
        { time: "10:40", end: "11:30", name: "前往酒店（先寄存行李）", lat: 37.8060, lng: -122.4154 },
        { time: "11:30", end: "13:00", name: "午餐 + 缓冲", lat: 37.8060, lng: -122.4154 },
        { time: "14:00", end: "14:20", name: "Dragon Gate 拍照 + 主街感受", lat: 37.7908, lng: -122.4058, icon: "sight" },
        { time: "14:20", end: "15:10", name: "唐人街随逛（Grant Ave）", lat: 37.7941, lng: -122.4078, icon: "sight" },
        { time: "15:10", end: "15:40", name: "【可选】孙中山相关纪念点", lat: 37.7935, lng: -122.4060, icon: "sight" },
        { time: "16:30", name: "回酒店办理入住/休息", lat: 37.8060, lng: -122.4154 },
        { time: "18:00", end: "19:30", name: "渔人码头海边散步 + 晚餐", lat: 37.8080, lng: -122.4177, icon: "food" },
        { time: "21:00", name: "休息" }
      ]
    },
    {
      id: "d2", day: 2, date: "5/02", weekday: "周六",
      title: "恶魔岛 + Coit Tower + Ferry Building",
      region: "sfo", color: "#E8913A",
      hotel: "Holiday Inn Express & Suites Fisherman's Wharf",
      activities: [
        { time: "07:30", name: "早餐" },
        { time: "08:30", name: "出发去 Pier 33", lat: 37.8083, lng: -122.4098 },
        { time: "09:00", end: "12:30", name: "恶魔岛 Day Tour", lat: 37.8267, lng: -122.4230, icon: "sight" },
        { time: "13:00", name: "午餐", icon: "food" },
        { time: "14:30", end: "15:30", name: "Coit Tower（城市景）", lat: 37.8024, lng: -122.4058, icon: "sight" },
        { time: "16:00", end: "17:00", name: "Ferry Building（咖啡/休息）", lat: 37.7955, lng: -122.3937, icon: "sight" },
        { time: "18:00", name: "回酒店" },
        { time: "19:30", name: "晚餐", icon: "food" }
      ]
    },
    {
      id: "d3", day: 3, date: "5/03", weekday: "周日",
      title: "金门大桥拍照 + 硅谷（山景城）",
      region: "sfo", color: "#E8913A",
      hotel: "Bay Landing Hotel（Burlingame）",
      carRental: "旧金山租车（市区取→机场附近还）",
      activities: [
        { time: "07:30", name: "退房准备" },
        { time: "08:30", name: "市区取车", lat: 37.8060, lng: -122.4154 },
        { time: "09:15", end: "10:30", name: "金门大桥拍照", lat: 37.8199, lng: -122.4783, icon: "sight" },
        { time: "10:30", end: "12:00", name: "开车去南湾" },
        { time: "12:00", end: "16:30", name: "硅谷打卡（Google/Apple/Stanford）", lat: 37.4220, lng: -122.0841, icon: "sight" },
        { time: "17:30", name: "前往 Burlingame" },
        { time: "18:00", name: "机场附近还车", lat: 37.5771, lng: -122.3480 },
        { time: "18:30", name: "入住 Bay Landing", lat: 37.5930, lng: -122.3660 },
        { time: "19:30", name: "晚餐 + 早睡", icon: "food" }
      ]
    },
    {
      id: "d4", day: 4, date: "5/04", weekday: "周一",
      title: "SFO → HNL｜抵达 Waikiki",
      region: "hnl", color: "#2E86AB",
      flight: { code: "UA1175", from: "SFO", to: "HNL", time: "09:20→11:58" },
      hotel: "Waikiki市中心酒店",
      activities: [
        { time: "06:30", name: "起床" },
        { time: "07:00", end: "07:30", name: "酒店早餐" },
        { time: "07:45", name: "出发去 SFO", lat: 37.6213, lng: -122.3790, icon: "airport" },
        { time: "09:20", name: "起飞", icon: "airport" },
        { time: "11:58", name: "到达 HNL", lat: 21.3187, lng: -157.9225, icon: "airport" },
        { time: "12:00", end: "14:30", name: "取行李 + 去 Waikiki（入住/寄存）", lat: 21.2766, lng: -157.8278 },
        { time: "17:30", name: "日落散步", lat: 21.2766, lng: -157.8278, icon: "sight" },
        { time: "19:00", name: "晚餐", icon: "food" },
        { time: "21:00", name: "休息" }
      ]
    },
    {
      id: "d5", day: 5, date: "5/05", weekday: "周二",
      title: "海龟浮潜 + 珍珠港",
      region: "hnl", color: "#2E86AB",
      hotel: "Waikiki市中心酒店",
      activities: [
        { time: "06:00", name: "起床" },
        { time: "06:30", name: "前往集合点" },
        { time: "07:00", end: "10:00", name: "Waikiki 海龟浮潜船", lat: 21.2766, lng: -157.8278, icon: "activity" },
        { time: "10:30", name: "回酒店冲澡/休息" },
        { time: "13:00", name: "出发去 Pearl Harbor" },
        { time: "14:00", end: "16:30", name: "珍珠港（USS Arizona）", lat: 21.3649, lng: -157.9517, icon: "sight" },
        { time: "17:30", name: "回 Waikiki" },
        { time: "19:00", name: "晚餐", icon: "food" }
      ]
    },
    {
      id: "d6", day: 6, date: "5/06", weekday: "周三",
      title: "钻石山 + 皇宫 + 唐人街 → 晚飞 Hilo",
      region: "hnl", color: "#2E86AB",
      flight: { code: "AS1112", from: "HNL", to: "ITO", time: "19:35→20:28" },
      hotel: "Hilo市区酒店",
      activities: [
        { time: "06:30", name: "起床" },
        { time: "07:15", name: "出发去 Diamond Head" },
        { time: "08:00", end: "10:00", name: "钻石山", lat: 21.2614, lng: -157.8059, icon: "sight" },
        { time: "10:30", name: "回酒店冲澡/换衣服" },
        { time: "11:30", end: "12:00", name: "整理大岛过夜小包" },
        { time: "12:30", name: "出发去 Downtown" },
        { time: "13:15", end: "14:45", name: "ʻIolani Palace（皇宫）", lat: 21.3069, lng: -157.8589, icon: "sight" },
        { time: "14:55", end: "15:25", name: "Dr. Sun Yat-sen Memorial Park", lat: 21.3114, lng: -157.8617, icon: "sight" },
        { time: "15:30", end: "16:30", name: "Honolulu Chinatown", lat: 21.3128, lng: -157.8636, icon: "sight" },
        { time: "16:45", name: "回 Waikiki 取过夜小包" },
        { time: "18:00", name: "出发去 HNL", icon: "airport" },
        { time: "19:35", name: "飞 Hilo", lat: 19.7204, lng: -155.0483, icon: "airport" },
        { time: "20:30", end: "21:20", name: "取行李 + 取车" },
        { time: "21:40", name: "入住 Hilo 市区酒店", lat: 19.7241, lng: -155.0868 },
        { time: "22:00", name: "休息" }
      ]
    },
    {
      id: "d7", day: 7, date: "5/07", weekday: "周四",
      title: "火山国家公园整天 → 晚飞回 Oʻahu",
      region: "hilo", color: "#A23B34",
      flight: { code: "AS1111", from: "ITO", to: "HNL", time: "19:44→20:39" },
      hotel: "Waikiki市中心酒店",
      carRental: "大岛 Hilo 租车",
      activities: [
        { time: "08:30", name: "早餐" },
        { time: "09:30", name: "Hilo 出发" },
        { time: "10:30", end: "12:30", name: "火山核心三件套：Kīlauea Caldera / Steam Vents / Nāhuku Lava Tube", lat: 19.4194, lng: -155.2874, icon: "sight" },
        { time: "12:30", end: "13:30", name: "午餐/补给", icon: "food" },
        { time: "13:30", end: "15:30", name: "Chain of Craters Road（开车观景）", lat: 19.3097, lng: -155.1000, icon: "sight" },
        { time: "15:30", name: "回撤" },
        { time: "16:30", end: "17:00", name: "回到 Hilo" },
        { time: "17:00", end: "18:15", name: "加油/还车/机场办理", lat: 19.7204, lng: -155.0483, icon: "airport" },
        { time: "19:44", name: "飞回 HNL", icon: "airport" },
        { time: "21:30", name: "回到 Waikiki", lat: 21.2766, lng: -157.8278 },
        { time: "22:30", name: "睡觉" }
      ]
    },
    {
      id: "d8", day: 8, date: "5/08", weekday: "周五",
      title: "Kualoa UTV + Ko Olina 望远镜观星团",
      region: "hnl", color: "#2E86AB",
      hotel: "Waikiki市中心酒店",
      carRental: "欧胡岛 Waikiki 租车",
      activities: [
        { time: "07:30", name: "起床" },
        { time: "08:15", name: "Waikiki 取车", lat: 21.2766, lng: -157.8278 },
        { time: "09:15", name: "抵达 Kualoa Ranch", lat: 21.5213, lng: -157.8374 },
        { time: "09:30", end: "10:15", name: "check-in / 安全说明 / 分车" },
        { time: "10:30", end: "12:30", name: "UTV Raptor Tour（两人同车）", lat: 21.5213, lng: -157.8374, icon: "activity" },
        { time: "12:45", end: "13:45", name: "午饭", icon: "food" },
        { time: "14:45", name: "回到 Waikiki" },
        { time: "15:00", end: "16:30", name: "冲澡/换衣服/休息" },
        { time: "17:00", name: "出发去 Ko Olina" },
        { time: "18:00", name: "抵达 Ko Olina", lat: 21.3390, lng: -158.1281 },
        { time: "19:00", end: "20:30", name: "Stars Above Hawaii 望远镜观星团", lat: 21.3390, lng: -158.1281, icon: "activity" },
        { time: "21:30", name: "回 Waikiki" },
        { time: "22:00", name: "还车" },
        { time: "23:00", name: "睡觉" }
      ]
    },
    {
      id: "d9", day: 9, date: "5/09", weekday: "周六",
      title: "HNL → ICN（中午起飞）",
      region: "hnl", color: "#2E86AB",
      flight: { code: "KE054", from: "HNL", to: "ICN", time: "12:35→5/10 17:45" },
      activities: [
        { time: "07:30", name: "起床 + 打包" },
        { time: "09:00", name: "退房" },
        { time: "09:30", name: "出发去机场", lat: 21.3187, lng: -157.9225, icon: "airport" },
        { time: "12:35", name: "起飞 KE054", icon: "airport" }
      ]
    }
  ],
  // Map coordinates for city-level views
  cities: {
    overview: { center: [25, -170], zoom: 3 },
    sfo: { center: [37.75, -122.42], zoom: 12, name: "旧金山" },
    hnl: { center: [21.35, -157.88], zoom: 11, name: "欧胡岛" },
    hilo: { center: [19.60, -155.20], zoom: 10, name: "大岛" }
  },
  // Flight route coordinates for polylines
  flightRoutes: [
    { from: [22.3080, 113.9185], to: [37.6213, -122.3790], label: "HKG→SFO" },
    { from: [37.6213, -122.3790], to: [21.3187, -157.9225], label: "SFO→HNL" },
    { from: [21.3187, -157.9225], to: [19.7204, -155.0483], label: "HNL→ITO" },
    { from: [19.7204, -155.0483], to: [21.3187, -157.9225], label: "ITO→HNL" },
    { from: [21.3187, -157.9225], to: [37.5665, 126.9780], label: "HNL→ICN" },
    { from: [37.5665, 126.9780], to: [22.3080, 113.9185], label: "ICN→HKG" }
  ]
};
```

**Step 3: Verify**

Run: `open index.html` in browser
Expected: Blank page with no console errors. Leaflet CSS/JS loads from CDN.

---

### Task 2: CSS Layout + Header

**Files:**
- Modify: `index.html` (the `<style>` block and `<header>`)

**Step 1: Write the CSS for two-panel responsive layout**

Replace the `<style>` placeholder with complete CSS:

```css
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif;
  background: #f5f5f0;
  color: #2c2c2c;
}

#trip-header {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: white;
  padding: 20px 24px;
  text-align: center;
}
#trip-header h1 { font-size: 1.5rem; margin-bottom: 4px; }
#trip-header .date-range { font-size: 0.95rem; opacity: 0.8; margin-bottom: 12px; }
#trip-header .badges { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
#trip-header .badge {
  background: rgba(255,255,255,0.15);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
}

#app {
  display: flex;
  height: calc(100vh - 90px);
}

#map-panel {
  width: 40%;
  min-width: 300px;
  position: relative;
}
#map-panel #map { height: 100%; width: 100%; }
#map-panel .overview-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  background: white;
  border: 2px solid rgba(0,0,0,0.2);
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 0.85rem;
  font-family: inherit;
}

#itinerary-panel {
  width: 60%;
  overflow-y: auto;
  padding: 20px;
}

/* Mobile */
@media (max-width: 768px) {
  #app { flex-direction: column; height: auto; }
  #map-panel { width: 100%; height: 45vh; min-width: unset; }
  #itinerary-panel { width: 100%; height: auto; padding: 16px; }
}
```

**Step 2: Build the header HTML**

```html
<header id="trip-header">
  <h1>旧金山 + 夏威夷 9日行程</h1>
  <div class="date-range">2025年5月1日 – 5月10日</div>
  <div class="badges">
    <span class="badge">✈️ 6 趟航班</span>
    <span class="badge">🏨 4 间酒店</span>
    <span class="badge">🚗 3 次租车</span>
  </div>
</header>
```

**Step 3: Add map container div inside map-panel**

```html
<div id="map-panel">
  <button class="overview-btn" onclick="showOverview()">🌏 全览</button>
  <div id="map"></div>
</div>
```

**Step 4: Verify**

Run: `open index.html`
Expected: Dark header with title/badges, two side-by-side panels (left empty map area, right empty). On mobile viewport: stacked layout.

---

### Task 3: Summary Tables (Flight / Hotel / Rental / Checklist)

**Files:**
- Modify: `index.html` (add CSS for summary tables + JS to render them)

**Step 1: Add CSS for summary section**

```css
.summary-section {
  margin-bottom: 24px;
}
.summary-section h2 {
  font-size: 1.1rem;
  margin-bottom: 12px;
  padding-bottom: 6px;
  border-bottom: 2px solid #e0e0e0;
}
.summary-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  margin-bottom: 16px;
}
.summary-table th {
  background: #f0f0ea;
  text-align: left;
  padding: 8px 10px;
  font-weight: 600;
}
.summary-table td {
  padding: 8px 10px;
  border-bottom: 1px solid #eee;
}
.checklist { list-style: none; padding: 0; }
.checklist li {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
  font-size: 0.85rem;
}
.checklist li::before { content: "☐ "; color: #999; }
```

**Step 2: Write JS function to render summary section**

```javascript
function renderSummary() {
  const panel = document.getElementById('itinerary-panel');

  // Flights table
  let html = '<div class="summary-section"><h2>✈️ 机票总览</h2><table class="summary-table"><tr><th>日期</th><th>航班</th><th>航线</th><th>时间</th></tr>';
  TRIP_DATA.flights.forEach(f => {
    html += `<tr><td>${f.date}</td><td>${f.code}</td><td>${f.from} → ${f.to}</td><td>${f.depart} → ${f.arrive}</td></tr>`;
  });
  html += '</table></div>';

  // Hotels table
  html += '<div class="summary-section"><h2>🏨 酒店总览</h2><table class="summary-table"><tr><th>日期</th><th>酒店</th><th>备注</th></tr>';
  TRIP_DATA.hotels.forEach(h => {
    html += `<tr><td>${h.dates}（${h.nights}晚）</td><td>${h.name}</td><td>${h.note || ''}</td></tr>`;
  });
  html += '</table></div>';

  // Car rentals table
  html += '<div class="summary-section"><h2>🚗 租车总览</h2><table class="summary-table"><tr><th>日期</th><th>地点</th><th>详情</th></tr>';
  TRIP_DATA.carRentals.forEach(c => {
    html += `<tr><td>${c.date}</td><td>${c.location}</td><td>${c.detail}</td></tr>`;
  });
  html += '</table></div>';

  // Booking checklist
  html += '<div class="summary-section"><h2>📋 订购清单</h2><ul class="checklist">';
  TRIP_DATA.bookingChecklist.forEach(item => {
    html += `<li>${item}</li>`;
  });
  html += '</ul></div>';

  // Day cards placeholder
  html += '<div id="day-cards"></div>';

  panel.innerHTML = html;
}

renderSummary();
```

**Step 3: Verify**

Run: Refresh browser
Expected: Right panel shows 4 summary sections with formatted tables and checklist. Data matches detail.txt.

---

### Task 4: Collapsible Day Cards with Timeline

**Files:**
- Modify: `index.html` (add CSS for day cards + JS to render them)

**Step 1: Add CSS for day cards and timeline**

```css
.day-card {
  background: white;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  overflow: hidden;
}
.day-card-header {
  padding: 14px 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  user-select: none;
}
.day-card-header .day-num {
  font-size: 1.5rem;
  font-weight: 700;
  min-width: 48px;
}
.day-card-header .day-info { flex: 1; }
.day-card-header .day-title { font-weight: 600; font-size: 0.95rem; }
.day-card-header .day-date { font-size: 0.8rem; opacity: 0.6; }
.day-card-header .expand-icon {
  font-size: 1.2rem;
  transition: transform 0.2s;
}
.day-card.open .expand-icon { transform: rotate(180deg); }

.day-card-badges {
  padding: 0 18px 8px 78px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.tag {
  font-size: 0.72rem;
  padding: 2px 8px;
  border-radius: 10px;
  white-space: nowrap;
}
.tag-flight { background: #e8f4fd; color: #1976d2; }
.tag-hotel { background: #fef3e2; color: #e65100; }
.tag-car { background: #e8f5e9; color: #2e7d32; }

.day-card-body {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}
.day-card.open .day-card-body { max-height: 2000px; }

.timeline {
  padding: 8px 18px 18px 18px;
  margin-left: 36px;
  border-left: 2px solid #e0e0e0;
}
.timeline-item {
  position: relative;
  padding: 6px 0 6px 24px;
  font-size: 0.85rem;
  cursor: default;
}
.timeline-item::before {
  content: '';
  position: absolute;
  left: -7px;
  top: 12px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: white;
  border: 2px solid #ccc;
}
.timeline-item.has-location { cursor: pointer; }
.timeline-item.has-location:hover { background: #f8f8f5; border-radius: 6px; }
.timeline-item .tl-time {
  font-weight: 600;
  color: #666;
  min-width: 90px;
  display: inline-block;
}
.timeline-item .tl-name { color: #333; }
```

**Step 2: Write JS function to render day cards**

```javascript
function renderDayCards() {
  const container = document.getElementById('day-cards');
  let html = '';

  TRIP_DATA.days.forEach(day => {
    const badges = [];
    if (day.flight) badges.push(`<span class="tag tag-flight">✈️ ${day.flight.code} ${day.flight.from}→${day.flight.to}</span>`);
    if (day.hotel) badges.push(`<span class="tag tag-hotel">🏨 ${day.hotel}</span>`);
    if (day.carRental) badges.push(`<span class="tag tag-car">🚗 ${day.carRental}</span>`);

    let timeline = '';
    day.activities.forEach((a, i) => {
      const hasLoc = a.lat ? 'has-location' : '';
      const timeStr = a.end ? `${a.time}–${a.end}` : a.time;
      const dataAttrs = a.lat ? `data-lat="${a.lat}" data-lng="${a.lng}" data-day="${day.id}"` : '';
      timeline += `<div class="timeline-item ${hasLoc}" ${dataAttrs}><span class="tl-time">${timeStr}</span><span class="tl-name">${a.name}</span></div>`;
    });

    html += `
      <div class="day-card" id="card-${day.id}" data-region="${day.region}" style="border-left: 4px solid ${day.color}">
        <div class="day-card-header" onclick="toggleCard('${day.id}')">
          <span class="day-num" style="color:${day.color}">D${day.day}</span>
          <div class="day-info">
            <div class="day-title">${day.title}</div>
            <div class="day-date">${day.date} ${day.weekday}</div>
          </div>
          <span class="expand-icon">▼</span>
        </div>
        ${badges.length ? `<div class="day-card-badges">${badges.join('')}</div>` : ''}
        <div class="day-card-body">
          <div class="timeline">${timeline}</div>
        </div>
      </div>`;
  });

  container.innerHTML = html;
}

function toggleCard(dayId) {
  const card = document.getElementById('card-' + dayId);
  const wasOpen = card.classList.contains('open');
  // Close all
  document.querySelectorAll('.day-card').forEach(c => c.classList.remove('open'));
  if (!wasOpen) {
    card.classList.add('open');
    // Zoom map to this day's region
    const region = card.dataset.region;
    zoomToRegion(region, dayId);
  } else {
    showOverview();
  }
}

renderDayCards();
```

**Step 3: Verify**

Run: Refresh browser
Expected: 9 collapsible day cards below summary tables. Each has colored left border, day number, title, date, badges. Clicking expands to show timeline. Clicking again collapses.

---

### Task 5: Leaflet Map with City Markers + Flight Routes

**Files:**
- Modify: `index.html` (add map initialization JS)

**Step 1: Initialize the Leaflet map**

```javascript
// Initialize map
const map = L.map('map', {
  center: [25, -170],
  zoom: 3,
  zoomControl: true,
  worldCopyJump: true
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap',
  maxZoom: 18
}).addTo(map);
```

**Step 2: Add city-level markers**

```javascript
const cityMarkers = {};
const cityCoords = {
  hkg: { lat: 22.3080, lng: 113.9185, name: "香港", color: "#666" },
  sfo: { lat: 37.6213, lng: -122.3790, name: "旧金山", color: "#E8913A" },
  hnl: { lat: 21.3187, lng: -157.9225, name: "檀香山", color: "#2E86AB" },
  hilo: { lat: 19.7204, lng: -155.0483, name: "希洛", color: "#A23B34" },
  icn: { lat: 37.5665, lng: 126.9780, name: "首尔", color: "#666" }
};

Object.entries(cityCoords).forEach(([key, c]) => {
  const icon = L.divIcon({
    className: 'city-marker',
    html: `<div style="background:${c.color};color:white;padding:4px 8px;border-radius:12px;font-size:12px;white-space:nowrap;font-weight:600;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${c.name}</div>`,
    iconSize: null,
    iconAnchor: [30, 15]
  });
  cityMarkers[key] = L.marker([c.lat, c.lng], { icon }).addTo(map);
});
```

**Step 3: Draw flight route polylines (curved dashed lines)**

Use a simple midpoint-offset approach for curved lines:

```javascript
function getCurvedPoints(from, to, numPoints) {
  const points = [];
  const midLat = (from[0] + to[0]) / 2;
  const midLng = (from[1] + to[1]) / 2;
  // Handle wrapping for transpacific routes
  let lngDiff = to[1] - from[1];
  if (Math.abs(lngDiff) > 180) {
    // Go the other way around
    if (lngDiff > 0) lngDiff -= 360;
    else lngDiff += 360;
  }
  const actualMidLng = from[1] + lngDiff / 2;
  const dist = Math.sqrt(Math.pow(to[0] - from[0], 2) + Math.pow(lngDiff, 2));
  const offset = dist * 0.15;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const lat = from[0] + (to[0] - from[0]) * t + Math.sin(Math.PI * t) * offset;
    const lng = from[1] + lngDiff * t;
    points.push([lat, lng]);
  }
  return points;
}

TRIP_DATA.flightRoutes.forEach(route => {
  const points = getCurvedPoints(route.from, route.to, 50);
  L.polyline(points, {
    color: '#555',
    weight: 2,
    dashArray: '8, 6',
    opacity: 0.6
  }).addTo(map);
});
```

**Step 4: Add CSS for custom map markers**

```css
.city-marker { background: transparent; border: none; }
.activity-pin {
  width: 10px; height: 10px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 1px 4px rgba(0,0,0,0.3);
}
```

**Step 5: Verify**

Run: Refresh browser
Expected: Pacific-centered map showing city markers (HKG, SFO, HNL, Hilo, ICN) connected by dashed curved lines. Map is interactive (zoom/pan).

---

### Task 6: Activity Markers + Day Filtering

**Files:**
- Modify: `index.html` (add activity marker logic + filtering)

**Step 1: Create activity marker layer groups per day**

```javascript
const dayLayers = {};
const allActivityMarkers = L.layerGroup().addTo(map);

TRIP_DATA.days.forEach(day => {
  const layerGroup = L.layerGroup();
  dayLayers[day.id] = layerGroup;

  day.activities.forEach(a => {
    if (!a.lat) return;
    const pinColor = day.color;
    const icon = L.divIcon({
      className: 'activity-pin-wrap',
      html: `<div class="activity-pin" style="background:${pinColor}"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
    const marker = L.marker([a.lat, a.lng], { icon });
    const timeStr = a.end ? `${a.time}–${a.end}` : a.time;
    marker.bindPopup(`<b>${a.name}</b><br>${timeStr}`);
    layerGroup.addLayer(marker);
  });
});
```

**Step 2: Implement zoomToRegion and showOverview functions**

```javascript
function showOverview() {
  // Remove all day layers
  Object.values(dayLayers).forEach(l => map.removeLayer(l));
  const ov = TRIP_DATA.cities.overview;
  map.setView(ov.center, ov.zoom);
  // Show all city markers
  Object.values(cityMarkers).forEach(m => m.addTo(map));
  // Deselect all cards
  document.querySelectorAll('.day-card').forEach(c => c.classList.remove('active'));
}

function zoomToRegion(region, dayId) {
  // Remove all day layers first
  Object.values(dayLayers).forEach(l => map.removeLayer(l));
  // Add this day's layer
  if (dayLayers[dayId]) {
    dayLayers[dayId].addTo(map);
  }
  const city = TRIP_DATA.cities[region];
  if (city) {
    map.setView(city.center, city.zoom, { animate: true });
  }
  // Highlight active card
  document.querySelectorAll('.day-card').forEach(c => c.classList.remove('active'));
  const card = document.getElementById('card-' + dayId);
  if (card) card.classList.add('active');
}
```

**Step 3: Make timeline items clickable (highlight pin on map)**

```javascript
document.addEventListener('click', function(e) {
  const item = e.target.closest('.timeline-item.has-location');
  if (!item) return;
  const lat = parseFloat(item.dataset.lat);
  const lng = parseFloat(item.dataset.lng);
  const dayId = item.dataset.day;

  // Ensure day layer is shown
  if (dayLayers[dayId] && !map.hasLayer(dayLayers[dayId])) {
    Object.values(dayLayers).forEach(l => map.removeLayer(l));
    dayLayers[dayId].addTo(map);
  }

  map.setView([lat, lng], 14, { animate: true });

  // Open popup for nearest marker
  dayLayers[dayId].eachLayer(marker => {
    if (marker.getLatLng && marker.getLatLng().lat === lat && marker.getLatLng().lng === lng) {
      marker.openPopup();
    }
  });
});
```

**Step 4: Add active card CSS**

```css
.day-card.active { box-shadow: 0 0 0 2px #1976d2, 0 2px 8px rgba(25,118,210,0.2); }
```

**Step 5: Verify**

Run: Refresh browser
Expected:
- Click D1 card → map zooms to San Francisco, shows D1 activity pins
- Click D7 card → map zooms to Big Island, shows volcano pins
- Click a timeline item with location → map zooms to that exact spot, popup opens
- Click "全览" → map zooms back out to Pacific view

---

### Task 7: Polish — Colors, Typography, Mobile, Scroll Behavior

**Files:**
- Modify: `index.html` (final CSS/JS tweaks)

**Step 1: Add smooth scroll behavior when clicking day cards on mobile**

```javascript
// In toggleCard function, add scroll-into-view for mobile
function toggleCard(dayId) {
  const card = document.getElementById('card-' + dayId);
  const wasOpen = card.classList.contains('open');
  document.querySelectorAll('.day-card').forEach(c => c.classList.remove('open'));
  if (!wasOpen) {
    card.classList.add('open');
    const region = card.dataset.region;
    zoomToRegion(region, dayId);
    // Smooth scroll on mobile
    if (window.innerWidth <= 768) {
      setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  } else {
    showOverview();
  }
}
```

**Step 2: Add region color accents to timeline dots**

Update timeline-item::before to inherit day color:

```css
.day-card[style*="E8913A"] .timeline-item.has-location::before { border-color: #E8913A; }
.day-card[style*="2E86AB"] .timeline-item.has-location::before { border-color: #2E86AB; }
.day-card[style*="A23B34"] .timeline-item.has-location::before { border-color: #A23B34; }
```

Or better, apply via inline style in JS when rendering.

**Step 3: Add print-friendly styles**

```css
@media print {
  #map-panel { display: none; }
  #itinerary-panel { width: 100%; }
  .day-card { break-inside: avoid; }
  .day-card-body { max-height: none !important; }
}
```

**Step 4: Auto-open D1 on page load**

```javascript
// At end of script
toggleCard('d1');
```

**Step 5: Verify**

Run: Refresh browser + test on mobile viewport (DevTools)
Expected:
- D1 auto-opens on load, map zooms to SF
- Mobile: map on top, itinerary scrollable below
- Timeline dots match day color
- Print preview shows all days expanded, no map

---

### Task 8: Final Review + File Cleanup

**Files:**
- Review: `index.html`

**Step 1: Open in browser and test all interactions**

Test checklist:
- [ ] Header displays correctly with badges
- [ ] Summary tables show all flights, hotels, rentals, checklist
- [ ] All 9 day cards open/close correctly
- [ ] Map shows all city markers and flight routes on load
- [ ] Clicking each day card zooms map to correct city
- [ ] Activity pins appear for each day
- [ ] Clicking timeline items zooms and opens popup
- [ ] "全览" button resets to Pacific view
- [ ] Mobile layout works (stacked)
- [ ] No console errors

**Step 2: Verify data accuracy against detail.txt**

Spot-check:
- Flight times match
- Hotel names match
- Activity times and names match for D1, D5, D7

**Step 3: Check file size**

Run: `ls -lh index.html`
Expected: Under 50KB
