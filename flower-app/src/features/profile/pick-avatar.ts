import * as ImagePicker from 'expo-image-picker';

export type PickedAvatar = { uri: string; dataUri: string };

const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Opens the photo library with a square crop. The system picker needs no permission prompt on
 * current iOS and Android. Returns null when the user cancels.
 */
export async function pickAvatar(): Promise<PickedAvatar | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.5,
    base64: true,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (!asset?.base64) throw new Error('That photo could not be read. Please choose another one.');
  // Base64 is about a third bigger than the bytes it carries.
  if (asset.base64.length * 0.75 > MAX_BYTES) throw new Error('That photo is too large. Please choose a smaller one.');
  // The picker returns JPEG data when base64 is requested.
  return { uri: asset.uri, dataUri: `data:image/jpeg;base64,${asset.base64}` };
}
