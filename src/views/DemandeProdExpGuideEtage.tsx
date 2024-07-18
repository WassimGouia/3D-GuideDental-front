import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import SideBarContainer from "@/components/SideBarContainer";
import Container from "@/components/Container";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/components/languageContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import axios, { AxiosError } from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { BEARER } from "@/components/Constant";

interface SelectedOptions {
  immediateLoading: boolean;
  resinImpression: boolean;
  metalResinImpression: boolean;
  metalImpression: boolean;
}

const DemandeProdExpGuideEtage: React.FC = () => {
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({
    immediateLoading: false,
    resinImpression: false,
    metalResinImpression: false,
    metalImpression: false,
  });
  const { language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { caseNumber, patient, typeDeTravail, guideType, guideId } =
    location.state;

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return {
      Authorization: `${BEARER} ${token}`,
      "Content-Type": "application/json",
    };
  };

  const updateGuideStatus = async () => {
    const statusUpdateData = {
      data: {
        produire_expide: true,
        En_cours_de_modification: false,
        En_attente_approbation: false,
        approuve: false,
        archive: false,
        soumis: false,
      },
    };

    try {
      const response = await axios.put(
        `http://localhost:1337/api/${guideType}/${guideId}`,
        statusUpdateData,
        { headers: getAuthHeaders() }
      );
      console.log("Update response:", response);
      alert("Guide status updated successfully!");
    } catch (error) {
      console.error("Failed to update guide status:", error);
      if (error instanceof AxiosError) {
        alert(
          "Failed to update guide status due to an error: " +
            (error.response?.data?.error?.message || error.message)
        );
      } else {
        alert("An unknown error occurred");
      }
    }
  };

  const calculateTotalCost = () => {
    let total = 0;
    if (selectedOptions.immediateLoading) total += 150;
    if (selectedOptions.resinImpression) total += 100;
    if (selectedOptions.metalResinImpression) total += 300;
    if (selectedOptions.metalImpression) total += 400;
    return total;
  };

  const handleNextClick = async () => {
    const postData = {
      Patient: patient,
      case_number: caseNumber,
      type_travail: typeDeTravail,
      Immediate_Loading: selectedOptions.immediateLoading,
      Resin_Impression_of_Both_Stages: selectedOptions.resinImpression,
      Metal_Impression_First_Stage: selectedOptions.metalResinImpression,
      Metal_Impression_of_Both_Stages: selectedOptions.metalImpression,
      Cost: calculateTotalCost(),
    };

    console.log("Sending data:", postData);
    console.log("Headers:", getAuthHeaders());

    try {
      const response = await axios.post(
        "http://localhost:1337/api/demande-produire-et-expide-guide-etages",
        { data: postData },
        { headers: getAuthHeaders() }
      );
      console.log("Response:", response);
      if (response.status === 200) {
        await updateGuideStatus();
        navigate("/successPage");
      } else {
        alert(`Submission failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to submit data:", error);
      if (error instanceof AxiosError) {
        console.error("Error details:", error.response?.data);
        console.error("Error status:", error.response?.status);
        console.error("Error headers:", error.response?.headers);
        alert("Failed to submit the data due to an error: " + error.message);
      } else {
        alert("An unknown error occurred");
      }
    }
  };

  const handleOptionChange = (option: keyof SelectedOptions) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  return (
    <SideBarContainer>
      <Container>
        <Card className="p-3">
          <div className="flex items-center justify-center">
            <h1 className="font-extrabold font-roboto text-lg">
              {language === "french"
                ? "Demande de production et expédition"
                : "Production Inquiry and Shipping"}
            </h1>
          </div>
          <div>
            <div className="flex-col">
              <p className="text-lg font-semibold">
                {language === "french" ? "Nom du patient:" : "Patient's name:"}{" "}
                {patient}
              </p>
              <p>
                {language === "french" ? "Numéro du cas:" : "Case number:"}{" "}
                {caseNumber}
              </p>
              <p>
                {language === "french" ? "Type de travail:" : "Type of work:"}{" "}
                {typeDeTravail}
              </p>
              <p>
                {language === "french" ? "Coût:" : "Cost:"}{" "}
                {calculateTotalCost()}€
              </p>
            </div>
          </div>
          <br />
          <div className="flex-col items-center space-y-2 ">
            <div className="flex space-x-2 justify-between">
              <p>
                {language === "french"
                  ? "Mise en charge immédiate (impression de la prothèse immédiate)"
                  : "Immediate loading (impression of the immediate prosthesis)"}
              </p>
              <Switch
                checked={selectedOptions.immediateLoading}
                onCheckedChange={() => handleOptionChange("immediateLoading")}
              />
            </div>
            <div className="flex space-x-2 justify-between">
              <Label htmlFor="airplane-mode">
                {language === "french"
                  ? "Impression des 2 étages en résine (prothèse immédiate non incluse)"
                  : "Resin impression of both guide parts (immediate prosthesis not included)"}
              </Label>
              <Switch
                checked={selectedOptions.resinImpression}
                onCheckedChange={() => handleOptionChange("resinImpression")}
              />
            </div>
            <div className="flex space-x-2 justify-between">
              <Label htmlFor="airplane-mode">
                {language === "french"
                  ? "Impression du premier étage en métal + deuxième étage en résine (prothèse immédiate non incluse)"
                  : "Metal impression of the first guide part + second guide part in resin (immediate prosthesis not included)"}
              </Label>
              <Switch
                checked={selectedOptions.metalResinImpression}
                onCheckedChange={() =>
                  handleOptionChange("metalResinImpression")
                }
              />
            </div>
            <div className="flex space-x-2 justify-between">
              <Label htmlFor="airplane-mode">
                {language === "french"
                  ? "Impression des 2 étages en métal (prothèse immédiate non incluse)"
                  : "Metal impression of both guide parts (immediate prosthesis not included)"}
              </Label>
              <Switch
                checked={selectedOptions.metalImpression}
                onCheckedChange={() => handleOptionChange("metalImpression")}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between">
              <Button
                className="bg-[#fffa1b] text-[#0e0004] px-4 py-2 rounded-md mt-9"
                onClick={() => navigate(-1)}
              >
                {language === "french" ? "Précédent" : "Previous"}
              </Button>
              <Button
                className="bg-[#0e0004] text-[#fffa1b] px-4 py-2 rounded-md mt-9"
                onClick={handleNextClick}
              >
                {language === "french" ? "Suivant" : "Next"}
              </Button>
            </div>
          </div>
        </Card>
      </Container>
    </SideBarContainer>
  );
};

export default DemandeProdExpGuideEtage;
