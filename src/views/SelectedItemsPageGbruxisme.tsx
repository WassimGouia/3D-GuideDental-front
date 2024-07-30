import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Percent,
  Archive,
  FileDigit,
  FolderUp,
  UsersRound,
  Package,
  Info,
} from "lucide-react";
import Nouvelle from "@/components/Nouvelledemande";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

const SelectedItemsPageGbruxisme = () => {
  const MAX_FILE_SIZE = 400 * 1024 * 1024; // 400MB in bytes
  const ALLOWED_FILE_TYPES = [".zip", ".rar", ".7z", ".tar"];
  const apiUrl = import.meta.env.VITE_BACKEND_API_ENDPOINT;
  const location = useLocation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  const { selectedTeeth } = location.state.previousState;
  const selectedItemsData = location.state?.selectedItemsData;
  const previousStates = location.state.previousState;
  const comment = selectedItemsData.comment;
  const cost = selectedItemsData.cost;
  const first = previousStates.first;
  const second = previousStates.second;
  const additionalGuidess = selectedItemsData.additionalGuides;
  const textareaValu = selectedItemsData.textareaValue;
  const originalCost = location.state.selectedItemsData.originalCost;

  const [patientData, setPatientData] = useState({
    fullname: "",
    caseNumber: "",
  });
  const [currentOffer, setCurrentOffer] = useState(null);

  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_API);

  const formSchema = z.object({
    file: z
      .any()
      .refine((file) => file instanceof File, {
        message:
          language === "french"
            ? "Veuillez sélectionner un fichier"
            : "Please select a file",
      })
      .refine((file) => file.size <= MAX_FILE_SIZE, {
        message:
          language === "french"
            ? "La taille du fichier ne doit pas dépasser 400 Mo"
            : "File size should not exceed 400MB",
      })
      .refine(
        (file) =>
          ALLOWED_FILE_TYPES.includes(
            `.${file.name.split(".").pop().toLowerCase()}`
          ),
        language === "french"
          ? `Veuillez sélectionner un fichier ${ALLOWED_FILE_TYPES.join(", ")}`
          : `Please select a ${ALLOWED_FILE_TYPES.join(", ")} file`
      ),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: null,
    },
  });

  const handleArchiveClick = async (e) => {
    e.preventDefault();
    const isValid = await form.trigger();
    if (isValid) {
      setShowArchiveDialog(true);
    }
  };

  const handleSubmitClick = async (e) => {
    e.preventDefault();
    const isValid = await form.trigger();
    if (isValid) {
      setShowSubmitDialog(true);
    }
  };

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
              `${apiUrl}/users/${user.id}?populate=offre`,
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
    const isValid = await form.trigger();
    if (!isValid) {
      return;
    }

    if (textareaValu === "" && previousStates.first) {
      return;
    }

    const formData = new FormData();

    const guideData = {
      service: 4,
      comment,
      patient: patientData.fullname,
      numero_cas: patientData.caseNumber,
      cout: cost,
      selected_teeth: selectedTeeth,
      options_generiques: [
        {
          title: "les options generiques",
          Impression_Formlabs: [
            {
              title: "Formlabs® impression",
              active: second,
              Guide_supplementaire: additionalGuidess,
            },
          ],
          Suppression_numerique_de_dents: [
            {
              title: "Digital extraction of teeth",
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
      offre: currentOffer?.currentPlan,
      originalCost: originalCost,
    };

    formData.append("data", JSON.stringify(guideData));

    const file = form.getValues("file");
    if (file) {
      formData.append("files.User_Upload", file, file.name);
    }
    try {
      const checkRes = await axios.post(
        `${apiUrl}/checkCaseNumber`,
        { caseNumber: patientData.caseNumber },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (checkRes.data.exists) {
        alert("Case number already exists");
        return;
      }

      const res = await axios.post(
        `${apiUrl}/gouttiere-de-bruxismes`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const requestData = {
        cost: cost,
        service: 4,
        patient: patientData.fullname,
        email: user.email,
        guideId: res.data.data.id,
      };

      const stripe = await stripePromise;
      const response = await axios.post(`${apiUrl}/commandes`, requestData, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
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

  const handleNextClickArchive = async (data) => {
    const isValid = await form.trigger();
    if (!isValid) {
      return;
    }

    const formData = new FormData();

    const guideData = {
      service: 4,
      comment,
      patient: patientData.fullname,
      numero_cas: patientData.caseNumber,
      cout: cost,
      selected_teeth: selectedTeeth,
      options_generiques: [
        {
          title: "les options generiques",
          Impression_Formlabs: [
            {
              title: "Formlabs® impression",
              active: second,
              Guide_supplementaire: additionalGuidess,
            },
          ],
          Suppression_numerique_de_dents: [
            {
              title: "Digital extraction of teeth",
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
      offre: currentOffer?.currentPlan,
      originalCost: originalCost,
    };

    formData.append("data", JSON.stringify(guideData));

    const file = form.getValues("file");
    if (file) {
      formData.append("files.User_Upload", file, file.name);
    }

    try {
      const checkRes = await axios.post(
        `${apiUrl}/checkCaseNumber`,
        { caseNumber: patientData.caseNumber },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (checkRes.data.exists) {
        alert("Case number already exists");
        return;
      }

      const res = await axios.post(
        `${apiUrl}/gouttiere-de-bruxismes`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (res.status === 200) {
        localStorage.clear();
        navigate("/mes-fichiers");
      } else {
        alert(res.status);
      }
    } catch (err) {
      console.error(err);
      alert("Case already exists");
    }
  };

  const supportedCountries = [
    "france",
    "belgium",
    "portugal",
    "germany",
    "netherlands",
    "luxembourg",
    "italy",
    "spain",
  ];
  const country = user && user.location[0].country.toLowerCase();

  const handlePreviousClick = () => {
    navigate("/gouttiere-bruxismes", { state: { fromSelectedItems: true } });
  };

  return (
    <SideBarContainer>
      <Container>
        <Nouvelle />
        <br />
        <div className="p-4 max-w-6xl mx-auto">
          <Card className="w-full shadow-lg">
            <CardHeader className="bg-gray-100 py-6">
              <CardTitle className="text-3xl font-bold text-center text-gray-800">
                {language === "french"
                  ? "Gouttière de bruxisme"
                  : "Bruxism Splint"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="bg-gray-100 p-6 rounded-lg shadow-sm mb-8">
                <h2 className="text-2xl font-bold mb-4">
                  {language === "french" ? "Détails du cas" : "Case Details"}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <UsersRound className="text-yellow-600 w-6 h-6" />
                    <p className="text-lg">
                      <span className="font-semibold">
                        {language === "french" ? "Patient: " : "Patient: "}
                      </span>
                      {patientData.fullname}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FileDigit className="text-yellow-600 w-6 h-6" />
                    <p className="text-lg">
                      <span className="font-semibold">
                        {language === "french"
                          ? "Numéro du cas: "
                          : "Case number: "}
                      </span>
                      {patientData.caseNumber}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Package className="text-yellow-600 w-6 h-6" />
                    <p className="text-lg">
                      <span className="font-semibold">
                        {language === "french"
                          ? "Offre actuelle: "
                          : "Current offer: "}
                      </span>
                      {currentOffer ? currentOffer.currentPlan : "Loading..."}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Percent className="text-yellow-600 w-6 h-6" />
                    <p className="text-lg">
                      <span className="font-semibold">
                        {language === "french" ? "Réduction: " : "Discount: "}
                      </span>
                      {currentOffer
                        ? `${currentOffer.discount}%`
                        : "Loading..."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">
                    {language === "french"
                      ? "Dents sélectionnées"
                      : "Selected Teeth"}
                  </h3>
                  <div className="flex justify-center">
                    <Dents
                      selectAll={true}
                      selectedTeethData={selectedTeeth}
                      isReadOnly={true}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <p>
                      {language === "french"
                        ? "Suppression numérique de dents"
                        : "Digital extraction of teeth"}
                    </p>
                    <Switch checked={previousStates.first} />
                  </div>
                  {previousStates.first && (
                    <Input
                      style={{
                        border:
                          textareaValu === "pas de texte" || textareaValu === ""
                            ? "2px solid red"
                            : "none",
                      }}
                      value={textareaValu}
                      readOnly
                      className="w-full mt-2"
                    />
                  )}
                </div>

                {supportedCountries.includes(country) && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <p>
                        {language === "french"
                          ? "Impression Formlabs®"
                          : "Formlabs® impression"}
                      </p>
                      <Switch checked={previousStates.second} />
                    </div>
                    {previousStates.second && (
                      <Input
                        value={additionalGuidess}
                        readOnly
                        className="w-full mt-2"
                      />
                    )}
                  </div>
                )}

                <div className="mb-6">
                  <h4 className="font-semibold mb-2">
                    {language === "french" ? "Commentaire" : "Comment"}
                  </h4>
                  <Input
                    value={selectedItemsData.comment}
                    readOnly
                    className="w-full"
                  />
                </div>

                <Form {...form}>
                  <form className="space-y-6">
                    <FormField
                      control={form.control}
                      name="file"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {language === "french"
                              ? "Ajouter des fichiers:"
                              : "Add files:"}
                          </FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="file"
                                accept={ALLOWED_FILE_TYPES.join(",")}
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    field.onChange(file);
                                  } else {
                                    field.onChange(null);
                                  }
                                }}
                                className="flex-grow"
                              />
                              <FolderUp className="text-yellow-600 w-5 h-5" />
                              <HoverCard>
                                <HoverCardTrigger asChild>
                                  <Info className="h-4 w-4 cursor-pointer" />
                                </HoverCardTrigger>
                                <HoverCardContent className="w-80 bg-gray-200 bg-opacity-95 p-4 rounded-md shadow-lg">
                                  <p className="text-sm">
                                    {language === "french"
                                      ? "Merci de télécharger les fichiers ici. Veuillez regrouper vos fichiers dans un seul dossier compressé afin de ne pas dépasser la taille maximale de 400 Mo. L'application accepte uniquement les fichiers compressés."
                                      : "Please upload the files here. Remember to group your files into a single compressed folder to ensure the total size does not exceed 400 MB. The application only accepts compressed files."}
                                  </p>
                                </HoverCardContent>
                              </HoverCard>
                            </div>
                          </FormControl>
                          <FormDescription>
                            {language === "french"
                              ? `Formats acceptés : ${ALLOWED_FILE_TYPES.join(
                                  ", "
                                )}. Taille maximale : 400 Mo.`
                              : `Accepted formats: ${ALLOWED_FILE_TYPES.join(
                                  ", "
                                )}. Maximum size: 400MB.`}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-between items-center mt-8">
                      <Button
                        onClick={handlePreviousClick}
                        className="w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2 bg-[#fffa1b] text-[#0e0004] hover:bg-[#fffb1bb5] hover:text-[#0e0004] transition-all"
                      >
                        {language === "french" ? "Précédent" : "Previous"}
                      </Button>

                      <div className="flex space-x-4">
                        <Button
                          type="button"
                          onClick={handleArchiveClick}
                          className="w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2"
                        >
                          {language === "french" ? "Archiver" : "Archive"}
                        </Button>

                        <Button
                          type="button"
                          onClick={handleSubmitClick}
                          className="w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2 bg-[#0e0004] text-[#fffa1b] hover:bg-[#211f20] hover:text-[#fffa1b] transition-all"
                        >
                          {language === "french" ? "Soumettre" : "Submit"}
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </div>
            </CardContent>
          </Card>
        </div>

        <AlertDialog
          open={showArchiveDialog}
          onOpenChange={setShowArchiveDialog}
        >
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
              <AlertDialogCancel onClick={() => setShowArchiveDialog(false)}>
                {language === "french" ? "Annuler" : "Cancel"}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  form.handleSubmit(handleNextClickArchive)();
                  setShowArchiveDialog(false);
                }}
              >
                {language === "french" ? "Continuer" : "Continue"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
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
              <AlertDialogCancel onClick={() => setShowSubmitDialog(false)}>
                {language === "french" ? "Annuler" : "Cancel"}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  form.handleSubmit(handleNextClick)();
                  setShowSubmitDialog(false);
                }}
              >
                {language === "french" ? "Continuer" : "Continue"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Container>
    </SideBarContainer>
  );
};

export default SelectedItemsPageGbruxisme;
