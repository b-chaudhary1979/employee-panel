import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const router = useRouter();

  const getCookie = (name) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  const removeCookie = (name) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  };

  // JWT-based session cookie utilities for both companyId and employeeId
  const setSessionCookie = async (companyId, employeeId, days = 7) => {
    try {
      // Call API to create JWT token
      const response = await fetch('/api/createSession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId,
          employeeId,
          days
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const data = await response.json();
      const token = data.token;
      
      const expires = new Date();
      expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
      const cookieValue = `employeeSession=${token};expires=${expires.toUTCString()};path=/;SameSite=Strict${process.env.NODE_ENV === 'production' ? ';Secure' : ''}`;
      document.cookie = cookieValue;
      
    } catch (error) {
      console.error('Failed to set session cookie:', error);
      setError('Session creation failed. Please try again.');
    }
  };

  const getSessionFromCookie = async () => {
    try {
      const token = getCookie('employeeSession');
      if (!token) {
        return null;
      }
      
      // Call API to verify JWT token
      const response = await fetch('/api/verifySession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        // If token is invalid, remove it
        removeCookie('employeeSession');
        return null;
      }

      const data = await response.json();
      return data.sessionData;
    } catch (error) {
      removeCookie('employeeSession');
      return null;
    }
  };

  // Extract companyId from URL token (existing logic - NO CHANGES)
  const extractCompanyIdFromUrl = async (token) => {
    try {
      const response = await fetch('/api/decryptLoginToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        return null;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return null;
      }

      const data = await response.json();
      
      if (data.success && data.companyId) {
        return data.companyId;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  // Authenticate user with companyId and employeeId
  const authenticate = async (companyId, employeeId) => {
    try {
      // Validate user exists in Firestore
      const employeesRef = doc(db, 'users', companyId, 'employees', employeeId);
      const employeeSnap = await getDoc(employeesRef);
      
      if (employeeSnap.exists()) {
        const userData = { 
          id: employeeSnap.id, 
          companyId, 
          employeeId, 
          ...employeeSnap.data() 
        };
        
        // Store both companyId and employeeId in session cookie
        await setSessionCookie(companyId, employeeId);
        
        setUser(userData);
        setError(null);
        return true;
      } else {
        setError('Invalid credentials');
        return false;
      }
    } catch (error) {
      setError('Authentication failed');
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setError(null);
    removeCookie('employeeSession');
    router.push('/');
  };

  // Validate session by checking both URL token and cookie
  const validateSession = async () => {
    if (typeof window === 'undefined') {
      return false;
    }
    
    // Don't validate session on login page or home page
    if (router.pathname === '/' || router.pathname === '/auth/login') {
      return false;
    }
    
    // Prevent multiple simultaneous validations
    if (isValidating) {
      return false;
    }
    
    // Get session data from cookie (both companyId and employeeId)
    const sessionData = await getSessionFromCookie();
    
    if (!sessionData || !sessionData.companyId || !sessionData.employeeId) {
      setLoading(false);
      return false;
    }

    const { companyId, employeeId } = sessionData;

    // If user is already set with same credentials, skip Firestore call
    if (user && user.companyId === companyId && user.employeeId === employeeId) {
      setLoading(false);
      return true;
    }

    setIsValidating(true);

    // Validate user exists in Firestore
    try {
      const employeesRef = doc(db, 'users', companyId, 'employees', employeeId);
      const employeeSnap = await getDoc(employeesRef);
      
      if (employeeSnap.exists()) {
        const userData = { id: employeeSnap.id, companyId, employeeId, ...employeeSnap.data() };
        setUser(userData);
        setLoading(false);
        setIsValidating(false);
        return true;
      } else {
        removeCookie('employeeSession');
        setLoading(false);
        setIsValidating(false);
        return false;
      }
    } catch (error) {
      removeCookie('employeeSession');
      setLoading(false);
      setIsValidating(false);
      return false;
    }
  };

  // Check session on app load
  useEffect(() => {
    const checkSession = async () => {
      // Don't check session on login page or home page
      if (router.pathname === '/' || router.pathname === '/auth/login') {
        setLoading(false);
        return;
      }
      
      await validateSession();
    };
    
    checkSession();
  }, [router.query.token, router.pathname]);

  // Watch for route changes and validate session
  useEffect(() => {
    const handleRouteChange = async () => {
      // Don't validate session on login page or home page
      if (router.pathname === '/' || router.pathname === '/auth/login') {
        return;
      }
      
      // Only validate session on protected routes
      if (!user) {
        const isValid = await validateSession();
        if (!isValid) {
          router.push('/');
        }
      }
    };

    handleRouteChange();
  }, [router.pathname, user]);

  const value = {
    user,
    loading,
    error,
    authenticate,
    logout,
    validateSession,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
