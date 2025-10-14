import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='flex flex-col gap-y-8'>
      <h1><b>ResumeWise</b> click count: {count}</h1>
      <div className='flex w-full justify-center gap-x-12 items-center'>
        <button onClick={() => setCount(count+1)}>Click here to increment</button>
        <button onClick={() => {if (count>0) setCount(count-1)}}>Click here to decrement</button>
      </div>
    </div>
  )
}

export default App
