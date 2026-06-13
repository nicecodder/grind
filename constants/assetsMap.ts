export const ASSET_MAP: { [key: string]: any } = {
  'logo': require('../assets/logo.png'),
  'avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png': require('../assets/avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png'),
  'avatars/Gemini_Generated_Image_aufw98aufw98aufw_1.png': require('../assets/avatars/Gemini_Generated_Image_aufw98aufw98aufw_1.png'),
  'badges/bronze.png': require('../assets/badges/bronze.png'),
  'badges/silver.png': require('../assets/badges/silver.png'),
  'badges/gold.png': require('../assets/badges/gold.png'),
  'badges/dimond.png': require('../assets/badges/dimond.png'),
  'badges/master.png': require('../assets/badges/master.png'),
  'badges/supreme.png': require('../assets/badges/supreme.png'),
  'badges/ultrasupreme.png': require('../assets/badges/ultrasupreme.png'),
  
  // Achievements
  'achivement/dumble.png': require('../assets/achivement/dumble.png'),
  'achivement/lifting.png': require('../assets/achivement/lifting.png'),
  'achivement/muscles.png': require('../assets/achivement/muscles.png'),
  'achivement/run.png': require('../assets/achivement/run.png'),
  
  // Study illustrations
  'study/study 1.png': require('../assets/study/study 1.png'),
  'study/study 2.png': require('../assets/study/study 2.png'),
  'study/study 3.png': require('../assets/study/study 3.png'),
  'study/study 4.png': require('../assets/study/study 4.png'),
  'study/study 5.png': require('../assets/study/study 5.png'),
  'study/study 6.png': require('../assets/study/study 6.png'),
  'study/study 7.png': require('../assets/study/study 7.png'),
  'study/study 8.png': require('../assets/study/study 8.png'),
};

export function getAsset(path: string | null | undefined): any {
  if (!path) return ASSET_MAP['avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png'];
  if (ASSET_MAP[path]) {
    return ASSET_MAP[path];
  }
  // Fallbacks
  if (path.startsWith('avatars/')) {
    return ASSET_MAP['avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png'];
  }
  if (path.startsWith('badges/')) {
    return ASSET_MAP['badges/bronze.png'];
  }
  if (path.startsWith('achivement/')) {
    return ASSET_MAP['achivement/dumble.png'];
  }
  if (path.startsWith('study/')) {
    return ASSET_MAP['study/study 1.png'];
  }
  return ASSET_MAP['avatars/Gemini_Generated_Image_kr2fp6kr2fp6kr2f.png'];
}
