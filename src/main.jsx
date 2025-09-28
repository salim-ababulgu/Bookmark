import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/globals.css'
import './api/extensionApi.js'
import './api/mockServer.js'

console.log('🚀 Main.jsx loaded - CSS should be imported');

// Initialiser le mode sombre au démarrage
const initializeDarkMode = () => {
  const saved = localStorage.getItem('darkMode');
  const isDarkMode = saved ? JSON.parse(saved) : false;
  document.documentElement.classList.toggle('dark', isDarkMode);
  console.log('🎨 Dark mode initialized:', isDarkMode);
};

initializeDarkMode();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)