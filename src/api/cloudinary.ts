export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_PRESET_FOR_TRAININGS_IMAGES || 'bf1katla');
  formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name');

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name'}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image to Cloudinary');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
};

export const validateImageFile = (file: File): boolean => {
  const maxSizeMB = parseInt(import.meta.env.VITE_CLOUDINARY_IMAGE_LIMIT_SIZE_MB || '10');
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Type de fichier non supporté. Types autorisés: ${allowedTypes.join(', ')}`);
  }
  
  if (file.size > maxSizeBytes) {
    throw new Error(`Fichier trop volumineux. Taille maximale: ${maxSizeMB}MB`);
  }
  
  return true;
}; 