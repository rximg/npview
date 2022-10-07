import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
app.use(Antd)
app.mount('#app')
