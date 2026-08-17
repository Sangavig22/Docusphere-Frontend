import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Users, Building2, Loader, AlertCircle, User, Users2, FileText, Mic } from "lucide-react";
import { request } from "../api/apiClient";
import { normalizeDocumentType } from "../utils/documentUtils";

const AdminGlobalSearch = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);
  const micButtonRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationFrameRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const startAudioAnalyzer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += dataArrayRef.current[i];
        const level = Math.min(100, Math.round(((sum / bufferLength) / 128) * 100));
        
        if (micButtonRef.current) {
          micButtonRef.current.style.boxShadow = `0 0 0 ${Math.max(0, level / 3)}px rgba(239, 68, 68, 0.4)`;
        }
        
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      
      updateLevel();
    } catch (err) {
      console.error("Audio analyzer error:", err);
    }
  };

  const stopAudioAnalyzer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (micButtonRef.current) {
      micButtonRef.current.style.boxShadow = 'none';
    }
  };

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Your browser does not support voice search.");

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setSearchQuery("");
      setIsListening(true);
      startAudioAnalyzer();
    };
    
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      // Strip trailing punctuation if present, often added by speech API
      setSearchQuery(transcript.replace(/[.,!?]$/, ''));
    };

    recognition.onerror = (event) => {
      if (event.error === "no-speech") {
        setError("mic-timeout");
      } else if (event.error !== "aborted") {
        console.error("Speech recognition error:", event.error);
        setError(`Speech recognition failed: ${event.error}`);
      }
      setIsListening(false);
      stopAudioAnalyzer();
    };

    recognition.onend = () => {
      setIsListening(false);
      stopAudioAnalyzer();
      recognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) performSearch(searchQuery);
      else { setResults(null); setError(null); }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async (query) => {
    try {
      setLoading(true);
      setError(null);
      const data = await request(`/admin/search/global?query=${encodeURIComponent(query)}`);

      if (!data) throw new Error("Search failed");

      setResults(data);
    } catch (err) {
      setError(err.message || "Failed to perform search");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const getResultCount = (type) => {
    if (!results) return 0;
    switch (type) {
      case "users":
        return results.users?.length || 0;
      case "teams":
        return results.teams?.length || 0;
      case "documents":
        return results.documents?.length || 0;
      default:
        return (results.users?.length || 0) + (results.teams?.length || 0) + (results.documents?.length || 0);
    }
  };

  const renderResultRow = (index, Icon, bg, fg, title, subtitle, extra = null, onClick = null) => (
    <div 
      key={index} 
      className={`flex items-center p-3 hover:bg-gray-50 rounded border-b border-gray-200 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex-shrink-0 mr-3">
        <div className={`w-10 h-10 ${bg} rounded-full flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${fg}`} />
        </div>
      </div>
      <div className="flex-grow">
        <div className="font-medium text-gray-900">{title}</div>
        <div className="text-sm text-gray-500">{subtitle}</div>
        {extra && <div className="text-xs text-gray-400 mt-1">{extra}</div>}
      </div>
    </div>
  );

  const renderUserResult = (user, index) => 
    renderResultRow(
      index, 
      User, 
      "bg-blue-100", 
      "text-blue-600", 
      user.fullName, 
      user.email, 
      `Role: ${user.role || "USER"}`
    );

  const renderTeamResult = (team, index) => 
    renderResultRow(
      index, 
      Building2, 
      "bg-green-100", 
      "text-green-600", 
      team.teamName, 
      `${team.memberCount} members`,
      null,
      () => navigate(`/admin/teams/${team.id}`)
    );

  const renderDocumentResult = (doc, index) => {
    const typeMap = {
      pdf: { bg: "bg-rose-50", fg: "text-rose-600" },
      word: { bg: "bg-blue-50", fg: "text-blue-600" },
      sheet: { bg: "bg-emerald-50", fg: "text-emerald-600" },
      powerpoint: { bg: "bg-orange-50", fg: "text-orange-600" },
      image: { bg: "bg-violet-50", fg: "text-violet-600" }
    };
    const { bg, fg } = typeMap[normalizeDocumentType(doc.fileType)] || { bg: "bg-gray-50", fg: "text-gray-400" };
    return renderResultRow(
      index, 
      FileText, 
      bg, 
      fg, 
      doc.fileName, 
      doc.fileType || "Unknown Type",
      null,
      () => navigate(`/documents/${doc.id}/preview`, { state: { fromAdmin: true } })
    );
  };

  const renderResultSection = (tabId, title, Icon, colorClass, dataArray, renderItem) => {
    if ((activeTab !== "all" && activeTab !== tabId) || !dataArray?.length) return null;
    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Icon className={`w-5 h-5 ${colorClass}`} /> {title} ({dataArray.length})
        </h3>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {dataArray.map((item, idx) => renderItem(item, idx))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Search Input */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users, teams, documents across the entire platform..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900"
          />
          <button
            ref={micButtonRef}
            onClick={toggleListening}
            title="Search with voice"
            className={`absolute right-3 top-2.5 p-1 rounded-full transition-colors duration-75 ${
              isListening
                ? "bg-red-100 text-red-600"
                : "text-gray-400 hover:text-blue-600 hover:bg-gray-100"
            }`}
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error === "mic-timeout" ? (
        <div className="mb-6 py-8 px-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-col items-center justify-center gap-3 transition-all">
          <span className="text-5xl mb-2">😕</span>
          <p className="text-gray-600 text-lg font-medium text-center">
            Oops! I didn't quite catch that.
          </p>
          <p className="text-gray-500 text-sm text-center">
            Could you try speaking a bit louder?
          </p>
        </div>
      ) : error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-900">Search Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && searchQuery && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">Searching platform...</span>
        </div>
      )}

      {/* Results */}
      {!loading && results && searchQuery && (
        <div>
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            {[
              { id: "all", label: "All", icon: null },
              { id: "users", label: "Users", icon: Users },
              { id: "teams", label: "Teams", icon: Building2 },
              { id: "documents", label: "Documents", icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium border-b-2 ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <span className="flex items-center gap-2">
                  {tab.icon && <tab.icon className="w-4 h-4" />}
                  {tab.label}
                  <span className="text-sm bg-gray-200 px-2 py-1 rounded">{getResultCount(tab.id)}</span>
                </span>
              </button>
            ))}
          </div>

          {renderResultSection("users", "Users", Users2, "text-blue-600", results.users, renderUserResult)}
          {renderResultSection("teams", "Teams", Building2, "text-green-600", results.teams, renderTeamResult)}
          {renderResultSection("documents", "Documents", FileText, "text-orange-600", results.documents, renderDocumentResult)}

          {/* No Results Message */}
          {getResultCount("all") === 0 && (
            <div className="mb-6 py-12 px-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-col items-center justify-center gap-3 transition-all mt-8">
              <span className="text-5xl mb-2">😔</span>
              <p className="text-gray-600 text-lg font-medium text-center">
                Oops! We couldn't find anything for "{searchQuery}"
              </p>
              <p className="text-gray-500 text-sm text-center">
                Try searching with different keywords or check for typos.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && !results && !searchQuery && (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Search the Entire Platform</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Find any user, team, or document in your system. Start typing to search across all platform data.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminGlobalSearch;