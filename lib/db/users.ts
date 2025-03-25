import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import type { User } from "firebase/auth";

/**
 * Interface representing a UserProfile, including details about the user
 * and metadata about their account.
 */
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: "user" | "admin";
  emailVerified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Function to create a new user profile in Firestore.
 * It initializes a new user profile document with values from the Firebase Auth user.
 *
 * @param user - The Firebase Auth user object.
 */
export async function createUserProfile(user: User): Promise<void> {
  const userProfile = {
    uid: user.uid,
    email: user.email!,
    displayName: user.displayName || null,
    photoURL: user.photoURL || null,
    role: "user",
    emailVerified: user.emailVerified,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await setDoc(doc(db, "users", user.uid), userProfile);
}

/**
 * Function to get a user profile by UID.
 * It retrieves the user's profile data from Firestore.
 *
 * @param uid - The unique identifier of the user whose profile is to be retrieved.
 * @returns The user's profile data or null if no profile is found.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }

  return null;
}

/**
 * Function to update a user profile in Firestore.
 * It allows updating specific fields of the user profile (except 'createdAt' and 'updatedAt').
 *
 * @param uid - The unique identifier of the user whose profile is to be updated.
 * @param data - The data to update in the user profile, excluding 'createdAt' and 'updatedAt'.
 */
export async function updateUserProfile(
  uid: string,
  data: Partial<Omit<UserProfile, "createdAt" | "updatedAt">>,
): Promise<void> {
  const docRef = doc(db, "users", uid);

  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Function to update the email verification status of a user.
 * It updates the 'emailVerified' field in the user's profile in Firestore.
 *
 * @param uid - The unique identifier of the user whose email verification status is to be updated.
 * @param isVerified - The new email verification status (true or false).
 */
export async function updateEmailVerificationStatus(
  uid: string,
  isVerified: boolean,
): Promise<void> {
  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, {
    emailVerified: isVerified,
    updatedAt: Timestamp.now(),
  });
}
