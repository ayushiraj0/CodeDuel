import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";                    // <- Tailwind must be imported here
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ProfileProvider } from './context/ProfileDataStore';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || "202210728249-obd5sej8gksiti2j10fu2oa568jj5cpc.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <GoogleOAuthProvider clientId={clientId}>
        <ProfileProvider>
        <App />
        </ProfileProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
