import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster 
        position="top-center" 
        richColors 
        theme="dark"
        toastOptions={{
          style: {
            background: '#0a0a0a',
            border: '1px solid rgba(255,255,255,0.1)',
          }
        }}
      />
    </BrowserRouter>
  </StrictMode>,
)
