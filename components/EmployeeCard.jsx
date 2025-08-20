import React from 'react';
import Image from 'next/image';

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

  if (!user) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-green-100 transform hover:-translate-y-1">
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
        const reader = new FileReader();
        if (file.size > 500000) {
    alert('Image size exceeds 500kb. Please upload a smaller image.');
    return;
}
        reader.onload = (event) => {
          const base64Image = event.target.result;
          // Store the base64 image in the database
          fetch('/api/uploadProfileImage', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: base64Image })
          }).then(response => {
            if (response.ok) {
              // Image uploaded successfully
            } else {
              // Failed to upload image
            }
          }).catch(error => {
            // Error uploading image
          });
        };
        reader.readAsDataURL(file);
      }
    }}
  />
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-200 via-green-100 to-emerald-200 flex items-center justify-center shadow-lg overflow-hidden border-4 border-white">
              {user.photo ? (
                <img 
                  src={user.photo.startsWith('data:') ? user.photo : `data:image/jpeg;base64,${user.photo}`}
                  className="w-full h-full object-cover"
                  alt={`${user.firstName} ${user.lastName}`}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <svg className={`w-12 h-12 text-green-500 ${user.photo ? 'hidden' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
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
            <p className="text-xs text-gray-500 font-semibold uppercase">Company ID</p>
            <p className="text-gray-800 font-bold">{user.companyId || 'N/A'}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 font-semibold uppercase">Email</p>
            <p className="text-gray-800 font-medium truncate">{user.email || 'N/A'}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500 font-semibold uppercase">Company</p>
            <p className="text-gray-800 font-bold">{user.companyName || 'CyberClipper'}</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center border-t border-gray-100 pt-4">
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase">Date Joined</p>
            <p className="text-gray-800 font-medium">{formatDate(user.joinedAt)}</p>
          </div>
          <div className="flex space-x-2">
            <button className="bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
            <button className="bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;