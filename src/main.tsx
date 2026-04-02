import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BlinkProvider, BlinkAuthProvider } from '@blinkdotnew/react'
import { BlinkUIProvider, Toaster } from '@blinkdotnew/ui'
import App from './App'
import './index.css'

const queryClient = new QueryClient()

function getProjectId(): string {
  const envId = import.meta.env.VITE_BLINK_PROJECT_ID
  if (envId) return envId
  const hostname = window.location.hostname
  const match = hostname.match(/^([^.]+)\.sites\.blink\.new$/)
  if (match) return match[1]
  return 'deepresear-ai-toolkit-gcvm28e5'
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BlinkProvider 
        projectId={getProjectId()}
        publishableKey={import.meta.env.VITE_BLINK_PUBLISHABLE_KEY}
      >
        <BlinkAuthProvider>
          <BlinkUIProvider theme="linear" darkMode="system">
            <Toaster />
            <App />
          </BlinkUIProvider>
        </BlinkAuthProvider>
      </BlinkProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
