import React from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import { AuthProvider } from './features/auth/AuthProvider'
import ReactDOM from 'react-dom/client'
import App from './App'

import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ChakraProvider>
  </React.StrictMode>,
)
