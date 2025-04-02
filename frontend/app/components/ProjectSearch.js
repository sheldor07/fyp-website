"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, ChevronDown, CheckSquare, Square, 
         Info, User, Tag, FileText, Award, Sliders, 
         Bookmark, BookmarkCheck, Eye, AlertCircle, RefreshCw } from 'lucide-react';

// Data for dropdowns
const supervisors = [
  "A/P A S Madhukumar", "A/P Alexei Sourin", "A/P Anupam Chattopadhyay", "A/P Arvind Easwaran",
  "A/P Chan Syin", "A/P Chee Wei Tan", "A/P Cheong Kang Hao", "A/P Chia Liang Tien",
  "A/P Daniel Paulin", "A/P Deepu Rajan", "A/P Goh Wooi Boon", "A/P He Ying",
  "A/P Hui Siu Cheung", "A/P Ke Yiping, Kelly", "A/P Kong Wai Kin Adams", "A/P Kwoh Chee Keong",
  "A/P Lam Siew Kei", "A/P Lee Bu Sung", "A/P Li Boyang", "A/P Li Yi", "A/P Lin Guosheng",
  "A/P Liu Weichen", "A/P Liu Ziwei", "A/P Long Cheng", "A/P Lu Shijian", "A/P Melanie Herschel Weis",
  "A/P Qian Kemao", "A/P Sourav Saha Bhowmick", "A/P Sun Aixin", "A/P Tan Rui", "A/P Tang Xueyan",
  "A/P Vun Chan Hua, Nicholas", "A/P W. K. Ng", "A/P Xiong Jie", "A/P Yeo Chai Kiat", "A/P Yu Han",
  "A/P Zhang Hanwang", "Ast/P Chan Guo Wei Alvin", "Ast/P Chan Wei Ting, Samantha", "Ast/P Conrad Watt",
  "Ast/P Dmitrii Ustiugov", "Ast/P Dong Wei", "Ast/P Fan Xiuyi", "Ast/P Luo Siqiang",
  "Ast/P Luu Anh Tuan", "Ast/P Pan Xingang", "Ast/P Timothy van Bremen", "Ast/P Wang Wenya",
  "Ast/P Wang Yong", "Ast/P Zhang Mengmi", "Ast/P Zhao Jun", "Dr Huang Shell Ying",
  "Dr Josephine Chong Leng Leng", "Dr Li Fang", "Dr Liu Siyuan", "Dr Loke Yuan Ren",
  "Dr Owen Noel Newton Fernando", "Dr Shen Zhiqi", "Dr Smitha K G", "Dr Tan Wen Jun",
  "Dr Tay Kian Boon", "Dr Vidya Sudarshan", "Dr Zhang Jiehuang", "Mr Oh Hong Lye",
  "Mr Ong Chin Ann", "Mr Tan Yong Kiam", "Prof Bo An", "Prof Cai Wentong", "Prof Cham Tat Jen",
  "Prof Chen Change Loy", "Prof Chng Eng Siong", "Prof Dusit Niyato", "Prof Erik Cambria",
  "Prof Jagath Chandana Rajapakse", "Prof Lin Weisi", "Prof Liu Yang", "Prof Miao Chun Yan",
  "Prof Ong Yew Soon", "Prof Zhang Jie", "Prof Zheng Jianmin"
];

const categories = [
  "", "Hardware & Software (Mostly Hardware)", "Hardware & Software (Mostly Software)",
  "Hardware Only", "Software Only"
];

const keywords = [
  "Artificial Intelligence", "Bioinformatics", "Biomedical Systems", "Blockchain", "Cloud Computing",
  "Computational Biology", "Computer Animation/ Games", "Computer Architecture", "Computer Graphics",
  "Computer Networks", "Computer vision, Image processing and Pattern recognition", "Cyber Security",
  "Data Analytics", "Data Mining", "Data Security", "Data Structure and Algorithms", "Database Systems",
  "Digital Systems", "Discrete Math", "Distributed Computing Systems", "Field Programmable Gate Arrays (FPGA)",
  "Gamification", "Graph Theory", "Hardware Acceleration", "High-Performance Computing",
  "Human Computer Interaction", "Image Analysis & Processing", "Information Retrieval/ Processing",
  "Knowledge Representation/ Ontology", "Logic and Formal Methods", "Low-power Computing",
  "Machine Learning", "Medical Informatics", "Microprocessor-based Systems", "Mixed Reality",
  "Mobile Applications", "Multimedia Systems", "Natural Language Processing/ Text Mining",
  "Operating Systems", "Parallel Computing", "Program Analysis and Optimization",
  "Programming Languages & Systems", "Real-Time / Embedded Systems", "Robotics", "Sensor Networks",
  "Serious Games", "Smartphone Systems and Applications", "Social Networks", "Software and Applications",
  "System Security", "System on-Chip", "Systems Biology", "Theory & Algorithms",
  "Ubiquitous/ Pervasive Computing", "Video/Audio/Speech Processing", "Virtual Reality",
  "Visual Computing", "Web-based Applications", "Wireless and Mobile Networks", "e-Commerce", "e-Learning"
];

const types = [
  "", "Design & Implementation", "Others (please describe in project)", "Research & Development"
];

