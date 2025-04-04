"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  CheckSquare,
  Square,
  Info,
  User,
  Tag,
  FileText,
  Award,
  Sliders,
  Bookmark,
  BookmarkCheck,
  Eye,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import posthog from "posthog-js";

// Data for dropdowns
const supervisors = [
  "A/P A S Madhukumar",
  "A/P Alexei Sourin",
  "A/P Anupam Chattopadhyay",
  "A/P Arvind Easwaran",
  "A/P Chan Syin",
  "A/P Chee Wei Tan",
  "A/P Cheong Kang Hao",
  "A/P Chia Liang Tien",
  "A/P Daniel Paulin",
  "A/P Deepu Rajan",
  "A/P Goh Wooi Boon",
  "A/P He Ying",
  "A/P Hui Siu Cheung",
  "A/P Ke Yiping, Kelly",
  "A/P Kong Wai Kin Adams",
  "A/P Kwoh Chee Keong",
  "A/P Lam Siew Kei",
  "A/P Lee Bu Sung",
  "A/P Li Boyang",
  "A/P Li Yi",
  "A/P Lin Guosheng",
  "A/P Liu Weichen",
  "A/P Liu Ziwei",
  "A/P Long Cheng",
  "A/P Lu Shijian",
  "A/P Melanie Herschel Weis",
  "A/P Qian Kemao",
  "A/P Sourav Saha Bhowmick",
  "A/P Sun Aixin",
  "A/P Tan Rui",
  "A/P Tang Xueyan",
  "A/P Vun Chan Hua, Nicholas",
  "A/P W. K. Ng",
  "A/P Xiong Jie",
  "A/P Yeo Chai Kiat",
  "A/P Yu Han",
  "A/P Zhang Hanwang",
  "Ast/P Chan Guo Wei Alvin",
  "Ast/P Chan Wei Ting, Samantha",
  "Ast/P Conrad Watt",
  "Ast/P Dmitrii Ustiugov",
  "Ast/P Dong Wei",
  "Ast/P Fan Xiuyi",
  "Ast/P Luo Siqiang",
  "Ast/P Luu Anh Tuan",
  "Ast/P Pan Xingang",
  "Ast/P Timothy van Bremen",
  "Ast/P Wang Wenya",
  "Ast/P Wang Yong",
  "Ast/P Zhang Mengmi",
  "Ast/P Zhao Jun",
  "Dr Huang Shell Ying",
  "Dr Josephine Chong Leng Leng",
  "Dr Li Fang",
  "Dr Liu Siyuan",
  "Dr Loke Yuan Ren",
  "Dr Owen Noel Newton Fernando",
  "Dr Shen Zhiqi",
  "Dr Smitha K G",
  "Dr Tan Wen Jun",
  "Dr Tay Kian Boon",
  "Dr Vidya Sudarshan",
  "Dr Zhang Jiehuang",
  "Mr Oh Hong Lye",
  "Mr Ong Chin Ann",
  "Mr Tan Yong Kiam",
  "Prof Bo An",
  "Prof Cai Wentong",
  "Prof Cham Tat Jen",
  "Prof Chen Change Loy",
  "Prof Chng Eng Siong",
  "Prof Dusit Niyato",
  "Prof Erik Cambria",
  "Prof Jagath Chandana Rajapakse",
  "Prof Lin Weisi",
  "Prof Liu Yang",
  "Prof Miao Chun Yan",
  "Prof Ong Yew Soon",
  "Prof Zhang Jie",
  "Prof Zheng Jianmin",
];

const categories = [
  "",
  "Hardware & Software (Mostly Hardware)",
  "Hardware & Software (Mostly Software)",
  "Hardware Only",
  "Software Only",
];

const keywords = [
  "Artificial Intelligence",
  "Bioinformatics",
  "Biomedical Systems",
  "Blockchain",
  "Cloud Computing",
  "Computational Biology",
  "Computer Animation/ Games",
  "Computer Architecture",
  "Computer Graphics",
  "Computer Networks",
  "Computer vision, Image processing and Pattern recognition",
  "Cyber Security",
  "Data Analytics",
  "Data Mining",
  "Data Security",
  "Data Structure and Algorithms",
  "Database Systems",
  "Digital Systems",
  "Discrete Math",
  "Distributed Computing Systems",
  "Field Programmable Gate Arrays (FPGA)",
  "Gamification",
  "Graph Theory",
  "Hardware Acceleration",
  "High-Performance Computing",
  "Human Computer Interaction",
  "Image Analysis & Processing",
  "Information Retrieval/ Processing",
  "Knowledge Representation/ Ontology",
  "Logic and Formal Methods",
  "Low-power Computing",
  "Machine Learning",
  "Medical Informatics",
  "Microprocessor-based Systems",
  "Mixed Reality",
  "Mobile Applications",
  "Multimedia Systems",
  "Natural Language Processing/ Text Mining",
  "Operating Systems",
  "Parallel Computing",
  "Program Analysis and Optimization",
  "Programming Languages & Systems",
  "Real-Time / Embedded Systems",
  "Robotics",
  "Sensor Networks",
  "Serious Games",
  "Smartphone Systems and Applications",
  "Social Networks",
  "Software and Applications",
  "System Security",
  "System on-Chip",
  "Systems Biology",
  "Theory & Algorithms",
  "Ubiquitous/ Pervasive Computing",
  "Video/Audio/Speech Processing",
  "Virtual Reality",
  "Visual Computing",
  "Web-based Applications",
  "Wireless and Mobile Networks",
  "e-Commerce",
  "e-Learning",
];

