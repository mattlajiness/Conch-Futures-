import React, { useState, useEffect, useRef } from "react";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { AuthUser } from "../lib/auth";
import { Pool } from "../types";
import { Send, MessageSquare, Sparkles } from "lucide-react";
import ProfileCustomizerModal from "./ProfileCustomizerModal";

interface ChatTabProps {
  pool: Pool;
  user: AuthUser;
}

interface ChatMessage {
  id: string;
  text: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL?: string;
  createdAt: any;
}

export default function ChatTab({ pool, user }: ChatTabProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, `pools/${pool.id}/messages`),
      orderBy("createdAt", "asc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        fetchedMessages.push({ id: doc.id, ...doc.data() } as ChatMessage);
      });
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [pool.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await addDoc(collection(db, `pools/${pool.id}/messages`), {
        text: newMessage.trim(),
        userId: user.uid,
        userDisplayName: user.displayName,
        userPhotoURL: user.photoURL || null,
        createdAt: serverTimestamp(),
      });
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[500px] bg-slate-900 border border-slate-700/50 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800/80 border-b border-slate-700/50 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-white">League Chat</h3>
        </div>
        <button
          type="button"
          onClick={() => setIsCustomizerOpen(true)}
          className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Sparkles className="w-3 h-3" /> Change My Logo
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
            <MessageSquare className="w-8 h-8 opacity-50" />
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.userId === user.uid;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2`}>
                <div className={`flex flex-col max-w-[80%] ${isMe ? "items-end" : "items-start"}`}>
                  <div 
                    className={`px-3 py-2 rounded-2xl text-sm ${
                      isMe 
                        ? "bg-emerald-600 text-white rounded-tr-sm" 
                        : "bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 mx-1">
                    {!isMe && (
                      <div className="flex items-center gap-1">
                        {msg.userPhotoURL ? (
                          <img
                            src={msg.userPhotoURL}
                            alt={msg.userDisplayName}
                            className="w-3.5 h-3.5 rounded-full bg-slate-950 p-0.5 border border-slate-700 object-contain flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full bg-slate-700 text-[8px] font-bold text-slate-300 flex items-center justify-center uppercase flex-shrink-0">
                            {msg.userDisplayName?.charAt(0)}
                          </div>
                        )}
                        <span className="text-[10px] font-bold text-slate-400">
                          {msg.userDisplayName}
                        </span>
                      </div>
                    )}
                    <span className="text-[9px] text-slate-500 font-mono">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-slate-800/50 border-t border-slate-700/50">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            maxLength={500}
            className="flex-1 bg-slate-900 border border-slate-700 text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white p-2.5 rounded-lg transition-colors flex items-center justify-center shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Profile & Logo Customizer Modal */}
      <ProfileCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        currentPoolId={pool.id}
      />
    </div>
  );
}
