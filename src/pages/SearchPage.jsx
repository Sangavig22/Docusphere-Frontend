import { useState, useMemo } from "react";
import { Search, Filter, FileText, Tag, User, Clock, File, SearchSlash } from "lucide-react";
import { useDocumentsStore } from "../hooks/useDocumentsStore";
import { normalizeDocumentType, formatBytes, formatRelativeTime } from "../components/documents";

/**
 * SearchPage Component
 * 
 * This page implements the Search Documents feature.
 * It allows users to search by:
 * - Document title
 * - Tags
 * - OCR text
 * - Description
 * 
 * It also provides filtering capabilities and displays detailed document metadata.
 */
export default function SearchPage() {
  const { documents } = useDocumentsStore();
  
  // State for search input and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    title: true,
    tags: true,
    ocr: true,
    description: true,
    type: "all"
  });

  // Mock data augmentation: The store might not have tags/ocr/description/uploadedBy
  // We'll augment the existing documents with some mock data for demonstration
  const enrichedDocuments = useMemo(() => {
    return documents.map(doc => ({
      ...doc,
      tags: doc.tags || ["Project", "Internal"],
      ocrText: doc.ocrText || "This is a sample OCR text content for searching demonstration purposes.",
      description: doc.description || "A standard document uploaded for management.",
      uploadedBy: doc.uploadedBy || "System User",
    }));
  }, [documents]);

  // Filtering logic
  const filteredDocs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q && filters.type === "all") return enrichedDocuments;

    return enrichedDocuments.filter((doc) => {
      const matchesType = filters.type === "all" || normalizeDocumentType(doc.type) === filters.type;
      
      if (!q) return matchesType;

      const matchesTitle = filters.title && doc.name.toLowerCase().includes(q);
      const matchesTags = filters.tags && doc.tags.some(tag => tag.toLowerCase().includes(q));
      const matchesOCR = filters.ocr && doc.ocrText.toLowerCase().includes(q);
      const matchesDescription = filters.description && doc.description.toLowerCase().includes(q);

      return matchesType && (matchesTitle || matchesTags || matchesOCR || matchesDescription);
    });
  }, [enrichedDocuments, searchQuery, filters]);

  const toggleFilter = (key) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTypeChange = (e) => {
    setFilters(prev => ({ ...prev, type: e.target.value }));
  };

  return (
    <div className="flex w-full max-w-6xl flex-1 flex-col gap-6">
      {/* Search Header */}
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Search Documents</h1>
        <p className="text-sm text-slate-500">Find any document by its title, tags, or content.</p>
      </div>

      {/* Search Bar & Primary Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full p-3 pl-10 text-sm border border-slate-200 rounded-xl bg-white focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            showFilters 
              ? "bg-blue-600 text-white shadow-md" 
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm"
          }`}
        >
          <Filter size={18} />
          Filters
        </button>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Search Fields</label>
              <div className="flex flex-wrap gap-2">
                {["title", "tags", "ocr", "description"].map((key) => (
                  <button
                    key={key}
                    onClick={() => toggleFilter(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      filters[key] 
                        ? "bg-blue-50 border-blue-200 text-blue-700" 
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {key === "ocr" ? "OCR Content" : key.charAt(0).toUpperCase() + key.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Document Type</label>
              <select
                value={filters.type}
                onChange={handleTypeChange}
                className="w-full p-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="pdf">PDF Documents</option>
                <option value="image">Images</option>
                <option value="word">Word Files</option>
                <option value="other">Others</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">
            Showing {filteredDocs.length} {filteredDocs.length === 1 ? 'document' : 'documents'}
          </span>
        </div>

        {filteredDocs.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredDocs.map((doc) => (
              <div 
                key={doc.id} 
                className="group p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-100 transition-colors">
                    <FileText size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-base font-semibold text-slate-900 truncate">{doc.name}</h3>
                      <span className="shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 rounded">
                        {doc.type}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mb-3 line-clamp-1">{doc.description}</p>
                    
                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-3 gap-x-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <User size={14} className="text-slate-400" />
                        <span className="truncate">{doc.uploadedBy}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock size={14} className="text-slate-400" />
                        <span>{formatRelativeTime(doc.updatedAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <File size={14} className="text-slate-400" />
                        <span>{formatBytes(doc.sizeBytes)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Tag size={14} className="text-slate-400" />
                        <div className="flex gap-1 overflow-hidden">
                          {doc.tags.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                              {tag}
                            </span>
                          ))}
                          {doc.tags.length > 2 && <span className="text-[10px]">+{doc.tags.length - 2}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-white border border-dashed border-slate-200 rounded-2xl shadow-sm text-center">
            <div className="p-4 bg-slate-50 rounded-full text-slate-400 mb-4">
              <SearchSlash size={48} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No documents found</h3>
            <p className="text-sm text-slate-500 max-w-xs">
              Try adjusting your search query or filters to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
