import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import SideBarContainer from "@/components/SideBarContainer";
import Container from "@/components/Container";
import { useLanguage } from "@/components/languageContext";
import { Switch } from "@/components/ui/switch";
import { FaTooth } from "react-icons/fa";
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
import { useAuthContext } from "@/components/AuthContext";
import { getToken } from "@/components/Helpers";
import { loadStripe } from "@stripe/stripe-js";

const SelectedItemsPageGclassique = () => {
  const { user } = useAuthContext();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedItemsData = location.state.selectedItemsData;
  const previousStates = location.state.previousStates;
  const brandSurgeonKit = location.state.previousStates.brandSurgeonKit;
  const implantBrandInputs = previousStates.implantBrandInputs || {};
  const implantBrandValues = previousStates.implantBrandValues || {};
  const additionalGuidesClavettes =
    previousStates.additionalGuidesClavettes || {};


  const Suppressionnumérique = location.state.selectedItemsData.second;
  const smileDesign = location.state.selectedItemsData.first;
  const ImpressionFormlabs = location.state.selectedItemsData.third;
  const cost = location.state.selectedItemsData.cost;
  const fullGuide = location.state.selectedItemsData.fullGuide;
  const foragePilote = location.state.selectedItemsData.foragePilote;
  const comment = location.state.selectedItemsData.comment;
  const brandSurgeon = location.state.selectedItemsData.brandSurgeonKit;
  const implantBrandValue = location.state.selectedItemsData.implantBrandValues;
  const textareaValu = location.state.selectedItemsData.textareaValue;
  const additionalGuidesImpressionn =
    location.state.selectedItemsData.additionalGuidesImpression;
  const additionalGuidesClavettess =
    location.state.selectedItemsData.additionalGuidesClavettes;
    location.state.selectedItemsData.additionalGuidesClavettes;
  const [patientData, setPatientData] = useState({
    fullname: "",
    caseNumber: "",
  });
  const [currentOffer, setCurrentOffer] = useState(null);

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

  const stripePromise = loadStripe(
    "pk_test_51P7FeV2LDy5HINSgFRIn3T8E8B3HNESuLslHURny1RAImgxfy0VV9nRrTEpmlSImYA55xJWZQEOthTLzabxrVDLl00vc2xFyDt"
  );
  const handleNextClick = async () => {
    if(previousStates.textareaValue === "" && previousStates.second)
    {
      return;
    }
    const res = await axios.post(
      "http://localhost:1337/api/guide-classiques",
      {
        data: {
          service: 2,
          comment,
          patient: patientData.fullname,
          numero_cas: patientData.caseNumber,
          Full_guidee: [
            {
              titlle: "Full guidée",
              active: fullGuide,
            },
          ],
          Forage_pilote: [
            {
              title: "forage pilote",
              active: foragePilote,
            },
          ],
          Marque_de_la_trousse: [
            {
              title: "Marque de la trousse de chirurgie utilisée",
              description: brandSurgeon,
            },
          ],
          options_generiques: [
            {
              title: "options generiques",
              Impression_Formlabs: [
                {
                  title: "Impression Formlabs",
                  active: ImpressionFormlabs,
                  Guide_supplementaire: additionalGuidesImpressionn,
                },
              ],
              Suppression_numerique: [
                {
                  title: "Suppression numérique de dents",
                  active: Suppressionnumérique,
                  description: textareaValu,
                },
              ],
              Smile_Design: [
                {
                  title: "Smile Design",
                  active: smileDesign,
                },
              ],
            },
          ],
          Clavettes_de_stabilisation: [
            {
              title: "Clavettes de stabilisation",
              active:selectedItemsData.selectedSwitch.checked,
              nombre_des_clavettes: additionalGuidesClavettess,
            },
          ],
          cout: [
            {
              cout: cost,
            },
          ],
          marque_implant_pour_la_dent: { " index": implantBrandValue },
          submit: false,
          archive: true,
        },
      }
    );

    const requestData = {
      cost: cost,
      service: 2,
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
  useEffect(() => {
    axios.get("http://localhost:1337/api/services").then(() => {});
  }, []);

  const handleNextClickArchive = async () => {
    

    const res = await axios.post(
      "http://localhost:1337/api/guide-classiques",
      {
        data: {
          service: 2,
          comment,
          patient: patientData.fullname,
          numero_cas: patientData.caseNumber,
          Full_guidee: [
            {
              titlle: "Full guidée",
              active: fullGuide,
            },
          ],
          Forage_pilote: [
            {
              title: "forage pilote",
              active: foragePilote,
            },
          ],
          Marque_de_la_trousse: [
            {
              title: "Marque de la trousse de chirurgie utilisée",
              description: brandSurgeon,
            },
          ],
          options_generiques: [
            {
              title: "options generiques",
              Impression_Formlabs: [
                {
                  title: "Impression Formlabs",
                  active: ImpressionFormlabs,
                  Guide_supplementaire: additionalGuidesImpressionn,
                },
              ],
              Suppression_numerique: [
                {
                  title: "Suppression numérique de dents",
                  active: Suppressionnumérique,
                  description: textareaValu,
                },
              ],
              Smile_Design: [
                {
                  title: "Smile Design",
                  active: smileDesign,
                },
              ],
            },
          ],
          Clavettes_de_stabilisation: [
            {
              title: "Clavettes de stabilisation",
              nombre_des_clavettes: additionalGuidesClavettess,
            },
          ],
          cout: [
            {
              cout: cost,
            },
          ], 
          marque_implant_pour_la_dent: { " index": implantBrandValue },
          submit: false,
          archive: true,
        },
      }

    );

    if (res.status === 200) {
      localStorage.removeItem("guideClassiqueState")
      navigate("/");
    } else {
      alert(res.status);
    }
  };

  const handlePreviousClick = ()=>{
    // navigate("/guide-classique")
    window.location.href="/guide-classique"
  }

  return (
    <SideBarContainer>
      <Container>
        <div className="p-2">
          <Card className="h-auto p-3 font-SF-Pro-Display">
            <div>
              <div className="flex items-center justify-center">
                <h1 className="font-lato text-5xl ">
                  {language === "french" ? "Guide classique" : "Classic Guide"}
                </h1>
              </div>
              <div className="flex-col mt-3 bg-gray-100 p-4 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold mb-3">
                  {language === "french" ? "Détails du cas" : "Case Details"}
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
                    {currentOffer ? `${currentOffer.discount}%` : "Loading..."}
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
              <p className="text-lg font-bold">
                {language === "french"
                  ? "Options sélectionnées"
                  : "Selected Options"}
              </p>

              <div className="flex flex-col items-center justify-center ">
                <Dents
                  selectAll={false}
                  selectedTeethData={previousStates.selectedTeeth || []}
                  isReadOnly={true}
                />
              </div>

              <div className="flex-col space-y-2">
                <p className="font-semibold">
                  {language === "french" ? "Kit chirurgical" : "Surgical Kit"}
                </p>
                <p>{brandSurgeonKit}</p>

                <div className="flex-col space-y-1">
                  <h1 className="font-bold">
                    {language === "french"
                      ? "Marque de l'implant pour la dent:"
                      : "Brand of the implant for the tooth:"}
                  </h1>
                  {implantBrandInputs.map((index) => (
                    <div key={index}>
                      <div className="flex items-center ">
                        <div className="flex space-x-2 items-center mr-2">
                          <FaTooth />
                          <span className=" flex items-center">{index}</span>
                        </div>
                        <Input
                          value={implantBrandValues[index]}
                          readOnly
                          className="w-2/5"
                        />

                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-semibold">
                  {language === "french"
                    ? "Marque de l'implant pour la dent"
                    : "Brand of the implant for the tooth"}
                </p>
                <p>{}</p>
              </div>
              <div className="flex space-x-2">
                <p>{selectedItemsData.selectedSwitchLabel}</p>

                <Switch checked={selectedItemsData.selectedSwitch.checked} />
              </div>
              <div>
                <div className="flex space-x-2">
                  <p>
                    {language === "french"
                      ? "Clavettes de stabilisation"
                      : "Stabilization pins"}
                  </p>

                  <p>
                    <Switch
                      checked={previousStates.showAdditionalGuidesInput}
                    />
                  </p>
                </div>
                {previousStates.showAdditionalGuidesInput && (
                  <Input
                    value={additionalGuidesClavettes}
                    readOnly
                    className="w-2/5"
                  />
                )}
              </div>

              <div className="flex space-x-2">
                <p>{language === "french" ? "Smile Design" : "Smile Design"}</p>

                <p>
                  <Switch checked={previousStates.first} />
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
                    <Switch checked={previousStates.second} />
                  </p>
                </div>
                {previousStates.second && (
                  <Input style={{
                    border: previousStates.textareaValue === "pas de texte" ||previousStates.textareaValue === "" ? "2px solid red" : "none",
                }} value={previousStates.textareaValue || ""} readOnly className="w-2/5" />
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
                    <Switch checked={previousStates.third} />
                  </p>
                </div>
                {previousStates.third && (
                  <Input
                    value={previousStates.additionalGuidesImpression}
                    readOnly
                    className="w-2/5"
                  />
                )}
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
                <Button
                onClick={handlePreviousClick}
                  className={`w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2 bg-[#fffa1b] text-[#0e0004] hover:bg-[#fffb1bb5] hover:text-[#0e0004] transition-all`}
                >
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
                      <Button
                        className={`w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2 bg-[#0e0004] text-[#fffa1b] hover:bg-[#211f20] hover:text-[#fffa1b] transition-all`}
                      >
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
              </div>
            </div>
          </Card>
        </div>
      </Container>
    </SideBarContainer>
  );
};

export default SelectedItemsPageGclassique;
