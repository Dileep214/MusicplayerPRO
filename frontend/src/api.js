import axios from 'axios';
import API_URL from './config';

const api = axios.create({
    baseURL: API_URL
});

// Request interceptor for adding the bearer token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
    refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
    refreshSubscribers.map((cb) => cb(token));
    refreshSubscribers = [];
};

// Response interceptor for refreshing the token and handling cold starts
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // 1. Handle Cold Start / Server Sleeping (Render Free Tier)
        if ((!error.response || error.response.status >= 500) && !originalRequest._retryWakeup) {
            originalRequest._retryWakeup = true;
            console.log('📡 Server might be sleeping (Cold Start). Retrying in 3 seconds...');
            await new Promise(resolve => setTimeout(resolve, 3000));
            return api(originalRequest);
        }

        // 2. Handle Token Expiration
        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve) => {
                    subscribeTokenRefresh((token) => {
                        originalRequest._retry = true;
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(api(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refreshToken');

            if (refreshToken) {
                try {
                    const res = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
                    if (res.status === 200) {
                        const { accessToken, refreshToken: newRefreshToken } = res.data;

                        localStorage.setItem('accessToken', accessToken);
                        localStorage.setItem('refreshToken', newRefreshToken);

                        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                        isRefreshing = false;
                        onRefreshed(accessToken);

                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
                    isRefreshing = false;
                    localStorage.clear();
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            } else {
                // No refresh token, force login
                localStorage.clear();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
