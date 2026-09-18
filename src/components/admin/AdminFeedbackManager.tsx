"use client";

import { useState } from "react";
import { 
  HeartHandshake, 
  Sparkles, 
  Star, 
  MessageSquare, 
  CheckCircle2, 
  Trash2, 
  Plus, 
  Edit3, 
  Eye, 
  EyeOff, 
  Search,
  Filter,
  Check,
  X,
  Loader2,
  ExternalLink,
  MessageCircle,
  Lightbulb,
  Bug,
  Briefcase
} from "lucide-react";
import { toast } from "sonner";
import { FeedbackItem } from "@/utils/feedbackStore";
import Link from "next/link";

export function AdminFeedbackManager({
  initialFeedback = [],
}: {
  initialFeedback: FeedbackItem[];
}) {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>(initialFeedback);
  const [activeTab, setActiveTab] = useState<"all" | "featured" | "ideas" | "general" | "bugs">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Modal State for Feature/Edit in "Loved by Communities"
  const [modalItem, setModalItem] = useState<FeedbackItem | null>(null);
  const [editQuote, setEditQuote] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editRole, setEditRole] = useState("Group Admin");
  const [isSaving, setIsSaving] = useState(false);

  // Modal for Manual New Testimonial creation
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("Group Admin");
  const [newQuote, setNewQuote] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [isCreating, setIsCreating] = useState(false);

  // Metrics
  const totalCount = feedbackList.length;
  const featuredCount = feedbackList.filter(f => f.isFeaturedInCommunity).length;
  const avgRating = totalCount > 0 
    ? (feedbackList.reduce((acc, f) => acc + (f.rating || 5), 0) / totalCount).toFixed(1) 
    : "5.0";
  const ideasCount = feedbackList.filter(f => f.category?.includes("Idea") || f.category?.includes("Feature")).length;

  // Filter logic
  const filteredItems = feedbackList.filter((item) => {
    // Tab filter
    if (activeTab === "featured" && !item.isFeaturedInCommunity) return false;
    if (activeTab === "ideas" && !item.category?.includes("Idea") && !item.category?.includes("Feature")) return false;
    if (activeTab === "general" && !item.category?.includes("General")) return false;
    if (activeTab === "bugs" && !item.category?.includes("Issue") && !item.category?.includes("Bug")) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (item.name || "").toLowerCase().includes(q);
      const matchMsg = (item.message || "").toLowerCase().includes(q);
      const matchQuote = (item.featuredQuote || "").toLowerCase().includes(q);
      const matchAuthor = (item.featuredAuthor || "").toLowerCase().includes(q);
      if (!matchName && !matchMsg && !matchQuote && !matchAuthor) return false;
    }

    return true;
  });

  // Open modal to configure feature in community
  const handleOpenFeatureModal = (item: FeedbackItem) => {
    setModalItem(item);
    setEditQuote(item.featuredQuote || item.message);
    setEditAuthor(item.featuredAuthor || item.name);
    setEditRole(item.featuredRole || "Group Admin");
  };

  // Submit Feature or Edit to API
  const handleSaveFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalItem) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: modalItem.id,
          isFeaturedInCommunity: true,
          featuredQuote: editQuote.trim(),
          featuredAuthor: editAuthor.trim(),
          featuredRole: editRole.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.item) {
        setFeedbackList((prev) =>
          prev.map((f) => (f.id === modalItem.id ? data.item : f))
        );
        toast.success(`Published to 'Loved by Communities'!`);
        setModalItem(null);
      } else {
        throw new Error(data.error || "Failed to update community status");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  // One-click unfeature
  const handleUnfeature = async (item: FeedbackItem) => {
    setLoadingId(item.id);
    try {
      const res = await fetch("/api/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          isFeaturedInCommunity: false,
        }),
      });

      const data = await res.json();
      if (res.ok && data.item) {
        setFeedbackList((prev) =>
          prev.map((f) => (f.id === item.id ? data.item : f))
        );
        toast.success(`Removed from 'Loved by Communities'.`);
      } else {
        throw new Error(data.error || "Failed to unfeature");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoadingId(null);
    }
  };

  // Delete Feedback item
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feedback item?")) return;

    setLoadingId(id);
    try {
      const res = await fetch(`/api/feedback?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setFeedbackList((prev) => prev.filter((f) => f.id !== id));
        toast.success("Feedback deleted.");
      } else {
        throw new Error("Failed to delete");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    } finally {
      setLoadingId(null);
    }
  };

  // Create Manual Testimonial directly
  const handleCreateManualTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuote.trim() || !newName.trim()) {
      toast.error("Please fill in the name and testimonial quote.");
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          category: "General Feedback",
          message: newQuote.trim(),
          rating: newRating,
          url: "Admin Desk",
        }),
      });

      const data = await res.json();
      if (res.ok && data.feedback) {
        // Immediately feature it
        const patchRes = await fetch("/api/feedback", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: data.feedback.id,
            isFeaturedInCommunity: true,
            featuredQuote: newQuote.trim(),
            featuredAuthor: newName.trim(),
            featuredRole: newRole.trim(),
          }),
        });
        const patchData = await patchRes.json();

        setFeedbackList((prev) => [patchData.item || data.feedback, ...prev]);
        toast.success("New testimonial added directly to 'Loved by Communities'!");
        setIsCreateOpen(false);
        setNewName("");
        setNewQuote("");
      } else {
        throw new Error(data.error || "Failed to create feedback");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create testimonial");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
              Community Governance
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs text-zinc-400">Marketing Integration Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Feedback &amp; "Loved by Communities"
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Review live contributor feedback submitted from the website footer. Curate and publish real quotes to the homepage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/#testimonials"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-semibold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>View Live Landing Page</span>
          </Link>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C5A059] hover:bg-[#D4AF37] text-zinc-950 text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Testimonial</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0C120E] border border-zinc-800/90 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Feedbacks</span>
            <MessageSquare className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalCount}</div>
          <p className="text-[11px] text-zinc-400 mt-1">From web footer &amp; in-app</p>
        </div>

        <div className="bg-[#0C120E] border border-[#C5A059]/40 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#C5A059]/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-[#C5A059]">Live in Community</span>
            <Sparkles className="h-4 w-4 text-[#C5A059]" />
          </div>
          <div className="text-2xl font-black text-[#C5A059]">{featuredCount}</div>
          <p className="text-[11px] text-zinc-300 mt-1">Published on homepage</p>
        </div>

        <div className="bg-[#0C120E] border border-zinc-800/90 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Average Rating</span>
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{avgRating} <span className="text-xs font-normal text-zinc-500">/ 5.0</span></div>
          <p className="text-[11px] text-zinc-400 mt-1">Contributor satisfaction</p>
        </div>

        <div className="bg-[#0C120E] border border-zinc-800/90 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Feature Requests</span>
            <Lightbulb className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400">{ideasCount}</div>
          <p className="text-[11px] text-zinc-400 mt-1">Product roadmap ideas</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: `All (${totalCount})` },
            { id: "featured", label: `⭐ Loved by Communities (${featuredCount})` },
            { id: "ideas", label: `💡 Ideas (${ideasCount})` },
            { id: "general", label: `💬 General` },
            { id: "bugs", label: `🐛 Issues` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#C5A059] text-zinc-950 font-bold shadow-sm"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search feedback or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#C5A059] transition-all"
          />
        </div>
      </div>

      {/* Feedback Feed List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="bg-[#0C120E] border border-zinc-800 rounded-2xl p-12 text-center text-zinc-500">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <h4 className="text-base font-bold text-zinc-300 mb-1">No feedback found</h4>
            <p className="text-xs max-w-sm mx-auto">
              No feedback matching your selected filter. Submissions from the footer form will stream in here automatically.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isFeatured = item.isFeaturedInCommunity;
            const isLoading = loadingId === item.id;

            return (
              <div
                key={item.id}
                className={`bg-[#0C120E] rounded-2xl p-6 border transition-all duration-200 ${
                  isFeatured
                    ? "border-[#C5A059]/60 shadow-[0_0_20px_rgba(197,160,89,0.08)] bg-gradient-to-r from-[#0C120E] via-[#0F1813] to-[#0C120E]"
                    : "border-zinc-800/80 hover:border-zinc-700"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
                      {item.name ? item.name[0].toUpperCase() : "U"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-bold text-white text-sm">{item.name || "Anonymous"}</h4>
                        {item.email && (
                          <span className="text-xs text-zinc-400">({item.email})</span>
                        )}
                        <span className="text-[11px] font-mono text-zinc-500">
                          &bull; {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-medium border border-zinc-700">
                          {item.category}
                        </span>
                      </div>
                      
                      {/* Star Rating Display */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= (item.rating || 5)
                                ? "fill-[#C5A059] text-[#C5A059]"
                                : "text-zinc-700 fill-transparent"
                            }`}
                          />
                        ))}
                        <span className="text-xs font-semibold text-zinc-400 ml-1.5">
                          {item.rating || 5}/5
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 self-start">
                    {isFeatured ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/40 text-[#C5A059] text-xs font-bold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Live in "Loved by Communities"</span>
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-500 font-medium px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800">
                        Not Featured
                      </span>
                    )}
                  </div>
                </div>

                {/* Original Feedback Message */}
                <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-4 mb-4 text-xs sm:text-sm text-zinc-200 leading-relaxed">
                  "{item.message}"
                </div>

                {/* Live Preview if Featured */}
                {isFeatured && (
                  <div className="mb-4 bg-[#082319]/80 border border-[#C5A059]/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#C5A059] mb-1">
                        Landing Page Display Preview:
                      </div>
                      <p className="text-xs text-zinc-100 italic mb-1.5">
                        "{item.featuredQuote || item.message}"
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-white">&mdash; {item.featuredAuthor || item.name}</span>
                        <span className="text-zinc-500">•</span>
                        <span className="text-[#C5A059] font-medium">{item.featuredRole || "Group Admin"}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenFeatureModal(item)}
                      className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-zinc-300 rounded-lg border border-white/10 transition-colors shrink-0 cursor-pointer"
                    >
                      Customize Quote &amp; Role
                    </button>
                  </div>
                )}

                {/* Card Action Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-xs">
                  <span className="text-zinc-500 text-[11px]">
                    Source: {item.sourceUrl || "Footer Widget"}
                  </span>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={isLoading}
                      className="text-zinc-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10 cursor-pointer"
                      title="Delete Feedback"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {isFeatured ? (
                      <button
                        onClick={() => handleUnfeature(item)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold transition-all cursor-pointer"
                      >
                        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>Remove from Homepage</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenFeatureModal(item)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#C5A059] hover:bg-[#D4AF37] text-zinc-950 font-bold shadow-sm transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Add to "Loved by Communities"</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Configure / Publish to "Loved by Communities" */}
      {modalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0C120E] border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 sm:p-8 relative">
            <button
              onClick={() => setModalItem(null)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white p-2 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Publish Testimonial</h3>
                <p className="text-xs text-zinc-400">Featured on the "Loved by Communities" homepage section</p>
              </div>
            </div>

            <form onSubmit={handleSaveFeature} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Display Quote (Polished for Landing Page)
                </label>
                <textarea
                  rows={3}
                  value={editQuote}
                  onChange={(e) => setEditQuote(e.target.value)}
                  required
                  className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#C5A059] transition-all resize-none"
                  placeholder="The concise quote displayed to site visitors..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Author Display Name
                  </label>
                  <input
                    type="text"
                    value={editAuthor}
                    onChange={(e) => setEditAuthor(e.target.value)}
                    required
                    placeholder="e.g., Bisi A. or Babatunde"
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#C5A059] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Member Role / Title
                  </label>
                  <input
                    type="text"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    required
                    placeholder="e.g., Group Admin, Alumni President"
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#C5A059] transition-all"
                  />
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="bg-[#FDFBF7] p-4 rounded-xl border border-gray-200 mt-2 text-zinc-900">
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-3.5 h-3.5 fill-[#C5A059] text-[#C5A059]" />
                  ))}
                </div>
                <p className="text-xs italic text-gray-800 mb-2">
                  "{editQuote || "Your testimonial quote will appear here..."}"
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#0B3022] flex items-center justify-center text-[10px] font-bold text-white">
                    {editAuthor ? editAuthor[0].toUpperCase() : "A"}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#0B3022]">{editAuthor || "Author"}</span>
                    <span className="text-[11px] text-gray-500 ml-1.5">({editRole || "Role"})</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setModalItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C5A059] hover:bg-[#D4AF37] text-zinc-950 text-xs font-bold shadow-md cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save &amp; Publish to Homepage</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Manual Testimonial */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0C120E] border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 sm:p-8 relative">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white p-2 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Add New Community Testimonial</h3>
                <p className="text-xs text-zinc-400">Directly add a quote from a verified circle member</p>
              </div>
            </div>

            <form onSubmit={handleCreateManualTestimonial} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Testimonial Quote
                </label>
                <textarea
                  rows={3}
                  value={newQuote}
                  onChange={(e) => setNewQuote(e.target.value)}
                  required
                  placeholder="e.g., The direct debit automation took away all the drama from our monthly office circle..."
                  className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[#C5A059] transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Member Name
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    placeholder="e.g., Bisi Adeleke"
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#C5A059] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Role / Title
                  </label>
                  <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    required
                    placeholder="e.g., Group Admin, Contributor"
                    className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#C5A059] transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C5A059] hover:bg-[#D4AF37] text-zinc-950 text-xs font-bold shadow-md cursor-pointer"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add &amp; Publish</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
