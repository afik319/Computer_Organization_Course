import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App.jsx';
import '@/index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

const CLIENT_ID = "997527215580-7h2pv2s2j68ojfqsgf41re9l8e959j0f.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
);
