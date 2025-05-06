# CloudSync 待辦事項 Web 應用

## 專案簡介
CloudSync 是一個基於 Spring Boot（後端）、React（前端）、Firebase（雲端同步與認證）的跨平台待辦事項管理系統。支援桌面瀏覽器與 Android PWA，整合 Google 帳號登入與 Google 日曆同步。

## 主要功能
- Google 帳號登入（OAuth2）
- 待辦事項 CRUD（新增、查看、修改、刪除）
- 到期提醒（含推播）
- Google 日曆事件同步
- 跨平台同步（Web/PWA）

## 技術棧
- 前端：React, TypeScript, Material-UI, Firebase JS SDK
- 後端：Spring Boot, Java, Firebase Admin SDK
- 其他：PWA、Google OAuth2、Google Calendar API

## 專案結構
```
todoList/
├── backend/                # Spring Boot 後端
│   ├── src/main/java/com/cloudsync/todo/
│   │   ├── TodoApplication.java
│   │   ├── config/         # Firebase 設定
│   │   └── model/          # Entity
│   └── src/main/resources/application.properties
├── frontend/               # React 前端
│   ├── public/             # 靜態資源
│   └── src/
│       ├── components/     # UI元件
│       ├── layouts/        # 版型
│       ├── pages/          # 頁面
│       ├── services/       # API/Firebase/Google日曆
│       ├── store/          # Redux 狀態管理
│       └── theme.ts        # 主題設定
├── docs/                   # 文件與規格
│   └── specifications.md
```

## 安裝與啟動

### 前端
```bash
cd frontend
npm install
npm start
```
- 開發環境預設 http://localhost:3000

### 後端
需安裝 JDK 17+
```bash
cd backend
./mvnw spring-boot:run
```
- 預設 API 端點 http://localhost:8080

### Firebase 設定
- 請於 `frontend/.env` 及 `backend/src/main/resources/application.properties` 設定對應的 Firebase 參數

## PWA 支援
- 前端支援安裝為 Android PWA，支援離線瀏覽與推播提醒

## 其他
- Google 日曆整合需於 Google Cloud Console 設定 OAuth2 憑證與 Calendar API
- 詳細規格請見 `docs/specifications.md`

---
本專案適合需要跨裝置同步、Google 生態系整合的待辦事項管理需求。
