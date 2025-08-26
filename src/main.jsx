import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'

import  ContextProvider  from './Context/context'
import { Toaster } from './components/ui/toaster'
import { Provider } from 'react-redux'
import { store } from './store/store.js'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ContextProvider>
      <Provider store={store} >
    <App />
      </Provider>
    <Toaster/>
    </ContextProvider>
  </BrowserRouter>,
)
