import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'DELETE' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { publicId, resourceType } = req.body;

  console.log('Cloudinary delete request:', { publicId, resourceType });

  if (!publicId || !resourceType) {
    return res.status(400).json({ error: 'Missing publicId or resourceType' });
  }

  try {
    console.log('Attempting to delete from Cloudinary:', { publicId, resourceType });
    console.log('Cloudinary config:', {
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? '***' : 'MISSING',
      api_secret: process.env.CLOUDINARY_API_SECRET ? '***' : 'MISSING'
    });
    
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType, // 'image', 'video', or 'raw'
    });

    console.log('Cloudinary delete result:', result);

    if (result.result === 'ok') {
      return res.status(200).json({
        success: true,
        deletedResources: [publicId],
        deletedCount: 1,
      });
    } else {
      return res.status(500).json({ error: `Cloudinary error: ${result.result}` });
    }
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    return res.status(500).json({ error: 'Cloudinary deletion failed' });
  }
}
