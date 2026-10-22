import { auth, db } from '../firebase';
import { reload, sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth';
import { ref, get } from 'firebase/database';

export const resendVerificationEmail = async (user = auth.currentUser) => {
  if (!user) {
    throw new Error('Silakan masuk kembali sebelum meminta email verifikasi.');
  }

  await reload(user);
  if (user.emailVerified) return false;

  await sendEmailVerification(user, {
    url: new URL('/login', window.location.origin).toString(),
  });
  return true;
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await reload(user);
    if (!user.emailVerified) {
      throw new Error('Email belum diverifikasi. Silakan cek kotak masuk Anda.');
    }

    const userRef = ref(db, 'users/' + user.uid);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      throw new Error('Data user tidak ditemukan di database.');
    }
  } catch (error) {
    throw error;
  }
};