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

const SelectedItemsPageGging = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const selectedItemsData = location.state?.selectedItemsData;
  const previousStates = location.state?.previousStates;
  const textareaValue = previousStates?.textareaValue || {}; // for the Digital extraction of teeth
  const additionalGuides = previousStates?.additionalGuides || {};
  const selectedTeethData = previousStates?.selectedTeeth || [];
  const comment = location.state?.selectedItemsData.comment;
  const cost = location.state?.selectedItemsData.cost;
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

  

  const stripePromise = loadStripe(
    "pk_live_51P7FeV2LDy5HINSgXOwiSvMNT7A8x0OOUaTFbu07yQlFBd2Ek5oMCj3eo0aSORCDwI4javqv9tIpEsS8dc8FQT2700vuuVUdFS"
  );

  const handlePayment = async (event) => {
    event.preventDefault();

    // Get Stripe.js instance
    const stripe = await stripePromise;

    // Call your backend to create the Checkout Session
    const response = await axios.post("http://localhost:1337/api/commandes", {
      // Include any data you want to send to the server
      paymentId: "testPaymentId", // replace with actual paymentId
      cost: 100, // replace with actual cost
      client: { id: "testClientId" }, // replace with actual client data
    });

    const session = response.data.stripeSession;

    // When the customer clicks on the button, redirect them to Checkout.
    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      // If `redirectToCheckout` fails due to a browser or network
      // error, display the localized error message to your customer
      console.error(result.error.message);
    }
  };

  useEffect(() => {
    // const fetchPatientData = async () => {
    //   try {
    //     const response = await axios.get(
    //       "http://localhost:1337/api/patients?sort=id:desc&pagination[limit]=1"
    //     );
    //     const patient = response.data.data[0].attributes;
    //     setPatientData({
    //       fullname: patient.fullname,
    //       caseNumber: patient.caseNumber,
    //     });
    //   } catch (error) {
    //     console.error("Error fetching patient data:", error);
    //   }
    // };

    // fetchPatientData();
    const storedFullname = localStorage.getItem("fullName");
    const storedCaseNumber = localStorage.getItem("caseNumber");

    if (!storedFullname || !storedCaseNumber) {
      // Redirect to /sign/nouvelle-demande if data is missing
      navigate("/sign/nouvelle-demande");
    } else {
      // If data exists in local storage, set it to patientData
      setPatientData({
        fullname: storedFullname,
        caseNumber: storedCaseNumber,
      });
    }
    // Check if any location is null and redirect if true
    if (
      !selectedItemsData ||
      !comment ||
      !cost ||
      !first ||
      !supressionumerique ||
      !textareaValu ||
      !costt ||
      !ImpressionFormlabs ||
      !additionalGuidess ||
      !smiledesign
    ) {
      navigate("/sign/nouvelle-demande");
    }
  }, [
    navigate,
    selectedItemsData,
    comment,
    cost,
    first,
    supressionumerique,
    textareaValu,
    costt,
    ImpressionFormlabs,
    additionalGuidess,
    smiledesign,
  ]);

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
                  <div className="flex-col">
                    <p className="text-lg font-semibold">
                      Patient: {patientData.fullname}
                    </p>
                    <p>
                      {language === "french"
                        ? "Numéro du cas:"
                        : "Case number:"}
                      {patientData.caseNumber}
                    </p>
                    <p>
                      {language === "french"
                        ? "Offre actuelle:"
                        : "Current offer: "}
                    </p>
                    <p className="flex">
                      {language === "french" ? "Coût" : "Cost"} :{" "}
                      {selectedItemsData ? selectedItemsData.cost : 0} €
                    </p>
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
