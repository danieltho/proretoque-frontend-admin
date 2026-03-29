import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n/i18n'
import './index.css'
import { IconContext } from '@phosphor-icons/react'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <IconContext.Provider value={{ size: '24', weight: 'light' }}>
        <Toaster reverseOrder containerStyle={{ top: 90 }} position="top-right" />
        <App />
      </IconContext.Provider>
    </BrowserRouter>
  </StrictMode>,
)
