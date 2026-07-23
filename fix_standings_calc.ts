import * as fs from 'fs';
let content = fs.readFileSync('src/components/StandingsTab.tsx', 'utf-8');

const target1 = `        return {
          userId: pick.userId,
          userDisplayName: pick.userDisplayName || "Anonymous Player",
          userPhotoURL: pick.userPhotoURL,
          score,
          correctCount,
          totalPicks,
          picks: pick.selections,
        };`;

const rep1 = `        let tiebreakerDiff: number | undefined;
        if (pool.tiebreakerResult && pick.tiebreaker) {
          tiebreakerDiff = Math.abs(Number(pick.tiebreaker) - Number(pool.tiebreakerResult));
        }

        return {
          userId: pick.userId,
          userDisplayName: pick.userDisplayName || "Anonymous Player",
          userPhotoURL: pick.userPhotoURL,
          score,
          correctCount,
          totalPicks,
          picks: pick.selections,
          tiebreaker: pick.tiebreaker,
          tiebreakerDiff,
        };`;

const target2 = `      // Sort by score DESC, then correct count DESC, then alphabetically by name
      rows.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.correctCount !== a.correctCount) return b.correctCount - a.correctCount;
        return a.userDisplayName.localeCompare(b.userDisplayName);
      });`;

const rep2 = `      // Sort by score DESC, then correct count DESC, then tiebreaker diff ASC, then alphabetically by name
      rows.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.correctCount !== a.correctCount) return b.correctCount - a.correctCount;
        if (a.tiebreakerDiff !== undefined && b.tiebreakerDiff !== undefined) {
           if (a.tiebreakerDiff !== b.tiebreakerDiff) return a.tiebreakerDiff - b.tiebreakerDiff;
        } else if (a.tiebreakerDiff !== undefined) {
           return -1; // a has tiebreaker, b doesn't
        } else if (b.tiebreakerDiff !== undefined) {
           return 1; // b has tiebreaker, a doesn't
        }
        return a.userDisplayName.localeCompare(b.userDisplayName);
      });`;

content = content.replace(target1, rep1).replace(target2, rep2);
fs.writeFileSync('src/components/StandingsTab.tsx', content);
