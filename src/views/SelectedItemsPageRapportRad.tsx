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
import { useAuthContext } from "@/components/AuthContext";
import { getToken } from "@/components/Helpers";

const SelectedItemsPageRapportRad = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const [currentOffer, setCurrentOffer] = useState(null);
  const { user } = useAuthContext();
  const originalCost = location.state?.selectedItemsData?.originalCost || 0;
  const cost = location.state?.selectedItemsData?.cost || 0;
  const selectedItemsData = location.state?.selectedItemsData;
  const previousState = location.state?.previousState;
  const comment = location.state?.selectedItemsData.comment1 || "";
  const secondComment = location.state?.selectedItemsData.comment2 || "";
  const date = location.state?.selectedItemsData.date;
  const isBoxCheckedImplantation = location.state?.isBoxCheckedImplantation;
  const isBoxCheckeEvaluerImplant = location.state?.isBoxCheckeEvaluerImplant;
  const isBoxCheckedEvaluationATM = location.state?.isBoxCheckedEvaluationATM;
  const isBoxCheckedEliminerPathologie =
    location.state?.isBoxCheckedEliminerPathologie;
  const isBoxCheckedAutre = location.state?.isBoxCheckedAutre;
  const [patientData, setPatientData] = useState({
    fullname: "",
    caseNumber: "",
  });
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
