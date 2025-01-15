// import axios from 'axios';

// const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_APP_URL,
//   withCredentials: true, // Allows cookies to be sent with requests
// });

// // Function to fetch and set the CSRF token
// export const initializeCsrf = async () => {
//   await api.get('/sanctum/csrf-cookie'); // Fetch and set CSRF token cookie
// };

// export default api;

import Cookies from 'js-cookie';

export const setCookie = (key, value, options = {}) => {
  Cookies.set(key, value, options);
};

export const getCookie = (key) => {
  return Cookies.get(key);
};

export const removeCookie = (key) => {
  Cookies.remove(key);
};
