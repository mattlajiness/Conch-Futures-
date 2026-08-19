import React, { useState, useEffect } from "react";
import {
  User,
  Shield,
  Sparkles,
  Search,
  Check,
  CheckCircle2,
  X,
  RotateCcw,
  Award,
  CircleDollarSign,
  Save,
  MessageSquare,
  Flame,
  Trophy,
} from "lucide-react";
import {
  NFL_TEAMS_ALL,
  FOOTBALL_ICONS_AND_AVATARS,
  POPULAR_EMOJIS_AND_AVATARS,
  BEER_AND_LEISURE_AVATARS,
  getNflTeamLogoUrl,
} from "../constants";
import { useAuth, AuthUser } from "../lib/auth";
import { Pool, Picks } from "../types";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

interface ProfileTabProps {
  pool: Pool;
  user: AuthUser;
  userPicks: Picks | null;
  onProfileUpdated?: () => void;
}

export default function ProfileTab({
  pool,
  user,
  userPicks,
  onProfileUpdated,
}: ProfileTabProps) {
  const { updateUserProfile } = useAuth();

  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [selectedLogo, setSelectedLogo] = useState(user.photoURL || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "football" | "emojis" | "leisure" | "nfl" | "afc" | "nfc">("all");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user.displayName) setDisplayName(user.displayName);
    if (user.photoURL !== undefined) setSelectedLogo(user.photoURL || "");
  }, [user.displayName, user.photoURL]);

  const isCreator = pool.creatorId === user.uid;
  const isPaid = pool.payments?.[user.uid]?.paid;
  const picksCount = Object.keys(userPicks?.selections || {}).length;

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

      // 2. Sync pick document in the current pool
      try {
        const pickDocRef = doc(db, `pools/${pool.id}/picks`, user.uid);
        await updateDoc(pickDocRef, {
          userDisplayName: cleanName,
          userPhotoURL: cleanLogo,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.debug("Pick record not yet created or failed to update:", err);
      }

      setSuccessMsg("Your profile and icon have been updated successfully!");
      if (onProfileUpdated) onProfileUpdated();

      setTimeout(() => {
        setSuccessMsg(null);
      }, 3500);
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
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Profile Status Overview Card */}
      <div className="bg-[#09222c] border border-[#113a4b]/80 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              {selectedLogo ? (
                <img
                  src={selectedLogo}
                  alt={displayName || "User"}
                  className="w-16 h-16 rounded-full bg-slate-950 p-1 border-2 border-emerald-500/60 object-contain shadow-lg"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-black text-xl text-slate-300 uppercase shadow-lg">
                  {(displayName || "P").substring(0, 2)}
                </div>
              )}
              {isCreator && (
                <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1 rounded-full border-2 border-slate-900 shadow" title="Pool Creator">
                  <Shield className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {displayName || "Player"}
                </h2>
                {isCreator ? (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md text-[10px] font-bold uppercase tracking-wider">
                    Creator / Admin
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-md text-[10px] font-bold uppercase tracking-wider">
                    Member
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {user.email}
              </p>
            </div>
          </div>

          {/* Quick Pool Stats */}
          <div className="flex items-center gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
            <div className="flex-1 sm:flex-none bg-slate-900/80 border border-slate-800 px-3.5 py-2 rounded-xl text-center">
              <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Picks Made</span>
              <span className="text-sm font-mono font-bold text-emerald-400">{picksCount} picks</span>
            </div>

            {(pool.entryFee || 0) > 0 && (
              <div className="flex-1 sm:flex-none bg-slate-900/80 border border-slate-800 px-3.5 py-2 rounded-xl text-center">
                <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Dues</span>
                {isPaid ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                    <Check className="w-3 h-3" /> Paid
                  </span>
                ) : (
                  <span className="text-xs font-bold text-amber-400">
                    Pending
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Customizer Form Card */}
      <div className="bg-[#09222c] border border-[#113a4b]/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">
                Edit Profile & Appearance
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Customize your name and select a football icon, emoji, or NFL team logo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !displayName.trim()}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>

        {/* Status Alerts */}
        {successMsg && (
          <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-emerald-300 text-xs font-semibold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-rose-300 text-xs font-semibold animate-fadeIn">
            <X className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Live Appearance Preview in App */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-teal-400" />
              Live Preview in App
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">How others see your profile</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {/* 1. Leaderboard row */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-[11px] flex items-center justify-center border border-amber-500/30 flex-shrink-0">
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
                <span className="text-[10px] text-slate-400">145 Pts • 11 Correct</span>
              </div>
            </div>

            {/* 2. League Chat Preview */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex flex-col justify-center">
              <div className="bg-slate-800 text-slate-200 border border-slate-700/50 rounded-2xl rounded-tl-sm px-3 py-1.5 text-xs w-fit">
                Can&apos;t wait for kickoff! 🏈
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
                <span className="text-[9px] text-slate-500">• Just now</span>
              </div>
            </div>
          </div>
        </div>

        {/* Display Name Input */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-300">
            Player Display Name
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
              className="w-full pl-9 pr-14 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
            />
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] font-mono text-slate-500">
              {displayName.length}/30
            </span>
          </div>
        </div>

        {/* Icon & Logo Picker */}
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
                <RotateCcw className="w-3 h-3" /> Clear Selected Icon
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
                placeholder="Search icon, emoji, or team..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Grid of Icons & Logos */}
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-80 overflow-y-auto p-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
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
            <div className="text-center py-8 text-slate-400 text-xs bg-slate-950/40 rounded-xl border border-slate-800">
              No icons or teams found matching &ldquo;{searchQuery}&rdquo;.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
