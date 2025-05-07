## 專案目錄結構

```text
├── .vscode
│   ├── extensions.json
│   └── settings.json
├── README.md
├── backend
│   ├── pom.xml
│   ├── src
│   │   └── main
│   │       ├── java
│   │       │   └── com
│   │       │       └── cloudsync
│   │       │           └── todo
│   │       │               ├── TodoApplication.java
│   │       │               ├── config
│   │       │               │   └── FirebaseConfig.java
│   │       │               └── model
│   │       │                   ├── Todo.java
│   │       │                   ├── User.java
│   │       │                   └── UserSettings.java
│   │       └── resources
│   │           ├── application.properties
│   │           └── firebase-service-account.json
│   └── target
│       ├── classes
│       │   ├── application.properties
│       │   ├── com
│       │   │   └── cloudsync
│       │   │       └── todo
│       │   │           ├── TodoApplication.class
│       │   │           ├── config
│       │   │           │   └── FirebaseConfig.class
│       │   │           └── model
│       │   │               ├── Todo.class
│       │   │               ├── User.class
│       │   │               └── UserSettings.class
│       │   └── firebase-service-account.json
│       ├── generated-sources
│       │   └── annotations
│       ├── generated-test-sources
│       │   └── test-annotations
│       └── test-classes
├── docs
│   └── specifications.md
├── frontend
│   ├── .env
│   ├── .env.example
│   ├── package-lock.json
│   ├── package.json
│   ├── public
│   │   ├── favicon.ico
│   │   ├── gapi_test.html
│   │   ├── index.html
│   │   ├── logo192.png
│   │   ├── logo512.png
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── src
│   │   ├── App.css
│   │   ├── App.test.tsx
│   │   ├── App.tsx
│   │   ├── components
│   │   │   ├── AddReminderDialog.tsx
│   │   │   ├── CalendarEventsDisplay.tsx
│   │   │   ├── EditReminderDialog.tsx
│   │   │   ├── GlobalSnackbar.tsx
│   │   │   ├── PrivateRoute.tsx
│   │   │   └── TodoDialog.tsx
│   │   ├── index.css
│   │   ├── index.tsx
│   │   ├── layouts
│   │   │   └── MainLayout.tsx
│   │   ├── logo.svg
│   │   ├── pages
│   │   │   ├── CalendarPage.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── TodoList.tsx
│   │   ├── react-app-env.d.ts
│   │   ├── reportWebVitals.ts
│   │   ├── services
│   │   │   ├── firebase.ts
│   │   │   └── googleCalendarService.ts
│   │   ├── setupTests.ts
│   │   ├── store
│   │   │   ├── index.ts
│   │   │   └── slices
│   │   │       ├── authSlice.ts
│   │   │       ├── todoSlice.ts
│   │   │       └── uiSlice.ts
│   │   ├── theme.ts
│   │   └── types
│   │       └── env.d.ts
│   └── tsconfig.json
├── package-lock.json
├── package.json
├── snapshot.js
└── temp-todo
    ├── README.md
    ├── package-lock.json
    ├── package.json
    ├── public
    │   ├── favicon.ico
    │   ├── index.html
    │   ├── logo192.png
    │   ├── logo512.png
    │   ├── manifest.json
    │   └── robots.txt
    ├── src
    │   ├── App.css
    │   ├── App.test.tsx
    │   ├── App.tsx
    │   ├── index.css
    │   ├── index.tsx
    │   ├── logo.svg
    │   ├── react-app-env.d.ts
    │   ├── reportWebVitals.ts
    │   └── setupTests.ts
    └── tsconfig.json
```

## 函式清單

### frontend\src\services\googleCalendarService.ts
- **signOut()**

### frontend\src\theme.ts
- **getAppTheme(mode: 'light' | 'dark')** - 根據模式創建並匯出主題的函數

### snapshot.js
- **foo(...)**
- **useXxx(...)**

## 依賴清單

## cloudsync-todo-frontend

### devDependencies
```json
{
  "@types/gapi": "^0.0.47",
  "@types/gapi.auth2": "^0.0.61",
  "@types/gapi.client.calendar": "^3.0.12",
  "@types/google.accounts": "^0.0.15",
  "@types/jest": "^27.5.2",
  "@types/node": "^16.18.31",
  "@types/react": "^18.2.6",
  "@types/react-dom": "^18.2.4",
  "typescript": "^4.9.5"
}
```

### dependencies
```json
{
  "@emotion/react": "^11.11.0",
  "@emotion/styled": "^11.11.0",
  "@fullcalendar/core": "^6.1.17",
  "@fullcalendar/daygrid": "^6.1.17",
  "@fullcalendar/interaction": "^6.1.17",
  "@fullcalendar/list": "^6.1.17",
  "@fullcalendar/react": "^6.1.17",
  "@fullcalendar/timegrid": "^6.1.17",
  "@mui/icons-material": "^5.11.16",
  "@mui/material": "^5.13.0",
  "@mui/x-date-pickers": "^5.0.20",
  "@reduxjs/toolkit": "^1.9.5",
  "@testing-library/dom": "^10.4.0",
  "@testing-library/jest-dom": "^6.6.3",
  "@testing-library/react": "^13.4.0",
  "@testing-library/user-event": "^13.5.0",
  "axios": "^1.4.0",
  "date-fns": "^2.30.0",
  "firebase": "^9.22.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-redux": "^8.0.5",
  "react-router-dom": "^6.11.1",
  "react-scripts": "5.0.1",
  "web-vitals": "^2.1.4"
}
```

## todoList

### devDependencies
無

### dependencies
```json
{
  "firebase": "^11.6.1"
}
```

## temp-todo

### devDependencies
無

### dependencies
```json
{
  "@testing-library/dom": "^10.4.0",
  "@testing-library/jest-dom": "^6.6.3",
  "@testing-library/react": "^16.3.0",
  "@testing-library/user-event": "^13.5.0",
  "@types/jest": "^27.5.2",
  "@types/node": "^16.18.126",
  "@types/react": "^19.1.3",
  "@types/react-dom": "^19.1.3",
  "react": "^19.1.0",
  "react-dom": "^19.1.0",
  "react-scripts": "5.0.1",
  "typescript": "^4.9.5",
  "web-vitals": "^2.1.4"
}
```

