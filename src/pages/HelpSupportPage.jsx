import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Search,
  ArrowRight,
  Lock,
  User,
  Star,
  Trash2,
  Users,
  FileText,
  Activity,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Play,
  AlertCircle,
  Loader2,
  Clock,
  Sparkles,
  LifeBuoy
} from "lucide-react";

import { helpSupportService } from "../services/helpSupportService";
import { FAQ_DATA, TUTORIAL_VIDEOS, STEP_GUIDES } from "../data/helpCenterData";
import VideoPlayerModal from "../components/Help/VideoPlayerModal";
import { getYoutubeThumbnail, extractYoutubeId } from "../utils/youtube";

export default function HelpSupportPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFaqCategory, setActiveFaqCategory] = useState("Account");
  const [openFaqIndexes, setOpenFaqIndexes] = useState({});
  const [openGuideIndexes, setOpenGuideIndexes] = useState({});
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Tickets states
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [ticketFilter, setTicketFilter] = useState(""); // empty for All

  // Form states
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("ACCOUNT");
  const [priority, setPriority] = useState("LOW");
  const [description, setDescription] = useState("");
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // Status states
  const [systemStatus, setSystemStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    loadTickets();
    loadSystemStatus();
  }, []);

  const loadTickets = async () => {
    try {
      setLoadingTickets(true);
      const data = await helpSupportService.getUserTickets(ticketFilter || null);
      setTickets(data || []);
    } catch (err) {
      console.error("Failed to load support tickets:", err);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [ticketFilter]);

  const loadSystemStatus = async () => {
    try {
      setLoadingStatus(true);
      const status = await helpSupportService.getSystemStatus();
      setSystemStatus(status);
    } catch (err) {
      console.error("Failed to load system status:", err);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!subject.trim()) {
      toast.error("Subject is required");
      return;
    }
    if (description.trim().length < 10) {
      toast.error("Description must be at least 10 characters");
      return;
    }

    try {
      setSubmittingTicket(true);
      await helpSupportService.createTicket({
        subject,
        category,
        priority,
        description
      });
      toast.success("Your support request has been submitted successfully!");
      setSubject("");
      setDescription("");
      loadTickets(); // refresh list
    } catch (err) {
      toast.error(err.message || "Failed to submit support request.");
    } finally {
      setSubmittingTicket(false);
    }
  };

  const toggleFaq = (index) => {
    setOpenFaqIndexes((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleGuide = (index) => {
    setOpenGuideIndexes((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Helper to highlight matching query text
  const highlightText = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 dark:bg-yellow-600/40 dark:text-yellow-100 rounded px-0.5">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  // Search Logic
  const getFilteredFaqs = () => {
    if (!searchQuery.trim()) {
      const cat = FAQ_DATA.find((c) => c.category === activeFaqCategory);
      return cat ? cat.items : [];
    }

    const results = [];
    FAQ_DATA.forEach((cat) => {
      cat.items.forEach((item) => {
        if (
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.category.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          results.push(item);
        }
      });
    });
    return results;
  };

  const getFilteredVideos = () => {
    if (!searchQuery.trim()) return TUTORIAL_VIDEOS;
    return TUTORIAL_VIDEOS.filter(
      (v) =>
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getFilteredGuides = () => {
    if (!searchQuery.trim()) return STEP_GUIDES;
    return STEP_GUIDES.filter(
      (g) =>
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredFaqs = getFilteredFaqs();
  const filteredVideos = getFilteredVideos();
  const filteredGuides = getFilteredGuides();
  const hasSearchResults = filteredFaqs.length > 0 || filteredVideos.length > 0 || filteredGuides.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-12">
      <ToastContainer position="top-right" theme="colored" hideProgressBar />

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/10 via-background to-muted border border-border p-8 md:p-12 text-center space-y-6 shadow-sm">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <LifeBuoy className="h-64 w-64 animate-spin-slow" />
        </div>
        <div className="max-w-2xl mx-auto space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            How can we help you?
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Find answers, learn how to use DocuSphere, or contact our support team.
          </p>
        </div>
        <div className="relative max-w-xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Search answers, tutorials, categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
        </div>
      </div>

      {/* System Status & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" /> Self-Service Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link
              to="/setting"
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-card text-center hover:bg-muted/40 transition-colors shadow-sm space-y-2 group"
            >
              <User className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-foreground">Manage Profile</span>
            </Link>
            <Link
              to="/setting"
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-card text-center hover:bg-muted/40 transition-colors shadow-sm space-y-2 group"
            >
              <Lock className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-foreground">Reset Password</span>
            </Link>
            <Link
              to="/starred"
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-card text-center hover:bg-muted/40 transition-colors shadow-sm space-y-2 group"
            >
              <Star className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-foreground">Starred Files</span>
            </Link>
            <Link
              to="/documents"
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-card text-center hover:bg-muted/40 transition-colors shadow-sm space-y-2 group"
            >
              <FileText className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-foreground">My Documents</span>
            </Link>
            <Link
              to="/team"
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-card text-center hover:bg-muted/40 transition-colors shadow-sm space-y-2 group"
            >
              <Users className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-foreground">Collaborative Teams</span>
            </Link>
            <Link
              to="/trash"
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-card text-center hover:bg-muted/40 transition-colors shadow-sm space-y-2 group"
            >
              <Trash2 className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-foreground">Recycle Bin</span>
            </Link>
          </div>
        </div>

        {/* System Status */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" /> System Health Status
          </h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3.5 shadow-sm">
            {loadingStatus ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground text-xs gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading status...
              </div>
            ) : systemStatus ? (
              <>
                <div className="flex items-center justify-between text-xs border-b border-border/60 pb-2">
                  <span className="font-medium text-muted-foreground">Document Service</span>
                  <span className={`font-bold flex items-center gap-1 ${systemStatus.documentService === "ONLINE" ? "text-emerald-500" : "text-amber-500"}`}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> {systemStatus.documentService}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-border/60 pb-2">
                  <span className="font-medium text-muted-foreground">OCR Engine Service</span>
                  <span className={`font-bold flex items-center gap-1 ${systemStatus.ocrService === "ONLINE" ? "text-emerald-500" : "text-amber-500"}`}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> {systemStatus.ocrService}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-border/60 pb-2">
                  <span className="font-medium text-muted-foreground">AI Engine (Gemini)</span>
                  <span className={`font-bold flex items-center gap-1 ${systemStatus.aiSummarization === "ONLINE" ? "text-emerald-500" : "text-amber-500"}`}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> {systemStatus.aiSummarization}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pb-1">
                  <span className="font-medium text-muted-foreground">Database Backend</span>
                  <span className={`font-bold flex items-center gap-1 ${systemStatus.database === "ONLINE" ? "text-emerald-500" : "text-amber-500"}`}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> {systemStatus.database}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground text-xs gap-1.5">
                <AlertCircle className="h-4 w-4 text-amber-500" /> Status unavailable
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Knowledge Base: FAQs & Guides */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FAQs Accordion */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" /> Frequently Asked Questions
          </h2>

          {/* FAQ Category Filters */}
          {!searchQuery.trim() && (
            <div className="flex flex-wrap gap-2 border-b border-border pb-3">
              {FAQ_DATA.map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => setActiveFaqCategory(cat.category)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeFaqCategory === cat.category
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat.category}
                </button>
              ))}
            </div>
          )}

          {/* Accordion List */}
          <div className="space-y-3">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => {
                const isOpen = openFaqIndexes[index];
                return (
                  <div
                    key={index}
                    className="rounded-xl border border-border bg-card overflow-hidden shadow-sm transition-all"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm text-foreground hover:bg-muted/30 transition-colors"
                    >
                      <span>{highlightText(faq.question, searchQuery)}</span>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="p-4 border-t border-border bg-muted/20 text-xs md:text-sm text-muted-foreground leading-relaxed">
                        {highlightText(faq.answer, searchQuery)}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-muted-foreground text-xs">
                No FAQ matches found for "{searchQuery}".
              </div>
            )}
          </div>
        </div>

        {/* Step-by-step Guides */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Step-by-Step Guides
          </h2>
          <div className="space-y-3">
            {filteredGuides.length > 0 ? (
              filteredGuides.map((guide, idx) => {
                const isOpen = openGuideIndexes[idx];
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-border bg-card overflow-hidden shadow-sm transition-all"
                  >
                    <button
                      onClick={() => toggleGuide(idx)}
                      className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs md:text-sm text-foreground hover:bg-muted/30 transition-colors"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
                          {guide.category}
                        </span>
                        <h4 className="block font-bold">{highlightText(guide.title, searchQuery)}</h4>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="p-4 border-t border-border bg-muted/20 space-y-3 text-xs">
                        <p className="text-muted-foreground font-medium italic">
                          {highlightText(guide.description, searchQuery)}
                        </p>
                        <ol className="list-decimal pl-4 space-y-2 text-foreground">
                          {guide.steps.map((step, sIdx) => (
                            <li key={sIdx}>{step}</li>
                          ))}
                        </ol>
                        <div className="text-[10px] text-muted-foreground/80 flex items-center gap-1 pt-1">
                          <Clock className="h-3 w-3" /> Estimated read time: {guide.time}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-muted-foreground text-xs">
                No guides match "{searchQuery}".
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Tutorials Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Play className="h-5 w-5 text-primary" /> Video Tutorials
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredVideos.length > 0 ? (
            filteredVideos.map((video) => {
              const videoId = extractYoutubeId(video.videoId || video.youtubeUrl);
              const thumbUrl = videoId ? getYoutubeThumbnail(videoId) : null;
              return (
                <div
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-300 cursor-pointer"
                >
                  {/* Visual Thumbnail Card */}
                  <div className="relative aspect-video w-full bg-gradient-to-br from-primary/20 via-muted to-card flex items-center justify-center overflow-hidden border-b border-border">
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={video.title}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors" />
                    <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary/95 text-primary-foreground shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="h-5 w-5 fill-current ml-0.5" />
                    </div>
                  </div>
                  {/* Details Panel */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-primary tracking-wide">
                        {video.category}
                      </span>
                      <h3 className="font-bold text-sm text-foreground line-clamp-1">
                        {highlightText(video.title, searchQuery)}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {video.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground pt-2 border-t border-border/50">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {video.duration}
                      </span>
                      <span className="text-primary group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                        Watch Tutorial <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-8 text-center text-muted-foreground text-xs">
              No video tutorials match "{searchQuery}".
            </div>
          )}
        </div>
      </div>

      {/* Support Ticketing System (Contact Support & Ticket History) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 border-t border-border pt-12">
        {/* Submit Ticket Form */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <LifeBuoy className="h-5 w-5 text-primary" /> Contact Support Team
          </h2>
          <form
            onSubmit={handleCreateTicket}
            className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Subject</label>
              <input
                type="text"
                required
                placeholder="What issue are you facing?"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-muted/20 text-foreground text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-muted/20 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="ACCOUNT">Account</option>
                  <option value="DOCUMENT_UPLOAD">Document Upload</option>
                  <option value="DOCUMENT_MANAGEMENT">Document Management</option>
                  <option value="OCR">OCR Extraction</option>
                  <option value="AI_SUMMARIZATION">AI Summarization</option>
                  <option value="SHARING">Document Sharing</option>
                  <option value="SECURITY">Security / Passwords</option>
                  <option value="COLLABORATION">Collaboration</option>
                  <option value="VERSION_CONTROL">Version Control</option>
                  <option value="OTHER">Other Support</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-muted/20 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Detailed Description</label>
              <textarea
                required
                rows={4}
                placeholder="Please describe your issue in detail (at least 10 characters)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-muted/20 text-foreground text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={submittingTicket}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-primary text-primary-foreground text-xs md:text-sm font-semibold hover:bg-primary/95 transition-colors disabled:opacity-50"
            >
              {submittingTicket ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting Request...
                </>
              ) : (
                "Submit Request"
              )}
            </button>
          </form>
        </div>

        {/* Support Tickets List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-primary" /> My Support Requests
            </h2>

            {/* Ticket Filter options */}
            <div className="flex gap-1.5">
              <select
                value={ticketFilter}
                onChange={(e) => setTicketFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-border bg-card text-foreground text-[10px] md:text-xs focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>

          <div className="space-y-3.5">
            {loadingTickets ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-xs gap-2 bg-card rounded-xl border border-border">
                <Loader2 className="h-5 w-5 animate-spin text-primary" /> Loading support tickets...
              </div>
            ) : tickets.length > 0 ? (
              tickets.map((t) => (
                <div
                  key={t.id}
                  className="rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-4 shadow-sm hover:border-primary/20 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-muted-foreground">#{t.id}</span>
                      <h4 className="font-bold text-sm text-foreground line-clamp-1">{t.subject}</h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted-foreground font-semibold">
                      <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] uppercase font-bold text-foreground">
                        {t.category.replace("_", " ")}
                      </span>
                      <span>•</span>
                      <span>Priority: <strong className="text-foreground">{t.priority}</strong></span>
                      <span>•</span>
                      <span>Updated: {new Date(t.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-extrabold ${
                        t.status === "OPEN"
                          ? "bg-blue-500/10 text-blue-500 border border-blue-500/25"
                          : t.status === "IN_PROGRESS"
                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/25"
                          : t.status === "RESOLVED"
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/25"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {t.status.replace("_", " ")}
                    </span>
                    <button
                      onClick={() => navigate(`/help/tickets/${t.id}`)}
                      className="px-3 py-1.5 rounded-lg border border-border bg-muted/30 hover:bg-muted text-xs font-semibold text-foreground transition-colors"
                    >
                      Open
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center text-muted-foreground text-xs bg-card rounded-xl border border-border">
                No support tickets found. Create a ticket using the form on the left if you need assistance!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Modal Overlay */}
      {selectedVideo && (
        <VideoPlayerModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}
    </div>
  );
}
