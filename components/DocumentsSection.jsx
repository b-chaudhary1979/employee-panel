import React, { useState, useEffect } from "react";
import { FaDownload, FaEye, FaEdit, FaFileAlt, FaImage, FaFilePdf, FaTrash } from "react-icons/fa";
import { useUserInfo } from "../context/UserInfoContext";
import CryptoJS from "crypto-js";
import { useRouter } from "next/router";

const ENCRYPTION_KEY = "cyberclipperSecretKey123!";

function decryptToken(token) {
  try {
    const bytes = CryptoJS.AES.decrypt(token, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    const { ci, aid } = JSON.parse(decrypted);
    return { ci, aid };
  } catch {
    return { ci: null, aid: null };
  }
}

export default function DocumentsSection({ onEdit, onAdd, onDelete }) {
  const router = useRouter();
  const { token } = router.query;
  const { ci, aid } = decryptToken(token);
  
  const { user, aid: userAid } = useUserInfo();
  
  // Use ci from token as companyId (same as data.jsx page)
  const companyId = ci;
  const employeeId = aid;
  
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editModal, setEditModal] = useState(null); // {document, formData}
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewModal, setViewModal] = useState(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('documentsViewModal');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  }); // {document}
  const [downloadModal, setDownloadModal] = useState(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('documentsDownloadModal');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  }); // {document}
  const [editFilesModal, setEditFilesModal] = useState(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('documentsEditFilesModal');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  }); // {document}
  const [editFileModal, setEditFileModal] = useState(null); // {file, formData}
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(null); // {file}

  // Group documents by documentGroupId
  const groupDocuments = (documents) => {
    const groups = {};
    const individualDocs = [];

    documents.forEach(doc => {
      if (doc.documentGroupId) {
        if (!groups[doc.documentGroupId]) {
          groups[doc.documentGroupId] = [];
        }
        groups[doc.documentGroupId].push(doc);
      } else {
        individualDocs.push(doc);
      }
    });

    const groupedDocuments = [];

    // Process grouped documents
    Object.values(groups).forEach(group => {
      if (group.length > 0) {
        const firstDoc = group[0];
        const allFiles = group.map(doc => ({
          id: doc.id,
          fileName: doc.fileName,
          fileType: doc.fileType,
          fileSize: doc.fileSize,
          data: doc.data,
          cloudinaryUrl: doc.cloudinaryUrl
        }));

        const totalFileSize = group.reduce((total, doc) => total + (doc.fileSize || 0), 0);

        groupedDocuments.push({
          id: firstDoc.documentGroupId,
          title: firstDoc.title || 'Untitled Document',
          submitterName: firstDoc.submitterName || 'Unknown',
          category: firstDoc.category || 'Other',
          linkData: firstDoc.linkData || '',
          textData: firstDoc.textData || '',
          tags: firstDoc.tags || '',
          date: firstDoc.date,
          notes: firstDoc.notes || '',
          fileCategory: firstDoc.fileCategory || 'documents',
          files: allFiles,
          totalFileSize,
          fileCount: group.length,
          isGroup: true,
          documentIds: group.map(doc => doc.id) // Store all document IDs for deletion
        });
      }
    });

    // Add individual documents
    individualDocs.forEach(doc => {
      groupedDocuments.push({
        ...doc,
        files: doc.fileName ? [{
          id: doc.id,
          fileName: doc.fileName,
          fileType: doc.fileType,
          fileSize: doc.fileSize,
          data: doc.data,
          cloudinaryUrl: doc.cloudinaryUrl
        }] : [],
        totalFileSize: doc.fileSize || 0,
        fileCount: doc.fileName ? 1 : 0,
        isGroup: false,
        documentIds: [doc.id]
      });
    });

    return groupedDocuments;
  };

  // Fetch documents from Firebase with real-time updates
  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { getFirestore, collection, query, onSnapshot } = await import('firebase/firestore');
        const db = getFirestore();
        
        // Query documents from the data collection
        const documentRef = collection(db, "users", companyId, "employees", employeeId, "data_documents");
        const q = query(documentRef);
        
                 // Use onSnapshot for real-time updates
         const unsubscribe = onSnapshot(q, (querySnapshot) => {
           const fetchedDocuments = [];
           querySnapshot.forEach((doc) => {
             const data = doc.data();
            // Robustly extract date from uploadAt
            let date = 'Unknown';
            const uploadedAt = data.uploadedAt;
            if (uploadedAt) {
              if (uploadedAt.seconds && uploadedAt.nanoseconds) {
                // Firestore Timestamp object (plain)
                const d = new Date(uploadedAt.seconds * 1000);
                if (!isNaN(d.getTime())) date = d.toLocaleDateString();
              } else if (typeof uploadedAt.toDate === 'function') {
                // Firestore Timestamp (SDK)
                date = uploadedAt.toDate().toLocaleDateString();
              } else if (typeof uploadedAt === 'string' || typeof uploadedAt === 'number') {
                const d = new Date(uploadedAt);
                if (!isNaN(d.getTime())) date = d.toLocaleDateString();
              }
            }
                         fetchedDocuments.push({
               id: doc.id,
               title: data.title || 'Untitled Document',
               submitterName: data.submitterName || 'Unknown',
               category: data.category || 'Other',
               linkData: data.url || data.linkData || '',
               textData: data.textData || '',
               tags: data.tags || '',
               date,
               files: data.files || [],
               notes: data.notes || '',
               fileCategory: data.fileCategory || 'documents',
               fileName: data.fileName,
               fileType: data.fileType,
               fileSize: data.fileSize,
               data: data.data || null,
               cloudinaryUrl: data.cloudinaryUrl || null,
               documentGroupId: data.documentGroupId || null,
               documentId: data.documentId || null
             });
          });
          
          // Group documents by documentGroupId
          const groupedDocuments = groupDocuments(fetchedDocuments);
          
          // Sort by date (newest first)
          groupedDocuments.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA;
          });
          
          setDocuments(groupedDocuments);
          setLoading(false);
        }, (err) => {
          setError('Failed to load documents');
          setLoading(false);
        });
        
        // Return unsubscribe function for cleanup
        return unsubscribe;
      } catch (err) {
        setError('Failed to load documents');
        setLoading(false);
        return null;
      }
    };

    // Set up real-time listener and store unsubscribe function
    let unsubscribe = null;
    fetchDocuments().then((unsub) => {
      unsubscribe = unsub;
    });

    // Cleanup function to unsubscribe from real-time listener
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [companyId]);

  // Delete document function
  const handleDelete = async (document) => {
    try {
      const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
      const db = getFirestore();
      
      // Delete all documents in the group
      const deletePromises = document.documentIds.map(docId => {
        const documentRef = doc(db, 'users', companyId, 'data', docId);
        return deleteDoc(documentRef);
      });
      
      await Promise.all(deletePromises);
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  // Get unique categories for filter dropdown
  const categories = [...new Set(documents.map(doc => doc.category).filter(Boolean))];

  // Filtered documents based on search and category
  const filteredDocuments = documents.filter(doc => {
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchLower) ||
      doc.submitterName.toLowerCase().includes(searchLower) ||
      doc.category.toLowerCase().includes(searchLower) ||
      doc.tags.toLowerCase().includes(searchLower) ||
      doc.textData.toLowerCase().includes(searchLower);
    
    const matchesCategory = !selectedCategory || doc.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return <FaFilePdf className="text-red-500" />;
      case 'image':
        return <FaImage className="text-green-500" />;
      default:
        return <FaFileAlt className="text-blue-500" />;
    }
  };

  // Function to extract public ID from Cloudinary URL
  const extractPublicIdFromUrl = (url) => {
    if (!url) return null;
    
    try {
      // Handle different Cloudinary URL formats
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      
      // Find the upload part and extract the public ID
      const uploadIndex = pathParts.findIndex(part => part === 'upload');
      if (uploadIndex !== -1 && uploadIndex + 2 < pathParts.length) {
        // Get the part after 'upload' and before the version (if any)
        let publicId = pathParts[uploadIndex + 2];
        
        // Remove file extension if present
        if (publicId.includes('.')) {
          publicId = publicId.split('.')[0];
        }
        
        // Remove version prefix if present (e.g., v1234567890/)
        if (publicId.startsWith('v')) {
          publicId = publicId.substring(publicId.indexOf('/') + 1);
        }
        
        return publicId;
      }
      
      // For URLs with version numbers, try to extract the full path after upload
      if (uploadIndex !== -1) {
        // Get all parts after 'upload' except the version and filename
        const partsAfterUpload = pathParts.slice(uploadIndex + 1);
        if (partsAfterUpload.length >= 2) {
          // Skip the version number (first part) and filename (last part)
          const pathParts = partsAfterUpload.slice(1, -1);
          const filename = partsAfterUpload[partsAfterUpload.length - 1];
          const filenameWithoutExt = filename.includes('.') ? filename.split('.')[0] : filename;
          
          // Combine path parts with filename
          const fullPath = [...pathParts, filenameWithoutExt].join('/');
          return fullPath;
        }
      }
      
      // Fallback: try to extract from the last part of the URL
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart && lastPart.includes('.')) {
        return lastPart.split('.')[0];
      }
      
      return null;
    } catch (error) {
      return null;
    }
  };

  const handleDownload = (doc) => {
    // Show download modal with all files
    const modalData = { document: doc };
    setDownloadModal(modalData);
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('documentsDownloadModal', JSON.stringify(modalData));
    }
  };

  const handleDownloadFile = (file) => {
    try {
      if (file.cloudinaryUrl) {
        // Fetch the file from Cloudinary and download it
        fetch(file.cloudinaryUrl)
          .then(response => response.blob())
          .then(blob => {
            // Create blob URL
            const url = URL.createObjectURL(blob);
            
            // Create download link
            const link = document.createElement('a');
            link.href = url;
            link.download = file.fileName || 'document';
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            
            // Clean up
            document.body.removeChild(link);
            setTimeout(() => {
              URL.revokeObjectURL(url);
            }, 1000);
          })
          .catch(error => {
            console.error('Error downloading file:', error);
            // Show toast error
            const toast = document.createElement('div');
            toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
            toast.textContent = 'Error downloading file. Please try again.';
            document.body.appendChild(toast);
            setTimeout(() => document.body.removeChild(toast), 3000);
          });
      } else if (file.data) {
        const base64Data = file.data.split(',')[1] || file.data;
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        
        // Create blob with proper MIME type
        const mimeType = file.fileType || 'application/octet-stream';
        const blob = new Blob([byteArray], { type: mimeType });
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.fileName || 'document';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1000);
      } else {
        // Show toast error
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        toast.textContent = 'Unable to download this file. File data not found.';
        document.body.appendChild(toast);
        setTimeout(() => document.body.removeChild(toast), 3000);
      }
    } catch (error) {
      // Show toast error
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = 'Error downloading file. Please try again.';
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
    }
  };

  const handleDownloadAll = () => {
    // Download all files in the group
    if (downloadModal && downloadModal.document.files) {
      downloadModal.document.files.forEach(file => {
        handleDownloadFile(file);
      });
    }
  };

  const handleView = (document) => {
    // Show view modal with all files
    const modalData = { document };
    setViewModal(modalData);
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('documentsViewModal', JSON.stringify(modalData));
    }
  };

  const handleViewFile = (file) => {
    try {
      if (file.cloudinaryUrl) {
        if (file.fileType === 'pdf' || file.fileType === 'application/pdf') {
          // First try to open directly
          const newWindow = window.open(file.cloudinaryUrl, '_blank');
          
          // If the window is blocked or fails, try Google Docs viewer
          if (!newWindow || newWindow.closed) {
            const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(file.cloudinaryUrl)}&embedded=true`;
            window.open(googleDocsUrl, '_blank');
          }
        } else {
          // For other file types, open directly
          window.open(file.cloudinaryUrl, '_blank');
        }
        return;
      } else if (file.data) {
        const base64Data = file.data.split(',')[1] || file.data;
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        
        // Create blob with proper MIME type
        const mimeType = file.fileType || 'application/octet-stream';
        const blob = new Blob([byteArray], { type: mimeType });
        
        // Create blob URL and open in new tab
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        
        // Clean up blob URL after a delay
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1000);
        return;
      } else {
        // Show toast error
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        toast.textContent = 'Unable to view this file. Please try downloading it instead.';
        document.body.appendChild(toast);
        setTimeout(() => document.body.removeChild(toast), 3000);
      }
    } catch (error) {
      // Show toast error
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = 'Error viewing file. Please try downloading it instead.';
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 3000);
    }
  };

  const handleEdit = (document) => {
    // Show edit files modal with all files
    const modalData = { document };
    setEditFilesModal(modalData);
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('documentsEditFilesModal', JSON.stringify(modalData));
    }
  };

  const handleEditChange = (field, value) => {
    setEditModal(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value
      }
    }));
  };

  const handleSaveEdit = async () => {
    if (!editModal) return;
    
    setSaving(true);
    try {
      const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
      const db = getFirestore();
      const documentRef = doc(db, 'users', companyId, 'data_documents', editModal.document.id);
      
      await updateDoc(documentRef, {
        title: editModal.formData.title,
        category: editModal.formData.category,
        tags: editModal.formData.tags,
        notes: editModal.formData.notes,
        textData: editModal.formData.textData,
        updatedAt: new Date().toISOString()
      });
      
      setEditModal(null);
      setShowConfirmSave(false);
      setSaving(false);
    } catch (error) {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 text-left">
        <h2 className="text-2xl font-bold text-[#7c3aed]">Documents</h2>
        <p className="text-gray-500 text-base mt-1">Manage your documents and files.</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex justify-between items-center mb-4 flex-col sm:flex-row gap-2">
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="flex-1 sm:w-96">
            <input
              type="text"
              placeholder="Search documents, submitter, category, or tags..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-2 rounded-lg shadow border border-purple-400 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-600 text-gray-900 transition"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-lg shadow border border-purple-400 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] text-gray-900"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow-md">
          <thead>
            <tr className="bg-[#f3f4f6] text-[#7c3aed]">
              <th className="py-3 px-4 text-left">S.No</th>
              <th className="py-3 px-4 text-left">Title</th>
              <th className="py-3 px-4 text-left">Submitter</th>
              <th className="py-3 px-4 text-left">Category</th>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Files</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-400">
                  {documents.length === 0 ? 'No documents found. Upload your first document!' : 'No documents match your search criteria.'}
                </td>
              </tr>
            ) : (
              filteredDocuments.map((doc, idx) => (
                <tr key={doc.id} className="border-b hover:bg-[#f9f5ff] transition">
                  <td className="py-3 px-4 text-gray-600">{idx + 1}</td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-semibold text-gray-800">{doc.title}</div>
                      {doc.textData && (
                        <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                          {doc.textData}
                        </div>
                      )}
                      {doc.tags && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {doc.tags.split(',').slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{doc.submitterName}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {doc.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{doc.date}</td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      {doc.files && doc.files.length > 0 ? (
                        <>
                          {doc.files.map((file, fileIndex) => (
                            <div key={file.id} className="flex items-center gap-2 text-xs">
                              {getFileIcon(file.fileType)}
                              <span className="text-gray-700">{file.fileName}</span>
                              <span className="text-gray-500">({file.fileSize ? `${(file.fileSize / 1024).toFixed(1)} KB` : 'Unknown size'})</span>
                            </div>
                          ))}
                          {doc.isGroup && doc.fileCount > 1 && (
                            <div className="text-xs text-gray-500 mt-1">
                              Total: {doc.fileCount} files ({doc.totalFileSize ? `${(doc.totalFileSize / 1024).toFixed(1)} KB` : 'Unknown size'})
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">No files</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleView(doc)}
                          className="px-2 py-1 bg-[#ede9fe] text-[#7c3aed] rounded text-xs hover:bg-[#c7d2fe] transition flex items-center gap-1"
                          title="View"
                        >
                          <FaEye className="w-3 h-3" />
                          View
                        </button>
                        {doc.files && doc.files.length > 0 && (
                          <button
                            onClick={() => handleDownload(doc)}
                            className="px-2 py-1 bg-[#f3f4f6] text-[#7c3aed] rounded text-xs hover:bg-[#e0e7ff] transition flex items-center gap-1"
                            title="Download"
                          >
                            <FaDownload className="w-3 h-3" />
                            Download
                          </button>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(doc)}
                          className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200 transition flex items-center gap-1"
                          title="Edit"
                        >
                          <FaEdit className="w-3 h-3" />
                          Edit
                        </button>
                        {onDelete && (
                          <button
                            onClick={() => onDelete(doc)}
                            className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition flex items-center gap-1"
                            title="Delete"
                          >
                            <FaTrash className="w-3 h-3" />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Info */}
      <div className="mt-4 text-sm text-gray-600">
        Showing {filteredDocuments.length} of {documents.length} documents
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-purple-700">Edit Document</h3>
              <button
                onClick={() => setEditModal(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Document Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editModal.formData.title}
                  onChange={(e) => handleEditChange('title', e.target.value)}
                  className="w-full border-2 border-purple-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-400 text-base text-gray-800 bg-purple-50/80 shadow-md transition-all duration-200"
                  placeholder="Enter document title"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Category</label>
                <select
                  value={editModal.formData.category}
                  onChange={(e) => handleEditChange('category', e.target.value)}
                  className="w-full border-2 border-purple-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base text-gray-800 bg-purple-50/80 shadow-md transition-all duration-200"
                >
                  <option value="">Select Category</option>
                  <option value="Report">Report</option>
                  <option value="Contract">Contract</option>
                  <option value="Invoice">Invoice</option>
                  <option value="Presentation">Presentation</option>
                  <option value="Image">Image</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Tags</label>
                <input
                  type="text"
                  value={editModal.formData.tags}
                  onChange={(e) => handleEditChange('tags', e.target.value)}
                  className="w-full border-2 border-purple-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-400 text-base text-gray-800 bg-purple-50/80 shadow-md transition-all duration-200"
                  placeholder="e.g. important, urgent, review (comma separated)"
                />
              </div>

              {/* Text Data */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Text Description</label>
                <textarea
                  value={editModal.formData.textData}
                  onChange={(e) => handleEditChange('textData', e.target.value)}
                  className="w-full border-2 border-purple-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-400 text-base text-gray-800 bg-purple-50/80 shadow-md transition-all duration-200"
                  placeholder="Enter any text data or description..."
                  rows={4}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Notes</label>
                <textarea
                  value={editModal.formData.notes}
                  onChange={(e) => handleEditChange('notes', e.target.value)}
                  className="w-full border-2 border-purple-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-400 text-base text-gray-800 bg-purple-50/80 shadow-md transition-all duration-200"
                  placeholder="Any additional notes..."
                  rows={3}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditModal(null)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowConfirmSave(true)}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Confirmation Modal */}
      {showConfirmSave && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full border-2 border-purple-200 flex flex-col items-center">
            <h3 className="text-xl font-bold text-purple-600 mb-4">Save Changes?</h3>
            <p className="text-gray-700 mb-6 text-center">Are you sure you want to save these changes to the document?</p>
            <div className="flex gap-4 w-full justify-end">
              <button
                className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
                onClick={() => setShowConfirmSave(false)}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 rounded-lg bg-purple-500 text-white font-semibold hover:bg-purple-600 transition"
                onClick={handleSaveEdit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-purple-700">View Files</h3>
            </div>
            
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">{viewModal.document.title}</h4>
              <p className="text-sm text-gray-600">Select a file to view:</p>
            </div>
            
            <div className="space-y-3">
              {viewModal.document.files && viewModal.document.files.length > 0 ? (
                viewModal.document.files.map((file, index) => (
                  <div key={file.id} className="flex items-center justify-between p-4 border border-purple-200 rounded-lg bg-purple-50/50">
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.fileType)}
                      <div>
                        <div className="font-medium text-gray-800">{file.fileName}</div>
                        <div className="text-sm text-gray-500">
                          {file.fileSize ? `${(file.fileSize / 1024).toFixed(1)} KB` : 'Unknown size'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewFile(file)}
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                      title="View file"
                    >
                      <FaEye className="w-4 h-4" />
                      View
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No files available to view
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setViewModal(null);
                  // Clear from localStorage
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('documentsViewModal');
                  }
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download Modal */}
      {downloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-purple-700">Download Files</h3>
            </div>
            
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">{downloadModal.document.title}</h4>
              <p className="text-sm text-gray-600">Select files to download:</p>
            </div>
            
            <div className="space-y-3">
              {downloadModal.document.files && downloadModal.document.files.length > 0 ? (
                downloadModal.document.files.map((file, index) => (
                  <div key={file.id} className="flex items-center justify-between p-4 border border-purple-200 rounded-lg bg-purple-50/50">
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.fileType)}
                      <div>
                        <div className="font-medium text-gray-800">{file.fileName}</div>
                        <div className="text-sm text-gray-500">
                          {file.fileSize ? `${(file.fileSize / 1024).toFixed(1)} KB` : 'Unknown size'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadFile(file)}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                      title="Download file"
                    >
                      <FaDownload className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No files available to download
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setDownloadModal(null);
                  // Clear from localStorage
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('documentsDownloadModal');
                  }
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                Close
              </button>
              <button
                onClick={handleDownloadAll}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
              >
                Download All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Files Modal */}
      {editFilesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-purple-700">Edit Files</h3>
            </div>
            
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">{editFilesModal.document.title}</h4>
              <p className="text-sm text-gray-600">Select files to edit or delete:</p>
            </div>
            
            <div className="space-y-3">
              {editFilesModal.document.files && editFilesModal.document.files.length > 0 ? (
                editFilesModal.document.files.map((file, index) => (
                  <div key={file.id} className="flex items-center justify-between p-4 border border-purple-200 rounded-lg bg-purple-50/50">
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.fileType)}
                      <div>
                        <div className="font-medium text-gray-800">{file.fileName}</div>
                        <div className="text-sm text-gray-500">
                          {file.fileSize ? `${(file.fileSize / 1024).toFixed(1)} KB` : 'Unknown size'}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditFileModal({
                            file,
                            formData: {
                              fileName: file.fileName || '',
                              title: editFilesModal.document.title || '',
                              category: editFilesModal.document.category || '',
                              tags: editFilesModal.document.tags || '',
                              notes: editFilesModal.document.notes || '',
                              textData: editFilesModal.document.textData || ''
                            }
                          });
                        }}
                        className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition flex items-center gap-2"
                        title="Edit file"
                      >
                        <FaEdit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setDeleteConfirmModal({ file });
                        }}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                        title="Delete file"
                      >
                        <FaTrash className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No files available to edit
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setEditFilesModal(null);
                  // Clear from localStorage
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('documentsEditFilesModal');
                  }
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit File Modal */}
      {editFileModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-purple-700">Edit File</h3>
            </div>
            
            <div className="space-y-4">
              {/* File Name */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  File Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editFileModal.formData.fileName}
                  onChange={(e) => setEditFileModal(prev => ({
                    ...prev,
                    formData: { ...prev.formData, fileName: e.target.value }
                  }))}
                  className="w-full border-2 border-purple-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-400 text-base text-gray-800 bg-purple-50/80 shadow-md transition-all duration-200"
                  placeholder="Enter file name"
                />
              </div>



              {/* Category */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Category</label>
                <select
                  value={editFileModal.formData.category}
                  onChange={(e) => setEditFileModal(prev => ({
                    ...prev,
                    formData: { ...prev.formData, category: e.target.value }
                  }))}
                  className="w-full border-2 border-purple-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 text-base text-gray-800 bg-purple-50/80 shadow-md transition-all duration-200"
                >
                  <option value="">Select Category</option>
                  <option value="Report">Report</option>
                  <option value="Contract">Contract</option>
                  <option value="Invoice">Invoice</option>
                  <option value="Presentation">Presentation</option>
                  <option value="Image">Image</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Tags</label>
                <input
                  type="text"
                  value={editFileModal.formData.tags}
                  onChange={(e) => setEditFileModal(prev => ({
                    ...prev,
                    formData: { ...prev.formData, tags: e.target.value }
                  }))}
                  className="w-full border-2 border-purple-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-400 text-base text-gray-800 bg-purple-50/80 shadow-md transition-all duration-200"
                  placeholder="e.g. important, urgent, review (comma separated)"
                />
              </div>

              {/* Text Data */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Text Description</label>
                <textarea
                  value={editFileModal.formData.textData}
                  onChange={(e) => setEditFileModal(prev => ({
                    ...prev,
                    formData: { ...prev.formData, textData: e.target.value }
                  }))}
                  className="w-full border-2 border-purple-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-400 text-base text-gray-800 bg-purple-50/80 shadow-md transition-all duration-200"
                  placeholder="Enter any text data or description..."
                  rows={4}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Notes</label>
                <textarea
                  value={editFileModal.formData.notes}
                  onChange={(e) => setEditFileModal(prev => ({
                    ...prev,
                    formData: { ...prev.formData, notes: e.target.value }
                  }))}
                  className="w-full border-2 border-purple-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-400 text-base text-gray-800 bg-purple-50/80 shadow-md transition-all duration-200"
                  placeholder="Any additional notes..."
                  rows={3}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditFileModal(null)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                Close
              </button>
              <button
                onClick={async () => {
                  try {
                    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
                    const db = getFirestore();
                    const documentRef = doc(db, 'users', companyId, 'data_documents', editFileModal.file.id);
                    
                                         await updateDoc(documentRef, {
                       fileName: editFileModal.formData.fileName,
                       category: editFileModal.formData.category,
                       tags: editFileModal.formData.tags,
                       notes: editFileModal.formData.notes,
                       textData: editFileModal.formData.textData,
                       updatedAt: new Date().toISOString()
                     });
                    
                    setEditFileModal(null);
                  } catch (error) {
                    console.error('Error updating file:', error);
                  }
                }}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
