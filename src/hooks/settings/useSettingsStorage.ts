
import { useState, useEffect } from 'react';
import { SiteSettings } from '@/types/siteSettings';
import { defaultSettings } from './useSettingsDefaults';

export const useSettingsStorage = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings as SiteSettings);

  // Charger les paramètres au démarrage
  useEffect(() => {
    try {
      // Récupérer les paramètres principaux
      const storedSettings = localStorage.getItem('siteSettings');
      let parsedSettings = storedSettings ? JSON.parse(storedSettings) : defaultSettings;
      
      // Vérifier si les images sont stockées séparément et les récupérer
      if (parsedSettings.logo === 'stored_separately') {
        try {
          const storedLogo = localStorage.getItem('site_logo');
          if (storedLogo) {
            console.log("Logo chargé depuis le stockage séparé, longueur:", storedLogo.length);
            
            // Pour une meilleure persistance, vérifier que le logo est une URL de données valide
            if (storedLogo.startsWith('data:image/')) {
              parsedSettings.logo = storedLogo;
            } else {
              console.log("Format de logo invalide, utilisation du logo par défaut");
              parsedSettings.logo = "/lovable-uploads/840dfb44-1c4f-4475-9321-7f361be73327.png";
            }
          } else {
            console.log("Aucun logo trouvé dans le stockage séparé");
            parsedSettings.logo = "/lovable-uploads/840dfb44-1c4f-4475-9321-7f361be73327.png";
          }
        } catch (logoError) {
          console.error("Erreur lors du chargement du logo séparé:", logoError);
          parsedSettings.logo = "/lovable-uploads/840dfb44-1c4f-4475-9321-7f361be73327.png";
        }
      }
      
      // Vérifier également pour le favicon
      const storedFavicon = localStorage.getItem('site_favicon');
      if (parsedSettings.favicon === 'stored_separately' && storedFavicon) {
        parsedSettings.favicon = storedFavicon;
        console.log("Favicon chargé depuis le stockage séparé");
      }
      
      // S'assurer que le mode sombre est toujours désactivé
      parsedSettings.darkMode = false;
      
      setSettings(parsedSettings as SiteSettings);
      console.log("Paramètres chargés avec succès");
    } catch (error) {
      console.error("Erreur lors du chargement des paramètres:", error);
      setSettings({...defaultSettings, darkMode: false} as SiteSettings);
    }
  }, []);

  // Sauvegarder les paramètres à chaque modification de manière plus robuste
  useEffect(() => {
    try {
      // Vérifier et sauvegarder le logo et favicon
      if (settings.logo) {
        // Vérifier si c'est une URL de données
        if (settings.logo.startsWith('data:')) {
          try {
            // Sauvegarder avec un timestamp pour éviter les problèmes de cache
            const timestamp = new Date().getTime();
            localStorage.setItem(`site_logo_${timestamp}`, settings.logo);
            localStorage.setItem('site_logo', settings.logo);
            localStorage.setItem('site_logo_timestamp', timestamp.toString());
            console.log("Logo sauvegardé séparément avec horodatage:", timestamp);
          } catch (logoError) {
            console.error("Erreur lors de la sauvegarde du logo:", logoError);
            // Essayer une version compressée si possible
            try {
              const compressedLogo = settings.logo.substring(0, 1000000); // Limiter la taille
              localStorage.setItem('site_logo', compressedLogo);
              console.log("Logo sauvegardé en version compressée");
            } catch (compressError) {
              console.error("Impossible de sauvegarder même le logo compressé:", compressError);
            }
          }
        }
      }
      
      if (settings.favicon && settings.favicon.startsWith('data:')) {
        localStorage.setItem('site_favicon', settings.favicon);
        console.log("Favicon sauvegardé séparément");
      }
      
      // Créer une copie des paramètres pour éviter de stocker les grandes data URLs directement
      const settingsToStore = { ...settings, darkMode: false };
      
      // Ne pas stocker les grandes data URLs dans l'objet principal
      if (settingsToStore.logo && settingsToStore.logo.startsWith('data:')) {
        // Remplacer par un indicateur dans l'objet principal
        settingsToStore.logo = 'stored_separately';
      }
      
      if (settingsToStore.favicon && settingsToStore.favicon.startsWith('data:')) {
        // Remplacer par un indicateur dans l'objet principal
        settingsToStore.favicon = 'stored_separately';
      }
      
      localStorage.setItem('siteSettings', JSON.stringify(settingsToStore));
      console.log("Paramètres sauvegardés avec succès");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des paramètres:", error);
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    setSettings((prevSettings) => {
      // S'assurer que le mode sombre reste désactivé
      const updatedSettings = {
        ...prevSettings,
        ...newSettings,
        darkMode: false
      };
      console.log("Paramètres mis à jour:", updatedSettings);
      return updatedSettings;
    });
  };

  const resetSettings = () => {
    // Supprimer également les images stockées séparément
    localStorage.removeItem('site_logo');
    localStorage.removeItem('site_logo_timestamp');
    // Supprimer toutes les versions horodatées
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('site_logo_')) {
        localStorage.removeItem(key);
      }
    }
    localStorage.removeItem('site_favicon');
    
    setSettings({...defaultSettings, darkMode: false} as SiteSettings);
    console.log("Paramètres réinitialisés");
  };

  return {
    settings,
    updateSettings,
    resetSettings
  };
};
