import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { onAuthStateChanged, reload } from 'firebase/auth';
import { auth } from '../../firebase';

export default function VerifiedRoute({ children }) {
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (active) setStatus('signed-out');
        return;
      }

      try {
        await reload(user);
        if (active) setStatus(user.emailVerified ? 'verified' : 'unverified');
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to verify your account.');
          setStatus('error');
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  if (status === 'verified') return children;
  if (status === 'loading') {
    return <div className="flex min-h-screen items-center justify-center">Checking your account...</div>;
  }
  if (status === 'signed-out') {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="font-serif text-2xl text-grimoire-dark">Email verification required</h1>
      <p className="max-w-md text-gray-600">
        {status === 'unverified'
          ? 'Please verify your email using the link in your inbox, then sign in again to continue.'
          : error}
      </p>
      <Link className="font-bold text-grimoire-dark underline" to="/login">Go to sign in</Link>
    </main>
  );
}
