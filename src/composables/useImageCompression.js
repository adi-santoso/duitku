import imageCompression from 'browser-image-compression'

/**
 * Composable for image compression
 */
export function useImageCompression() {
  /**
   * Compress image file to base64
   */
  const compressImage = async (file) => {
    try {
      const options = {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
        fileType: 'image/jpeg'
      }

      const compressedFile = await imageCompression(file, options)
      const base64 = await fileToBase64(compressedFile)

      return base64
    } catch (error) {
      console.error('Image compression error:', error)
      throw error
    }
  }

  /**
   * Convert file to base64
   */
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })
  }

  /**
   * Validate image file
   */
  const validateImage = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!validTypes.includes(file.type)) {
      throw new Error('Format file tidak didukung. Gunakan JPG, PNG, atau WebP.')
    }

    if (file.size > maxSize) {
      throw new Error('Ukuran file terlalu besar. Maksimal 5MB.')
    }

    return true
  }

  return {
    compressImage,
    validateImage
  }
}
