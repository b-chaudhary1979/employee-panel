import { useState } from 'react';

export default function useCloudinary() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadToCloudinary = async (file, folder = 'cyberclipper') => {
    setLoading(true);
    setError(null);
  
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
      formData.append("folder", folder);
  
      const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`, {
        method: "POST",
        body: formData,
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        const errorMessage = result.error?.message || result.error || result.message || "Upload failed";
        throw new Error(errorMessage);
      }
  
      setLoading(false);
      return {
        success: true,
        cloudinaryUrl: result.secure_url,
        cloudinaryPublicId: result.public_id,
        cloudinaryAssetId: result.asset_id,
        cloudinaryVersion: result.version,
        cloudinaryFormat: result.format,
        cloudinaryResourceType: result.resource_type,
        cloudinaryBytes: result.bytes || null,
        cloudinaryWidth: result.width || null,
        cloudinaryHeight: result.height || null,
        cloudinaryDuration: result.duration || null,
        cloudinaryBitRate: result.bit_rate || null,
        cloudinaryFps: result.fps || null,
      };
  
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      setError("Upload failed");
      setLoading(false);
      return {
        success: false,
        error: err.message || "Upload failed",
      };
    }
  };
  
  

  // Delete file from Cloudinary via API route
  const deleteFromCloudinary = async (publicId, resourceType = 'auto') => {
    setLoading(true);
    setError(null);
    
    try {
      // Delete via API route
      const response = await fetch('/api/cloudinary-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicId: publicId,
          resourceType: resourceType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Deletion failed');
      }

      const result = await response.json();

      setLoading(false);
      return {
        success: true,
        deletedCount: result.deletedCount,
        deletedResources: result.deletedResources,
      };

    } catch (err) {
      console.error('Cloudinary deletion error:', err);
      setError('Deletion failed');
      setLoading(false);
      return { 
        success: false, 
        error: err.message || 'Deletion failed' 
      };
    }
  };

  // Get optimized URL for different use cases
  const getOptimizedUrl = (cloudinaryUrl, options = {}) => {
    if (!cloudinaryUrl) return null;

    const {
      width,
      height,
      quality = 'auto',
      format = 'auto',
      crop = 'scale',
      gravity = 'auto',
      effect = null,
    } = options;

    // Parse the Cloudinary URL
    const urlParts = cloudinaryUrl.split('/');
    const versionIndex = urlParts.findIndex(part => part.match(/^v\d+$/));
    
    if (versionIndex === -1) return cloudinaryUrl;

    // Insert transformations before the version
    const transformations = [];
    
    if (width || height) {
      const size = [];
      if (width) size.push(`w_${width}`);
      if (height) size.push(`h_${height}`);
      if (crop) size.push(`c_${crop}`);
      if (gravity) size.push(`g_${gravity}`);
      transformations.push(size.join(','));
    }
    
    if (quality !== 'auto') {
      transformations.push(`q_${quality}`);
    }
    
    if (format !== 'auto') {
      transformations.push(`f_${format}`);
    }
    
    if (effect) {
      transformations.push(`e_${effect}`);
    }

    if (transformations.length === 0) return cloudinaryUrl;

    const transformationString = transformations.join('/');
    urlParts.splice(versionIndex, 0, transformationString);
    
    return urlParts.join('/');
  };

  // Get thumbnail URL
  const getThumbnailUrl = (cloudinaryUrl, width = 300, height = 300) => {
    return getOptimizedUrl(cloudinaryUrl, {
      width,
      height,
      crop: 'fill',
      gravity: 'auto',
      quality: 'auto',
    });
  };

  // Get responsive URL
  const getResponsiveUrl = (cloudinaryUrl, maxWidth = 1200) => {
    return getOptimizedUrl(cloudinaryUrl, {
      width: maxWidth,
      crop: 'scale',
      quality: 'auto',
    });
  };

  return {
    uploadToCloudinary,
    deleteFromCloudinary,
    getOptimizedUrl,
    getThumbnailUrl,
    getResponsiveUrl,
    loading,
    error,
  };
} 