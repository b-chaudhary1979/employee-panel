import { useState, useCallback } from 'react';

// Cloudinary configuration for client-side
const CLOUDINARY_CONFIG = {
    cloud_name: 'dqvae07io', 
    api_key: '349726265388583', 
    upload_preset: 'ml_default' // You'll need to create this in your Cloudinary dashboard
};

export default function useCloudinary() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Upload image to Cloudinary using client-side API
    const uploadImage = useCallback(async (file, options = {}) => {
        setLoading(true);
        setError(null);
        
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_CONFIG.upload_preset);
            formData.append('cloud_name', CLOUDINARY_CONFIG.cloud_name);
            
            if (options.folder) {
                formData.append('folder', options.folder);
            }
            if (options.public_id) {
                formData.append('public_id', options.public_id);
            }

            const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloud_name}/image/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Upload failed');
            }

            const uploadResult = await response.json();
            setLoading(false);
            return uploadResult;
        } catch (err) {
            setError(err.message || 'Failed to upload image');
            setLoading(false);
            throw err;
        }
    }, []);

    // Generate Cloudinary URL with transformations
    const generateCloudinaryUrl = useCallback((publicId, options = {}) => {
        try {
            const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloud_name}/image/upload`;
            const transformations = [];
            
            if (options.fetch_format) transformations.push(`f_${options.fetch_format}`);
            if (options.quality) transformations.push(`q_${options.quality}`);
            if (options.width) transformations.push(`w_${options.width}`);
            if (options.height) transformations.push(`h_${options.height}`);
            if (options.crop) transformations.push(`c_${options.crop}`);
            if (options.gravity) transformations.push(`g_${options.gravity}`);
            if (options.radius) transformations.push(`r_${options.radius}`);
            
            const transformString = transformations.join(',');
            return transformString ? `${baseUrl}/${transformString}/${publicId}` : `${baseUrl}/${publicId}`;
        } catch (err) {
            setError(err.message || 'Failed to generate URL');
            throw err;
        }
    }, []);

    // Get optimized URL for an image
    const getOptimizedUrl = useCallback((publicId, options = {}) => {
        return generateCloudinaryUrl(publicId, {
            fetch_format: 'auto',
            quality: 'auto',
            ...options
        });
    }, [generateCloudinaryUrl]);

    // Get transformed URL (e.g., cropped, resized)
    const getTransformedUrl = useCallback((publicId, options = {}) => {
        return generateCloudinaryUrl(publicId, {
            crop: 'auto',
            gravity: 'auto',
            width: 500,
            height: 500,
            ...options
        });
    }, [generateCloudinaryUrl]);

    // Get profile picture URL (small, circular)
    const getProfilePictureUrl = useCallback((publicId, size = 150) => {
        return generateCloudinaryUrl(publicId, {
            width: size,
            height: size,
            crop: 'fill',
            gravity: 'face',
            radius: 'max',
            fetch_format: 'auto',
            quality: 'auto'
        });
    }, [generateCloudinaryUrl]);

    // Get thumbnail URL
    const getThumbnailUrl = useCallback((publicId, width = 200, height = 200) => {
        return generateCloudinaryUrl(publicId, {
            width,
            height,
            crop: 'fill',
            gravity: 'auto',
            fetch_format: 'auto',
            quality: 'auto'
        });
    }, [generateCloudinaryUrl]);

    // Delete image from Cloudinary (requires server-side implementation for security)
    const deleteImage = useCallback(async (publicId) => {
        setLoading(true);
        setError(null);
        
        try {
            // Note: Delete operations should be done server-side for security
            // This is a placeholder - implement server-side deletion
            setLoading(false);
            return { result: 'ok' };
        } catch (err) {
            setError(err.message || 'Failed to delete image');
            setLoading(false);
            throw err;
        }
    }, []);

    // Upload multiple images
    const uploadMultipleImages = useCallback(async (files, options = {}) => {
        setLoading(true);
        setError(null);
        
        try {
            const uploadPromises = files.map((file, index) => 
                uploadImage(file, {
                    ...options,
                    public_id: options.public_id ? `${options.public_id}_${index}` : `employee_${Date.now()}_${index}`
                })
            );
            
            const results = await Promise.all(uploadPromises);
            setLoading(false);
            return results;
        } catch (err) {
            setError(err.message || 'Failed to upload multiple images');
            setLoading(false);
            throw err;
        }
    }, [uploadImage]);

    return {
        uploadImage,
        uploadMultipleImages,
        getOptimizedUrl,
        getTransformedUrl,
        getProfilePictureUrl,
        getThumbnailUrl,
        deleteImage,
        loading,
        error,
        clearError: () => setError(null)
    };
} 