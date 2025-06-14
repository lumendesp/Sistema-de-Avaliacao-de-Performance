import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './index.css'
import viteLogo from '/vite.svg'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-500 text-gray-800 font-sans">
      <div className="flex gap-8 mb-6">
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="h-16 hover:scale-110 transition-transform" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="h-16 hover:scale-110 transition-transform" alt="React logo" />
        </a>
      </div>

      <h1 className="text-4xl font-bold mb-4">Vite + React + Tailwind</h1>

      <div className="bg-white shadow-md rounded px-8 py-6 mb-4 text-center">
        <button
          onClick={() => setCount((count) => count + 1)}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          count is {count}
        </button>
        <p className="mt-4 text-sm text-gray-600">
          Edit <code className="bg-gray-200 px-1 rounded">src/App.tsx</code> and save to test HMR
        </p>
      </div>

      <p className="text-sm text-gray-500 mt-2">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App
