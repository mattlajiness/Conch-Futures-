import React, { useState, useEffect } from "react";
import { collection, collectionGroup, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Pool } from "../types";
import { ArrowLeft, Users, Trophy, Activity, CheckCircle2 } from "lucide-react";
import { AuthUser } from "../lib/auth";

interface SiteAdminPortalProps {
  onBack: () => void;
}

export default function SiteAdminPortal({ onBack }: SiteAdminPortalProps) {
  const [pools, setPools] = useState<Pool[]>([]);
  const [globalStats, setGlobalStats] = useState({
    totalPools: 0,
    totalUsers: 0,
    totalPicks: 0,
    totalPotSize: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const poolsSnap = await getDocs(collection(db, "pools"));
        const allPools: Pool[] = [];
        poolsSnap.forEach(doc => {
          const data = doc.data() as Pool;
          allPools.push(data);
        });

        const picksSnap = await getDocs(collectionGroup(db, "picks"));
        const uniqueUsers = new Set<string>();
        let picksCount = 0;
        const poolMemberCounts: Record<string, number> = {};

        picksSnap.forEach(doc => {
          const data = doc.data();
          const isJoin = !data.selections || Object.keys(data.selections).length === 0;
          uniqueUsers.add(doc.id);
          
          if (!isJoin) {
            picksCount++;
          }
          const poolId = doc.ref.parent.parent?.id;
          if (poolId) {
             poolMemberCounts[poolId] = (poolMemberCounts[poolId] || 0) + 1;
          }
        });

        let potSize = 0;
        allPools.forEach(p => {
          potSize += (p.entryFee || 0) * (poolMemberCounts[p.id] || 0);
        });

        setPools(allPools.map(p => ({...p, memberCount: poolMemberCounts[p.id] || 0})));
        setGlobalStats({
          totalPools: allPools.length,
          totalUsers: uniqueUsers.size,
          totalPicks: picksCount,
          totalPotSize: potSize,
        });

      } catch (err) {
        console.error("Failed to load admin stats", err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-teal-500/25 border-t-teal-400 animate-spin mb-4 mx-auto"></div>
        <div className="text-emerald-400 font-bold">Loading Site Stats...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <h1 className="text-2xl font-black text-white mb-6">Site Administration Portal</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Pools</div>
          <div className="text-3xl font-black text-white">{globalStats.totalPools}</div>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Unique Users</div>
          <div className="text-3xl font-black text-white">{globalStats.totalUsers}</div>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Completed Picks</div>
          <div className="text-3xl font-black text-white">{globalStats.totalPicks}</div>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Economy (Pots)</div>
          <div className="text-3xl font-black text-emerald-400">${globalStats.totalPotSize}</div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-white mb-4">All Active Pools</h2>
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800 text-slate-400 text-xs uppercase font-bold">
            <tr>
              <th className="px-4 py-3">Pool Name</th>
              <th className="px-4 py-3">Creator</th>
              <th className="px-4 py-3">Members</th>
              <th className="px-4 py-3">Entry Fee</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {pools.map(pool => (
              <tr key={pool.id} className="hover:bg-slate-800/50">
                <td className="px-4 py-3 font-semibold text-white">{pool.name}</td>
                <td className="px-4 py-3">{pool.creatorName}</td>
                <td className="px-4 py-3">{(pool as any).memberCount}</td>
                <td className="px-4 py-3 text-emerald-400 font-mono font-bold">${pool.entryFee || 0}</td>
                <td className="px-4 py-3 text-slate-500">
                  {pool.createdAt?.toDate ? pool.createdAt.toDate().toLocaleDateString() : "Unknown"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
