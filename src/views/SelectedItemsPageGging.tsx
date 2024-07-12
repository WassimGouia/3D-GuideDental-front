import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import SideBarContainer from "@/components/SideBarContainer";
import Container from "@/components/Container";
import { useLanguage } from "@/components/languageContext";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

const SelectedItemsPageGging = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();

  const originalCost = location.state?.selectedItemsData.originalCost || 0;
  const cost = location.state?.selectedItemsData.cost || 0;
  const selectedItemsData = location.state?.selectedItemsData;
  const previousStates = location.state?.previousStates;
  const textareaValue = previousStates?.textareaValue || {}; // for the Digital extraction of teeth
  const additionalGuides = previousStates?.additionalGuides || {};
  const selectedTeethData = previousStates?.selectedTeeth || [];
  const comment = location.state?.selectedItemsData.comment;
  // const cost = location.state?.selectedItemsData.cost;
  const first = location.state?.selectedItemsData.first;
  const supressionumerique = location.state?.selectedItemsData.third;
  const textareaValu = location.state?.selectedItemsData.textareaValue;
  const costt = location.state?.selectedItemsData.cost;
  const ImpressionFormlabs = location.state?.selectedItemsData.fourth;
  const additionalGuidess = location.state?.selectedItemsData.additionalGuides;
  const smiledesign = location.state?.selectedItemsData.second;
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

    // Check if any required data is missing and redirect if true
    if (
      !selectedItemsData ||
      !selectedItemsData.comment ||
      !selectedItemsData.cost
    ) {
      navigate("/sign/nouvelle-demande");
    }
  }, [navigate, user, selectedItemsData]);

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
    const dataToStore = {
      cost,
      first,
    };

    const res = await axios.post(
      "http://localhost:1337/api/guide-pour-gingivectomies",
      {
        data: {
          service: 3,
          comment,
          patient: patientData.fullname,
          numero_cas: patientData.caseNumber,
          cout: costt,
          DICOM: [
            {
              title: "DICOM",
              active: first,
            },
          ],
          options_generiques: [
            {
              title: "options generiques",
              Impression_Formlabs: [
                {
                  title: "Impression Formlabs",
                  active: ImpressionFormlabs,
                  Guide_supplementaire: additionalGuidess,
                },
              ],
              Suppression_numerique: [
                {
                  title: "Suppression numérique de dents",
                  active: supressionumerique,
                  description: textareaValu,
                },
              ],
              Smile_Design: [
                {
                  title: "Smile Design",
                  active: smiledesign,
                },
              ],
            },
          ],
          submit: true,
          selected_teeth: selectedTeethData, // Add this line
          archive: false,
          en__cours_de_modification: false,
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
      first,
    };

    const res = await axios.post(
      "http://localhost:1337/api/guide-pour-gingivectomies",
      {
        data: {
          service: 3,
          comment,
          patient: patientData.fullname,
          numero_cas: patientData.caseNumber,
          cout: costt,
          DICOM: [
            {
              title: "DICOM",
              active: first,
            },
          ],
          options_generiques: [
            {
              title: "options generiques",
              Impression_Formlabs: [
                {
                  title: "Impression Formlabs",
                  active: ImpressionFormlabs,
                  Guide_supplementaire: additionalGuidess,
                },
              ],
              Suppression_numerique: [
                {
                  title: "Suppression numérique de dents",
                  active: supressionumerique,
                  description: textareaValu,
                },
              ],
              Smile_Design: [
                {
                  title: "Smile Design",
                  active: smiledesign,
                },
              ],
            },
          ],
          submit: false,
          archive: true,
          selected_teeth: selectedTeethData, // Add this line
          en__cours_de_modification: false,
          En_attente_approbation: false,
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
                <ul>
                  <div className="flex items-center justify-center">
                    <h1 className="font-lato text-5xl ">
                      {language === "french"
                        ? "Guide pour gingivectomie"
                        : "Gingivectomy guide"}
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
                  <p className="text-lg font-semibold">
                    {language === "french"
                      ? "Options sélectionnées"
                      : "Selected Options"}
                  </p>
                  <div className="flex flex-col items-center justify-center ">
                    <Dents
                      selectAll={false}
                      selectedTeethData={selectedTeethData}
                      isReadOnly={true}
                    />
                    <div className="flex space-x-2">
                      <p>
                        {language === "french" ? "avec DICOM" : "with DICOM"}
                      </p>

                      <p>
                        <Switch checked={previousStates?.first} />
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <p>
                      {language === "french" ? "Smile Design" : "Smile Design"}
                    </p>

                    <p>
                      <Switch checked={previousStates?.second} />
                    </p>
                  </div>

                  <div>
                    <div className="flex space-x-2">
                      <p>
                        {language === "french"
                          ? "Suppression numérique de dents"
                          : "Digital extraction of teeth"}
                      </p>

                      <p>
                        <Switch checked={previousStates?.third} />
                      </p>
                    </div>
                    {previousStates?.third && (
                      <Input value={textareaValue} readOnly className="w-2/5" />
                    )}
                  </div>

                  <div>
                    <div className="flex space-x-2">
                      <p>
                        {language === "french"
                          ? "Impression Formlabs®"
                          : "Formlabs® impression"}
                      </p>

                      <p>
                        <Switch checked={previousStates?.fourth} />
                      </p>
                    </div>
                    {previousStates?.fourth && (
                      <Input
                        value={additionalGuides}
                        readOnly
                        className="w-2/5"
                      />
                    )}
                  </div>

                  <li>Comment:</li>
                  <Input
                    value={selectedItemsData ? selectedItemsData.comment : ""}
                    readOnly
                    className="w-2/5"
                  />
                </ul>
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
                  <Button onClick={handlePayment}>Pay</Button>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </SideBarContainer>
    </div>
  );
};

export default SelectedItemsPageGging;
