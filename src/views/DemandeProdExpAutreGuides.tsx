import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import SideBarContainer from "@/components/SideBarContainer";
import Container from "@/components/Container";
import { useLanguage } from "@/components/languageContext";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/components/AuthContext";
import { loadStripe } from "@stripe/stripe-js";
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

const DemandeProdExpAutreGuides = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const [inputValue, setInputValue] = useState(0);
  const [cost, setCost] = useState(0);
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

  useEffect(() => {
    setCost(inputValue * 40);
  }, [inputValue]);

  const handleNextClick = async () => {
    localStorage.setItem("guideType",guideType)
    localStorage.setItem("guideId",guideId)
    localStorage.setItem("offre",offre)
    localStorage.setItem("originalCost",cost)
    localStorage.setItem("numberOfPieces",inputValue)

    const requestData = {
      cost: (cost * (1 - getDiscount(offre) /100)) + (user.location[0].country.toLowerCase() === "france" ? 7.5 : 15),
      patient: patient,
      email: user && user.email,
      caseNumber:caseNumber,
      type_travail: typeDeTravail,
    };

    try {
      const stripe = await stripePromise;
      const response = await axios.post(
        "https://admin.3dguidedental.com/api/demande-produire-et-expidees",
        requestData
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

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handlePreviousClick = () => {
    navigate("/mes-fichier")
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
          <div className="flex-col">
            <p className="text-lg font-semibold">
              {language === "french" ? "Nom du patient:" : "Patient's name:"}{" "}
              {patient}
            </p>
            <p>
              {language === "french" ? "Numéro du cas:" : "Case number:"}
              {caseNumber}
            </p>
            <p>
              {language === "french" ? "Type de travail:" : "Type of work:"}
              {typeDeTravail}
            </p>
            <p>
              {language === "french" ? "Offre du cas:" : "Offre of the case:"}
              {offre}
            </p>
            <p>
              {language === "french" ? "coût:" : "Cost:"} ({cost} - {getDiscount(offre)}%) + {user && user.location[0].country.toLowerCase() === "france" ? 7.5 : 15} = {(cost * (1 - getDiscount(offre) /100)) + (user && user.location[0].country.toLowerCase() === "france" ? 7.5 : 15)} €
            </p>
          </div>
          <br />
          <div className="flex flex-col">
            <h1>
              {language === "french"
                ? "Guide supplémentaire(s)"
                : "Additional guide(s)"}
            </h1>
            <Input
              type="number"
              min="0"
              placeholder="0"
              className="w-1/3"
              value={inputValue}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex justify-between">
            <Button onClick={handlePreviousClick} className="w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2 bg-[#fffa1b] text-[#0e0004] hover:bg-[#fffb1bb5] hover:text-[#0e0004] transition-all  mt-9">
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
        </Card>
      </Container>
    </SideBarContainer>
  );
};

export default DemandeProdExpAutreGuides;
