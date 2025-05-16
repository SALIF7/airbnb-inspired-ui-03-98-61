
/**
 * Utilitaires de stockage et gestion d'images
 */

/**
 * Supprime les anciennes entrées du localStorage pour libérer de l'espace
 */
export const purgeOldImageEntries = (): void => {
  try {
    // Garder une liste des clés à supprimer pour éviter les problèmes de boucle
    const keysToRemove: string[] = [];
    
    // Identifier les clés à supprimer
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('job_featured_image_') || key.includes('job_images_'))) {
        // Ne supprimer que les anciennes entrées (pas les "latest")
        if (!key.includes('_latest')) {
          keysToRemove.push(key);
        }
      }
      
      // Gérer également les anciennes versions du logo (garder seulement la plus récente)
      if (key && key.startsWith('site_logo_') && key !== 'site_logo' && key !== 'site_logo_timestamp') {
        const currentTimestamp = localStorage.getItem('site_logo_timestamp');
        // Si ce n'est pas la version actuelle, ajouter à la liste de suppression
        if (currentTimestamp && key !== `site_logo_${currentTimestamp}`) {
          keysToRemove.push(key);
        }
      }
    }
    
    // Supprimer toutes les clés identifiées
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    if (keysToRemove.length > 0) {
      console.log(`${keysToRemove.length} anciennes entrées nettoyées du localStorage`);
    }
  } catch (error) {
    console.error('Erreur lors du nettoyage du localStorage:', error);
  }
};

/**
 * Stocke des images dans localStorage avec un ID spécifique
 */
export const storeImagesToLocalStorage = async (
  key: string, 
  images: string[], 
  compressFunction: (img: string, quality: number) => Promise<string>,
  jobId?: string
): Promise<string[]> => {
  try {
    // Purger les anciennes entrées pour libérer de l'espace
    purgeOldImageEntries();
    
    // Si nous avons un jobId, utiliser des clés spécifiques à ce job
    // Sinon, utiliser temporairement les clés "latest" (lors de la création)
    const storageKey = jobId ? `${key}_${jobId}` : `${key}_latest`;
    
    // Limiter à max 3 images pour éviter de dépasser le quota
    const limitedImages = images.slice(0, 3);
    
    // Compresser les images
    const processedImages = await Promise.all(
      limitedImages.map(async (img) => {
        try {
          // Ajouter un timestamp unique à chaque image pour éviter les problèmes de cache
          const timestamp = new Date().getTime();
          const compressedImg = await compressFunction(img, 0.6);
          return `${compressedImg}#t=${timestamp}`;
        } catch (error) {
          console.error("Erreur lors du traitement de l'image:", error);
          return '';
        }
      })
    );
    
    // Filtrer les images vides ou invalides
    const validImages = processedImages.filter(img => img && img.length > 0);
    
    if (validImages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(validImages));
      console.log(`${validImages.length} images converties et stockées dans ${storageKey}`);
    }
    
    return validImages;
  } catch (error) {
    console.error('Erreur lors du stockage des images:', error);
    return [];
  }
};

/**
 * Stocke une image unique dans localStorage avec versionnement
 */
export const storeSingleImageToLocalStorage = async (
  key: string, 
  image: string,
  compressFunction: (img: string, quality: number) => Promise<string>,
  jobId?: string
): Promise<string> => {
  try {
    // Purger les anciennes entrées pour libérer de l'espace
    purgeOldImageEntries();
    
    // Si nous avons un jobId, utiliser des clés spécifiques à ce job
    // Sinon, utiliser temporairement les clés "latest"
    const storageKey = jobId ? `${key}_${jobId}` : `${key}_latest`;
    
    // Compresser l'image
    const compressedImage = await compressFunction(image, 0.7);
    
    // Pour des images importantes comme le logo, utiliser le versionnement
    if (key.includes('logo') || key.includes('favicon')) {
      const timestamp = new Date().getTime();
      localStorage.setItem(`${storageKey}_${timestamp}`, compressedImage);
      localStorage.setItem(`${key}_timestamp`, timestamp.toString());
    }
    
    // Toujours stocker la version standard
    localStorage.setItem(storageKey, compressedImage);
    console.log(`Image convertie et stockée dans ${storageKey}`);
    
    return compressedImage;
  } catch (error) {
    console.error('Erreur lors du stockage de l\'image:', error);
    return '';
  }
};

/**
 * Récupère des images depuis localStorage
 */
export const getImagesFromLocalStorage = (key: string, jobId?: string): string[] => {
  try {
    const storageKey = jobId ? `${key}_${jobId}` : `${key}_latest`;
    const imagesStr = localStorage.getItem(storageKey);
    
    if (!imagesStr) return [];
    
    try {
      const images = JSON.parse(imagesStr);
      return Array.isArray(images) ? images : [];
    } catch (e) {
      console.error(`Erreur de parsing pour ${storageKey}:`, e);
      return [];
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des images:', error);
    return [];
  }
};

/**
 * Récupère une image unique depuis localStorage avec gestion des versions
 */
export const getSingleImageFromLocalStorage = (key: string, jobId?: string): string => {
  try {
    const storageKey = jobId ? `${key}_${jobId}` : `${key}_latest`;
    
    // Vérifier d'abord s'il existe une version avec timestamp
    const timestamp = localStorage.getItem(`${key}_timestamp`);
    let image;
    
    if (timestamp) {
      image = localStorage.getItem(`${storageKey}_${timestamp}`);
    }
    
    // Si pas trouvé avec timestamp, utiliser la version standard
    if (!image) {
      image = localStorage.getItem(storageKey);
    }
    
    if (!image) return '';
    
    // Nettoyer l'image des guillemets si nécessaire
    if (image.startsWith('"') && image.endsWith('"')) {
      return image.substring(1, image.length - 1);
    }
    
    return image;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'image:', error);
    return '';
  }
};

/**
 * Supprime toutes les images temporaires (latest)
 */
export const clearTemporaryImages = (): void => {
  try {
    localStorage.removeItem('job_images_latest');
    localStorage.removeItem('job_featured_image_latest');
    console.log('Images temporaires supprimées');
  } catch (error) {
    console.error('Erreur lors de la suppression des images temporaires:', error);
  }
};
