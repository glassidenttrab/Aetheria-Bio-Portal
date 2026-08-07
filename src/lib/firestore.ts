import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';

export const COLLECTIONS = {
  USERS: 'users',
  ORDERS: 'orders',
  SUBSCRIPTIONS: 'subscriptions',
} as const;

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Order {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  currency: string;
  status: 'completed' | 'failed';
  paypalOrderId: string;
  createdAt: Timestamp;
}

export async function createUserProfile(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  const ref = doc(db, COLLECTIONS.USERS, uid);
  await setDoc(ref, {
    uid,
    email: data.email || null,
    displayName: data.displayName || null,
    photoURL: data.photoURL || null,
    plan: data.plan || 'free',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...data,
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, COLLECTIONS.USERS, uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  const ref = doc(db, COLLECTIONS.USERS, uid);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function createOrderRecord(order: Omit<Order, 'createdAt'>): Promise<void> {
  const ref = doc(db, COLLECTIONS.ORDERS, order.id);
  await setDoc(ref, {
    ...order,
    createdAt: serverTimestamp(),
  });
}
