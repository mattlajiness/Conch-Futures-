export interface Pool {
  id: string;
  name: string;
  description?: string;
  code: string;
  creatorId: string;
  creatorName: string;
  createdAt: any; // Timestamp or date string
  results?: Record<string, string>; // Map of categoryId -> officialWinner
  activeQuestions?: string[]; // Optional active question IDs for this pool
}

export interface Picks {
  userId: string;
  userDisplayName: string;
  userPhotoURL?: string;
  selections: Record<string, string>; // Map of categoryId -> selectedOption
  updatedAt: any; // Timestamp
}

export interface FutureQuestion {
  id: string;
  category: "award" | "team" | "division" | "over_under" | "standings";
  title: string;
  subtitle: string;
  points: number;
  options: { value: string; label: string; logo?: string }[];
}

export interface StandingRow {
  userId: string;
  userDisplayName: string;
  userPhotoURL?: string;
  score: number;
  correctCount: number;
  totalPicks: number;
  picks: Record<string, string>;
}
