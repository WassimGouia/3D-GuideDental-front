import offreEnglish from "@/assets/1 (2).png";
import offreFrench from "@/assets/2 (1).png";
import { Button } from "@/components/ui/button";
import { Outlet, useNavigate } from "react-router-dom";
import Nouvelle from "@/components/Nouvelledemande";
import { Input } from "@/components/ui/input";
import SideBarContainer from "@/components/SideBarContainer";
import { useLanguage } from "@/components/languageContext";
import { useState } from "react";
import { useStepTracking } from "@/components/StepTrackingContext";
import axios from "axios";
import { Label } from "@radix-ui/react-label";

function generateRandomNumber() {
  return Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit random number
}

function Nouvelled() {
  const { completeStep } = useStepTracking();
  const { language } = useLanguage();
  const [patientName, setPatientName] = useState("");
  const navigate = useNavigate();

  const handleOnClick = async () => {
    try {
      const res = await axios.post("http://localhost:1337/api/patients", {
        data: {
          fullname: patientName,
          caseNumber: generateRandomNumber(),
          user: 1,
        },
      });
      if (res.status === 200) {
        completeStep("Nouvelle-demande");
        navigate("/sign/Nouvelle-modelisation", {
          state: {
            formData: {
              fullname: patientName,
              caseNumber: res.data.data.attributes.caseNumber,
            },
          },
        });
        window.localStorage.setItem("fullName",patientName);
        window.localStorage.setItem("caseNumber",res.data.data.attributes.caseNumber);
      }
    } catch (error) {
      console.error("Error creating patient:", error);
      // Handle error (e.g., show error message to user)
    }
  };

  return (
    <SideBarContainer>
      <div className="m-4">
        <Nouvelle />
        <div className="mt-4 mb-4">
          <Label htmlFor="name">
            {language === "french"
              ? "Remplissez le nom du nouveau patient:"
              : "Fill in the new patient's name:"}
          </Label>
          <br />
          <Input
            id="NOMP"
            placeholder={
              language === "french"
                ? "Nom du patient (requis)"
                : "Patient name (required)"
            }
            className="w-full md:w-1/2 lg:w-1/4 h-auto mt-2"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
          />
        </div>
        <img
          src={language === "french" ? offreFrench : offreEnglish}
          className="w-full h-auto mt-4"
          alt="Offre"
        />
        <div className="flex justify-end mt-4">
          <Button
            className="w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2 bg-[#0e0004] text-[#fffa1b] hover:bg-[#211f20] hover:text-[#fffa1b] transition-all"
            onClick={handleOnClick}
          >
            {language === "french" ? "Suivant" : "Next"}
          </Button>
        </div>
        <Outlet />
      </div>
    </SideBarContainer>
  );
}

export default Nouvelled;
