import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import {GoogleReCaptchaProvider} from "react-google-recaptcha-v3";
import { HelmetProvider } from "react-helmet-async";


createRoot(document.getElementById("root")!).render(
    <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}>
        <HelmetProvider>
            <App />
        </HelmetProvider>
    </GoogleReCaptchaProvider>
);
