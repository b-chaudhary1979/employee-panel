import { useState } from 'react';
import { getFirestore, doc, setDoc, deleteDoc, arrayUnion, arrayRemove, getDocs, query, where, collection, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import app from '../firebase';
import useCloudinary from './useCloudinary';

const db = getFirestore(app);

// Helper to categorize file by extension and map to collection name
function getCollectionByExtension(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  if (["jpg", "jpeg", "png", "gif"].includes(ext)) return "images";
  if (["mp3", "wav", "aac", "flac", "ogg", "m4a"].includes(ext)) return "audio";
  if (["mp4", "avi", "mov", "wmv", "flv", "webm"].includes(ext)) return "videos";
  if (["pdf", "doc", "docx", "txt"].includes(ext)) return "documents";
  return "documents"; // Default to documents for unknown types
}

// Helper to clean data for Firestore (remove undefined and null values)
function cleanDataForFirestore(data) {
  const cleaned = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

export default function useStoreData(companyId, uniqueId) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { uploadToCloudinary, deleteFromCloudinary, loading: cloudinaryLoading, error: cloudinaryError } = useCloudinary();

  // Validate required parameters
  if (!companyId) {
    throw new Error('companyId is required');
  }
  if (!uniqueId) {
    throw new Error('uniqueId is required');
  }

  // file: File object, metadata: { title, submitterName, ... }
  const uploadMedia = async (file, metadata = {}) => {
    setLoading(true);
    setError(null);
    try {
      
      const collectionName = getCollectionByExtension(file.name);
      // Upload to Cloudinary first
      const cloudinaryResult = await uploadToCloudinary(file, `cyberclipper/${companyId}/${collectionName}`);
      
      if (!cloudinaryResult.success) {
        setError('Upload failed');
        setLoading(false);
        return { success: false, error: cloudinaryResult.error || 'Upload failed' };
      }
      
      // Create a minimal, safe data structure with only essential fields
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
      };
      
      // Only add comments field for images, audio, and videos
      if (["images", "audio", "videos"].includes(collectionName)) {
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

      // Store in the appropriate subcollection inside uniqueId
      const fileDocRef = doc(
        collection(db, 'users', companyId, 'employees', uniqueId, `data_${collectionName}`),
        fileDocId
      );
      
      
      
      await setDoc(fileDocRef, cleanDataForFirestore(docData));
      
      setLoading(false);
      return { 
        success: true, 
        cloudinaryUrl: cloudinaryResult.cloudinaryUrl, 
        collectionName, 
        docId: fileDocId, 
        storageType: 'cloudinary' 
      };
      
    } catch (err) {
      console.error('Upload error:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        stack: err.stack
      });
      
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
        console.error('CompanyId is missing:', companyId);
        setError('Company ID is required');
        setLoading(false);
        return { success: false, error: 'Company ID is required' };
      }

      // Create a unique document ID for this link
      const linkDocId = `link-${Date.now()}-${crypto.randomUUID()}`;
      const linkDocRef = doc(
        collection(db, 'users', companyId, 'employees', uniqueId, 'data_links'),
        linkDocId
      );
      
      
      
      
      console.log('Creating link document with path:', ['users', companyId, 'data', 'links', linkDocId]);
      
      // Store the link as an individual document
      const linkDataWithMetadata = {
        ...linkData,
        uploadedAt: new Date().toISOString(),
        comments: [], // Initialize comments array
      };
      
      await setDoc(linkDocRef, linkDataWithMetadata);
      setLoading(false);
      return { success: true, docId: linkDocId };
    } catch (err) {
      console.error('Add link error:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        stack: err.stack
      });
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
        collection(db, 'users', companyId, 'employees', uniqueId, 'data_favourites'),
        where('originalId', '==', favData.id)
      );
            
      // const favouriteDocId = `favourite-${Date.now()}-${uuid}`;
      const existingFavouritesSnapshot = await getDocs(existingFavouritesQuery);
      
      if (!existingFavouritesSnapshot.empty) {
        setLoading(false);
        return { success: false, error: 'Item is already in favourites' };
      }
      
      // Create a unique document ID for this favourite
      const uuid = crypto.randomUUID();
      const favouriteDocId = `favourite-${Date.now()}-${uuid}`;
      const favouriteDocRef = doc(
        collection(db, 'users', companyId, 'employees', uniqueId, 'data_favourites'),
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
      };
      
      // Clean the data to remove any undefined values
      const cleanedFavouriteData = cleanDataForFirestore(favouriteData);
      
      await setDoc(favouriteDocRef, cleanedFavouriteData);
      setLoading(false);
      return { success: true, favouriteId: favouriteDocId };
    } catch (err) {
      console.error('Add favourite error:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        stack: err.stack
      });
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
      const favouriteDocRef = doc(db, 'users', companyId, 'employees', uniqueId, 'data_favourites', favData.id);

      await deleteDoc(favouriteDocRef);
      
      setLoading(false);
      return { success: true };
    } catch (err) {
      console.error('Remove favourite error:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        stack: err.stack
      });
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
          console.warn('Failed to delete from Cloudinary:', cloudinaryResult.error);
          // Continue with Firestore deletion even if Cloudinary deletion fails
        }
      }
      
      // Delete the document from the appropriate subcollection
      const docRef = doc(db, 'users', companyId, 'employees', uniqueId, `data_${collectionName}`, docId);
      await deleteDoc(docRef);
      
      // Also delete any related favourite documents
      const favouritesQuery = query(
        collection(db, 'users', companyId, 'employees', uniqueId, 'data_favourites'),
        where('originalId', '==', docId)
      );
           
      const favouritesSnapshot = await getDocs(favouritesQuery);
      
      if (!favouritesSnapshot.empty) {
        const deletePromises = favouritesSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
      }
      
      setLoading(false);
      return { success: true };
    } catch (err) {
      console.error('Delete media error:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        stack: err.stack
      });
      // Always show generic error to user, never expose Firebase errors
      setError('Failed to delete media');
      setLoading(false);
      return { success: false, error: 'Failed to delete media' };
    }
  };

  // Fetch favourites from Firestore with real-time updates
  const fetchFavourites = async (callback) => {
    setLoading(true);
    setError(null);
    try {
      const favouritesQuery = query(
        collection(db, 'users', companyId, 'employees', uniqueId, 'data_favourites')
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
        console.error('Fetch favourites error:', err);
        setError('Failed to fetch favourites');
        setLoading(false);
        if (callback && typeof callback === 'function') {
          callback({ success: false, error: 'Failed to fetch favourites' });
        }
      });
      
      // Return unsubscribe function for cleanup
      return unsubscribe;
    } catch (err) {
      console.error('Fetch favourites error:', err);
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
      const docRef = doc(db, 'users', companyId, 'employees', uniqueId, `data_${collectionName}`, documentId);
      await updateDoc(docRef, {
        comments: arrayUnion(comment)
      });
      
      setLoading(false);
      return { success: true };
    } catch (err) {
      console.error('Add comment error:', err);
      setError('Failed to add comment');
      setLoading(false);
      return { success: false, error: 'Failed to add comment' };
    }
  };

  // Listen for comment updates in real time (updated for subcollection structure)
  const listenForComments = (documentId, collectionName, callback) => {
    try {
      const docRef = doc(db, 'users', companyId, 'employees', uniqueId, `data_${collectionName}`, documentId);

      
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
        console.error('Listen for comments error:', err);
        if (callback && typeof callback === 'function') {
          callback({ success: false, error: 'Failed to listen for comments' });
        }
      });
      
      return unsubscribe;
    } catch (err) {
      console.error('Listen for comments error:', err);
      if (callback && typeof callback === 'function') {
        callback({ success: false, error: 'Failed to listen for comments' });
      }
      return null;
    }
  };

  return {
    uploadMedia,
    addLink,
    addFavourite,
    removeFavourite,
    deleteMedia,
    fetchFavourites,
    addComment,
    listenForComments,
    loading: loading || cloudinaryLoading,
    error: error || cloudinaryError,
  };
} 