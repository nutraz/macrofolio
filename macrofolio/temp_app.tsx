import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold text-blue-600">Macrofolio DApp</h1>
      <p className="mt-4">Frontend is connected!</p>
      <button 
        className="px-4 py-2 bg-green-500 text-white rounded mt-4"
        onClick={() => setCount(count + 1)}
      >
        Count is {count}
      </button>
      <p className="mt-2 text-sm text-gray-500">If you see this, the build is working.</p>
    </div>
  );
}

export default App;
