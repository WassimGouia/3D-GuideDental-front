import { Card } from "@/components/ui/card";
import SideBarContainer from "@/components/SideBarContainer";
import Container from "@/components/Container";
import { useLanguage } from "@/components/languageContext";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  const selectedItemsData = location.state.selectedItemsData;
  const previousStates = location.state.previousState;
  const additionalGuides = previousStates.additionalGuides || {};
  const textareaValue = previousStates.textareaValue || {};
  const comment = selectedItemsData.comment;
  const originalCost = selectedItemsData.originalCost;
  const cost = selectedItemsData.cost;
  const first = selectedItemsData.first;
  const second = selectedItemsData.second;
  const additionalGuidess = selectedItemsData.additionalGuides;
  const textareaValu = selectedItemsData.textareaValue;

  const [patientData, setPatientData] = useState({
    fullname: "",
    caseNumber: "",
  });
  const [currentOffer, setCurrentOffer] = useState(null);

  const stripePromise = loadStripe(
    "pk_live_51P7FeV2LDy5HINSgXOwiSvMNT7A8x0OOUaTFbu07yQlFBd2Ek5oMCj3eo0aSORCDwI4javqv9tIpEsS8dc8FQT2700vuuVUdFS"
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

  const handlePayment = async (event) => {
    event.preventDefault();
    const stripe = await stripePromise;
    const response = await axios.post("http://localhost:1337/api/commandes", {
      paymentId: "testPaymentId",
      cost: cost,
      client: { id: "testClientId" },
    });

    const session = response.data.stripeSession;
    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      console.error(result.error.message);
    }
  };

  const handleNextClick = async () => {
    const dataToStore = { cost };
    const res = await axios.post(
      "http://localhost:1337/api/gouttiere-de-bruxismes",
      {
        data: {
          service: 4,
          comment,
          patient: patientData.fullname,
          numero_cas: patientData.caseNumber,
          selected_teeth: selectedTeeth,
          les_options_generiques: [
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
          submit: true,
          archive: false,
        },
      }
    );

    if (res.status === 200) {
      navigate("/selectedItemsPage", {
        state: { selectedItemsData: dataToStore },
      });
    } else {
      alert(res.status);
    }
  };

  const handleNextClickArchive = async () => {
    const dataToStore = {
      cost,
    };

    const res = await axios.post(
      "http://localhost:1337/api/gouttiere-de-bruxismes",
      {
        data: {
          service: 4,
          comment,
          patient: patientData.fullname,
          numero_cas: patientData.caseNumber,
          selected_teeth: selectedTeeth, // only the indexes
          les_options_generiques: [
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
          submit: false,
          archive: true,
        },
      }
    );

    if (res.status === 200) {
      navigate("/selectedItemsPage", {
        state: { selectedItemsData: dataToStore },
      });
    } else {
      alert(res.status);
    }
  };

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
                        <span className="line-through">
                          {originalCost.toFixed(2)} €
                        </span>{" "}
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
                      <Input value={textareaValue} readOnly />
                    )}
                  </div>
                </div>

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
                      <Input value={additionalGuides} readOnly />
                    )}
                  </div>
                </div>

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
                  <Button className="w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2 bg-[#fffa1b] text-[#0e0004] hover:bg-[#fffb1bb5] hover:text-[#0e0004] transition-all">
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
                              ? "Voulez-vous vraiment archiver ce cas?"
                              : "Are you sure you want to archive this case?"}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {language === "french"
                              ? " cela archivera le cas."
                              : " this will archive the case."}
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
                              ? "Voulez-vous vraiment soumettre ce cas?"
                              : "Are you sure you want to submit this case?"}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {language === "french"
                              ? " cela soumettra le cas."
                              : " this will submit the case."}
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
                  <Button onClick={handlePayment}>
                    {language === "french" ? "Payer" : "Pay"}
                  </Button>
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
