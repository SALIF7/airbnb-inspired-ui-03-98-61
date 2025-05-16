
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import "../../styles/components/logo.css";

export const NavbarLogo = () => {
  const { settings } = useSiteSettings();
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [currentLogo, setCurrentLogo] = useState<string>("");
  
  // Update currentLogo when settings.logo changes or on component mount
  useEffect(() => {
    try {
      // Use a default logo if none is provided
      const defaultLogo = "/lovable-uploads/840dfb44-1c4f-4475-9321-7f361be73327.png";
      let logoSrc = "";
      
      if (settings.logo === 'stored_separately') {
        // Récupérer la version la plus récente du logo
        const timestamp = localStorage.getItem('site_logo_timestamp');
        let storedLogo;
        
        if (timestamp) {
          storedLogo = localStorage.getItem(`site_logo_${timestamp}`);
        }
        
        // Si pas trouvé avec timestamp, essayer la version standard
        if (!storedLogo) {
          storedLogo = localStorage.getItem('site_logo');
        }
        
        logoSrc = storedLogo || defaultLogo;
        console.log("Logo chargé depuis le stockage local:", logoSrc.substring(0, 30) + "...");
      } else if (settings.logo) {
        logoSrc = settings.logo || defaultLogo;
        console.log("Logo chargé depuis les paramètres:", logoSrc.substring(0, 30) + "...");
      } else {
        logoSrc = defaultLogo;
        console.log("Logo par défaut utilisé");
      }
      
      setCurrentLogo(logoSrc);
      setLogoLoaded(false);
      setLogoError(false);
    } catch (error) {
      console.error("Erreur lors de l'initialisation du logo:", error);
      setLogoError(true);
      // Use default logo in case of error
      setCurrentLogo("/lovable-uploads/840dfb44-1c4f-4475-9321-7f361be73327.png");
    }
  }, [settings.logo]);
  
  const handleLogoError = () => {
    console.error("Error loading logo in navbar:", currentLogo?.substring(0, 30));
    setLogoError(true);
  };
  
  return (
    <Link to="/" className="flex items-center gap-4 sm:gap-6 md:gap-8 mr-8">
      <motion.div 
        whileHover={{ scale: 1.05, rotate: 5, z: 10 }}
        whileTap={{ scale: 0.95 }}
        className="relative logo-container"
        style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
      >
        <div className="h-10 sm:h-12 md:h-14 w-10 sm:w-12 md:w-14 flex items-center justify-center overflow-hidden rounded-full bg-black border-2 border-yellow-500">
          {!logoError && currentLogo ? (
            <img 
              src={currentLogo} 
              alt={settings.siteName || "Logo"}
              className={`logo w-full h-full transition-all duration-300 ease-in-out ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setLogoLoaded(true)}
              onError={handleLogoError}
            />
          ) : null}
          
          {(!logoLoaded || logoError) && (
            <div className="h-full w-full rounded-full bg-black border-2 border-yellow-500 flex items-center justify-center logo-fallback">
              <span className="text-yellow-500 font-bold text-lg">
                {settings.siteName ? settings.siteName.substring(0, 2).toUpperCase() : 'SJ'}
              </span>
            </div>
          )}
        </div>
      </motion.div>
      <motion.span 
        className="text-xl sm:text-2xl md:text-3xl font-bold site-name inline-block font-serif tracking-wide truncate max-w-[180px] xs:max-w-[180px] sm:max-w-none" 
        whileHover={{ scale: 1.05 }}
      >
        {settings.siteName || 'Shalom Job Center'}
      </motion.span>
    </Link>
  );
};
