import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/components/languageContext";

const ClientSign: React.FC = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const [value, setValue] = useState("createAccount");

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/sign/createAccount")) {
      setValue("createAccount");
    } else if (path.includes("/sign/information")) {
      setValue("information");
    }
  }, [location]);

  const handleTabClick = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  return (
    <div className="m-2">
      <Tabs
        value={value}
        className="flex flex-col justify-center items-center w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="createAccount"
            className="flex justify-center"
            onClick={handleTabClick}
          >
            {language === "french" ? "Créer un compte" : "Create an account"}
          </TabsTrigger>
          <TabsTrigger
            value="information"
            className="flex justify-center"
            onClick={handleTabClick}
          >
            {language === "french" ? "Information" : "Information"}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default ClientSign;
