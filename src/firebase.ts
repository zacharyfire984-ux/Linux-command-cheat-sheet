import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  serverTimestamp,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Initialize Firestore with custom database ID if specified
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Test connection on boot
(async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore client is offline or not reachable.');
    }
  }
})();

// Auth helpers
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  // Ensure user profile document exists
  if (result.user) {
    const userRef = doc(db, 'users', result.user.uid);
    const existing = await getDoc(userRef);
    if (!existing.exists()) {
      await setDoc(userRef, {
        uid: result.user.uid,
        displayName: result.user.displayName || 'Cyber Explorer',
        email: result.user.email || '',
        photoURL: result.user.photoURL || '',
        learnedCount: 0,
        favoritesCount: 0,
        updatedAt: serverTimestamp(),
      });
    }
  }
  return result.user;
}

export async function logOut(): Promise<void> {
  await signOut(auth);
}

// User data sync helpers
export async function syncUserDataFromCloud(userId: string): Promise<{
  learned: Set<string>;
  favorites: Set<string>;
  notes: Record<string, string>;
}> {
  const learnedSet = new Set<string>();
  const favoritesSet = new Set<string>();
  const notesMap: Record<string, string> = {};

  try {
    // 1. Fetch learned
    const learnedSnap = await getDocs(collection(db, 'users', userId, 'learned'));
    learnedSnap.forEach((d) => {
      learnedSet.add(d.id);
    });

    // 2. Fetch favorites
    const favSnap = await getDocs(collection(db, 'users', userId, 'favorites'));
    favSnap.forEach((d) => {
      favoritesSet.add(d.id);
    });

    // 3. Fetch notes
    const notesSnap = await getDocs(collection(db, 'users', userId, 'notes'));
    notesSnap.forEach((d) => {
      const data = d.data();
      if (data.note) {
        notesMap[d.id] = data.note;
      }
    });
  } catch (err) {
    console.error('Error syncing data from Firestore:', err);
  }

  return { learned: learnedSet, favorites: favoritesSet, notes: notesMap };
}

export async function cloudToggleLearned(userId: string, commandId: string, isLearned: boolean): Promise<void> {
  try {
    const ref = doc(db, 'users', userId, 'learned', commandId);
    if (isLearned) {
      await setDoc(ref, {
        commandId,
        learnedAt: serverTimestamp(),
      });
    } else {
      await deleteDoc(ref);
    }
  } catch (err) {
    console.error('Failed to update learned state in cloud:', err);
  }
}

export async function cloudToggleFavorite(userId: string, commandId: string, isFavorite: boolean): Promise<void> {
  try {
    const ref = doc(db, 'users', userId, 'favorites', commandId);
    if (isFavorite) {
      await setDoc(ref, {
        commandId,
        addedAt: serverTimestamp(),
      });
    } else {
      await deleteDoc(ref);
    }
  } catch (err) {
    console.error('Failed to update favorite state in cloud:', err);
  }
}

export async function cloudSaveNote(userId: string, commandId: string, noteText: string): Promise<void> {
  try {
    const ref = doc(db, 'users', userId, 'notes', commandId);
    if (noteText.trim()) {
      await setDoc(ref, {
        commandId,
        note: noteText.trim(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await deleteDoc(ref);
    }
  } catch (err) {
    console.error('Failed to save note in cloud:', err);
  }
}
