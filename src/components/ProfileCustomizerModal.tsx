import React, { useState } from "react";
import { X, Check, Search, Sparkles, Shield, User, Trophy, Flame, CheckCircle2, RotateCcw } from "lucide-react";
import {
  NFL_TEAMS_ALL,
  AFC_TEAMS,
  NFC_TEAMS,
  FOOTBALL_ICONS_AND_AVATARS,
  POPULAR_EMOJIS_AND_AVATARS,
  BEER_AND_LEISURE_AVATARS,
  getNflTeamLogoUrl,
} from "../constants";
import { useAuth } from "../lib/auth";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

interface ProfileCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPoolId?: string;
  onUpdated?: () => void;
}

export default function ProfileCustomizerModal({
  isOpen,
  onClose,
  currentPoolId,
  onUpdated,
}: ProfileCustomizerModalProps) {
  const { user, updateUserProfile } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [selectedLogo, setSelectedLogo] = useState(user?.photoURL || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "football" | "emojis" | "leisure" | "nfl" | "afc" | "nfc">("all");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  // Filter items based on activeTab and searchQuery
  const query = searchQuery.toLowerCase().trim();

  const filteredFootball = FOOTBALL_ICONS_AND_AVATARS.filter(
    (f) =>
      (activeTab === "all" || activeTab === "football") &&
      (f.label.toLowerCase().includes(query) || (f.icon && f.icon.includes(query)))
  );

  const filteredEmojis = POPULAR_EMOJIS_AND_AVATARS.filter(
    (e) =>
      (activeTab === "all" || activeTab === "emojis") &&
      (e.label.toLowerCase().includes(query) || (e.icon && e.icon.includes(query)))
  );

  const filteredLeisure = BEER_AND_LEISURE_AVATARS.filter(
    (l) =>
      (activeTab === "all" || activeTab === "leisure") &&
      (l.label.toLowerCase().includes(query) || (l.icon && l.icon.includes(query)))
  );

  const filteredNfl = NFL_TEAMS_ALL.filter(
    (t) =>
      (activeTab === "all" ||
        activeTab === "nfl" ||
        (activeTab === "afc" && t.conference === "AFC") ||
        (activeTab === "nfc" && t.conference === "NFC")) &&
      (t.label.toLowerCase().includes(query) ||
        t.value.toLowerCase().includes(query) ||
        t.division.toLowerCase().includes(query))
  );

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!displayName.trim()) {
      setErrorMsg("Display name cannot be empty.");
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    try {
      const cleanName = displayName.trim();
      const cleanLogo = selectedLogo.trim();

      // 1. Update Firebase Auth Profile
      await updateUserProfile(cleanName, cleanLogo);

      // 2. If user is currently inside an active pool, sync pick document
      if (currentPoolId) {
        try {
          const pickDocRef = doc(db, `pools/${currentPoolId}/picks`, user.uid);
          await updateDoc(pickDocRef, {
            userDisplayName: cleanName,
            userPhotoURL: cleanLogo,
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          // If user hasn't submitted picks yet, updateDoc might fail, which is completely fine
          console.debug("Pick record not yet created or failed to update:", err);
        }
      }

      setSuccessMsg("Profile & icon updated successfully!");
      if (onUpdated) onUpdated();

      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setErrorMsg("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = () => {
    setSelectedLogo("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-800/90 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base leading-tight">
                Personalize Name & Icon
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Choose a football icon, emoji, or NFL team logo to display next to your name
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Status Notifications */}
          {successMsg && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-300 text-xs font-semibold animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300 text-xs font-semibold animate-fadeIn">
              <X className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Live Preview Card */}
          <div className="bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Live Preview</span>
              <span className="text-[10px] text-emerald-400 font-mono">How you appear to others</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              {/* Leaderboard Row Preview */}
              <div className="flex-1 bg-slate-900/90 border border-slate-700/60 rounded-lg p-2.5 flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-[10px] flex items-center justify-center border border-amber-500/30">
                  #1
                </div>

                {selectedLogo ? (
                  <img
                    src={selectedLogo}
                    alt="Logo"
                    className="w-8 h-8 rounded-full bg-slate-950 p-0.5 border border-slate-700 object-contain flex-shrink-0 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-300 flex-shrink-0 uppercase">
                    {(displayName || "Player").substring(0, 2)}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-bold text-white text-xs truncate">
                      {displayName || "Player"}
                    </span>
                    <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1 py-0.2 rounded font-medium">
                      You
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">125 Points • 9 Correct</span>
                </div>
              </div>

              {/* League Chat Preview */}
              <div className="flex-1 bg-slate-900/90 border border-slate-700/60 rounded-lg p-2.5 flex flex-col justify-center">
                <div className="bg-slate-800 text-slate-200 border border-slate-700/50 rounded-2xl rounded-tl-sm px-3 py-1 text-xs w-fit">
                  Let&apos;s go! Season is looking huge.
                </div>
                <div className="flex items-center gap-1.5 mt-1 ml-1">
                  {selectedLogo && (
                    <img
                      src={selectedLogo}
                      alt="Logo"
                      className="w-3.5 h-3.5 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <span className="text-[10px] font-bold text-slate-400 truncate">
                    {displayName || "Player"}
                  </span>
                  <span className="text-[9px] text-slate-500">Just now</span>
                </div>
              </div>
            </div>
          </div>

          {/* Display Name Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">
              Display Name / Player Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                {selectedLogo ? (
                  <img
                    src={selectedLogo}
                    alt="Avatar"
                    className="w-4 h-4 object-contain rounded-sm"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={30}
                placeholder="Your player name..."
                className="w-full pl-9 pr-14 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] font-mono text-slate-500">
                {displayName.length}/30
              </span>
            </div>
          </div>

          {/* Logo / Icon Picker Section */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Choose an Icon, Emoji, or Team Logo
              </label>

              {selectedLogo && (
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Clear Icon
                </button>
              )}
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex flex-wrap bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                    activeTab === "all"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  All ({FOOTBALL_ICONS_AND_AVATARS.length + POPULAR_EMOJIS_AND_AVATARS.length + BEER_AND_LEISURE_AVATARS.length + NFL_TEAMS_ALL.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("football")}
                  className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                    activeTab === "football"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span>🏈</span> Football ({FOOTBALL_ICONS_AND_AVATARS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("emojis")}
                  className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                    activeTab === "emojis"
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span>🔥</span> Emojis & Hype ({POPULAR_EMOJIS_AND_AVATARS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("leisure")}
                  className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                    activeTab === "leisure"
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span>🍻</span> Leisure ({BEER_AND_LEISURE_AVATARS.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("nfl")}
                  className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                    activeTab === "nfl"
                      ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  NFL (32)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("afc")}
                  className={`px-2 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                    activeTab === "afc"
                      ? "bg-red-500/20 text-red-300 border border-red-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  AFC
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("nfc")}
                  className={`px-2 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                    activeTab === "nfc"
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  NFC
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-500">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search (e.g. Chiefs, 🏈, Goat, Fire, Trophy)..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Grid of Icons & Logos */}
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-64 overflow-y-auto p-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
              {/* 1. Football Icons Section */}
              {filteredFootball.map((item) => {
                const isSelected = selectedLogo === item.url;
                return (
                  <button
                    key={item.id}
                    type="button"
                    title={item.label}
                    onClick={() => setSelectedLogo(item.url)}
                    className={`relative p-1.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer group ${
                      isSelected
                        ? "bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-950/40"
                        : "bg-slate-900/80 hover:bg-slate-850 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <img
                        src={item.url}
                        alt={item.label}
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    </div>
                    {isSelected && (
                      <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-sm">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}

              {/* 2. Emojis & Hype Icons */}
              {filteredEmojis.map((item) => {
                const isSelected = selectedLogo === item.url;
                return (
                  <button
                    key={item.id}
                    type="button"
                    title={item.label}
                    onClick={() => setSelectedLogo(item.url)}
                    className={`relative p-1.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer group ${
                      isSelected
                        ? "bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-950/40"
                        : "bg-slate-900/80 hover:bg-slate-850 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <img
                        src={item.url}
                        alt={item.label}
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    </div>
                    {isSelected && (
                      <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-sm">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}

              {/* 3. Leisure & Drinks */}
              {filteredLeisure.map((item) => {
                const isSelected = selectedLogo === item.url;
                return (
                  <button
                    key={item.id}
                    type="button"
                    title={item.label}
                    onClick={() => setSelectedLogo(item.url)}
                    className={`relative p-1.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer group ${
                      isSelected
                        ? "bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-950/40"
                        : "bg-slate-900/80 hover:bg-slate-850 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <img
                        src={item.url}
                        alt={item.label}
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    </div>
                    {isSelected && (
                      <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-sm">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}

              {/* 4. NFL Team Logos */}
              {filteredNfl.map((team) => {
                const logoUrl = getNflTeamLogoUrl(team.value);
                const isSelected = selectedLogo === logoUrl;

                return (
                  <button
                    key={team.value}
                    type="button"
                    title={team.label}
                    onClick={() => setSelectedLogo(logoUrl)}
                    className={`relative p-1.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer group ${
                      isSelected
                        ? "bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-950/40"
                        : "bg-slate-900/80 hover:bg-slate-850 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <img
                        src={logoUrl}
                        alt={team.label}
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    </div>
                    {isSelected && (
                      <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-sm">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {filteredFootball.length === 0 && filteredEmojis.length === 0 && filteredLeisure.length === 0 && filteredNfl.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-xs bg-slate-950/40 rounded-xl border border-slate-800">
                No icons or teams found matching &ldquo;{searchQuery}&rdquo;.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-800/90 border-t border-slate-700/80 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !displayName.trim()}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20 hover:scale-[1.02]"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Save Profile & Icon</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
