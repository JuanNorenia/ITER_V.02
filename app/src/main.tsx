import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import { LocaleProvider } from '@/providers/LocaleProvider'
import './index.css'
import { TRPCProvider } from "@/providers/trpc"
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <LocaleProvider>
        <TRPCProvider>
          <App />
        </TRPCProvider>
      </LocaleProvider>
    </HashRouter>
  </StrictMode>,
)
