import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import { ThemeProvider } from './app/ThemeProvider';
import { registerServiceWorker } from './app/registerSW';
import './styles/index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('No se encontró el elemento raíz #root.');
}

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);

// Registrar el Service Worker tras montar la app (offline-first, R5.1/R5.2).
// Es defensivo: no hace nada en entornos sin Service Worker.
void registerServiceWorker();
