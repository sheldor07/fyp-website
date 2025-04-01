"use client";

import { useState } from 'react';

export default function ProjectSearch() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [supervisor, setSupervisor] = useState('');
  const [isJointOrURECA, setIsJointOrURECA] = useState(false);
  const [topK, setTopK] = useState(20);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const params = new URLSearchParams({
        query: query.trim(),
        top: topK.toString()
      });
      
      if (category) params.append('category', category);
      if (type) params.append('type', type);
      if (supervisor) params.append('supervisor', supervisor);
      if (isJointOrURECA) params.append('joint', 'true');
      
      // Call API
      const response = await fetch(`/api/projects/search?${params.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to search projects');
      }
      
      setResults(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">FYP Project Search</h1>
      
      <form onSubmit={handleSearch} className="mb-8 space-y-4">
        <div>
          <label htmlFor="query" className="block mb-1 font-medium">
            Search Query:
          </label>
          <input
            id="query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="E.g., machine learning for image processing"
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block mb-1 font-medium">
              Category:
            </label>
            <input
              id="category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Optional"
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label htmlFor="type" className="block mb-1 font-medium">
              Type:
            </label>
            <input
              id="type"
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="Optional"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="supervisor" className="block mb-1 font-medium">
              Supervisor:
            </label>
            <input
              id="supervisor"
              type="text"
              value={supervisor}
              onChange={(e) => setSupervisor(e.target.value)}
              placeholder="Optional"
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label htmlFor="topK" className="block mb-1 font-medium">
              Number of Results:
            </label>
            <input
              id="topK"
              type="number"
              min="1"
              max="100"
              value={topK}
              onChange={(e) => setTopK(parseInt(e.target.value, 10))}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        
        <div className="flex items-center">
          <input
            id="jointURECA"
            type="checkbox"
            checked={isJointOrURECA}
            onChange={(e) => setIsJointOrURECA(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="jointURECA">
            Show only Joint/URECA projects
          </label>
        </div>
        
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search Projects'}
        </button>
      </form>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {results.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Found {results.length} matching projects:
          </h2>
          
          <div className="space-y-6">
            {results.map((project) => (
              <div 
                key={project.projectNo} 
                className="border rounded p-4 hover:shadow-md"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium">
                    {project.title}
                  </h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
                    Score: {project.score.toFixed(4)}
                  </span>
                </div>
                
                <div className="mt-2 text-sm text-gray-700">
                  <p><strong>Project No:</strong> {project.projectNo}</p>
                  <p><strong>Supervisor:</strong> {project.supervisor}</p>
                  <p><strong>Category:</strong> {project.category}</p>
                  <p><strong>Type:</strong> {project.type}</p>
                  <p><strong>Keywords:</strong> {project.keywords.join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {results.length === 0 && !loading && !error && query && (
        <p className="text-gray-500">No projects found matching your criteria.</p>
      )}
    </div>
  );
}