# CloudSync 待辦事項 Web 應用

測試更新

## 專案簡介
CloudSync 是一個基於 Spring Boot（後端）、React（前端）、Firebase（雲端同步與認證）的跨平台待辦事項管理系統。支援桌面瀏覽器與 Android PWA，整合 Google 帳號登入與 Google 日曆同步。

## 主要功能
- Google 帳號登入（OAuth2）
- 待辦事項 CRUD（新增、查看、修改、刪除）
- 到期提醒（含推播）
- Google 日曆事件同步
- 跨平台同步（Web/PWA）

## 技術棧
- 前端：React, TypeScript, Material-UI, Redux, FullCalendar
- 後端：Spring Boot, Java, Firebase Admin SDK
- 其他：PWA、Google OAuth2、Google Calendar API