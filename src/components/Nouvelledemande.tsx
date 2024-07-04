import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/components/languageContext";

const Nouvelle: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState("OFFRE"); // Default tab based on default URL
  const [selectedOption, setSelectedOption] = useState(""); // Assuming this is your selected option state

  useEffect(() => {
    // Ensure that tab state updates based on the URL, supporting direct URL access and back navigation
    const path = location.pathname;
    if (path.includes("/sign/Nouvelle-demande")) {
      setValue("OFFRE");
    } else if (path.includes("/sign/Nouvelle-modelisation")) {
      setValue("LOGIN");
    } else if (path.includes("/sign/information")) {
      setValue("INFORMATION");
    }
  }, [location]);

  const handleTabChange = (newValue: string) => {
    if (newValue === "OFFRE") {
      navigate("/sign/Nouvelle-demande");
    } else if (newValue === "LOGIN") {
      // Directly use the selectedOption state
      switch (selectedOption) {
        case "Stackable guide":
          navigate("/guide-etage");
          break;
        case "Rapport radiologique":
          navigate("/rapport-radiologique");
          break;
        // Add more cases as needed for other options
        default:
          // Handle default case or show an error/notification
          console.log("Unknown option selected in Nouvelle modelisation");
      }
    } else if (newValue === "INFORMATION" && formIsValid()) {
      navigate("/sign/information");
    }
  };

  // Placeholder for your form validation logic
  const formIsValid = () => {
    // Return true if form data is valid or conditions are met, otherwise false
    return true; // Assume true for example purposes
  };

  return (
    <Tabs
      value={value}
      onValueChange={handleTabChange}
      className="flex flex-col justify-center items-center gap-4 w-full"
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="OFFRE" className="flex justify-center">
          {language === "french" ? "Informations" : "Information"}
        </TabsTrigger>
        <TabsTrigger value="LOGIN" className="flex justify-center">
          {language === "french" ? "Détails" : "Details"}
        </TabsTrigger>
        <TabsTrigger value="INFORMATION" className="flex justify-center">
          {language === "french" ? "Fichier" : "File"}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default Nouvelle;
