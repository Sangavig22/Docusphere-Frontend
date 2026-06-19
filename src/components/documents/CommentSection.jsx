import React, { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare, Send, User } from "lucide-react";
import { commentService } from "../../services/commentService";
import authService from "../../services/authService";

export default function CommentSection({ documentId }) {
  const [comments, setComments] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  const currentUserId = authService.getUserId();

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await commentService.getComments(documentId);
      setComments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (documentId) {
      loadComments();
    }
  }, [documentId, loadComments]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setNewMessage("");
      
      const saved = await commentService.addComment(
        documentId,
        currentUserId,
        newMessage
      );
      
      setComments((prev) => [...prev, saved]);
    } catch (error) {
      console.error("Failed to post comment:", error);
    }
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm">
      <div className="p-4 border-b flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-gray-800">Comments</h3>
        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
          {comments.length}
        </span>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50"
      >
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <MessageSquare className="h-10 w-10 mb-2 opacity-20" />
            <p className="text-sm">No comments yet</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div 
              key={comment.id} 
              className={`flex flex-col ${comment.userId === currentUserId ? "items-end" : "items-start"}`}
            >
              <div 
                className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  comment.userId === currentUserId 
                    ? "bg-blue-600 text-white rounded-tr-none" 
                    : "bg-white text-gray-800 border rounded-tl-none"
                }`}
              >
                {comment.message}
              </div>
              <span className="text-[10px] text-gray-400 mt-1 px-1">
                {formatTime(comment.timestamp)}
              </span>
            </div>
          ))
        )}
      </div>

      <form 
        onSubmit={handleSend}
        className="p-4 border-t bg-white flex items-center gap-2"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="h-10 w-10 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-all"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
