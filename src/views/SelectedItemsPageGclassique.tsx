import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { loadStripe } from "@stripe/stripe-js";


const SelectedItemsPageGclassique = () => {
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
  const additionalGuidesImpression =
    previousStates.additionalGuidesImpression || {};
  const textareaValue = previousStates.textareaValue || {}; //for the Digital extraction of teeth

  const Suppressionnumérique = location.state.selectedItemsData.second;
  const smileDesign = location.state.selectedItemsData.first;
  const ImpressionFormlabs = location.state.selectedItemsData.third;
  const cost = location.state.selectedItemsData.cost;
  const fullGuide = location.state.selectedItemsData.fullGuide;
  const foragePilote = location.state.selectedItemsData.foragePilote;
  const comment = location.state.selectedItemsData.comment;
  const brandSurgeon = location.state.selectedItemsData.brandSurgeonKit;
  const implantBrandValue = location.state.selectedItemsData.implantBrandValues; // tb3inn les dents // to do never show the input type of eror[object object ]
  const implantBrandInput = location.state.selectedItemsData.implantBrandInputs;
  const textareaValu = location.state.selectedItemsData.textareaValue;
  const additionalGuidesImpressionn =
    location.state.selectedItemsData.additionalGuidesImpression;
  const additionalGuidesClavettess =
    location.state.selectedItemsData.additionalGuidesClavettes;
  const showAdditionalGuidesInput =
    location.state.selectedItemsData.additionalGuidesClavettes; //to do mta33 clavette a wassimos type of eror [object object]
  const selectedTeeth = location.state.selectedItemsData.selectedTeeth;
  const [patientData, setPatientData] = useState({ fullname: '', caseNumber: '' });

  useEffect(() => {
    // const fetchPatientData = async () => {
    //   try {
    //     const response = await axios.get("http://localhost:1337/api/patients?sort=id:desc&pagination[limit]=1");
    //     // Assuming the first patient is the one you want
    //     const patient = response.data.data[0].attributes;
    //     setPatientData({
    //       fullname: patient.fullname,
    //       caseNumber: patient.caseNumber
    //     });
    //   } catch (error) {
    //     console.error('Error fetching patient data:', error);
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
  }, [navigate]);
// useEffect(() => {
//   axios.get("http://localhost:1337/api/services",).then(() => {});
  

// }, []);
  useEffect(() => {
    axios.get("http://localhost:1337/api/services").then(() => {});
  }, []);

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


  const handleNextClick = async () => {
    const dataToStore = {
      cost,
      Suppressionnumérique,
      ImpressionFormlabs,
      smileDesign,
      // comment,
    };

    const res = await axios.post(
      "http://localhost:1337/api/guide-classiques",
      {
        data: {
          service: 2,
          comment,
          patient:patientData.fullname,
          numero_cas:patientData.caseNumber,
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
            //     Impression_Formlabs: [
            //       {
            //             title: "Impression Formlabs",
            //             active: ImpressionFormlabs,
            //             number:additionalGuidesImpressionn,
            //           }],
          ],
          Clavettes_de_stabilisation: [
            {
              title: "Clavettes de stabilisation",
              // active:showAdditionalGuidesInput, to doo a wassimos type of eror  = [object] never show the input
              nombre_des_clavettes: additionalGuidesClavettess,
            },
          ],
          cout: [
            {
              cout: cost,
            },
          ],
          marque_implant_pour_la_dent:{" index" : implantBrandValue,},
          submit: true,
          archive:false,
        },
      }
      // {
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization:
      //       "Bearer " +
      //       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzExMzIwNjU0LCJleHAiOjE3MTM5MTI2NTR9.3lmhTvg2sW893Hyz3y3MscmQDCt23a1QqdyHq1jmYto",
      //   },
      // }
    );

    if (res.status === 200) {
      navigate("/selectedItemsPage", {
        state: { selectedItemsData: dataToStore },
      });
    } else {
      alert(res.status);
    }
  };
  useEffect(() => {
    axios.get("http://localhost:1337/api/services").then(() => {});
  }, []);

  const handleNextClickArchive = async () => {
    const dataToStore = {
      cost,
      Suppressionnumérique,
      ImpressionFormlabs,
      smileDesign,
      // comment,
    };

    const res = await axios.post(
      "http://localhost:1337/api/guide-classiques",
      {
        data: {
          service: 2,
          comment,
          patient:patientData.fullname,
          numero_cas:patientData.caseNumber,
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
            //     Impression_Formlabs: [
            //       {
            //             title: "Impression Formlabs",
            //             active: ImpressionFormlabs,
            //             number:additionalGuidesImpressionn,
            //           }],
          ],
          Clavettes_de_stabilisation: [
            {
              title: "Clavettes de stabilisation",
              // active:showAdditionalGuidesInput, to doo a wassimos type of eror  = [object] never show the input
              nombre_des_clavettes: additionalGuidesClavettess,
            },
          ],
          cout: [
            {
              cout: cost,
            },
          ],
          marque_implant_pour_la_dent:{" index" : implantBrandValue,},
          submit: false,
          archive:true,
        },
      }
      // {
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization:
      //       "Bearer " +
      //       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzExMzIwNjU0LCJleHAiOjE3MTM5MTI2NTR9.3lmhTvg2sW893Hyz3y3MscmQDCt23a1QqdyHq1jmYto",
      //   },
      // }
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
              <div className="flex-col">
              <p className="text-lg font-semibold">Patient: {patientData.fullname}</p>
                <p>
                {language === "french" ? "Numéro du cas:" : "Case number:" }{patientData.caseNumber}
                </p>
                <p>
                  {language === "french"
                    ? "Offre actuelle:"
                    : "Current offer: "}
                </p>
                <p className="flex">
                  {language === "french" ? "Coût" : "Cost"} :{" "}
                  {selectedItemsData.cost} €
                </p>
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
                        {/* <Input
                        type="text"
                        placeholder="Ex: IDI, Nobel, Straumann ..."
                        className="w-2/5"
                        value=
                        readOnly
                      /> */}
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
                    <Switch checked={previousStates.third} />
                  </p>
                </div>
                {previousStates.third && (
                  <Input
                    value={additionalGuidesImpression}
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
                <Button className={`w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2 bg-[#fffa1b] text-[#0e0004] hover:bg-[#fffb1bb5] hover:text-[#0e0004] transition-all`}>
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
                      <Button className={`w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2 bg-[#0e0004] text-[#fffa1b] hover:bg-[#211f20] hover:text-[#fffa1b] transition-all`}>
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
  );
};

export default SelectedItemsPageGclassique;