const types = [
  "",
  "Design & Implementation",
  "Others (please describe in project)",
  "Research & Development",
];

export default function ProjectSearch() {
  // Form state
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [supervisor, setSupervisor] = useState("");
  const [isJointOrURECA, setIsJointOrURECA] = useState(false);
  const [topK, setTopK] = useState(100);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [filteredKeywords, setFilteredKeywords] = useState([]);

  // UI state
  const [isSupervisorDropdownOpen, setIsSupervisorDropdownOpen] =
    useState(false);
  const [filteredSupervisors, setFilteredSupervisors] = useState(supervisors);
  const [supervisorSearch, setSupervisorSearch] = useState("");

  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isKeywordDropdownOpen, setIsKeywordDropdownOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Results state
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("projectNo");
  const [sortDirection, setSortDirection] = useState("asc");
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recentSearches, setRecentSearches] = useState([]);
  const [usingSemantic, setUsingSemantic] = useState(true);
  const [initialFetch, setInitialFetch] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Shortlist state
  const [shortlist, setShortlist] = useState([]);
  const [showShortlist, setShowShortlist] = useState(false);
  
  // Shabdify integration - search limit tracking
  const [searchCount, setSearchCount] = useState(0);
  const [searchLimit, setSearchLimit] = useState(5); // Configurable: number of searches before showing Shabdify
  const [showShabdify, setShowShabdify] = useState(false);
  const [shabdifyTimer, setShabdifyTimer] = useState(30); // Countdown timer in seconds (20s)

  const resultsPerPage = 10;
  const supervisorRef = useRef(null);
  const categoryRef = useRef(null);
  const typeRef = useRef(null);
  const keywordRef = useRef(null);

  // Filter keywords based on input
  useEffect(() => {
    if (keywordInput) {
      const filtered = keywords.filter(
        (k) =>
          k.toLowerCase().includes(keywordInput.toLowerCase()) &&
          !selectedKeywords.includes(k)
      );
      setFilteredKeywords(filtered);
    } else {
      setFilteredKeywords([]);
    }
  }, [keywordInput, selectedKeywords]);

  // Filter supervisors based on search input
  useEffect(() => {
    if (supervisorSearch) {
      const filtered = supervisors.filter((s) =>
        s.toLowerCase().includes(supervisorSearch.toLowerCase())
      );
      setFilteredSupervisors(filtered);
    } else {
      setFilteredSupervisors(supervisors);
    }
  }, [supervisorSearch]);

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
      if (
        supervisorRef.current &&
        !supervisorRef.current.contains(event.target)
      ) {
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

  // Initial load of all projects
  useEffect(() => {
    if (initialFetch) {
      const fetchInitialProjects = async () => {
        setLoading(true);
        try {
          // Build query parameters for initial load
          const params = new URLSearchParams({
            initial: "true",
            top: topK.toString(),
          });

          // Call API
          const response = await fetch(
            `/api/projects/search?${params.toString()}`
          );
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Failed to load projects");
          }

          setResults(data.results || []);
          setTotalCount(data.total || data.results.length);
          setUsingSemantic(data.usingSemantic);
          setCurrentPage(1);

          // For initial load, ensure sort is by project number
          setSortBy("projectNo");
          setSortDirection("asc");
          setHasSearched(false);
        } catch (err) {
          setError(err.message || "An error occurred loading projects");
        } finally {
          setLoading(false);
          setInitialFetch(false);
        }
      };

      fetchInitialProjects();
    }
  }, [initialFetch, topK]);

  // Load recent searches, shortlist, and search count from local storage
  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
    
    const savedShortlist = localStorage.getItem("fypShortlist");
    if (savedShortlist) {
      setShortlist(JSON.parse(savedShortlist));
    }
    
    // Load search count from localStorage
    const savedSearchCount = localStorage.getItem("shabdifySearchCount");
    if (savedSearchCount) {
      setSearchCount(parseInt(savedSearchCount, 10));
    }
  }, []);
  
  // Add window message listener for iframe communication
  useEffect(() => {
    function handleReceivedMessage(event) {
      // Make sure the message is from our Shabdify game
      if (event.origin !== "https://shabdify.com") return;
      
      // Handle message from shabdify iframe
      if (event.data && event.data.type === "gameCompleted") {
        setShowShabdify(false);
        setSearchCount(0); // Reset counter after playing
        localStorage.setItem("shabdifySearchCount", "0");
        // Track game completion in PostHog
        posthog.capture('shabdify_game_completed', event.data);
      }
    }
    
    // Add event listener
    window.addEventListener("message", handleReceivedMessage);
    
    // Remove event listener on cleanup
    return () => {
      window.removeEventListener("message", handleReceivedMessage);
    };
  }, []);
  
  // Timer effect for Shabdify countdown
  useEffect(() => {
    let timer;
    
    // Only run timer when Shabdify is shown
    if (showShabdify && shabdifyTimer > 0) {
      timer = setInterval(() => {
        setShabdifyTimer(prev => prev - 1);
      }, 1000);
    }
    
    // Reset timer when Shabdify is closed
    if (!showShabdify) {
      setShabdifyTimer(20); // Reset to initial value
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showShabdify, shabdifyTimer]);
  
  // Show warning when user is on their last search
  const showLastSearchWarning = searchLimit - searchCount === 1;

  // Search handler - connected to the API
  let handleSearch = async (e) => {
    if (e) e.preventDefault();
    
    // Check if user is performing a search with a query (not just a filter change)
    if (query.trim()) {
      // Increment search count for Shabdify integration
      const newSearchCount = searchCount + 1;
      setSearchCount(newSearchCount);
      localStorage.setItem("shabdifySearchCount", newSearchCount.toString());
      
      // Show Shabdify game if search limit is reached
      if (newSearchCount >= searchLimit && !showShabdify) {
        setShowShabdify(true);
        // Track when search limit is reached
        posthog.capture('shabdify_limit_reached', {
          searchCount: newSearchCount,
          limit: searchLimit
        });
      }
    }

    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams({
        query: query.trim(),
        top: topK.toString(),
      });

      if (category) params.append("category", category);
      if (type) params.append("type", type);
      if (supervisor) params.append("supervisor", supervisor);
      if (isJointOrURECA) params.append("joint", "true");

      if (selectedKeywords.length > 0) {
        // Add keywords to query for better results
        const keywordQuery = selectedKeywords.join(" ");
        params.set("query", `${params.get("query")} ${keywordQuery}`);
      }

      // Capture search event with PostHog
      posthog.capture('project_search', {
        query: query.trim(),
        category: category || null,
        type: type || null,
        supervisor: supervisor || null,
        isJointOrURECA: isJointOrURECA,
        selectedKeywords: selectedKeywords,
        topK: topK
      });

      // Call API
      const response = await fetch(`/api/projects/search?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to search projects");
      }

      setResults(data.results || []);
      setTotalCount(data.total || data.results.length);
      setUsingSemantic(data.usingSemantic);
      setCurrentPage(1);

      // Set hasSearched to true if there was a query
      if (query.trim()) {
        setHasSearched(true);
        // For search results, default sort to relevance
        setSortBy("score");
        setSortDirection("desc");

        // Save to recent searches
        const newSearch = { query, timestamp: new Date().toISOString() };
        const updatedSearches = [
          newSearch,
          ...recentSearches.filter((s) => s.query !== query),
        ].slice(0, 5);
        setRecentSearches(updatedSearches);
        localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
      } else {
        // For initial load or empty query, default sort by project number
        setHasSearched(false);
        setSortBy("projectNo");
        setSortDirection("asc");
      }
    } catch (err) {
      setError(err.message || "An error occurred during search");
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setCategory("");
    setType("");
    setSupervisor("");
    setIsJointOrURECA(false);
    setSelectedKeywords([]);
  };

  const handleKeywordSelect = (keyword) => {
    if (!selectedKeywords.includes(keyword)) {
      setSelectedKeywords([...selectedKeywords, keyword]);
    }
    setKeywordInput("");
    setIsKeywordDropdownOpen(false);
  };

  const handleKeywordRemove = (keyword) => {
    setSelectedKeywords(selectedKeywords.filter((k) => k !== keyword));
  };

  const handleRecentSearchClick = (searchQuery) => {
    // Update the query in the UI
    setQuery(searchQuery);
    // Set hasSearched to true immediately
    setHasSearched(true);

    // Increment search count for predefined prompts
    const newSearchCount = searchCount + 1;
    setSearchCount(newSearchCount);
    localStorage.setItem("shabdifySearchCount", newSearchCount.toString());
    
    // Show Shabdify game if search limit is reached
    if (newSearchCount >= searchLimit && !showShabdify) {
      setShowShabdify(true);
      // Track when search limit is reached
      posthog.capture('shabdify_limit_reached', {
        searchCount: newSearchCount,
        limit: searchLimit,
        source: 'predefined_prompt'
      });
    }

    // Capture event for clicking a recent search
    posthog.capture('recent_search_click', {
      query: searchQuery
    });

    // Create a mock event
    const e = { preventDefault: () => {} };

    // Temporarily override the current query for the search
    const originalHandleSearch = handleSearch;
    handleSearch = async (event) => {
      // Restore the original function
      handleSearch = originalHandleSearch;

      // Call with the specific query
      setLoading(true);
      setError(null);

      try {
        // Build query parameters with the passed searchQuery instead of state
        const params = new URLSearchParams({
          query: searchQuery.trim(),
          top: topK.toString(),
        });

        if (category) params.append("category", category);
        if (type) params.append("type", type);
        if (supervisor) params.append("supervisor", supervisor);
        if (isJointOrURECA) params.append("joint", "true");

        if (selectedKeywords.length > 0) {
          // Add keywords to query for better results
          const keywordQuery = selectedKeywords.join(" ");
          params.set("query", `${params.get("query")} ${keywordQuery}`);
        }

        // Capture search event with PostHog
        posthog.capture('project_search', {
          query: searchQuery.trim(),
          category: category || null,
          type: type || null,
          supervisor: supervisor || null,
          isJointOrURECA: isJointOrURECA,
          selectedKeywords: selectedKeywords,
          topK: topK,
          source: 'recent_search'
        });

        // Call API
        const response = await fetch(
          `/api/projects/search?${params.toString()}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to search projects");
        }

        setResults(data.results || []);
        setTotalCount(data.total || data.results.length);
        setUsingSemantic(data.usingSemantic);
        setCurrentPage(1);

        // For search results, default sort to relevance
        setSortBy("score");
        setSortDirection("desc");

        // Save to recent searches
        const newSearch = {
          query: searchQuery,
          timestamp: new Date().toISOString(),
        };
        const updatedSearches = [
          newSearch,
          ...recentSearches.filter((s) => s.query !== searchQuery),
        ].slice(0, 5);
        setRecentSearches(updatedSearches);
        localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
      } catch (err) {
        setError(err.message || "An error occurred during search");
      } finally {
        setLoading(false);
      }
    };

    // Execute the search
    handleSearch(e);
  };

  const handleSort = (key) => {
    const newDirection = sortBy === key 
      ? (sortDirection === "asc" ? "desc" : "asc")
      : "desc";
      
    // Track sort event
    posthog.capture('result_sort', {
      sortBy: key,
      sortDirection: newDirection
    });
    
    if (sortBy === key) {
      setSortDirection(newDirection);
    } else {
      setSortBy(key);
      setSortDirection(newDirection);
    }
  };

  // Toggle shortlist
  const toggleShortlist = (projectNo) => {
    const isRemoving = shortlist.includes(projectNo);
    
    let updatedShortlist;
    if (isRemoving) {
      updatedShortlist = shortlist.filter((id) => id !== projectNo);
      setShortlist(updatedShortlist);
      // Track removal from shortlist
      posthog.capture('shortlist_remove', {
        projectNo: projectNo
      });
    } else {
      updatedShortlist = [...shortlist, projectNo];
      setShortlist(updatedShortlist);
      // Track addition to shortlist
      posthog.capture('shortlist_add', {
        projectNo: projectNo
      });
    }
    
    // Save to localStorage
    localStorage.setItem("fypShortlist", JSON.stringify(updatedShortlist));
  };

  // Get paginated and sorted results
  const getPaginatedResults = () => {
    // First filter out low similarity projects if we're searching
    const filteredResults =
      query.trim() !== ""
        ? results.filter((project) => project.score >= 0.3)
        : results;

    const sortedResults = [...filteredResults].sort((a, b) => {
      if (sortBy === "title") {
        return sortDirection === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      if (sortBy === "supervisor") {
        return sortDirection === "asc"
          ? a.supervisor.localeCompare(b.supervisor)
          : b.supervisor.localeCompare(a.supervisor);
      }
      if (sortBy === "projectNo") {
        return sortDirection === "asc"
          ? a.projectNo.localeCompare(b.projectNo)
          : b.projectNo.localeCompare(a.projectNo);
      }
      return sortDirection === "asc" ? a.score - b.score : b.score - a.score;
    });

    const startIndex = (currentPage - 1) * resultsPerPage;
    return sortedResults.slice(startIndex, startIndex + resultsPerPage);
  };

  // Filter projects for shortlist view
  const shortlistedProjects = results.filter((project) =>
    shortlist.includes(project.projectNo)
  );

  const totalPages = Math.ceil(
    (query.trim() !== ""
      ? results.filter((p) => p.score >= 0.5).length
      : results.length) / resultsPerPage
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-sm sm:text-base">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
              NTU CCDS FYP Search
            </h1>
            <p className="text-xs sm:text-sm mt-1 text-indigo-100 font-light">
              2025-2026 Final Year Project Selection
            </p>
          </div>
          <div className="flex sm:items-center items-end gap-2">
            <button
              onClick={() => setShowShortlist(!showShortlist)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 sm:px-4 py-2 rounded-full transition-all self-start"
            >
              {showShortlist ? <Eye size={18} /> : <BookmarkCheck size={18} />}
              <span className="hidden sm:inline">
                {showShortlist
                  ? "View All Projects"
                  : `My Shortlist (${shortlist.length})`}
              </span>
              {/* Only show count on mobile */}
              {!showShortlist && (
                <span className="sm:hidden text-xs">{shortlist.length}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto sm:p-4 p-1">
        {!showShortlist && (
          <>
            {/* Search Form */}
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 border border-gray-100">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex flex-col gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search projects (AI, blockchain, vision, I want to break into finance, I am interested in computer security...)"
                        className="w-full p-3 pl-10 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      />
                      <Search
                        className="absolute left-3 top-3.5 text-gray-400"
                        size={18}
                      />
                      
                      {searchLimit - searchCount > 0 && searchLimit - searchCount <= 3 && (
                        <div className="absolute right-24 sm:right-28 top-3 bg-amber-50 border border-amber-200 px-2 py-1 rounded text-xs text-amber-700">
                          {searchLimit - searchCount} search{searchLimit - searchCount !== 1 ? 'es' : ''} remaining
                        </div>
                      )}

                      <button
                        type="submit"
                        className="absolute right-2 top-2 px-2 sm:px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all disabled:bg-indigo-300 flex items-center text-sm"
                        disabled={loading}
                      >
                        <Search
                          size={16}
                          className={loading ? "animate-pulse" : ""}
                        />
                        <span className="hidden sm:inline ml-1">
                          {loading ? "Searching" : "Search"}
                        </span>
                      </button>
                    </div>

                    {/* Last search warning */}
                    {showLastSearchWarning && (
                      <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 flex items-start">
                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5 mr-2 text-amber-600" />
                        <div>
                          <p className="text-sm font-medium">This is your last search</p>
                          <p className="text-xs">After this search, you'll need to play a quick word game to continue searching.</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Sample prompts */}
                    <div className="mt-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 border border-blue-100 rounded-lg shadow-sm">
                      <p className="text-base font-medium text-gray-700 mb-3">
                        ✨ Have a specific career path in mind? Try these
                        queries:
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleRecentSearchClick(
                              "I want to break into finance. Looking for quantitative finance projects with algorithmic trading, financial modeling, risk assessment, and data analysis to build technical skills for investment banks and hedge funds."
                            )
                          }
                          className="text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-2 bg-blue-100 hover:bg-blue-200 rounded-md text-blue-700 transition-all border border-blue-200 shadow-sm hover:shadow font-medium"
                        >
                          Quantitative Finance
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleRecentSearchClick(
                              "Data science projects focusing on statistical modeling, predictive analytics, machine learning pipelines, data visualization, feature engineering, and big data processing to build skills for roles in analytics and business intelligence."
                            )
                          }
                          className="text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-2 bg-cyan-100 hover:bg-cyan-200 rounded-md text-cyan-700 transition-all border border-cyan-200 shadow-sm hover:shadow font-medium"
                        >
                          Data Science
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleRecentSearchClick(
                              "Cybersecurity projects involving threat detection, penetration testing, secure system design, cryptography implementation, network security protocols, and vulnerability assessment to prepare for security engineering roles."
                            )
                          }
                          className="text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 bg-red-100 hover:bg-red-200 rounded-md text-red-700 transition-all border border-red-200 shadow-sm hover:shadow font-medium"
                        >
                          Cybersecurity
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleRecentSearchClick(
                              "Full stack web development with modern JavaScript frameworks, React, Node.js, database design, system architecture, cloud deployment, and API development for creating scalable web applications."
                            )
                          }
                          className="text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-2 bg-green-100 hover:bg-green-200 rounded-md text-green-700 transition-all border border-green-200 shadow-sm hover:shadow font-medium"
                        >
                          Full Stack Dev
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleRecentSearchClick(
                              "Projects for Big Tech Interviews with machine learning, distributed systems, computer vision, algorithm optimization, and large-scale data processing that showcase technical depth and problem-solving abilities."
                            )
                          }
                          className="text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-2 bg-purple-100 hover:bg-purple-200 rounded-md text-purple-700 transition-all border border-purple-200 shadow-sm hover:shadow font-medium"
                        >
                          Big Tech Interview
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleRecentSearchClick(
                              "I have my own startup focusing on software solutions. Need projects with business model validation, user experience design, MVP development, market analysis, and rapid prototyping techniques."
                            )
                          }
                          className="text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-2 bg-teal-100 hover:bg-teal-200 rounded-md text-teal-700 transition-all border border-teal-200 shadow-sm hover:shadow font-medium"
                        >
                          Startup Founder
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleRecentSearchClick(
                              "Generative AI and LLM projects involving prompt engineering, fine-tuning, multimodal systems, RAG architectures, and AI agent development to build cutting-edge applications for emerging GenAI startups."
                            )
                          }
                          className="text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-2 bg-pink-100 hover:bg-pink-200 rounded-md text-pink-700 transition-all border border-pink-200 shadow-sm hover:shadow font-medium"
                        >
                          GenAI Startups
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleRecentSearchClick(
                              "Gaming development projects with game engines, procedural generation, virtual reality, immersive worlds, physics simulation, and game AI for creating innovative interactive experiences."
                            )
                          }
                          className="text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-2 bg-amber-100 hover:bg-amber-200 rounded-md text-amber-700 transition-all border border-amber-200 shadow-sm hover:shadow font-medium"
                        >
                          Gaming & VR
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleRecentSearchClick(
                              "Research-oriented projects in computational biology, graph theory, formal methods, mathematical optimization, natural language understanding, and novel algorithms with publications potential."
                            )
                          }
                          className="text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-2 bg-indigo-100 hover:bg-indigo-200 rounded-md text-indigo-700 transition-all border border-indigo-200 shadow-sm hover:shadow font-medium"
                        >
                          Academic Research
                        </button>
                      </div>
                    </div>

                    {recentSearches.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-2">
                          Recent searches:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {recentSearches.map((search, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() =>
                                handleRecentSearchClick(search.query)
                              }
                              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-all"
                            >
                              {search.query.slice(0, 50) + "..."}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex">
                    <button
                      type="button"
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center justify-center w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all text-sm"
                    >
                      <Filter size={16} className="mr-1" />
                      {showFilters ? "Hide Filters" : "Show Filters"}
                      {activeFilters > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-indigo-500 text-white text-xs rounded-full">
                          {activeFilters}
                        </span>
                      )}
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      {/* Supervisor dropdown */}
                      <div ref={supervisorRef} className="relative">
                        <label
                          htmlFor="supervisor"
                          className="block mb-1 text-sm font-medium text-gray-700"
                        >
                          Supervisor
                        </label>
                        <div
                          className="flex justify-between items-center w-full p-2.5 border border-gray-300 rounded-lg cursor-pointer bg-white"
                          onClick={() =>
                            setIsSupervisorDropdownOpen(
                              !isSupervisorDropdownOpen
                            )
                          }
                        >
                          <span
                            className={
                              supervisor ? "text-gray-900" : "text-gray-400"
                            }
                          >
                            {supervisor || "Select supervisor"}
                          </span>
                          <ChevronDown size={16} className="text-gray-400" />
                        </div>

                        {isSupervisorDropdownOpen && (
                          <div className="absolute z-10 w-full max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-lg mt-1 shadow-lg">
                            <div className="sticky top-0 bg-white p-2 border-b">
                              <div className="relative">
                                <Search
                                  className="absolute left-2 top-2.5 text-gray-400"
                                  size={14}
                                />
                                <input
                                  type="text"
                                  placeholder="Search supervisors..."
                                  className="w-full p-2 pl-7 border border-gray-300 rounded"
                                  value={supervisorSearch}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) =>
                                    setSupervisorSearch(e.target.value)
                                  }
                                />
                              </div>
                            </div>
                            <div className="p-1">
                              <div
                                className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                                onClick={() => {
                                  setSupervisor("");
                                  setSupervisorSearch("");
                                  setIsSupervisorDropdownOpen(false);
                                }}
                              >
                                None
                              </div>
                              {filteredSupervisors.map((s, index) => (
                                <div
                                  key={index}
                                  className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                                  onClick={() => {
                                    setSupervisor(s);
                                    setSupervisorSearch("");
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
                        <label
                          htmlFor="category"
                          className="block mb-1 text-sm font-medium text-gray-700"
                        >
                          Category
                        </label>
                        <div
                          className="flex justify-between items-center w-full p-2.5 border border-gray-300 rounded-lg cursor-pointer bg-white"
                          onClick={() =>
                            setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                          }
                        >
                          <span
                            className={
                              category ? "text-gray-900" : "text-gray-400"
                            }
                          >
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
                        <label
                          htmlFor="type"
                          className="block mb-1 text-sm font-medium text-gray-700"
                        >
                          Type
                        </label>
                        <div
                          className="flex justify-between items-center w-full p-2.5 border border-gray-300 rounded-lg cursor-pointer bg-white"
                          onClick={() =>
                            setIsTypeDropdownOpen(!isTypeDropdownOpen)
                          }
                        >
                          <span
                            className={type ? "text-gray-900" : "text-gray-400"}
                          >
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
                          {isJointOrURECA ? (
                            <CheckSquare
                              size={16}
                              className="text-indigo-500 mr-2"
                            />
                          ) : (
                            <Square size={16} className="text-gray-400 mr-2" />
                          )}
                          <span>Show only Joint/URECA projects</span>
                        </div>
                      </div>

                      {/* Keywords multi-select */}
                      <div
                        ref={keywordRef}
                        className="relative md:col-span-2 lg:col-span-4"
                      >
                        <label
                          htmlFor="keywords"
                          className="block mb-1 text-sm font-medium text-gray-700"
                        >
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
                              placeholder={
                                selectedKeywords.length === 0
                                  ? "Add keywords..."
                                  : ""
                              }
                              className="outline-none flex-grow min-w-[120px] text-sm"
                            />
                          </div>
                        </div>

                        {isKeywordDropdownOpen &&
                          filteredKeywords.length > 0 && (
                            <div className="absolute z-10 w-full max-h-48 overflow-y-auto bg-white border border-gray-300 rounded-lg mt-1 shadow-lg">
                              <div className="p-1">
                                {filteredKeywords
                                  .slice(0, 8)
                                  .map((keyword, idx) => (
                                    <div
                                      key={idx}
                                      className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                                      onClick={() =>
                                        handleKeywordSelect(keyword)
                                      }
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
                        <label
                          htmlFor="topK"
                          className="block mb-1 text-sm font-medium text-gray-700"
                        >
                          Results to show
                        </label>
                        <input
                          id="topK"
                          type="number"
                          min="5"
                          max="100"
                          value={topK}
                          onChange={(e) =>
                            setTopK(parseInt(e.target.value, 10))
                          }
                          className="w-full p-2.5 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Shabdify Game Modal */}
            {showShabdify && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden max-h-screen flex flex-col">
                  {/* Mobile Header (visible on small screens) */}
                  <div className="sm:hidden p-3 bg-indigo-50 border-b border-indigo-100">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <AlertCircle size={18} className="text-indigo-600 mr-2 flex-shrink-0" />
                        <h4 className="font-medium text-indigo-800 text-sm">Play Shabdify to continue searching</h4>
                      </div>
                      {shabdifyTimer > 0 ? (
                        <div className="flex items-center text-xs text-indigo-600">
                          <span>{shabdifyTimer}s</span>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setShowShabdify(false)}
                          className="p-1.5 rounded-full hover:bg-indigo-100"
                        >
                          <X size={18} className="text-indigo-600" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Desktop Header with details (visible on medium screens and up) */}
                  <div className="hidden sm:block p-4 bg-indigo-50 mb-2">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <AlertCircle size={20} className="text-indigo-600 mr-2" />
                        <h4 className="font-medium text-indigo-800">You've reached your search limit!</h4>
                      </div>
                      {shabdifyTimer > 0 ? (
                        <div className="flex items-center text-sm text-indigo-600">
                          <span>Close in {shabdifyTimer}s</span>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setShowShabdify(false)}
                          className="p-2 rounded-full hover:bg-indigo-100"
                        >
                          <X size={20} className="text-indigo-600" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-indigo-700 mb-2">
                      Play and complete Shabdify to get more searches. No shortcuts - you must find all 4 connection rules!
                    </p>
                    <div className="bg-white/100 rounded-lg p-3 text-sm text-indigo-900">
                      <p className="font-medium mb-1">How to play:</p>
                      <ol className="list-decimal pl-4 space-y-1">
                        <li>Group the 16 words into 4 categories (4 words each)</li>
                        <li>Find the connection rule for each category</li>
                        <li>Complete all categories to unlock more searches</li>
                      </ol>
                    </div>
                  </div>

                  <div className="flex-grow overflow-hidden" id="shabdify-game-container">
                    <iframe 
                      src="https://shabdify.com/?source=fyp-search&embed=true"
                      className="w-full min-h-[600px] sm:min-h-[600px] border-0"
                      title="Shabdify Game"
                      id="shabdify-frame"
                    />
                  </div>
                  
                  {/* Mobile Footer (visible on small screens) */}
                  <div className="sm:hidden p-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-t border-indigo-100 flex justify-between items-center">
                    {shabdifyTimer > 0 ? (
                      <span className="text-xs text-gray-500">Please wait {shabdifyTimer}s</span>
                    ) : (
                      <button
                        onClick={() => {
                          setShowShabdify(false);
                          setSearchCount(0); // Reset counter manually
                          localStorage.setItem("shabdifySearchCount", "0");
                          posthog.capture('shabdify_manual_complete');
                        }}
                        className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-all"
                      >
                        Skip & Continue
                      </button>
                    )}
                    
                    <span className="text-xs text-indigo-500">
                      Powered by 
                      <a href="https://shabdify.com" target="_blank" rel="noopener noreferrer" className="ml-1 hover:underline">Shabdify</a>
                    </span>
                  </div>
                  
                  {/* Desktop Footer (visible on medium screens and up) */}
                  <div className="hidden sm:block p-4 bg-gradient-to-r from-indigo-50 to-purple-50 text-center">
                    <p className="text-sm text-indigo-800 mb-3">
                      Enjoy the game? The search limit will reset automatically when you complete it.
                    </p>
                    <div className="flex justify-center">
                      {shabdifyTimer > 0 ? (
                        <button
                          disabled
                          className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed"
                        >
                          Please wait {shabdifyTimer}s to continue
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setShowShabdify(false);
                            setSearchCount(0); // Reset counter manually
                            localStorage.setItem("shabdifySearchCount", "0");
                            posthog.capture('shabdify_manual_complete');
                          }}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                        >
                          Skip & Continue Searching
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Powered by <a href="https://shabdify.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Shabdify</a>
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Error message */}
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                <div className="flex items-center">
                  <Info size={20} className="mr-2 flex-shrink-0" />
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
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                      Showing {getPaginatedResults().length} of {results.length} top matched projects
                    </h2>
                    {query.trim() !== "" &&
                      results.filter((p) => p.score >= 0.5).length === 0 && (
                        <div className="text-red-600 text-sm flex items-center mt-1">
                          <AlertCircle
                            size={14}
                            className="mr-1 flex-shrink-0"
                          />
                          No projects with sufficient relevance found
                        </div>
                      )}
                  </div>

                  <div className="overflow-x-auto">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2 whitespace-nowrap">
                        Sort by:
                      </span>
                      <div className="flex rounded-lg overflow-hidden border border-gray-300">
                        <button
                          type="button"
                          className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium ${
                            sortBy === "projectNo"
                              ? "bg-indigo-600 text-white"
                              : "bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                          onClick={() => handleSort("projectNo")}
                        >
                          Project#{" "}
                          {sortBy === "projectNo" &&
                            (sortDirection === "asc" ? "↑" : "↓")}
                        </button>
                        <button
                          type="button"
                          className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium border-l border-gray-300 ${
                            sortBy === "score"
                              ? "bg-indigo-600 text-white"
                              : "bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                          onClick={() => handleSort("score")}
                        >
                          Relevance{" "}
                          {sortBy === "score" &&
                            (sortDirection === "desc" ? "↓" : "↑")}
                        </button>
                        <button
                          type="button"
                          className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium border-l border-gray-300 ${
                            sortBy === "title"
                              ? "bg-indigo-600 text-white"
                              : "bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                          onClick={() => handleSort("title")}
                        >
                          Title{" "}
                          {sortBy === "title" &&
                            (sortDirection === "desc" ? "↓" : "↑")}
                        </button>
                        <button
                          type="button"
                          className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium border-l border-gray-300 ${
                            sortBy === "supervisor"
                              ? "bg-indigo-600 text-white"
                              : "bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                          onClick={() => handleSort("supervisor")}
                        >
                          Sup.{" "}
                          {sortBy === "supervisor" &&
                            (sortDirection === "desc" ? "↓" : "↑")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  {getPaginatedResults().length > 0 ? (
                    getPaginatedResults().map((project) => {
                      // Check if the project has a score below 0.5 (50%) and is not an initial load
                      const lowSimilarity =
                        project.score < 0.5 && query.trim() !== "";

                      return (
                        <div
                          key={project.projectNo}
                          className={`border rounded-xl overflow-hidden hover:shadow-md transition-all ${
                            lowSimilarity
                              ? "border-orange-200 bg-orange-50"
                              : "border-gray-200"
                          }`}
                        >
                          <div className="p-4">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0">
                              <h3 className="text-base sm:text-lg font-semibold text-indigo-700 mb-1 sm:pr-20 pr-0">
                                {project.title}
                              </h3>
                              <div className="flex items-center space-x-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleShortlist(project.projectNo)
                                  }
                                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                    shortlist.includes(project.projectNo)
                                      ? "bg-pink-100 text-pink-600"
                                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                  }`}
                                >
                                  {shortlist.includes(project.projectNo) ? (
                                    <BookmarkCheck size={18} />
                                  ) : (
                                    <Bookmark size={18} />
                                  )}
                                </button>
                                <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-1.5 rounded-full flex items-center">
                                  <Award className="mr-1" size={12} />
                                  {(project.score * 100).toFixed(0)}% Match
                                </span>
                              </div>
                            </div>

                            {/* Low similarity warning */}
                            {lowSimilarity && (
                              <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-3 rounded my-3 text-sm">
                                <div className="flex items-center">
                                  <AlertCircle
                                    size={16}
                                    className="mr-2 flex-shrink-0"
                                  />
                                  <p>
                                    This project has low similarity to your
                                    search. Try another search term for better
                                    results.
                                  </p>
                                </div>
                              </div>
                            )}

                            <div className="text-sm text-gray-500 mb-3 flex flex-wrap gap-2 sm:gap-4">
                              <span className="flex items-center">
                                <FileText
                                  size={14}
                                  className="mr-1 flex-shrink-0"
                                />
                                {project.projectNo}
                              </span>
                              <span className="flex items-center">
                                <User
                                  size={14}
                                  className="mr-1 flex-shrink-0"
                                />
                                <span className="truncate">
                                  {project.supervisor}
                                </span>
                              </span>
                            </div>

                            {/* Summary - always visible */}
                            <div className="mt-2 mb-4 text-gray-700 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <h4 className="font-medium mb-1">
                                Project Summary:
                              </h4>
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
                              {project.keywords &&
                                project.keywords.map((keyword, idx) => (
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
                                onClick={() =>
                                  toggleShortlist(project.projectNo)
                                }
                                className={`text-sm flex items-center ${
                                  shortlist.includes(project.projectNo)
                                    ? "text-pink-600 hover:text-pink-800"
                                    : "text-gray-600 hover:text-gray-800"
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
                      );
                    })
                  ) : (
                    // No results after filtering by low similarity
                    <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
                      <div className="flex flex-col items-center">
                        <Search size={36} className="text-gray-300 mb-3" />
                        <h3 className="text-lg font-medium text-gray-700 mb-2">
                          No relevant projects found
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                          We couldn't find any projects with sufficient
                          relevance to your search. Try different keywords or
                          adjust your filters.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8 overflow-x-auto">
                    <nav className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className="px-2 sm:px-4 py-2 rounded-md border bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 text-sm"
                      >
                        Prev
                      </button>

                      {/* First page */}
                      {currentPage > 3 && (
                        <>
                          <button
                            type="button"
                            onClick={() => setCurrentPage(1)}
                            className="px-3 sm:px-4 py-2 rounded-md border bg-white text-gray-700 hover:bg-gray-50 text-sm"
                          >
                            1
                          </button>

                          {currentPage > 4 && (
                            <span className="px-1 sm:px-2 py-1 text-gray-500">
                              ...
                            </span>
                          )}
                        </>
                      )}

                      {/* Pages around current page */}
                      {Array.from(
                        { length: Math.min(totalPages, 5) },
                        (_, i) => {
                          let pageNum;
                          if (currentPage <= 3) {
                            // At the beginning
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            // At the end
                            pageNum = totalPages - 4 + i;
                          } else {
                            // In the middle
                            pageNum = currentPage - 2 + i;
                          }

                          // Only display pages within range
                          if (pageNum > 0 && pageNum <= totalPages) {
                            return (
                              <button
                                key={pageNum}
                                type="button"
                                onClick={() => setCurrentPage(pageNum)}
                                className={`px-3 sm:px-4 py-2 rounded-md border text-sm ${
                                  currentPage === pageNum
                                    ? "bg-indigo-600 text-white border-indigo-600"
                                    : "bg-white text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                          return null;
                        }
                      ).filter(Boolean)}

                      {/* Last page */}
                      {currentPage < totalPages - 2 && (
                        <>
                          {currentPage < totalPages - 3 && (
                            <span className="px-1 sm:px-2 py-1 text-gray-500">
                              ...
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => setCurrentPage(totalPages)}
                            className="px-3 sm:px-4 py-2 rounded-md border bg-white text-gray-700 hover:bg-gray-50 text-sm"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="px-2 sm:px-4 py-2 rounded-md border bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 text-sm"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            )}

            {results.length === 0 && !loading && query && !error && (
              <div className="bg-white rounded-lg shadow-md p-6 sm:p-12 text-center">
                <div className="flex flex-col items-center">
                  <Search size={48} className="text-gray-300 mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 mb-2">
                    No projects found
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    We couldn't find any projects that match your search
                    criteria. Try adjusting your filters or using different
                    keywords.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Shortlist View */}
        {showShortlist && (
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-gray-100 mt-2 sm:mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <BookmarkCheck size={20} className="mr-2 text-pink-600" />
                My Shortlisted Projects ({shortlist.length})
              </h2>

              {shortlist.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setShortlist([]);
                    localStorage.removeItem("fypShortlist");
                  }}
                  className="text-red-600 hover:text-red-800 text-sm flex items-center"
                >
                  <X size={14} className="mr-1" />
                  Clear all
                </button>
              )}
            </div>

            {shortlist.length === 0 ? (
              <div className="p-8 sm:p-12 text-center">
                <div className="flex flex-col items-center">
                  <AlertCircle size={48} className="text-gray-300 mb-4" />
                  <h3 className="text-xl font-medium text-gray-700 mb-2">
                    No projects shortlisted
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    You haven't added any projects to your shortlist yet. Browse
                    the project search results and click the bookmark icon to
                    add projects to your shortlist.
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
              <div className="space-y-5">
                {results
                  .filter((project) => shortlist.includes(project.projectNo))
                  .map((project) => (
                    <div
                      key={project.projectNo}
                      className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all"
                    >
                      <div className="p-4 sm:p-5">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0">
                          <h3 className="text-base sm:text-lg font-semibold text-indigo-700 mb-1 sm:pr-20 pr-0">
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

                        <div className="text-sm text-gray-500 mb-3 flex flex-wrap gap-2 sm:gap-4">
                          <span className="flex items-center">
                            <FileText
                              size={14}
                              className="mr-1 flex-shrink-0"
                            />
                            {project.projectNo}
                          </span>
                          <span className="flex items-center">
                            <User size={14} className="mr-1 flex-shrink-0" />
                            <span className="truncate">
                              {project.supervisor}
                            </span>
                          </span>
                        </div>

                        {/* Summary */}
                        <div className="mt-2 mb-4 text-gray-700 text-sm bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-100">
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
                          {project.keywords &&
                            project.keywords.map((keyword, idx) => (
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
