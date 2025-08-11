import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Loader from '../loader/Loader';

export default function ProtectedRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect on login page, signup page, or home page
    if (router.pathname === '/' || router.pathname === '/auth/login' || router.pathname === '/auth/signup') {
      return;
    }

    // If not loading and not authenticated, redirect to login
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [loading, isAuthenticated, router]);

  // Show loader while checking authentication
  if (loading) {
    return <Loader />;
  }

  // Don't show protected content on login page, signup page, or home page
  if (router.pathname === '/' || router.pathname === '/auth/login' || router.pathname === '/auth/signup') {
    return children;
  }

  // Only show protected content if authenticated
  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return children;
}
