import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  BookOpen,
  Video,
  Activity,
  MessageSquare,
  User,
  Key,
  FolderOpen,
  Star,
  Trash2,
  Users,
  AlertCircle
} from "lucide-react";
import {
  HELP_CATEGORIES,
  HELP_FAQS,
  HELP_GUIDES,
  HELP_TUTORIALS
} from "../constants/helpCenterData";
import FAQAccordion from "../components/help/FAQAccordion";
import GuideView from "../components/help/GuideView";
import VideoTutorials from "../components/help/VideoTutorials";
import ContactSupportForm from "../components/help/ContactSupportForm";
import TicketList from "../components/help/TicketList";
import TicketDetails from "../components/help/TicketDetails";
import SystemStatus from "../components/help/SystemStatus";
import { supportService } from "../services/supportService";

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("kb"); // kb, videos, status, tickets
  const [selectedCategoryId, setSelectedCategoryId] = useState("All");

  // Support tickets states
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [activeTutorialId, setActiveTutorialId] = useState(null);

  // Load tickets when switching to tickets tab
  useEffect(() => {
    if (activeTab === "tickets") {
      loadTickets();
    }
  }, [activeTab]);

  const loadTickets = async () => {
    setTicketsLoading(true);
    try {
      const data = await supportService.getTickets();
      setTickets(data);
    } catch (err) {
      console.error("Failed to load support tickets", err);
    } finally {
      setTicketsLoading(false);
    }
  };

  // Search logic
  const getFilteredFaqs = () => {
    let result = HELP_FAQS;
    if (selectedCategoryId !== "All") {
      result = result.filter((f) => f.categoryId === selectedCategoryId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q)
      );
    }
    return result;
  };

  const getFilteredGuides = () => {
    let result = HELP_GUIDES;
    if (selectedCategoryId !== "All") {
      result = result.filter((g) => g.categoryId === selectedCategoryId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.steps.some((s) => s.toLowerCase().includes(q))
      );
    }
    return result;
  };

  const getFilteredTutorials = () => {
    let result = HELP_TUTORIALS;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }
    return result;
  };

  const filteredFaqs = getFilteredFaqs();
  const filteredGuides = getFilteredGuides();
  const filteredTutorials = getFilteredTutorials();

  const totalResultsCount =
    filteredFaqs.length + filteredGuides.length + (searchQuery ? filteredTutorials.length : 0);

  const handleSelectVideo = (tutorialId) => {
    setActiveTutorialId(tutorialId);
    setActiveTab("videos");
  };

  // Render Category Icon dynamically
  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case "FileText":
        return <FolderOpen size={20} className="text-blue-500" />;
      case "Users":
        return <Users size={20} className="text-blue-500" />;
      case "Shield":
        return <AlertCircle size={20} className="text-blue-500" />;
      default:
        return <BookOpen size={20} className="text-blue-500" />;
    }
  };

  return (
    <div className="w-full space-y-8 min-w-0 max-w-[1280px] mx-auto pb-10">
      {/* 1. HERO SEARCH BANNER */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-6 sm:p-10 shadow-lg text-center space-y-6">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">How can we help?</h2>
          <p className="text-sm sm:text-base text-blue-100 font-medium">
            Find answers, learn how to use DocuSphere, or contact our support team.
          </p>
        </div>

        <div className="max-w-xl mx-auto relative shadow-md rounded-xl overflow-hidden">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for help (e.g. 50 MB, OCR, password)..."
            className="w-full px-5 py-4 pl-12 text-sm sm:text-base border border-none rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        </div>
      </div>

      {/* 2. QUICK SELF-SERVICE ACTIONS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <Link
          to="/setting"
          className="bg-card border border-border rounded-xl p-3.5 shadow-sm text-center flex flex-col items-center gap-2 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <div className="p-2.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
            <User size={18} />
          </div>
          <span className="text-xs font-semibold text-text">Profile</span>
        </Link>

        <Link
          to="/setting"
          className="bg-card border border-border rounded-xl p-3.5 shadow-sm text-center flex flex-col items-center gap-2 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <div className="p-2.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
            <Key size={18} />
          </div>
          <span className="text-xs font-semibold text-text whitespace-nowrap">Password</span>
        </Link>

        <Link
          to="/documents"
          className="bg-card border border-border rounded-xl p-3.5 shadow-sm text-center flex flex-col items-center gap-2 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <div className="p-2.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
            <FolderOpen size={18} />
          </div>
          <span className="text-xs font-semibold text-text">Documents</span>
        </Link>

        <Link
          to="/starred"
          className="bg-card border border-border rounded-xl p-3.5 shadow-sm text-center flex flex-col items-center gap-2 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <div className="p-2.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
            <Star size={18} />
          </div>
          <span className="text-xs font-semibold text-text">Starred</span>
        </Link>

        <Link
          to="/trash"
          className="bg-card border border-border rounded-xl p-3.5 shadow-sm text-center flex flex-col items-center gap-2 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <div className="p-2.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
            <Trash2 size={18} />
          </div>
          <span className="text-xs font-semibold text-text">Recycle Bin</span>
        </Link>

        <Link
          to="/team"
          className="bg-card border border-border rounded-xl p-3.5 shadow-sm text-center flex flex-col items-center gap-2 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <div className="p-2.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
            <Users size={18} />
          </div>
          <span className="text-xs font-semibold text-text">Teams</span>
        </Link>

        <button
          type="button"
          onClick={() => setActiveTab("status")}
          className="bg-card border border-border rounded-xl p-3.5 shadow-sm text-center flex flex-col items-center gap-2 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all group w-full focus:outline-none"
        >
          <div className="p-2.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
            <Activity size={18} />
          </div>
          <span className="text-xs font-semibold text-text">Status</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("tickets");
            setSelectedTicketId(null);
          }}
          className="bg-card border border-border rounded-xl p-3.5 shadow-sm text-center flex flex-col items-center gap-2 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all group w-full focus:outline-none"
        >
          <div className="p-2.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
            <MessageSquare size={18} />
          </div>
          <span className="text-xs font-semibold text-text">Support</span>
        </button>
      </div>

      {/* 3. TABS SELECTOR */}
      <div className="border-b border-border flex gap-6">
        <button
          type="button"
          onClick={() => setActiveTab("kb")}
          className={`pb-3 font-semibold text-sm transition-all border-b-2 focus:outline-none ${
            activeTab === "kb"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-muted hover:text-text"
          }`}
        >
          Knowledge Base & FAQ
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("videos")}
          className={`pb-3 font-semibold text-sm transition-all border-b-2 focus:outline-none ${
            activeTab === "videos"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-muted hover:text-text"
          }`}
        >
          Video Tutorials
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("status")}
          className={`pb-3 font-semibold text-sm transition-all border-b-2 focus:outline-none ${
            activeTab === "status"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-muted hover:text-text"
          }`}
        >
          System Status
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("tickets");
            setSelectedTicketId(null);
          }}
          className={`pb-3 font-semibold text-sm transition-all border-b-2 focus:outline-none ${
            activeTab === "tickets"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-muted hover:text-text"
          }`}
        >
          My Support Tickets
        </button>
      </div>

      {/* 4. TAB CONTENTS */}
      <div className="min-w-0">
        {/* KNOWLEDGE BASE TAB */}
        {activeTab === "kb" && (
          <div className="space-y-8">
            {/* Category selection */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-text">Browse Categories</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryId("All")}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                    selectedCategoryId === "All"
                      ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                      : "bg-card border-border text-text hover:bg-gray-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  All Categories
                </button>
                {HELP_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                      selectedCategoryId === cat.id
                        ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                        : "bg-card border-border text-text hover:bg-gray-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    {getCategoryIcon(cat.icon)}
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Empty search matches */}
            {searchQuery && totalResultsCount === 0 && (
              <div className="bg-card border border-border border-dashed rounded-2xl p-8 text-center text-muted max-w-lg mx-auto flex flex-col items-center gap-3">
                <Search size={36} className="text-muted/60" />
                <h4 className="font-bold text-text text-base sm:text-lg">No results found</h4>
                <p className="text-sm">
                  Try using different keywords or contact our support team.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("tickets");
                    setSelectedTicketId(null);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Contact Support
                </button>
              </div>
            )}

            {/* Guides Section */}
            {filteredGuides.length > 0 && (
              <div className="space-y-4">
                <GuideView
                  guides={filteredGuides}
                  faqs={HELP_FAQS}
                  onSelectVideo={handleSelectVideo}
                />
              </div>
            )}

            {/* FAQs Section */}
            {filteredFaqs.length > 0 && (
              <div className="space-y-4 border-t border-border pt-8">
                <h3 className="text-lg font-semibold text-text mb-4">Frequently Asked Questions</h3>
                <FAQAccordion faqs={filteredFaqs} searchQuery={searchQuery} />
              </div>
            )}
          </div>
        )}

        {/* VIDEOS TAB */}
        {activeTab === "videos" && (
          <VideoTutorials
            tutorials={HELP_TUTORIALS}
            activeTutorialId={activeTutorialId}
            clearActiveTutorial={() => setActiveTutorialId(null)}
          />
        )}

        {/* STATUS TAB */}
        {activeTab === "status" && <SystemStatus />}

        {/* TICKETS TAB */}
        {activeTab === "tickets" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {selectedTicketId ? (
              <div className="lg:col-span-3">
                <TicketDetails
                  ticketId={selectedTicketId}
                  onBack={() => {
                    setSelectedTicketId(null);
                    loadTickets();
                  }}
                />
              </div>
            ) : (
              <>
                {/* Left panel: Create Ticket form */}
                <div className="lg:col-span-1 space-y-4">
                  <h3 className="text-lg font-bold text-text">Contact Support</h3>
                  <ContactSupportForm
                    onSuccess={() => {
                      loadTickets();
                    }}
                  />
                </div>

                {/* Right panel: Tickets List */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-lg font-bold text-text flex items-center justify-between">
                    <span>My Support Requests</span>
                    <button
                      type="button"
                      onClick={loadTickets}
                      disabled={ticketsLoading}
                      className="text-xs text-blue-500 hover:underline disabled:opacity-50"
                    >
                      {ticketsLoading ? "Loading..." : "Refresh list"}
                    </button>
                  </h3>
                  {ticketsLoading ? (
                    <div className="flex flex-col items-center justify-center p-8 min-h-[200px]">
                      <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-muted mt-2">Loading support tickets...</span>
                    </div>
                  ) : (
                    <TicketList
                      tickets={tickets}
                      onSelectTicket={(ticketId) => setSelectedTicketId(ticketId)}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
