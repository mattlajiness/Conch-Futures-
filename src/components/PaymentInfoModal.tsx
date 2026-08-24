import React, { useState, useEffect } from "react";
import { X, DollarSign, Save, Receipt, Sparkles, Check, AlertCircle, ExternalLink, Copy, ShieldCheck, Clock, Trophy } from "lucide-react";
import { Pool } from "../types";
import { doc, updateDoc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";

interface PaymentInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  pool: Pool;
  isCreator: boolean;
  currentUserId?: string;
  memberCount?: number;
  onPoolUpdated: (updated: Pool) => void;
  onNavigateToDuesTracker?: () => void;
}

export default function PaymentInfoModal({
  isOpen,
  onClose,
  pool,
  isCreator,
  currentUserId,
  memberCount = 0,
  onPoolUpdated,
  onNavigateToDuesTracker,
}: PaymentInfoModalProps) {
  const [entryFee, setEntryFee] = useState<number | string>(pool.entryFee !== undefined ? pool.entryFee : 0);
  const [duesNote, setDuesNote] = useState<string>(pool.duesNote || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(isCreator && (!pool.duesNote && (!pool.entryFee || pool.entryFee === 0)));

  useEffect(() => {
    if (isOpen) {
      setEntryFee(pool.entryFee !== undefined ? pool.entryFee : 0);
      setDuesNote(pool.duesNote || "");
      setError(null);
      setSuccess(false);
      setCopied(false);
      setIsEditing(isCreator && (!pool.duesNote && (!pool.entryFee || pool.entryFee === 0)));
    }
  }, [isOpen, pool, isCreator]);

  if (!isOpen) return null;

  const handleCopyNote = async () => {
    if (!pool.duesNote) return;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(pool.duesNote);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }
    } catch (e) {
      console.warn("Clipboard error", e);
    }
    // Fallback
    const textArea = document.createElement("textarea");
    textArea.value = pool.duesNote;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError(null);

    const feeNum = Math.max(0, Number(entryFee) || 0);
    const cleanedNote = duesNote.trim();
    const path = `pools/${pool.id}`;

    try {
      await updateDoc(doc(db, path), {
        entryFee: feeNum,
        duesNote: cleanedNote,
      });

      const updatedPool: Pool = {
        ...pool,
        entryFee: feeNum,
        duesNote: cleanedNote,
      };

      onPoolUpdated(updatedPool);
      setSuccess(true);
      setTimeout(() => {
        setIsEditing(false);
        setSuccess(false);
      }, 800);
    } catch (err: any) {
      console.error("Error saving payment info:", err);
      setError("Failed to save payment info. Please check your connection.");
      handleFirestoreError(err, OperationType.UPDATE, path);
    } finally {
      setSaving(false);
    }
  };

  const handleInsertPreset = (presetText: string) => {
    setDuesNote((prev) => {
      if (!prev) return presetText;
      return `${prev} | ${presetText}`;
    });
  };

  const userPaymentStatus = currentUserId ? pool.payments?.[currentUserId]?.paid : false;
  const currentFee = pool.entryFee || 0;
  const totalPot = currentFee * Math.max(memberCount, 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Pool Payment & Dues Info</h3>
              <p className="text-xs text-slate-400">Buy-in details & instructions from the commissioner</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>Payment instructions updated successfully!</span>
            </div>
          )}

          {/* Quick Overview Summary Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Entry Fee
              </div>
              <div className="text-lg font-black font-mono text-emerald-400 mt-0.5">
                {currentFee > 0 ? `$${currentFee}` : "Free"}
              </div>
            </div>

            {currentFee > 0 && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Total Pot
                </div>
                <div className="text-lg font-black font-mono text-white mt-0.5">
                  ${totalPot}
                  <span className="text-[10px] text-slate-500 font-sans ml-1 font-normal">
                    ({memberCount} {memberCount === 1 ? "entry" : "entries"})
                  </span>
                </div>
              </div>
            )}

            {currentUserId && currentFee > 0 && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 col-span-2 sm:col-span-1">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Your Status
                </div>
                <div className="mt-0.5">
                  {userPaymentStatus ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      <ShieldCheck className="w-3.5 h-3.5" /> Buy-In Paid ✅
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/30">
                      <Clock className="w-3.5 h-3.5" /> Fee Pending 💸
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Admin Edit Mode */}
          {isCreator && isEditing ? (
            <form onSubmit={handleSave} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Entry Fee / Buy-In ($ USD)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
                    $
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={entryFee}
                    onChange={(e) => setEntryFee(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-8 pr-4 py-2.5 text-white font-mono font-bold text-base focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Set to <strong>0</strong> if this pool has no buy-in.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Payment Instructions & Handles
                  </label>
                  <span className="text-[10px] text-slate-500">
                    {String(duesNote).length}/1000
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={1000}
                  value={duesNote}
                  onChange={(e) => setDuesNote(e.target.value)}
                  placeholder="e.g. Venmo: @commissioner | CashApp: $mytag | Due before Week 1 kickoff! Please include your team name in the payment memo."
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white text-xs leading-relaxed focus:outline-none focus:border-emerald-500 transition-colors resize-none placeholder:text-slate-600"
                />
              </div>

              {/* Preset Quick Insertion Tags */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-400 block">
                  Quick insert templates:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleInsertPreset("Venmo: @")}
                    className="text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-sky-400 border border-sky-500/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    + Venmo: @
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertPreset("CashApp: $")}
                    className="text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    + CashApp: $
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertPreset("Zelle: ")}
                    className="text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    + Zelle:
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertPreset("PayPal: @")}
                    className="text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    + PayPal: @
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertPreset("Payouts: 1st: 70%, 2nd: 20%, 3rd: 10%")}
                    className="text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    + Payout Breakdown
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? "Saving..." : "Save Payment Info"}
                </button>
              </div>
            </form>
          ) : (
            /* Member & Read-Only Display Mode */
            <div className="space-y-4 pt-1">
              {currentFee > 0 && (
                <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
                      Estimated Payouts
                    </span>
                  </div>
                  <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    {pool.duesNote && pool.duesNote.toLowerCase().includes("payout") 
                      ? "See the commissioner's notes below for custom payout rules." 
                      : `🏆 1st Place (Winner Takes All): ${totalPot}`}
                  </div>
                </div>
              )}

              {(!currentUserId || !userPaymentStatus) && (
                <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                    Payment Instructions
                  </span>
                  {pool.duesNote && (
                    <button
                      type="button"
                      onClick={handleCopyNote}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-755 text-slate-300 hover:text-white rounded-lg border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Info</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {pool.duesNote ? (
                  <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    {pool.duesNote}
                  </p>
                ) : (
                  <p className="text-slate-400 text-xs italic">
                    No payment instructions posted yet by the commissioner.
                  </p>
                )}
              </div>
              )}

              {/* Creator Edit Button */}
              {isCreator && (
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Edit Payment Instructions & Fee</span>
                  </button>

                  {onNavigateToDuesTracker && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateToDuesTracker();
                      }}
                      className="text-xs text-slate-400 hover:text-white font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <span>Manage Dues Checklist</span>
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
