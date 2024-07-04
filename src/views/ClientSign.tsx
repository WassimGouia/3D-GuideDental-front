import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/components/languageContext";

const ClientSign: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState("createAccount"); // Default tab to track progress

  useEffect(() => {
    // Ensure that tab state updates based on the URL, supporting direct URL access and back navigation
    const path = location.pathname;
    if (path.includes("/sign/createAccount")) {
      setValue("createAccount");
    } else if (path.includes("/sign/information")) {
      setValue("information");
    }
  }, [location]);

  const handleTabChange = (newValue: string) => {
    // Here you would implement your condition checks
    if (newValue === "createAccount") {
      navigate("/sign/createAccount");
    } else if (newValue === "information" && formIsValid()) {
      navigate("/sign/information");
    }
  };

  // Placeholder for your form validation logic
  const formIsValid = () => {
    // Return true if form data is valid or conditions are met, otherwise false
    return true; // Assume true for example purposes
  };

  return (
    <div className="m-2">
      <Tabs
        value={value}
        onValueChange={handleTabChange}
        className="flex flex-col justify-center items-center w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="createAccount" className="flex justify-center">
            {language === "french" ? "Créer un compte" : "Create an account"}
          </TabsTrigger>
          <TabsTrigger value="information" className="flex justify-center">
            {language === "french" ? "Informations" : "Informations"}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default ClientSign;