export default function ProjectSearch() {
  // Form state
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [supervisor, setSupervisor] = useState('');
  const [isJointOrURECA, setIsJointOrURECA] = useState(false);
  const [topK, setTopK] = useState(20);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [filteredKeywords, setFilteredKeywords] = useState([]);
  
  // UI state
  const [isSupervisorDropdownOpen, setIsSupervisorDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isKeywordDropdownOpen, setIsKeywordDropdownOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  
  // Results state
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('score');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [recentSearches, setRecentSearches] = useState([]);
  
  // Shortlist state
  const [shortlist, setShortlist] = useState([]);
  const [showShortlist, setShowShortlist] = useState(false);
  
  const resultsPerPage = 5;
  const supervisorRef = useRef(null);
  const categoryRef = useRef(null);
  const typeRef = useRef(null);
  const keywordRef = useRef(null);

  // Filter keywords based on input
  useEffect(() => {
    if (keywordInput) {
      const filtered = keywords.filter(
        k => k.toLowerCase().includes(keywordInput.toLowerCase()) && !selectedKeywords.includes(k)
      );
      setFilteredKeywords(filtered);
    } else {
      setFilteredKeywords([]);
    }
  }, [keywordInput, selectedKeywords]);

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (category) count++;
    if (type) count++;
    if (supervisor) count++;
    if (isJointOrURECA) count++;
    if (selectedKeywords.length > 0) count++;
    setActiveFilters(count);
  }, [category, type, supervisor, isJointOrURECA, selectedKeywords]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (supervisorRef.current && !supervisorRef.current.contains(event.target)) {
        setIsSupervisorDropdownOpen(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
      if (typeRef.current && !typeRef.current.contains(event.target)) {
        setIsTypeDropdownOpen(false);
      }
      if (keywordRef.current && !keywordRef.current.contains(event.target)) {
        setIsKeywordDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Load recent searches from local storage
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  // Search handler - connected to the API
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    
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
      
      if (selectedKeywords.length > 0) {
        // Add keywords to query for better results
        const keywordQuery = selectedKeywords.join(' ');
        params.set('query', `${params.get('query')} ${keywordQuery}`);
      }
      
      // Call API
      const response = await fetch(`/api/projects/search?${params.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to search projects');
      }
      
      setResults(data.results || []);
      setCurrentPage(1);
      
      // Save to recent searches
      const newSearch = { query, timestamp: new Date().toISOString() };
      const updatedSearches = [newSearch, ...recentSearches.filter(s => s.query !== query)].slice(0, 5);
      setRecentSearches(updatedSearches);
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    } catch (err) {
      setError(err.message || 'An error occurred during search');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setCategory('');
    setType('');
    setSupervisor('');
    setIsJointOrURECA(false);
    setSelectedKeywords([]);
  };

  const handleKeywordSelect = (keyword) => {
    if (!selectedKeywords.includes(keyword)) {
      setSelectedKeywords([...selectedKeywords, keyword]);
    }
    setKeywordInput('');
    setIsKeywordDropdownOpen(false);
  };

  const handleKeywordRemove = (keyword) => {
    setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
  };

  const handleRecentSearchClick = (searchQuery) => {
    setQuery(searchQuery);
    // Auto-search when clicking a recent search
    setTimeout(() => {
      const e = { preventDefault: () => {} };
      handleSearch(e);
    }, 0);
  };

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDirection('desc');
    }
  };

  // Toggle shortlist
  const toggleShortlist = (projectNo) => {
    if (shortlist.includes(projectNo)) {
      setShortlist(shortlist.filter(id => id !== projectNo));
    } else {
      setShortlist([...shortlist, projectNo]);
    }
  };

  // Get paginated and sorted results
  const getPaginatedResults = () => {
    const sortedResults = [...results].sort((a, b) => {
      if (sortBy === 'title') {
        return sortDirection === 'asc' 
          ? a.title.localeCompare(b.title) 
          : b.title.localeCompare(a.title);
      }
      if (sortBy === 'supervisor') {
        return sortDirection === 'asc' 
          ? a.supervisor.localeCompare(b.supervisor) 
          : b.supervisor.localeCompare(a.supervisor);
      }
      return sortDirection === 'asc' ? a.score - b.score : b.score - a.score;
    });
    
    const startIndex = (currentPage - 1) * resultsPerPage;
    return sortedResults.slice(startIndex, startIndex + resultsPerPage);
  };

  // Filter projects for shortlist view
  const shortlistedProjects = results.filter(project => shortlist.includes(project.projectNo));

  const totalPages = Math.ceil(results.length / resultsPerPage);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 text-white p-5 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">NTU CCDS FYP Search</h1>
            <p className="text-sm mt-1 text-indigo-100 font-light">2025-2026 Final Year Project Selection</p>
          </div>
          
          <button 
            onClick={() => setShowShortlist(!showShortlist)} 
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full transition-all self-start"
          >
            {showShortlist ? <Eye size={18} /> : <BookmarkCheck size={18} />}
            {showShortlist ? 'View All Projects' : `My Shortlist (${shortlist.length})`}
          </button>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto p-4 md:p-6">
        {!showShortlist && (
          <>
            {/* Search Form */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for projects (e.g., artificial intelligence, blockchain, computer vision...)"
                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        required
                      />
                      <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    </div>
                    
                    {recentSearches.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Recent searches:</p>
                        <div className="flex flex-wrap gap-2">
                          {recentSearches.map((search, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleRecentSearchClick(search.query)}
                              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-all"
                            >
                              {search.query}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                    >
                      <Filter size={18} className="mr-1" />
                      Filters
                      {activeFilters > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-indigo-500 text-white text-xs rounded-full">
                          {activeFilters}
                        </span>
                      )}
                    </button>
                    
                    <button
                      type="submit"
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all disabled:bg-indigo-300"
                      disabled={loading}
                    >
                      {loading ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                </div>
                
                {/* Advanced filters */}
                {showFilters && (
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-gray-700 flex items-center">
                        <Sliders size={16} className="mr-2" />
                        Advanced Filters
                      </h3>
                      
                      {activeFilters > 0 && (
                        <button
                          type="button"
                          onClick={handleClearFilters}
                          className="text-sm text-red-600 hover:text-red-800 flex items-center"
                        >
                          <RefreshCw size={14} className="mr-1" />
                          Clear all filters
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Supervisor dropdown */}
                      <div ref={supervisorRef} className="relative">
                        <label htmlFor="supervisor" className="block mb-1 text-sm font-medium text-gray-700">
                          Supervisor
                        </label>
                        <div
                          className="flex justify-between items-center w-full p-2.5 border border-gray-300 rounded-lg cursor-pointer bg-white"
                          onClick={() => setIsSupervisorDropdownOpen(!isSupervisorDropdownOpen)}
                        >
                          <span className={supervisor ? "text-gray-900" : "text-gray-400"}>
                            {supervisor || "Select supervisor"}
                          </span>
                          <ChevronDown size={16} className="text-gray-400" />
                        </div>
                        
                        {isSupervisorDropdownOpen && (
                          <div className="absolute z-10 w-full max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-lg mt-1 shadow-lg">
                            <div className="sticky top-0 bg-white p-2 border-b">
                              <input
                                type="text"
                                placeholder="Search supervisors..."
                                className="w-full p-2 border border-gray-300 rounded"
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  const val = e.target.value.toLowerCase();
                                  // This would filter the list in a real implementation
                                }}
                              />
                            </div>
                            <div className="p-1">
                              <div 
                                className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                                onClick={() => {
                                  setSupervisor('');
                                  setIsSupervisorDropdownOpen(false);
                                }}
                              >
                                None
                              </div>
                              {supervisors.map((s, index) => (
                                <div 
                                  key={index}
                                  className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                                  onClick={() => {
                                    setSupervisor(s);
                                    setIsSupervisorDropdownOpen(false);
                                  }}
                                >
                                  {s}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Category dropdown */}
                      <div ref={categoryRef} className="relative">
                        <label htmlFor="category" className="block mb-1 text-sm font-medium text-gray-700">
                          Category
                        </label>
                        <div
                          className="flex justify-between items-center w-full p-2.5 border border-gray-300 rounded-lg cursor-pointer bg-white"
                          onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                        >
                          <span className={category ? "text-gray-900" : "text-gray-400"}>
                            {category || "Select category"}
                          </span>
                          <ChevronDown size={16} className="text-gray-400" />
                        </div>
                        
                        {isCategoryDropdownOpen && (
                          <div className="absolute z-10 w-full max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-lg mt-1 shadow-lg">
                            <div className="p-1">
                              {categories.map((c, index) => (
                                <div 
                                  key={index}
                                  className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                                  onClick={() => {
                                    setCategory(c);
                                    setIsCategoryDropdownOpen(false);
                                  }}
                                >
                                  {c || "None"}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Type dropdown */}
                      <div ref={typeRef} className="relative">
                        <label htmlFor="type" className="block mb-1 text-sm font-medium text-gray-700">
                          Type
                        </label>
                        <div
                          className="flex justify-between items-center w-full p-2.5 border border-gray-300 rounded-lg cursor-pointer bg-white"
                          onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                        >
                          <span className={type ? "text-gray-900" : "text-gray-400"}>
                            {type || "Select type"}
                          </span>
                          <ChevronDown size={16} className="text-gray-400" />
                        </div>
                        
                        {isTypeDropdownOpen && (
                          <div className="absolute z-10 w-full max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-lg mt-1 shadow-lg">
                            <div className="p-1">
                              {types.map((t, index) => (
                                <div 
                                  key={index}
                                  className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                                  onClick={() => {
                                    setType(t);
                                    setIsTypeDropdownOpen(false);
                                  }}
                                >
                                  {t || "None"}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Joint/URECA checkbox */}
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Project Type
                        </label>
                        <div 
                          className="flex items-center p-2.5 border border-gray-300 rounded-lg cursor-pointer bg-white"
                          onClick={() => setIsJointOrURECA(!isJointOrURECA)}
                        >
                          {isJointOrURECA ? 
                            <CheckSquare size={16} className="text-indigo-500 mr-2" /> : 
                            <Square size={16} className="text-gray-400 mr-2" />
                          }
                          <span>Show only Joint/URECA projects</span>
                        </div>
                      </div>
                      
                      {/* Keywords multi-select */}
                      <div ref={keywordRef} className="relative md:col-span-2 lg:col-span-4">
                        <label htmlFor="keywords" className="block mb-1 text-sm font-medium text-gray-700">
                          Keywords
                        </label>
                        <div className="border border-gray-300 rounded-lg bg-white p-2 min-h-[42px]">
                          <div className="flex flex-wrap gap-2">
                            {selectedKeywords.map((keyword, idx) => (
                              <span 
                                key={idx} 
                                className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-1 rounded-full inline-flex items-center"
                              >
                                {keyword}
                                <X 
                                  size={12} 
                                  className="ml-1.5 cursor-pointer" 
                                  onClick={() => handleKeywordRemove(keyword)}
                                />
                              </span>
                            ))}
                            <input
                              type="text"
                              value={keywordInput}
                              onChange={(e) => {
                                setKeywordInput(e.target.value);
                                setIsKeywordDropdownOpen(true);
                              }}
                              onFocus={() => setIsKeywordDropdownOpen(true)}
                              placeholder={selectedKeywords.length === 0 ? "Add keywords..." : ""}
                              className="outline-none flex-grow min-w-[120px] text-sm"
                            />
                          </div>
                        </div>
                        
                        {isKeywordDropdownOpen && filteredKeywords.length > 0 && (
                          <div className="absolute z-10 w-full max-h-48 overflow-y-auto bg-white border border-gray-300 rounded-lg mt-1 shadow-lg">
                            <div className="p-1">
                              {filteredKeywords.slice(0, 8).map((keyword, idx) => (
                                <div 
                                  key={idx}
                                  className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                                  onClick={() => handleKeywordSelect(keyword)}
                                >
                                  {keyword}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Results per page */}
                      <div>
                        <label htmlFor="topK" className="block mb-1 text-sm font-medium text-gray-700">
                          Results to show
                        </label>
                        <input
                          id="topK"
                          type="number"
                          min="5"
                          max="100"
                          value={topK}
                          onChange={(e) => setTopK(parseInt(e.target.value, 10))}
                          className="w-full p-2.5 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
            
            {/* Error message */}
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                <div className="flex items-center">
                  <Info size={20} className="mr-2" />
                  <p>{error}</p>
                </div>
              </div>
            )}
            
            {/* Loading state */}
            {loading && (
              <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            )}
            
            {/* Results */}
            {results.length > 0 && !loading && (
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Found {results.length} projects
                  </h2>
                  
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">Sort by:</span>
                    <div className="flex rounded-lg overflow-hidden border border-gray-300">
                      <button
                        type="button"
                        className={`px-3 py-1.5 text-sm font-medium ${
                          sortBy === 'score' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => handleSort('score')}
                      >
                        Relevance {sortBy === 'score' && (sortDirection === 'desc' ? '↓' : '↑')}
                      </button>
                      <button
                        type="button"
                        className={`px-3 py-1.5 text-sm font-medium border-l border-gray-300 ${
                          sortBy === 'title' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => handleSort('title')}
                      >
                        Title {sortBy === 'title' && (sortDirection === 'desc' ? '↓' : '↑')}
                      </button>
                      <button
                        type="button"
                        className={`px-3 py-1.5 text-sm font-medium border-l border-gray-300 ${
                          sortBy === 'supervisor' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => handleSort('supervisor')}
                      >
                        Supervisor {sortBy === 'supervisor' && (sortDirection === 'desc' ? '↓' : '↑')}
                      </button>
                    </div>
                  </div>
                </div>
                  
                <div className="space-y-6">
                  {getPaginatedResults().map((project) => (
                    <div 
                      key={project.projectNo} 
                      className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all"
                    >
                      <div className="p-5">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-semibold text-indigo-700 mb-1 pr-20">
                            {project.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <button 
                              type="button"
                              onClick={() => toggleShortlist(project.projectNo)}
                              className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                shortlist.includes(project.projectNo) 
                                  ? 'bg-pink-100 text-pink-600' 
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}
                            >
                              {shortlist.includes(project.projectNo) ? 
                                <BookmarkCheck size={18} /> : 
                                <Bookmark size={18} />}
                            </button>
                            <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-1.5 rounded-full flex items-center">
                              <Award className="mr-1" size={12} />
                              Score: {project.score.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-500 mb-3 flex gap-4">
                          <span className="flex items-center">
                            <FileText size={14} className="mr-1" />
                            {project.projectNo}
                          </span>
                          <span className="flex items-center">
                            <User size={14} className="mr-1" />
                            {project.supervisor}
                          </span>
                        </div>
                        
                        {/* Summary - always visible */}
                        <div className="mt-2 mb-4 text-gray-700 text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
                          <h4 className="font-medium mb-1">Project Summary:</h4>
                          <p>{project.summary}</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="bg-slate-100 text-slate-800 text-xs px-2.5 py-1 rounded-full">
                            {project.category}
                          </span>
                          <span className="bg-slate-100 text-slate-800 text-xs px-2.5 py-1 rounded-full">
                            {project.type}
                          </span>
                          {project.isJointOrURECA !== "No" && (
                            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full">
                              Joint/URECA
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-1.5">
                          {project.keywords && project.keywords.map((keyword, idx) => (
                            <span 
                              key={idx} 
                              className="bg-indigo-50 text-indigo-600 text-xs px-2.5 py-1 rounded-full"
                            >
                              <Tag size={10} className="inline mr-1" />
                              {keyword}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex justify-end mt-4">
                          <button
                            type="button"
                            onClick={() => toggleShortlist(project.projectNo)}
                            className={`text-sm flex items-center ${
                              shortlist.includes(project.projectNo) 
                                ? 'text-pink-600 hover:text-pink-800' 
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            {shortlist.includes(project.projectNo) ? (
                              <>Remove from shortlist</>
                            ) : (
                              <>Add to shortlist</>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <nav className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-md border bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-md border ${
                            currentPage === page
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        type="button"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-md border bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            )}
            
            {results.length === 0 && !loading && query && !error && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="flex flex-col items-center">
                  <Search size={48} className="text-gray-300 mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 mb-2">No projects found</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    We couldn't find any projects that match your search criteria. Try adjusting your filters or using different keywords.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Shortlist View */}
        {showShortlist && (
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <BookmarkCheck size={20} className="mr-2 text-pink-600" />
                My Shortlisted Projects ({shortlist.length})
              </h2>
              
              {shortlist.length > 0 && (
                <button 
                  type="button"
                  onClick={() => setShortlist([])}
                  className="text-red-600 hover:text-red-800 text-sm flex items-center"
                >
                  <X size={14} className="mr-1" />
                  Clear all
                </button>
              )}
            </div>
            
            {shortlist.length === 0 ? (
              <div className="p-12 text-center">
                <div className="flex flex-col items-center">
                  <AlertCircle size={48} className="text-gray-300 mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 mb-2">No projects shortlisted</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    You haven't added any projects to your shortlist yet. Browse the project search results and click the bookmark icon to add projects to your shortlist.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowShortlist(false)}
                    className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                  >
                    Browse Projects
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {results.filter(project => shortlist.includes(project.projectNo)).map((project) => (
                  <div 
                    key={project.projectNo} 
                    className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all"
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-indigo-700 mb-1 pr-20">
                          {project.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <button 
                            type="button"
                            onClick={() => toggleShortlist(project.projectNo)}
                            className="h-8 w-8 rounded-full flex items-center justify-center bg-pink-100 text-pink-600"
                          >
                            <BookmarkCheck size={18} />
                          </button>
                          <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-1.5 rounded-full flex items-center">
                            <Award className="mr-1" size={12} />
                            Score: {project.score.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-500 mb-3 flex gap-4">
                        <span className="flex items-center">
                          <FileText size={14} className="mr-1" />
                          {project.projectNo}
                        </span>
                        <span className="flex items-center">
                          <User size={14} className="mr-1" />
                          {project.supervisor}
                        </span>
                      </div>
                      
                      {/* Summary */}
                      <div className="mt-2 mb-4 text-gray-700 text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <h4 className="font-medium mb-1">Project Summary:</h4>
                        <p>{project.summary}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="bg-slate-100 text-slate-800 text-xs px-2.5 py-1 rounded-full">
                          {project.category}
                        </span>
                        <span className="bg-slate-100 text-slate-800 text-xs px-2.5 py-1 rounded-full">
                          {project.type}
                        </span>
                        {project.isJointOrURECA !== "No" && (
                          <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full">
                            Joint/URECA
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5">
                        {project.keywords && project.keywords.map((keyword, idx) => (
                          <span 
                            key={idx} 
                            className="bg-indigo-50 text-indigo-600 text-xs px-2.5 py-1 rounded-full"
                          >
                            <Tag size={10} className="inline mr-1" />
                            {keyword}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex justify-end mt-4">
                        <button
                          type="button"
                          onClick={() => toggleShortlist(project.projectNo)}
                          className="text-red-600 hover:text-red-800 text-sm flex items-center"
                        >
                          Remove from shortlist
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}