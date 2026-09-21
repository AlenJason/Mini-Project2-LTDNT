import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

/**
 * Opens the native camera (or file picker on web) and returns the captured
 * photo as a data URL, ready to preview in an <img> and to store/sync as-is.
 * Returns null if the user cancels.
 */
export async function capturePhoto(): Promise<string | null> {
  try {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
      quality: 70,
      width: 1280,
    });
    return photo.dataUrl ?? null;
  } catch (error) {
    // User cancelled the camera/picker dialog — not an error worth surfacing.
    if (error instanceof Error && /cancelled/i.test(error.message)) return null;
    throw error;
  }
}
