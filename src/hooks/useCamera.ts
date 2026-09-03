import { useState, useCallback } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

/**
 * Custom hook to capture photos using `@capacitor/camera`
 * with automatic fallback to browser HTML5 File input for pure web environments.
 */
export function useCamera() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Take a photo using native Capacitor Camera API or web fallback.
   */
  const takePhoto = useCallback(async (): Promise<string | null> => {
    setIsCapturing(true);
    setError(null);

    try {
      // Attempt Capacitor Native Camera capture
      const image = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        correctOrientation: true,
        width: 1200 // Downscale image to fit offline storage easily
      });

      if (image && image.dataUrl) {
        setPhoto(image.dataUrl);
        setIsCapturing(false);
        return image.dataUrl;
      }
      setIsCapturing(false);
      return null;
    } catch (err: any) {
      console.warn('[CAMERA HOOK] Native Camera capture bypassed or cancelled:', err?.message || err);

      // Handle user cancellation gracefully
      if (err?.message?.includes('User cancelled photo app') || err?.message?.includes('cancelled')) {
        setIsCapturing(false);
        return null;
      }

      // If native camera fails or is unavailable, fallback to web HTML input picker
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment'; // Hint for mobile browser rear camera

        input.onchange = (e: Event) => {
          const target = e.target as HTMLInputElement;
          const file = target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              const base64 = reader.result as string;
              setPhoto(base64);
              setIsCapturing(false);
              resolve(base64);
            };
            reader.onerror = () => {
              setError('Failed to read image file');
              setIsCapturing(false);
              resolve(null);
            };
            reader.readAsDataURL(file);
          } else {
            setIsCapturing(false);
            resolve(null);
          }
        };

        input.oncancel = () => {
          setIsCapturing(false);
          resolve(null);
        };

        input.click();
      });
    }
  }, []);

  /**
   * Select a photo from device photo gallery / file system.
   */
  const chooseFromGallery = useCallback(async (): Promise<string | null> => {
    setIsCapturing(true);
    setError(null);

    try {
      const image = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
        width: 1200
      });

      if (image && image.dataUrl) {
        setPhoto(image.dataUrl);
        setIsCapturing(false);
        return image.dataUrl;
      }
      setIsCapturing(false);
      return null;
    } catch (err) {
      // Browser fallback for selecting from gallery
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.onchange = (e: Event) => {
          const target = e.target as HTMLInputElement;
          const file = target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              const base64 = reader.result as string;
              setPhoto(base64);
              setIsCapturing(false);
              resolve(base64);
            };
            reader.readAsDataURL(file);
          } else {
            setIsCapturing(false);
            resolve(null);
          }
        };
        input.click();
      });
    }
  }, []);

  const clearPhoto = useCallback(() => {
    setPhoto(null);
    setError(null);
  }, []);

  return {
    photo,
    setPhoto,
    isCapturing,
    error,
    takePhoto,
    chooseFromGallery,
    clearPhoto
  };
}
