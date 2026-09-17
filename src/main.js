import './style.css';
import { App } from './app/App.js';

const app = document.querySelector('#app');

const cosmosApp = new App({ root: app });

cosmosApp.start().catch((error) => {
  console.error('Failed to start Cosmos Within Reach.', error);
  app.innerHTML = '<p class="fatal-error">应用启动失败，请刷新页面后重试。</p>';
});
