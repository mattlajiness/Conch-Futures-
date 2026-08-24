import { db } from "./firebase";
import {
  collection,
  collectionGroup,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

/**
 * Synchronizes the user's display name and logo/avatar across all pools they have joined or created.
 */
export async function syncUserProfileAcrossAllPools(
  userId: string,
  displayName: string,
  photoURL: string
): Promise<void> {
  if (!userId) return;

  const cleanName = displayName.trim() || "Player";
  const cleanPhoto = photoURL.trim();

  try {
    // 1. Gather the pools this user belongs to, from their own pick documents.
    // The previous localStorage lookup read "user_pool_ids", a key nothing ever
    // writes, so it only ever contributed an empty list.
    const poolIdsSet = new Set<string>();

    try {
      const picksSnap = await getDocs(
        query(collectionGroup(db, "picks"), where("userId", "==", userId))
      );
      picksSnap.docs.forEach((d) => {
        const poolId = d.ref.parent.parent?.id;
        if (poolId) poolIdsSet.add(poolId);
      });
    } catch (e) {
      console.warn("Picks collection-group query unavailable:", e);
    }

    // Pools they created but have no pick document in. This used to read the
    // whole `pools` collection as a safety net for the still-building picks
    // index, which made one profile save cost two reads per pool IN THE ENTIRE
    // DATABASE — not per pool the user is in. A creatorId-filtered query
    // answers the same question at the user's own scale.
    const createdPools = new Map<string, string>(); // poolId -> current creatorName
    try {
      const createdSnap = await getDocs(
        query(collection(db, "pools"), where("creatorId", "==", userId))
      );
      createdSnap.docs.forEach((d) => {
        poolIdsSet.add(d.id);
        createdPools.set(d.id, d.data().creatorName);
      });
    } catch (e) {
      console.warn("Could not query pools created by user:", e);
    }

    // 2. Loop through all known pool IDs and synchronize pick documents
    const poolIds = Array.from(poolIdsSet);
    const updatePromises = poolIds.map(async (poolId) => {
      try {
        // The creator query above already told us which pools this user created
        // and what name they currently carry, so no per-pool read is needed.
        if (createdPools.has(poolId) && createdPools.get(poolId) !== cleanName) {
          try {
            await updateDoc(doc(db, "pools", poolId), { creatorName: cleanName });
          } catch (err) {
            console.debug(`Failed to update creator name on pool ${poolId}:`, err);
          }
        }

        // Update or merge the user's pick document in this pool
        const pickDocRef = doc(db, `pools/${poolId}/picks`, userId);
        const pickDocSnap = await getDoc(pickDocRef);

        if (pickDocSnap.exists()) {
          await updateDoc(pickDocRef, {
            userDisplayName: cleanName,
            userPhotoURL: cleanPhoto,
            updatedAt: serverTimestamp(),
          });
        }
      } catch (err) {
        console.debug(`Failed to sync user in pool ${poolId}:`, err);
      }
    });

    await Promise.allSettled(updatePromises);
  } catch (error) {
    console.error("Error syncing user profile across pools:", error);
  }
}
