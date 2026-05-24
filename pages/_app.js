// pages/_app.js
import { AppProvider } from '../context/AppContext'

export default function App({ Component, pageProps }) {
  return (
    <AppProvider>
      <style global jsx>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; }
        input, button, textarea, select { font-family: inherit; }
        a { color: inherit; }
        button { cursor: pointer; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.35); border-radius: 3px; }
        ::selection { background: rgba(45,106,79,0.25); }
      `}</style>
      <Component {...pageProps} />
    </AppProvider>
  )
}
