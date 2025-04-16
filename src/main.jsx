import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Initialize the app
const root = createRoot(document.getElementById('root'));

// Render the app
root.render(
  <StrictMode>
    <App />
  </StrictMode>
)
