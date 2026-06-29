import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.jsx'
import './index.css'

// TanStack Query client with sensible defaults for a construction management app
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,                    // always refetch when a component mounts
      gcTime: 1000 * 60 * 5,           // cache kept 5 min so back-navigations are instant
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
