import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router'
import { AuthProvider } from './context/AuthContext'
import { ModeProvider } from './context/ModeContext'
import { API_BASE_URL } from './api/config'

const keepAlive = () => {
  fetch(`${API_BASE_URL}/health`, { mode: 'no-cors', cache: 'no-store' }).catch(() => {})
}

keepAlive()
setInterval(keepAlive, 8 * 60 * 1000)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ModeProvider>
          <App />
        </ModeProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)