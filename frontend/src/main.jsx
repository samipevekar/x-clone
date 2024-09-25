import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// Import the register function from vite-plugin-pwa
import { registerSW } from 'virtual:pwa-register';

// Register the service worker
registerSW({
  onNeedRefresh() {
    console.log('New content available; please refresh.');
  },
  onOfflineReady() {
    console.log('App is ready to work offline.');
  },
});

const queryClient = new QueryClient({
  defaultOptions:{
    queries:{
      refetchOnWindowFocus:false
    }
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
    <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
    </BrowserRouter>
  // </React.StrictMode>,
)



