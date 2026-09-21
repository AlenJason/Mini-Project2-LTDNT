import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { defineCustomElements } from '@ionic/pwa-elements/loader'
import './index.css'
import App from './App.tsx'

if (Capacitor.isNativePlatform()) {
  StatusBar.setStyle({ style: Style.Default }).catch(() => {})
} else {
  // Provides the action-sheet/camera-modal UI that @capacitor/camera's web
  // fallback needs — without this, Camera.getPhoto() hangs forever on web.
  defineCustomElements(window)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
