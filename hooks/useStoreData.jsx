import { useState, useEffect, useMemo } from 'react';
import { getFirestore, doc, setDoc, deleteDoc, arrayUnion, getDocs, query, where, collection, onSnapshot, updateDoc } from 'firebase/firestore';
import app from '../firebase';
import useCloudinary from './useCloudinary';
import useDataSyncToAdmin from './useDataSyncToAdmin';

const db = getFirestore(app);

// Helper to categorize file by extension and map to collection name
function getCollectionByExtension(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  if (["jpg", "jpeg", "png", "gif"].includes(ext)) return "images";
  if (["mp3", "wav", "aac", "flac", "ogg", "m4a"].includes(ext)) return "audios";
  if (["mp4", "avi", "mov", "wmv", "flv", "webm"].includes(ext)) return "videos";
  if (["pdf", "doc", "docx", "txt"].includes(ext)) return "documents";
  return "documents"; // Default to documents for unknown types
}

function cleanDataForFirestore(data) {
  const cleaned = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

// New hook for media counts
export function useMediaCounts(companyId, employeeId) {
  // All hooks must be called first, before any conditional logic
  const [counts, setCounts] = useState({
    images: 0,
    videos: 0,
    audios: 0,
    links: 0,
    documents: 0,
    total: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Now handle the early return logic after all hooks are called
  if (!companyId || !employeeId) {
    return {
      counts: {
        images: 0,
        videos: 0,
        audios: 0,
        links: 0,
        documents: 0,
        total: 0
      },
      loading: false,
      error: null
    };
  }

  // Only define useEffect when we have valid parameters
  useEffect(() => {
    setLoading(true);
    setError(null);

    const collections = ['data_images', 'data_videos', 'data_audios', 'data_links', 'data_documents'];
    const unsubscribers = [];

    collections.forEach(collectionName => {
      const collectionRef = collection(db, 'users', companyId, 'employees', employeeId, collectionName);
      const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
        const mediaType = collectionName.replace('data_', '');
        setCounts(prevCounts => {
          const newCounts = {
            ...prevCounts,
            [mediaType]: snapshot.size
          };
          // Calculate total
          newCounts.total = newCounts.images + newCounts.videos + newCounts.audios + newCounts.links + newCounts.documents;
          return newCounts;
        });
        setLoading(false);
      }, (err) => {
        setError(`Failed to fetch ${mediaType} count`);
        setLoading(false);
      });
      unsubscribers.push(unsubscribe);
    });

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [companyId || '', employeeId || '']);

  return { counts, loading, error };
}

export default function useStoreData(companyId, employeeId) {
  // All hooks must be called first, before any conditional logic
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { uploadToCloudinary, deleteFromCloudinary, loading: cloudinaryLoading, error: cloudinaryError } = useCloudinary();
  
  // Admin sync hook for delete operations
  const { deleteMediaFromAdmin, deleteLinkFromAdmin } = useDataSyncToAdmin();

  // Now handle the early return logic after all hooks are called
  if (!companyId || !employeeId) {
    return {
      uploadMedia: async () => ({ success: false, error: 'Invalid parameters' }),
      addLink: async () => ({ success: false, error: 'Invalid parameters' }),
      addFavourite: async () => ({ success: false, error: 'Invalid parameters' }),
      removeFavourite: async () => ({ success: false, error: 'Invalid parameters' }),
      deleteMedia: async () => ({ success: false, error: 'Invalid parameters' }),
      fetchFavourites: async () => ({ success: false, error: 'Invalid parameters' }),
      listenForComments: () => null,
      fetchMediaCounts: async () => ({ success: false, error: 'Invalid parameters' }),
      loading: false,
      error: null,
    };
  }

  // Only define functions and useMemo when we have valid parameters
  const uploadMedia = async (file, metadata = {}) => {
    setLoading(true);
    setError(null);
    try {
      const collectionName = getCollectionByExtension(file.name);
      // Upload to Cloudinary first
      const cloudinaryResult = await uploadToCloudinary(file, `cyberclipper/${collectionName}`);
      
      if (!cloudinaryResult.success) {
        setError('Upload failed');
        setLoading(false);
        return { success: false, error: cloudinaryResult.error || 'Upload failed' };
      }
      
      const docData = {
        title: metadata.title,
        submitterName: metadata.submitterName,
        category: metadata.category,
        tags: metadata.tags,
        notes: metadata.notes,
        textData: metadata.textData,    
        cloudinaryUrl: cloudinaryResult.cloudinaryUrl, // Store Cloudinary URL instead of base64
        cloudinaryPublicId: cloudinaryResult.cloudinaryPublicId, // Store public ID for deletion
        cloudinaryAssetId: cloudinaryResult.cloudinaryAssetId,
        cloudinaryVersion: cloudinaryResult.cloudinaryVersion,
        cloudinaryFormat: cloudinaryResult.cloudinaryFormat,
        cloudinaryResourceType: cloudinaryResult.cloudinaryResourceType,
        cloudinaryBytes: cloudinaryResult.cloudinaryBytes,
        cloudinaryWidth: cloudinaryResult.cloudinaryWidth,
        cloudinaryHeight: cloudinaryResult.cloudinaryHeight,
        cloudinaryDuration: cloudinaryResult.cloudinaryDuration, // For videos
        cloudinaryBitRate: cloudinaryResult.cloudinaryBitRate, // For videos
        cloudinaryFps: cloudinaryResult.cloudinaryFps, // For videos
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        role: "Employee", // Hardcoded role field
        employeeId: employeeId, // Store the employee ID
      };
      
      // Only add comments field for images, audios, and videos
      if (["images", "audios", "videos"].includes(collectionName)) {
        docData.comments = [];
      }

      // Create a unique document ID for this file
      const uuid = crypto.randomUUID();
      const fileDocId = `${collectionName}-${Date.now()}-${uuid}`;
      
      // Add document ID and document group ID fields for document-type files
      if (collectionName === 'documents') {
        docData.documentId = fileDocId; // Store the document ID for deletion
        docData.documentGroupId = `${metadata.title}-${metadata.sessionGroupId || uuid}`; // Store the document group ID for grouping
      }

      // Store in the appropriate subcollection
      const fileDocRef = doc(
        collection(db, 'users', companyId, 'employees', employeeId, `data_${collectionName}`),
        fileDocId
      );
      
      await setDoc(fileDocRef, cleanDataForFirestore(docData));
      
      setLoading(false);
      return { 
        success: true, 
        cloudinaryUrl: cloudinaryResult.cloudinaryUrl,
        cloudinaryPublicId: cloudinaryResult.cloudinaryPublicId,
        cloudinaryAssetId: cloudinaryResult.cloudinaryAssetId,
        cloudinaryVersion: cloudinaryResult.cloudinaryVersion,
        cloudinaryFormat: cloudinaryResult.cloudinaryFormat,
        cloudinaryResourceType: cloudinaryResult.cloudinaryResourceType,
        cloudinaryBytes: cloudinaryResult.cloudinaryBytes,
        cloudinaryWidth: cloudinaryResult.cloudinaryWidth,
        cloudinaryHeight: cloudinaryResult.cloudinaryHeight,
        cloudinaryDuration: cloudinaryResult.cloudinaryDuration,
        cloudinaryBitRate: cloudinaryResult.cloudinaryBitRate,
        cloudinaryFps: cloudinaryResult.cloudinaryFps,
        collectionName, 
        docId: fileDocId, 
        storageType: 'cloudinary' 
      };
      
    } catch (err) {
      // Always show generic error to user, never expose Firebase errors
      setError('Upload failed');
      setLoading(false);
      return { success: false, error: 'Upload failed' };
    }
  };

  // For links, store in links subcollection
  const addLink = async (linkData) => {
    setLoading(true);
    setError(null);
    try {
      // Validate companyId
      if (!companyId) {
        setError('Company ID is required');
        setLoading(false);
        return { success: false, error: 'Company ID is required' };
      }

      // Create a unique document ID for this link
      const linkDocId = `link-${Date.now()}-${crypto.randomUUID()}`;
      const linkDocRef = doc(
        collection(db, 'users', companyId, 'employees', employeeId, 'data_links'),
        linkDocId
      );
      
      // Store the link as an individual document
      const linkDataWithMetadata = {
        ...linkData,
        uploadedAt: new Date().toISOString(),
        comments: [], // Initialize comments array
        role: "Employee", // Hardcoded role field
        employeeId: employeeId, // Store the employee ID
      };
      
      await setDoc(linkDocRef, linkDataWithMetadata);
      setLoading(false);
      return { success: true, docId: linkDocId };
    } catch (err) {
      // Always show generic error to user, never expose Firebase errors
      setError('Failed to save link');
      setLoading(false);
      return { success: false, error: 'Failed to save link' };
    }
  };

  const addFavourite = async (favData) => {
    setLoading(true);
    setError(null);
    try {
      // Validate required fields
      if (!favData.id || !favData.type) {
        setLoading(false);
        return { success: false, error: 'Missing required fields: id and type' };
      }
      
      // Check if this item is already favourited
      const existingFavouritesQuery = query(
        collection(db, 'users', companyId, 'employees', employeeId, 'data_favourites'),
        where('originalId', '==', favData.id)
      );
            
      const existingFavouritesSnapshot = await getDocs(existingFavouritesQuery);
      
      if (!existingFavouritesSnapshot.empty) {
        setLoading(false);
        return { success: false, error: 'Item is already in favourites' };
      }
      
      // Create a unique document ID for this favourite
      const uuid = crypto.randomUUID();
      const favouriteDocId = `favourite-${Date.now()}-${uuid}`;
      const favouriteDocRef = doc(
        collection(db, 'users', companyId, 'employees', employeeId, 'data_favourites'),
        favouriteDocId
      );
      
      // Store the favourite as an individual document
      const favouriteData = {
        title: favData.title || 'Untitled',
        submitterName: favData.submitterName || favData.employee || 'Unknown',
        category: favData.type,
        cloudinaryUrl: favData.cloudinaryUrl || '', // Store Cloudinary URL instead of base64
        fileName: favData.title || 'favourite',
        fileType: favData.type,
        fileSize: favData.fileSize || 0, // Use original file size
        uploadedAt: new Date().toISOString(),
        originalId: favData.id,
        originalType: favData.type,
        favouriteDate: new Date().toISOString(),
        favouritedBy: favData.submitterName || favData.employee || 'Unknown',
        originalCollection: favData.originalCollection || 'unknown', // Store which collection the original item is in
        role: "Employee", // Hardcoded role field
        employeeId: employeeId, // Store the employee ID
      };
      
      // Clean the data to remove any undefined values
      const cleanedFavouriteData = cleanDataForFirestore(favouriteData);
      
      await setDoc(favouriteDocRef, cleanedFavouriteData);
      setLoading(false);
      return { success: true, favouriteId: favouriteDocId };
    } catch (err) {
     
      // Always show generic error to user, never expose Firebase errors
      setError('Failed to add to favourites');
      setLoading(false);
      return { success: false, error: 'Failed to add to favourites' };
    }
  };

  // Remove favourite from Firestore
  const removeFavourite = async (favData) => {
    setLoading(true);
    setError(null);
    try {
      // Delete the favourite document directly using its own ID
      const favouriteDocRef = doc(db, 'users', companyId, 'employees', employeeId, 'data_favourites', favData.id);

      await deleteDoc(favouriteDocRef);
      
      setLoading(false);
      return { success: true };
    } catch (err) {
     
      // Always show generic error to user, never expose Firebase errors
      setError('Failed to remove from favourites');
      setLoading(false);
      return { success: false, error: 'Failed to remove from favourites' };
    }
  };

  // Delete media from Firestore and Cloudinary
  const deleteMedia = async (media) => {
    setLoading(true);
    setError(null);
    try {
      // Determine which collection the media belongs to
      const collectionName = media.originalCollection || getCollectionByExtension(media.fileName || '');
      const docId = media.id;
      
            // Delete from Cloudinary if cloudinaryPublicId exists
      if (media.cloudinaryPublicId) {
        const cloudinaryResult = await deleteFromCloudinary(media.cloudinaryPublicId, media.cloudinaryResourceType || 'auto');
       
        if (!cloudinaryResult.success) {
          // Continue with other deletions even if Cloudinary fails
        }
      }
      
      // Delete the document from the appropriate subcollection
      const docRef = doc(db, 'users', companyId, 'employees', employeeId, `data_${collectionName}`, docId);
      await deleteDoc(docRef);
      
      // Also delete any related favourite documents
      const favouritesQuery = query(
        collection(db, 'users', companyId, 'employees', employeeId, 'data_favourites'),
        where('originalId', '==', docId)
      );
           
      const favouritesSnapshot = await getDocs(favouritesQuery);
      
              if (!favouritesSnapshot.empty) {
          const deletePromises = favouritesSnapshot.docs.map(doc => deleteDoc(doc.ref));
          await Promise.all(deletePromises);
        }
      
      // SYNC DELETE TO ADMIN DATABASE
      try {
        const adminDeleteResult = await deleteMediaFromAdmin({
          companyId,
          employeeId,
          documentId: docId,
          mediaType: collectionName
        });
        
        if (!adminDeleteResult.success) {
          // Don't fail the entire operation if admin delete fails
        }
      } catch (syncErr) {
        // Don't fail the entire operation if admin delete fails
      }
      
      setLoading(false);
      return { success: true };
    } catch (err) {
      // Always show generic error to user, never expose Firebase errors
      setError('Failed to delete media');
      setLoading(false);
      return { success: false, error: 'Failed to delete media' };
    }
  };

  // Delete link from Firestore and sync to admin
  const deleteLink = async (link) => {
   
    setLoading(true);
    setError(null);
    try {
      const docId = link.id;
    
      // Delete the document from the links subcollection
      const docRef = doc(db, 'users', companyId, 'employees', employeeId, 'data_links', docId);
     
      
      await deleteDoc(docRef);
     
      // Also delete any related favourite documents
      const favouritesQuery = query(
        collection(db, 'users', companyId, 'employees', employeeId, 'data_favourites'),
        where('originalId', '==', docId)
      );
           
      const favouritesSnapshot = await getDocs(favouritesQuery);
      
      if (!favouritesSnapshot.empty) {
        const deletePromises = favouritesSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
       
      }
      
      // SYNC DELETE TO ADMIN DATABASE
     
      try {
        const adminDeleteParams = {
          companyId,
          employeeId,
          documentId: docId
        };
              
        const adminDeleteResult = await deleteLinkFromAdmin(adminDeleteParams);
       
      } catch (syncErr) {
       
        // Don't fail the entire operation if admin delete fails
      }
      
      setLoading(false);
     
      return { success: true };
    } catch (err) {
      // Always show generic error to user, never expose Firebase errors
      setError('Failed to delete link');
      setLoading(false);
      return { success: false, error: 'Failed to delete link' };
    }
  };

  // Fetch favourites from Firestore with real-time updates
  const fetchFavourites = async (callback) => {
    setLoading(true);
    setError(null);
    try {
      const favouritesQuery = query(
        collection(db, 'users', companyId, 'employees', employeeId, 'data_favourites')
      );
      
      // Use onSnapshot for real-time updates
      const unsubscribe = onSnapshot(favouritesQuery, (snapshot) => {
        const favourites = [];
        snapshot.forEach((doc) => {
          const favouriteData = doc.data();
          favourites.push({
            id: doc.id,
            ...favouriteData
          });
        });
        
        setLoading(false);
        if (callback && typeof callback === 'function') {
          callback({ success: true, favourites });
        }
      }, (err) => {
        setError('Failed to fetch favourites');
        setLoading(false);
        if (callback && typeof callback === 'function') {
          callback({ success: false, error: 'Failed to fetch favourites' });
        }
      });
      
      // Return unsubscribe function for cleanup
      return unsubscribe;
    } catch (err) {
      setError('Failed to fetch favourites');
      setLoading(false);
      if (callback && typeof callback === 'function') {
        callback({ success: false, error: 'Failed to fetch favourites' });
      }
      return null;
    }
  };

  // Add comment to a document using arrayUnion (updated for subcollection structure)
  const addComment = async (documentId, comment, collectionName) => {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, 'users', companyId, 'employees', employeeId, `data_${collectionName}`, documentId);
      await updateDoc(docRef, {
        comments: arrayUnion(comment)
      });
      
      setLoading(false);
      return { success: true };
    } catch (err) {
      setError('Failed to add comment');
      setLoading(false);
      return { success: false, error: 'Failed to add comment' };
    }
  };

  // Listen for comment updates in real time (updated for subcollection structure)
  const listenForComments = (documentId, collectionName, callback) => {
    try {
      const docRef = doc(db, 'users', companyId, 'employees', employeeId, `data_${collectionName}`, documentId);

      const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const comments = data.comments || [];
          
          if (callback && typeof callback === 'function') {
            callback({ success: true, comments });
          }
        } else {
          if (callback && typeof callback === 'function') {
            callback({ success: false, error: 'Document not found' });
          }
        }
      }, (err) => {
        if (callback && typeof callback === 'function') {
          callback({ success: false, error: 'Failed to listen for comments' });
        }
      });
      
      return unsubscribe;
    } catch (err) {
      if (callback && typeof callback === 'function') {
        callback({ success: false, error: 'Failed to listen for comments' });
      }
      return null;
    }
  };

  // Fetch media counts for all types
  const fetchMediaCounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const collections = ['data_images', 'data_videos', 'data_audios', 'data_links', 'data_documents'];
      const counts = {};
      
      for (const collectionName of collections) {
        const collectionRef = collection(db, 'users', companyId, 'employees', employeeId, collectionName);
        const snapshot = await getDocs(collectionRef);
        const mediaType = collectionName.replace('data_', '');
        counts[mediaType] = snapshot.size;
      }
      
      setLoading(false);
      return { success: true, counts };
    } catch (err) {
      setError('Failed to fetch media counts');
      setLoading(false);
      return { success: false, error: 'Failed to fetch media counts' };
    }
  };

  // Return the object directly without useMemo to avoid dependency array issues
  return {
    uploadMedia,
    addLink,
    deleteLink,
    addFavourite,
    removeFavourite,
    deleteMedia,
    fetchFavourites,
    addComment,
    listenForComments,
    fetchMediaCounts,
    loading: loading || cloudinaryLoading,
    error: error || cloudinaryError,
  };
} 