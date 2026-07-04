import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initNativeShell } from './lib/native'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// No-op on web; sets status bar + hides splash on the native iOS/Android builds.
void initNativeShell()
