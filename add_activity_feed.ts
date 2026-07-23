import * as fs from 'fs';

let content = fs.readFileSync('src/components/PoolSelector.tsx', 'utf-8');

// Add imports
content = content.replace(
  'import { Trophy, Plus, LogIn, Lock, Users, ArrowRight, AlertCircle, Sparkles, Heart } from "lucide-react";',
  'import { Trophy, Plus, LogIn, Lock, Users, ArrowRight, AlertCircle, Sparkles, Heart, Activity, UserPlus, CheckCircle2 } from "lucide-react";'
);

// Add ActivityItem type
const typeInsertion = `type ActivityItem = {
  id: string;
  type: 'join' | 'pick' | 'leaderboard';
  message: string;
  timestamp: Date;
  poolName: string;
};

interface PoolSelectorProps {`;
content = content.replace('interface PoolSelectorProps {', typeInsertion);

// Add state and useEffect
const stateInsertion = `  const [creating, setCreating] = useState(false);

  // Activity Feed State
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  useEffect(() => {
    if (pools.length === 0) return;

    const loadActivities = async () => {
      setLoadingActivities(true);
      try {
        const feed: ActivityItem[] = [];

        for (const pool of pools) {
          if (pool.createdAt) {
            const createdAt = pool.createdAt?.toDate ? pool.createdAt.toDate() : new Date();
            feed.push({
              id: \`pool_create_\${pool.id}\`,
              type: 'leaderboard',
              message: \`Pool created by \${pool.creatorName}\`,
              timestamp: createdAt,
              poolName: pool.name
            });
          }

          const picksQuery = query(collection(db, \`pools/\${pool.id}/picks\`));
          const pickSnaps = await getDocs(picksQuery);
          pickSnaps.forEach(docSnap => {
            const data = docSnap.data();
            if (data.updatedAt) {
               const ts = data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date();
               const isJoin = !data.selections || Object.keys(data.selections).length === 0;
               
               feed.push({
                 id: \`pick_\${pool.id}_\${docSnap.id}\`,
                 type: isJoin ? 'join' : 'pick',
                 message: isJoin ? \`\${data.userDisplayName} joined the pool\` : \`\${data.userDisplayName} locked in their picks\`,
                 timestamp: ts,
                 poolName: pool.name
               });
            }
          });
        }

        feed.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setActivities(feed.slice(0, 10));
      } catch (e) {
        console.error("Failed to load activities", e);
      } finally {
        setLoadingActivities(false);
      }
    };

    loadActivities();
  }, [pools]);`;
content = content.replace('  const [creating, setCreating] = useState(false);', stateInsertion);

// Add component markup
const feedMarkup = `          {/* Activity Feed */}
          <div className="bg-[#09222c] border border-[#113a4b]/80 rounded-2xl p-4 shadow-xl">
            <h2 className="text-sm font-extrabold text-white flex items-center gap-2 mb-4 uppercase tracking-wider">
              <Activity className="w-4 h-4 text-teal-400" /> Recent Activity
            </h2>
            {loadingActivities ? (
              <div className="flex justify-center items-center py-6">
                <div className="w-5 h-5 rounded-full border-2 border-teal-500/25 border-t-teal-400 animate-spin"></div>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs italic">
                No recent activity to display.
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map(act => (
                  <div key={act.id} className="flex gap-3 items-start p-2 rounded-lg hover:bg-slate-800/30 transition-colors">
                    <div className="mt-0.5 shrink-0">
                      {act.type === 'join' && <UserPlus className="w-4 h-4 text-indigo-400" />}
                      {act.type === 'pick' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {act.type === 'leaderboard' && <Trophy className="w-4 h-4 text-amber-400" />}
                    </div>
                    <div>
                      <p className="text-xs text-slate-200">
                        {act.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] text-teal-500/70 font-mono uppercase tracking-wider">{act.poolName}</span>
                        <span className="text-[9px] text-slate-500">•</span>
                        <span className="text-[9px] text-slate-500">
                          {act.timestamp.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {act.timestamp.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}`;
content = content.replace(/        <\/div>\n      <\/div>\n    <\/div>\n  \);\n}/, feedMarkup);

fs.writeFileSync('src/components/PoolSelector.tsx', content);
