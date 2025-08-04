import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export default function useFetchEmployeeData(companyId, employeeId) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    images: [],
    videos: [],
    audio: [],
    documents: [],
    links: [],
    favourites: []
  });

  useEffect(() => {
    if (!companyId || !employeeId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribeFunctions = [];

    // Fetch images
    const imagesQuery = query(
      collection(db, 'users', companyId, 'employees', employeeId, 'data_images'),
      orderBy('uploadedAt', 'desc')
    );
    const imagesUnsubscribe = onSnapshot(imagesQuery, (snapshot) => {
      const images = [];
      snapshot.forEach((doc) => {
        images.push({ id: doc.id, ...doc.data() });
      });
      setData(prev => ({ ...prev, images }));
    }, (err) => {
      console.error('Error fetching images:', err);
      setError('Failed to fetch images');
    });
    unsubscribeFunctions.push(imagesUnsubscribe);

    // Fetch videos
    const videosQuery = query(
      collection(db, 'users', companyId, 'employees', employeeId, 'data_videos'),
      orderBy('uploadedAt', 'desc')
    );
    const videosUnsubscribe = onSnapshot(videosQuery, (snapshot) => {
      const videos = [];
      snapshot.forEach((doc) => {
        videos.push({ id: doc.id, ...doc.data() });
      });
      setData(prev => ({ ...prev, videos }));
    }, (err) => {
      console.error('Error fetching videos:', err);
      setError('Failed to fetch videos');
    });
    unsubscribeFunctions.push(videosUnsubscribe);

    // Fetch audio
    const audioQuery = query(
      collection(db, 'users', companyId, 'employees', employeeId, 'data_audio'),
      orderBy('uploadedAt', 'desc')
    );
    const audioUnsubscribe = onSnapshot(audioQuery, (snapshot) => {
      const audio = [];
      snapshot.forEach((doc) => {
        audio.push({ id: doc.id, ...doc.data() });
      });
      setData(prev => ({ ...prev, audio }));
    }, (err) => {
      console.error('Error fetching audio:', err);
      setError('Failed to fetch audio');
    });
    unsubscribeFunctions.push(audioUnsubscribe);

    // Fetch documents
    const documentsQuery = query(
      collection(db, 'users', companyId, 'employees', employeeId, 'data_documents'),
      orderBy('uploadedAt', 'desc')
    );
    const documentsUnsubscribe = onSnapshot(documentsQuery, (snapshot) => {
      const documents = [];
      snapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      setData(prev => ({ ...prev, documents }));
    }, (err) => {
      console.error('Error fetching documents:', err);
      setError('Failed to fetch documents');
    });
    unsubscribeFunctions.push(documentsUnsubscribe);

    // Fetch links
    const linksQuery = query(
      collection(db, 'users', companyId, 'employees', employeeId, 'data_links'),
      orderBy('uploadedAt', 'desc')
    );
    const linksUnsubscribe = onSnapshot(linksQuery, (snapshot) => {
      const links = [];
      snapshot.forEach((doc) => {
        links.push({ id: doc.id, ...doc.data() });
      });
      setData(prev => ({ ...prev, links }));
    }, (err) => {
      console.error('Error fetching links:', err);
      setError('Failed to fetch links');
    });
    unsubscribeFunctions.push(linksUnsubscribe);

    // Fetch favourites
    const favouritesQuery = query(
      collection(db, 'users', companyId, 'employees', employeeId, 'data_favourites'),
      orderBy('favouriteDate', 'desc')
    );
    const favouritesUnsubscribe = onSnapshot(favouritesQuery, (snapshot) => {
      const favourites = [];
      snapshot.forEach((doc) => {
        favourites.push({ id: doc.id, ...doc.data() });
      });
      setData(prev => ({ ...prev, favourites }));
    }, (err) => {
      console.error('Error fetching favourites:', err);
      setError('Failed to fetch favourites');
    });
    unsubscribeFunctions.push(favouritesUnsubscribe);

    setLoading(false);

    // Cleanup function
    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }, [companyId, employeeId]);

  return {
    data,
    loading,
    error,
    clearError: () => setError(null)
  };
} 