import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import SideBarContainer from "@/components/SideBarContainer";
import Container from "@/components/Container";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/components/languageContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { BEARER } from "@/components/Constant";
import { loadStripe } from "@stripe/stripe-js";
import { useAuthContext } from "@/components/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription, 
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getToken } from "@/components/Helpers";

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
  const { caseNumber, patient, typeDeTravail, guideType, guideId,offre } =
    location.state;
    const { user } = useAuthContext();
    const stripePromise = loadStripe(
      import.meta.env.VITE_STRIPE_API
    );
    const getDiscount = (plan) => {
      const discounts = {
        Essential: 5,
        Privilege: 10,
        Elite: 15,
        Premium: 20,
      };
      return discounts[plan] || 0;
    };
  
  const getAuthHeaders = () => {
    const token = getToken();
    return {
      Authorization: `${BEARER} ${token}`,
      "Content-Type": "application/json",
    };
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
      offre:offre,
      Cost: calculateTotalCost(),
    };
    localStorage.setItem("data",JSON.stringify(postData))
    localStorage.setItem("guideType",guideType)
    localStorage.setItem("guideId",guideId)
    
    const requestData = {
      cost: (calculateTotalCost() * (1 - getDiscount(offre) /100)) + (user.location[0].country.toLowerCase() === "france" ? 7.5 : 15),
      patient: patient,
      email: user && user.email,
      caseNumber:caseNumber,
      type_travail: typeDeTravail,
    };
    console.log(requestData)

    try {
      const stripe = await stripePromise;
      const response = await axios.post(
        "http://92.222.101.80:1337/api/demande-produire-et-expide-guide-etages",
        requestData,
        { headers: getAuthHeaders() }
      );
      const { error } = await stripe.redirectToCheckout({
        sessionId: response.data.stripeSession.id,
      });
      if (error) {
        console.error("Stripe checkout error:", error);
      }
    } catch (err) {
      console.log(err);
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
              {language === "french" ? "Offre du cas:" : "Offre of the case:"}
              {offre}
            </p>
              <p>
              {language === "french" ? "coût:" : "Cost:"} ({calculateTotalCost()} - {getDiscount(offre)}%) + {user && user.location[0].country.toLowerCase() === "france" ? 7.5 : 15} = {(calculateTotalCost() * (1 - getDiscount(offre) /100)) + (user && user.location[0].country.toLowerCase() === "france" ? 7.5 : 15)} €
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
              
              <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="bg-[#0e0004] text-[#fffa1b] px-4 py-2 rounded-md mt-9">
                  {language === "french" ? "Soumettre" : "Submit"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>
                {language === "french"
                  ? "Êtes-vous sûr de vouloir soumettre ce cas ?"
                  : "Are you sure you want to submit this case?"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                {language === "french"
                  ? "Soumettez votre cas pour bénéficier d'une révision illimitée. Nos praticiens experts examineront le cas et vous enverront la planification pour validation."
                  : "Submit your case to benefit from unlimited revision. Our expert practitioners will review the case and send you the plan for validation."}
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    {language === "french" ? "Annuler" : "Cancel"}
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleNextClick}>
                    {language === "french" ? "Continuer" : "Continue"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </Card>
      </Container>
    </SideBarContainer>
  );
};

export default DemandeProdExpGuideEtage;
