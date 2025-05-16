import axios, { AxiosResponse } from 'axios'
// import { createBrowserHistory } from 'history'
import { addToast } from '@heroui/react'

//创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_MY_URL,
  timeout: 300000, //请求超时时间
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

//请求拦截器
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//响应拦截器
service.interceptors.response.use((response: AxiosResponse) => {
    const res = response.data
    //暂时用不到
    if (res.status === 401) {
      addToast({
        title: '登录权限到期，请重新登录系统后操作，正在自动退出！',
        timeout: 5000,
        color: 'danger',
        onClose: () => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // createBrowserHistory().push('/login');
        }
      })
    } else if (res.status === 403) {
      addToast({
        title: '您没有权限访问该资源',
        color: 'danger'
      })
    } else if (res.status === 400) {
      addToast({
        title: '客户端错误，请检查请求参数',
        color: 'danger'
      })
    } else if (res.status >= 500) {
      addToast({
        title: '服务器错误，请稍后再试',
        color: 'danger'
      })
    }
    return Promise.resolve(response)
  },
  (error) => {
    // 网络错误或无响应情况
    if (error.code === 'ECONNABORTED') {
      addToast({
        title: '请求超时，请检查网络连接',
        color: 'danger',
        timeout: 3000
      });
    } else if (error.message.includes('Network Error')) {
      addToast({
        title: '网络错误，请检查服务器是否启动',
        color: 'danger',
        timeout: 3000
      });
    } else if (error.message.includes('ERR_CONNECTION_REFUSED')) {
      addToast({
        title: '无法连接到服务器，请确认服务是否运行在端口 9000',
        color: 'danger',
        timeout: 3000
      });
    } else {
      // 默认错误提示
      addToast({
        title: '服务器对接失败！请检查服务器',
        color: 'danger',
        timeout: 3000
      });
    }
  }
)

export default service;
