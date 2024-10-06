import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
// BootstrapVue 설치

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import '@/assets/Common.css'; // Common.css 파일의 경로를 맞게 수정

// 애플리케이션 인스턴스 생성 및 설정
createApp(App)
  .use(router)         // 라우터 설정 추가
  .mount('#app');      // 애플리케이션을 #app 요소에 마운트
