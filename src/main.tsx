import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('[Boot] Mounting app');
createRoot(document.getElementById("root")!).render(<App />);
