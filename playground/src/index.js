import React from 'react';
import { createRoot } from 'react-dom/client'; // Nouvelle API
import 'semantic-ui-css/semantic.min.css';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

// On récupère l'élément du DOM
const container = document.getElementById('root');

// On crée la racine (root) et on rend l'application
const root = createRoot(container); 
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Service workers
serviceWorker.unregister();
