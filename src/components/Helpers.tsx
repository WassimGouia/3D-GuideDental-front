// import { AUTH_TOKEN } from "@/components/Constant";

// export const getToken = () => {
//   return localStorage.getItem(AUTH_TOKEN);
// };

// export const setToken = (token: string) => {
//   if (token) {
//     localStorage.setItem(AUTH_TOKEN, token);
//   }
// };

// export const removeToken = () => {
//   localStorage.removeItem(AUTH_TOKEN);
// };


import Cookies from 'js-cookie';
import { AUTH_TOKEN } from "@/components/Constant";

export const getToken = () => {
  return Cookies.get(AUTH_TOKEN);
};

export const setToken = (token: string) => {
  if (token) {
    Cookies.set(AUTH_TOKEN, token, { expires: 7 });
  }
};

export const removeToken = () => {
  Cookies.remove(AUTH_TOKEN);
};
