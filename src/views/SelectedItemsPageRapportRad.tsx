import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import SideBarContainer from "@/components/SideBarContainer";
import Container from "@/components/Container";
import { useLanguage } from "@/components/languageContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
import { loadStripe } from "@stripe/stripe-js";

const SelectedItemsPageRapportRad = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const selectedItemsData = location.state.selectedItemsData;
  const previousState = location.state.previousState;
  const comment = location.state.selectedItemsData.comment1 || "";
  const secondComment = location.state.selectedItemsData.comment2 || "";
  const date = location.state.selectedItemsData.date;
  const isBoxCheckedImplantation = location.state.isBoxCheckedImplantation;
  const isBoxCheckeEvaluerImplant = location.state.isBoxCheckeEvaluerImplant;
  const isBoxCheckedEvaluationATM = location.state.isBoxCheckedEvaluationATM;
  const isBoxCheckedEliminerPathologie =
    location.state.isBoxCheckedEliminerPathologie;
  const isBoxCheckedAutre = location.state.isBoxCheckedAutre;
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
    const fetchPatientData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:1337/api/patients?sort=id:desc&pagination[limit]=1"
        );
        // Assuming the first patient is the one you want
        const patient = response.data.data[0].attributes;
        setPatientData({
          fullname: patient.fullname,
          caseNumber: patient.caseNumber,
        });
      } catch (error) {
        console.error("Error fetching patient data:", error);
      }
    };

    fetchPatientData();
  }, []);
  useEffect(() => {
    axios.get("http://localhost:1337/api/services").then(() => {});
  }, []);

  const handleNextClick = async () => {
    // Check if the comment field is filled

    const dataToStore = {
      comment,
      secondComment,

      // comment,
    };

    const res = await axios.post(
      "http://localhost:1337/api/rapport-radiologiques",

      {
        data: {
          service: 6,

          first_comment: comment,
          date: date,
          second_comment: secondComment,
          Implantation_prevue: isBoxCheckedImplantation,
          Evaluer_implant_existant: isBoxCheckeEvaluerImplant,
          Evaluation_de_ATM: isBoxCheckedEvaluationATM,
          Eliminer_une_pathologie: isBoxCheckedEliminerPathologie,
          autres: isBoxCheckedAutre,
          submit: true,
          archive: false,
          patient: patientData.fullname,
          numero_cas: patientData.caseNumber,
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
  const handleNextClickArchive = async () => {
    // Check if the comment field is filled

    const dataToStore = {
      comment,
      secondComment,

      // comment,
    };

    const res = await axios.post(
      "http://localhost:1337/api/rapport-radiologiques",

      {
        data: {
          service: 6,

          first_comment: comment,
          date: date,
          second_comment: secondComment,
          Implantation_prevue: isBoxCheckedImplantation,
          Evaluer_implant_existant: isBoxCheckeEvaluerImplant,
          Evaluation_de_ATM: isBoxCheckedEvaluationATM,
          Eliminer_une_pathologie: isBoxCheckedEliminerPathologie,
          autres: isBoxCheckedAutre,
          submit: true,
          archive: false,
          patient: patientData.fullname,
          numero_cas: patientData.caseNumber,
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
    <div>
      <SideBarContainer>
        <Container>
          <div className="p-2">
            <Card className="h-auto p-3 font-SF-Pro-Display">
              <div>
                <div className="flex items-center justify-center">
                  <h1 className="font-lato text-5xl ">
                    {language === "french"
                      ? "Rapport radiologique"
                      : "Radiological report"}
                  </h1>
                </div>
                <div className="flex-col">
                  <p className="text-lg font-semibold">
                    Patient: {patientData.fullname}
                  </p>
                  <p>
                    {language === "french" ? "Numéro du cas:" : "Case number:"}
                    {patientData.caseNumber}
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
                <p className="text-lg font-semibold">
                  {language === "french"
                    ? "Antécédents médicaux du patient:"
                    : "Patient's medical history:"}{" "}
                </p>
                <p>{selectedItemsData.comment1}</p>
                <p>date: {selectedItemsData.date}</p>

                <p className="text-lg font-semibold">
                  {language === "french"
                    ? "Indication de l'examen radiologique tridimensionnel"
                    : "Indication of the three-dimensional radiological examination"}
                </p>

                <div className="flex-col">
                  <div className="items-center flex space-x-2">
                    <p>
                      {language === "french"
                        ? "Implantation prévue"
                        : "Planned implantation"}
                    </p>

                    <Checkbox checked={previousState.implantationPrevue} />

                    <Label>{language === "french" ? "Oui" : "Yes"}</Label>
                    <Checkbox
                      checked={previousState.implantationPrevueInverse}
                    />
                    <Label>{language === "french" ? "Non" : "No"}</Label>
                  </div>
                  <div className="items-center flex space-x-2">
                    <p>
                      {language === "french"
                        ? "Évaluer l'implant existant"
                        : "Evaluate existing implant"}
                    </p>

                    <Checkbox checked={previousState.evaluerImplantExistant} />

                    <Label>{language === "french" ? "Oui" : "Yes"}</Label>
                    <Checkbox
                      checked={previousState.evaluerImplantExistantInverse}
                    />
                    <Label>{language === "french" ? "Non" : "No"}</Label>
                  </div>
                  <div className="items-center flex space-x-2">
                    <p>
                      {language === "french"
                        ? "Évaluer l'ATM existante"
                        : "Evaluation of TMJ"}
                    </p>

                    <Checkbox checked={previousState.evaluationATM} />

                    <Label>{language === "french" ? "Oui" : "Yes"}</Label>

                    <Checkbox checked={previousState.evaluationATMInverse} />

                    <Label>{language === "french" ? "Non" : "No"}</Label>
                  </div>
                  <div className="items-center flex space-x-2">
                    <p>
                      {language === "french"
                        ? "Eliminer une pathologie"
                        : "Eliminate a pathology"}
                    </p>

                    <Checkbox checked={previousState.eliminerPathologie} />

                    <Label>{language === "french" ? "Oui" : "Yes"}</Label>

                    <Checkbox
                      checked={previousState.eliminerPathologieInverse}
                    />

                    <Label>{language === "french" ? "Non" : "No"}</Label>
                  </div>

                  <div className="items-center flex space-x-2">
                    <p>{language === "french" ? "Autre" : " Other "}</p>

                    <Checkbox checked={previousState.autre} />

                    <Label>{language === "french" ? "Oui" : "Yes"}</Label>

                    <Checkbox checked={previousState.autreInverse} />

                    <Label>{language === "french" ? "Non" : "No"}</Label>
                  </div>
                </div>

                <p className="text-lg font-semibold">
                  {language === "french" ? "Commentaires:" : "Comments:"}{" "}
                </p>
                <p>{selectedItemsData.comment2}</p>
                <Input
                  value={selectedItemsData.comment2}
                  readOnly
                  className="w-2/5"
                />
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
                <div className="flex">
                  <p className="mr-2">
                    {language === "french"
                      ? "En cliquant sur le bouton Soumettre ci-dessous, vous acceptez la clause de non-responsabilité "
                      : "By clicking the Submit button below, you agree to the disclaimer "}
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <a className="text-[#828019] underline hover-button">
                        {language === "french"
                          ? "énoncée ici."
                          : "stated here."}
                      </a>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {language === "french"
                            ? "Clause de non-responsabilité!"
                            : "Disclaimer!"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {language === "french"
                            ? " cela archivera le cas."
                            : "3D Guide Dental makes no warranty as to the sufficiency or relevance of its radiological interpretation services and does not guarantee their accuracy or completeness. The results must be verified by a clinical physician to ensure their accuracy before any use or comparison with the medical images provided to the company. Under no circumstances shall 3D Guide Dental be held liable to anyone for any actions taken in connection with the use of its radiological interpretation services."}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogAction>
                          {language === "french" ? "D'accord" : "Okay"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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

export default SelectedItemsPageRapportRad;
