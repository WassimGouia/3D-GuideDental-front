import { Card } from "@/components/ui/card";
import SideBarContainer from "@/components/SideBarContainer";
import Container from "@/components/Container";
import { useLanguage } from "@/components/languageContext";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
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
import Dents from "@/components/Dents";
import { loadStripe } from "@stripe/stripe-js";
import { useAuthContext } from "@/components/AuthContext";
import { getToken } from "@/components/Helpers";

const SelectedItemsPageGbruxisme = () => {
  const location = useLocation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const { selectedTeeth } = location.state.previousState;
  const selectedItemsData = location.state?.selectedItemsData;
  const previousStates = location.state.previousState;
  const comment = selectedItemsData.comment;
  const cost = selectedItemsData.cost;
  const first = previousStates.first;
  const second = previousStates.second;
  const additionalGuidess = selectedItemsData.additionalGuides;
  const textareaValu = selectedItemsData.textareaValue;
  const originalCost =
  location.state.selectedItemsData.originalCost;

console.log("first",first)
console.log("second",second)
  const [patientData, setPatientData] = useState({
    fullname: "",
    caseNumber: "",
  });
  const [currentOffer, setCurrentOffer] = useState(null);

  const stripePromise = loadStripe(
    "pk_test_51P7FeV2LDy5HINSgFRIn3T8E8B3HNESuLslHURny1RAImgxfy0VV9nRrTEpmlSImYA55xJWZQEOthTLzabxrVDLl00vc2xFyDt"
  ); 

  useEffect(() => {
    const storedFullname = localStorage.getItem("fullName");
    const storedCaseNumber = localStorage.getItem("caseNumber");

    if (!storedFullname || !storedCaseNumber) {
      navigate("/sign/nouvelle-demande");
    } else {
      setPatientData({
        fullname: storedFullname,
        caseNumber: storedCaseNumber,
      });

      const fetchOfferData = async () => {
        const token = getToken();
        if (token && user && user.id) {
          try {
            const userResponse = await axios.get(
              `http://localhost:1337/api/users/${user.id}?populate=offre`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (userResponse.data && userResponse.data.offre) {
              const offerData = userResponse.data.offre;
              setCurrentOffer({
                currentPlan: offerData.CurrentPlan,
                discount: getDiscount(offerData.CurrentPlan),
              });
            } else {
              console.error("Offer data not found in the user response");
              setCurrentOffer(null);
            }
          } catch (error) {
            console.error("Error fetching offer data:", error);
            setCurrentOffer(null);
          }
        }
      };

      fetchOfferData();
    }
  }, [navigate, user]);

  const getDiscount = (plan) => {
    const discounts = {
      Essential: 5,
      Privilege: 10,
      Elite: 15,
      Premium: 20,
    };
    return discounts[plan] || 0;
  };

  const handleNextClick = async () => {
    if(textareaValu === "" && previousStates.first)
      {
        return;
      }
    const res = await axios.post(
      "http://localhost:1337/api/gouttiere-de-bruxismes",
      {
        data: {
          service: 4,
          comment,
          cout:cost,
          patient: patientData.fullname,
          numero_cas: patientData.caseNumber,
          selected_teeth: selectedTeeth,
          options_generiques: [
            {
              title: "les options generiques",
              Impression_Formlabs: [
                {
                  title: "Impression Formlabs",
                  active: second,
                  Guide_supplementaire: additionalGuidess,
                },
              ],
              Suppression_numerique_de_dents: [
                {
                  title: "Suppression numérique de dents",
                  active: first,
                  description: textareaValu,
                },
              ],
            },
          ],
          archive: true,
          En_attente_approbation: false,
          soumis: false,
          en__cours_de_modification: false,
          approuve: false,
          produire_expide: false,
          user: user.id,
          offre:currentOffer?.currentPlan,
          originalCost:originalCost,
        },
      }
    );

    const requestData = {
      cost: cost,
      service: 4,
      patient: localStorage.getItem("fullName"),
      email: user && user.email,
      guideId:res.data.data.id
    };

    try {
      const stripe = await stripePromise;
      const response = await axios.post(
        "http://localhost:1337/api/commandes",
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

  const handleNextClickArchive = async () => {
    const res = await axios.post(
      "http://localhost:1337/api/gouttiere-de-bruxismes",
      {
        data: {
          service: 4,
          comment,
          cout:cost,
          patient: patientData.fullname,
          numero_cas: patientData.caseNumber,
          selected_teeth: selectedTeeth,
          options_generiques: [
            {
              title: "les options generiques",
              Impression_Formlabs: [
                {
                  title: "Impression Formlabs",
                  active: second,
                  Guide_supplementaire: additionalGuidess,
                },
              ],
              Suppression_numerique_de_dents: [
                {
                  title: "Suppression numérique de dents",
                  active: first,
                  description: textareaValu,
                },
              ],
            },
          ],
          archive: true,
          En_attente_approbation: false,
          soumis: false,
          en__cours_de_modification: false,
          approuve: false,
          produire_expide: false,
          user: user.id,
          offre:currentOffer?.currentPlan,
          originalCost:originalCost,
        },
      }
    );

    if (res.status === 200) {
      localStorage.removeItem("guideBruxismeState")
      navigate("/mes-fichier");
    } else {
      alert(res.status);
    }
  };
  const supportedCountries = ["france", "belgium", "portugal", "germany", "netherlands", "luxembourg", "italy", "spain"];
  const country = user && user.location[0].country.toLowerCase();
  
  const handlePreviousClick = ()=>{
    // navigate("/guide-classique")
    window.location.href="/gouttiere-bruxismes"
  }
  
  return (
    <div>
      <SideBarContainer>
        <Container>
          <div className="p-2">
            <Card className="h-auto p-3 font-SF-Pro-Display">
              <div>
                <div>
                  <div className="flex items-center justify-center">
                    <h1 className="font-lato text-5xl ">
                      {language === "french"
                        ? "Gouttière de bruxisme"
                        : "Bruxism splint"}
                    </h1>
                  </div>
                  <div className="flex-col mt-3 bg-gray-100 p-4 rounded-lg shadow-sm">
                    <h2 className="text-xl font-bold mb-3">
                      {language === "french"
                        ? "Détails du cas"
                        : "Case Details"}
                    </h2>
                    <div className="grid grid-cols-2 gap-2">
                      <p className="text-lg">
                        <span className="font-semibold">
                          {language === "french" ? "Patient: " : "Patient: "}
                        </span>
                        {patientData.fullname}
                      </p>
                      <p>
                        <span className="font-semibold">
                          {language === "french"
                            ? "Numéro du cas: "
                            : "Case number: "}
                        </span>
                        {patientData.caseNumber}
                      </p>
                      <p>
                        <span className="font-semibold">
                          {language === "french"
                            ? "Offre actuelle: "
                            : "Current offer: "}
                        </span>
                        {currentOffer ? currentOffer.currentPlan : "Loading..."}
                      </p>
                      <p>
                        <span className="font-semibold">
                          {language === "french" ? "Réduction: " : "Discount: "}
                        </span>
                        {currentOffer
                          ? `${currentOffer.discount}%`
                          : "Loading..."}
                      </p>
                      <p>
                        <span className="font-semibold">
                          {language === "french" ? "Coût: " : "Cost: "}
                        </span>

                        <span className="font-bold text-green-600">
                          {cost.toFixed(2)} €
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center ">
                  <Dents
                    selectAll={true}
                    selectedTeethData={selectedTeeth}
                    isReadOnly={true}
                  />
                </div>

                <div className="flex space-x-2">
                  <div>
                    <div className="flex space-x-2">
                      <p>
                        {language === "french"
                          ? "Suppression numérique de dents"
                          : "Digital extraction of teeth"}
                      </p>

                      <p>
                        <Switch checked={previousStates.first} />{" "}
                      </p>
                    </div>
                    {previousStates.first && (
                      <Input
                      style={{
                        border: textareaValu === "pas de texte" ||textareaValu === "" ? "2px solid red" : "none",
                    }}
                       value={textareaValu} readOnly />
                    )}
                  </div>
                </div>

                {supportedCountries.includes(country) ? (
                        <div className="flex space-x-2">
                        <div>
                          <div className="flex space-x-2">
                            <p>
                              {language === "french"
                                ? "Impression Formlabs®"
                                : "Formlabs® impression"}
                            </p>

                            <p>
                              <Switch checked={previousStates.second} />
                            </p>
                          </div>
                          {previousStates.second && (
                            <Input value={additionalGuidess} readOnly />
                          )}
                        </div>
                      </div>
                  ) : (
                    <></>
                  )}

                <div className="flex-col">
                  <p className="text-lg font-semibold">
                    {" "}
                    {language === "french" ? "commentaire" : "comment"}
                  </p>
                  <Input
                    value={selectedItemsData.comment}
                    readOnly
                    className="w-2/5"
                  />
                </div>
              </div>
              <div>
                <div className="mt-5 mb-5">
                  <p className="text-lg font-semibold">
                    {language === "french"
                      ? "Ajouter des fichiers:"
                      : "Add files:"}
                  </p>
                  <Input className="w-2/5" type="file" />
                </div>
                <div className="mt-5 flex justify-between">
                  <Button onClick={handlePreviousClick} className="w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2 bg-[#fffa1b] text-[#0e0004] hover:bg-[#fffb1bb5] hover:text-[#0e0004] transition-all">
                    {language === "french" ? "Précédent" : "Previous"}
                  </Button>

                  <div className="flex space-x-3">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2">
                          {language === "french" ? "Archiver" : "Archive"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                      <AlertDialogHeader>
                          <AlertDialogTitle>
                            {language === "french"
                              ? "Êtes-vous sûr de vouloir archiver ce cas ?"
                              : "Are you sure you want to archive this case?"}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                          {language === "french"
                            ? "Le cas sera archivé pendant une période de 3 mois à partir de sa date de création. En l'absence d'une action de votre part au-delà de cette période, il sera automatiquement et définitivement supprimé."
                            : "The case will be archived for a period of 3 months from its creation date. In the absence of action on your part beyond this period, it will be automatically and permanently deleted."}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            {language === "french" ? "Annuler" : "Cancel"}
                          </AlertDialogCancel>
                          <AlertDialogAction onClick={handleNextClickArchive}>
                            {language === "french" ? "Continuer" : "Continue"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2 bg-[#0e0004] text-[#fffa1b] hover:bg-[#211f20] hover:text-[#fffa1b] transition-all">
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
              </div>
            </Card>
          </div>
        </Container>
      </SideBarContainer>
    </div>
  );
};

export default SelectedItemsPageGbruxisme;
