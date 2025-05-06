import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from './App';
import { store } from './store';
// import theme from './theme'; // 移除舊的 theme 引入，因為 App.tsx 會處理 ThemeProvider
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      {/* ThemeProvider 已移至 App.tsx，這裡不再需要 */}
      {/* <CssBaseline />  CssBaseline 也已移至 App.tsx */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
