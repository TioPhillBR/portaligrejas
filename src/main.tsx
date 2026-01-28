import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Build version logging for cache debugging
const BUILD_VERSION = import.meta.env.VITE_BUILD_TIMESTAMP || 'dev';
console.log(`%c[Portal Igrejas] Build: ${BUILD_VERSION}`, 'color: #1E40AF; font-weight: bold;');
console.log(`%c[Portal Igrejas] Supabase URL: ${import.meta.env.VITE_SUPABASE_URL ? '✅ Configured' : '❌ Missing'}`, 
  import.meta.env.VITE_SUPABASE_URL ? 'color: green' : 'color: red');

// Validate Supabase config before rendering
if (!import.meta.env.VITE_SUPABASE_URL) {
  console.error('[Portal Igrejas] CRITICAL: VITE_SUPABASE_URL is not configured!');
  console.error('[Portal Igrejas] This usually means environment variables were not injected during build.');
  console.error('[Portal Igrejas] Please ensure VITE_SUPABASE_URL is set in your deployment environment.');
}

createRoot(document.getElementById("root")!).render(<App />);
