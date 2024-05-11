import axios from 'axios';

const api = axios.create({
  baseURL: 'http://14.96.15.148/palgeoapi/',
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

api.interceptors.request.use(
  config => {
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

export const LoginApi = async () => {
  try {
    const response = await api.post('api/MobileApp/PalgeoRegister');
    return response;
  } catch (error) {
    throw error;
  }
};
