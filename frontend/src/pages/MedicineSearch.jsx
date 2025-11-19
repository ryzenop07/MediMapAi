import { useState } from "react";
import axios from "axios";

export default function MedicineSearch() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");

  const handleSearch = async () => {
    const res = await axios.get(`http://localhost:5000/api/ai/suggest?query=${query}`);
    setResult(res.data.suggestions);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">AI Medicine Suggestion</h1>
      <input
        type="text"
        className="border p-2 rounded w-full"
        placeholder="Enter medicine name..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded mt-2">
        Search
      </button>
      <pre className="bg-gray-100 p-3 mt-4 whitespace-pre-wrap">{result}</pre>
    </div>
  );
}
