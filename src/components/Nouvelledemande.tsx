import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/components/languageContext";

const Nouvelle: React.FC = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const [value, setValue] = useState("OFFRE");

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/sign/Nouvelle-demande") || path.includes("/sign/Nouvelle-modelisation")) {
      setValue("OFFRE");
    } else if (path.includes("/guide-etage") || path.includes("/guide-classique") || 
               path.includes("/guide-gingivectomie") || path.includes("/gouttiere-bruxismes") || 
               path.includes("/autre-services") || path.includes("/rapport-radiologique")) {
      setValue("LOGIN");
    } else if (path.includes("/SelectedItemsPageGETAGE") || path.includes("/SelectedItemsPageGbruxisme") || 
               path.includes("/SelectedItemsPageGclassique") || path.includes("/selectedItemsPageAutreService") || 
               path.includes("/selectedItemsPageGging") || path.includes("/selectedItemsPageRapportRad")) {
      setValue("INFORMATION");
    }
  }, [location]);

  const handleTabClick = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  return (
    <Tabs
      value={value}
      className="flex flex-col justify-center items-center gap-4 w-full"
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger 
          value="OFFRE" 
          className="flex justify-center"
          onClick={handleTabClick}
        >
          {language === "french" ? "Informations" : "Information"}
        </TabsTrigger>
        <TabsTrigger 
          value="LOGIN" 
          className="flex justify-center"
          onClick={handleTabClick}
        >
          {language === "french" ? "Détails" : "Details"}
        </TabsTrigger>
        <TabsTrigger 
          value="INFORMATION" 
          className="flex justify-center"
          onClick={handleTabClick}
        >
          {language === "french" ? "Fichiers" : "Files"}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default Nouvelle;