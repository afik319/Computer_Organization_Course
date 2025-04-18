import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import { useRef } from 'react';
import { User } from '../api/User.js';

export const useGoogleAuth = () => {
  // משתנה ref ישמור על resolve ו־reject של ההבטחה
  const loginPromiseRef = useRef(null);

  // זהו ה־hook המקורי מ־@react-oauth/google
  const rawLogin = useGoogleLogin({
    ux_mode: 'popup',
    onSuccess: async (tokenResponse) => {
      // אם מישהו ממתין ל־Promise:
      if (loginPromiseRef.current) {
        try {
          const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          });
          const userInfo = await res.json();

          if(userInfo.email){
            const data = await User.login(userInfo.email, userInfo.name);
          }
          else throw new Error("Email is missing from Google response");

          // resolve להבטחה שלנו עם הנתונים
          loginPromiseRef.current.resolve(userInfo);
        } catch (err) {
          // במקרה של שגיאה, נדחה את ההבטחה
          loginPromiseRef.current.reject(err);
        } finally {
          // משחררים את ה־ref
          loginPromiseRef.current = null;
        }
      }
    },
    onError: (err) => {
      // אם הייתה שגיאה עוד לפני fetching
      if (loginPromiseRef.current) {
        loginPromiseRef.current.reject(err);
        loginPromiseRef.current = null;
      }
    },
    scope: 'openid email profile',
  });

  // עוטפים את rawLogin בהבטחה
  const login = () => {
    return new Promise((resolve, reject) => {
      loginPromiseRef.current = { resolve, reject };
      // מפעילים את תהליך הלוגין
      rawLogin();
    });
  };

  // לוגאאוט כרגיל
  const logout = () => {
    googleLogout();
  };

  return { login, logout };
};
