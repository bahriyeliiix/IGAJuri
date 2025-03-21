// src/api/axiosConfig.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://213.238.181.142/api', // Base URL burada tanımlanıyor
//   baseURL: 'http://213.238.181.142/api', // Base URL burada tanımlanıyor
  timeout: 10000, // İsteğe bağlı: zaman aşımı süresi
});

export default api;