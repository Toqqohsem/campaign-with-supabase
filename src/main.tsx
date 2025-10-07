import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { supabase } from './utils/supabaseClient.ts';

// Optional: Log to console to confirm Supabase client is available
console.log('Supabase client initialized:', supabase);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
