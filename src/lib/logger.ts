import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function logActivity(
  author: string,
  role: string,
  action: string,
  candidateName: string,
  affectedUser: string | null,
  purpose: string,
  module: string
) {
  try {
    await addDoc(collection(db, 'activity_logs'), {
      author,
      role,
      action,
      candidateName,
      affectedUser,
      purpose,
      module,
      timestamp: serverTimestamp()
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}
