import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import useStoreEmployees from '../hooks/useStoreEmployees';
import useDataSyncToAdmin from '../hooks/useDataSyncToAdmin';

const EmployeeCard = ({ user }) => {
  // Format date if it exists
  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    // Handle Firestore timestamp objects
    const date = dateValue.seconds
      ? new Date(dateValue.seconds * 1000)
      : new Date(dateValue);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const [previewImage, setPreviewImage] = useState(user?.photo || null);
  const [isUploading, setIsUploading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" }); // Add notification state
  
  // Get employee hook with companyId
  const employeesHook = useStoreEmployees(user?.companyId);
  
  // Get data sync hook
  const dataSyncHook = useDataSyncToAdmin();
  
  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, message: "", type: "success" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  if (!user) return null;

  const handleImageUpload = async (file) => {
    if (!file) return;

    // Validate file size (500KB limit)
    if (file.size > 500 * 1024) {
      setNotification({ show: true, message: 'Image size exceeds 500KB. Please upload a smaller image.', type: "error" });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setNotification({ show: true, message: 'Please upload a valid image file.', type: "error" });
      return;
    }

    setIsUploading(true);

    try {
      // Convert image to base64 data URL
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Image = event.target.result;
        
        // Update preview with the base64 image
        setPreviewImage(base64Image);
        
        // Update employee data in Firestore
        if (user.companyId && user.id) {
          await employeesHook.updateEmployee(user.id, {
            photo: base64Image
          });
          
          // Sync to admin panel
          await dataSyncHook.syncToAdmin({
            companyId: user.companyId,
            collectionName: 'employees',
            documentId: user.id,
            data: {
              photo: base64Image
            },
            operation: 'set'
          });
        }
        
        setNotification({ show: true, message: 'Profile image updated successfully!', type: "success" });
        setIsUploading(false);
      };
      
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        setNotification({ show: true, message: 'Error reading image file. Please try again.', type: "error" });
        setIsUploading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      setNotification({ show: true, message: 'Error uploading image. Please try again.', type: "error" });
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-green-100 transform hover:-translate-y-1">
      {/* Notification Popup */}
      {notification.show && (
        <div className={`fixed top-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${notification.type === 'success' ? 'bg-green-500' : 'bg-gradient-to-r from-red-500 to-pink-500'} text-white px-7 py-3 rounded-xl shadow-xl font-semibold flex items-center gap-2 text-lg animate-slideDown`}>
          {notification.type === 'success' ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {notification.message}
        </div>
      )}
      <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 flex justify-between items-center">
        <h3 className="text-white font-bold text-xl">Employee Profile</h3>
        <div className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
          {user.department || 'Department'}
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center mb-6">
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  handleImageUpload(file);
                }
              }}
              disabled={isUploading}
            />
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-200 via-green-100 to-emerald-200 flex items-center justify-center shadow-lg overflow-hidden border-4 border-white">
              {previewImage ? (
                <img
                  src={previewImage}
                  className="w-full h-full object-cover"
                  alt="Profile"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {/* Camera Icon Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full bg-black bg-opacity-40">
                    {isUploadingPhoto ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </div>
                
                </div>
              )}
            </div>
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          {/* Camera icon is now integrated with the profile SVG above */}
          
          <div className="ml-6">
            <h2 className="text-2xl font-bold text-gray-800">{`${user.firstName || ''} ${user.lastName || ''}`}</h2>
            <p className="text-green-600 font-medium">{user.role || 'Employee'}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 font-semibold uppercase">Employee ID</p>
            <p className="text-gray-800 font-bold">{user.id || 'N/A'}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 font-semibold uppercase">Email</p>
            <p className="text-gray-800 font-medium truncate">{user.email || 'N/A'}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 font-semibold uppercase">Company</p>
            <p className="text-gray-800 font-bold">{user.companyName || 'CyberClipper'}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 font-semibold uppercase">Date Joined</p>
            <p className="text-gray-800 font-bold">{formatDate(user.dateJoined)}</p>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default EmployeeCard;