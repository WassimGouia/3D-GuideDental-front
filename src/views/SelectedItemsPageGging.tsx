import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SideBarContainer from "@/components/SideBarContainer";
import Container from "@/components/Container";
import { useLanguage } from "@/components/languageContext";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
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
  FileDigit,
  UsersRound,
  Package,
  FolderUp,
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

const SelectedItemsPageGging = () => {
  const MAX_FILE_SIZE = 400 * 1024 * 1024; // 400MB in bytes
  const ALLOWED_FILE_TYPES = [".zip", ".rar", ".7z", ".tar"];
  const apiUrl = import.meta.env.VITE_BACKEND_API_ENDPOINT;
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState("");

  const originalCost = location.state?.selectedItemsData.originalCost || 0;
  const selectedItemsData = location.state?.selectedItemsData;
  const previousStates = location.state?.previousStates;
  const selectedTeethData = previousStates?.selectedTeeth || [];
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
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  const formSchema = z.object({
    file: z
      .instanceof(File)
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

  const submitData = async (fileId, isArchive = false) => {
    try {
      const checkRes = await axios.post(
        `${apiUrl}/checkCaseNumber`,
        { caseNumber: patientData.caseNumber },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );

      if (checkRes.data.exists) {
        alert(
          language === "french"
            ? "Le numéro de cas existe déjà"
            : "Case number already exists"
        );
        return;
      }

      const guideData = {
        service: 3,
        comment: selectedItemsData.comment,
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
                title: "Formlabs® impression",
                active: ImpressionFormlabs,
                Guide_supplementaire: additionalGuidess,
              },
            ],
            Suppression_numerique: [
              {
                title: "Digital extraction of teeth",
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
        selected_teeth: selectedTeethData,
        archive: true,
        En_attente_approbation: false,
        soumis: false,
        en__cours_de_modification: false,
        approuve: false,
        produire_expide: false,
        user: user.id,
        offre: currentOffer?.currentPlan,
        originalCost: originalCost,
        User_Upload: fileId,
      };

      const res = await axios.post(
        `${apiUrl}/guide-pour-gingivectomies`,
        { data: guideData },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );

      console.log("Data submission response:", res.data);

      if (res.status === 200) {
        if (isArchive) {
          localStorage.clear();
          navigate("/mes-fichiers");
        } else {
          await handlePayment(res.data.data.id);
        }
      } else {
        throw new Error(`Unexpected response status: ${res.status}`);
      }
    } catch (err) {
      console.error(
        "Data submission error:",
        err.response ? err.response.data : err
      );
      throw err;
    }
  };

  const handleArchiveClick = async () => {
    const isValid = await form.trigger();
    const file = form.getValues().file;
    if (isValid && file) {
      setShowArchiveDialog(true);
    } else {
      if (!file) {
        form.setError("file", {
          type: "manual",
          message:
            language === "french"
              ? "Veuillez sélectionner un fichier"
              : "Please select a file",
        });
      }
    }
  };

  const handleSubmitClick = async () => {
    const isValid = await form.trigger();
    const file = form.getValues().file;
    if (isValid && file) {
      setShowSubmitDialog(true);
    } else {
      if (!file) {
        form.setError("file", {
          type: "manual",
          message:
            language === "french"
              ? "Veuillez sélectionner un fichier"
              : "Please select a file",
        });
      }
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
  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_API);

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("files", file);

    const token = getToken();
    console.log("Token:", token);
    console.log("File size:", file.size);

    const startTime = Date.now();

    try {
      const uploadResponse = await axios.post(`${apiUrl}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(percentCompleted);
          console.log(`Upload progress: ${percentCompleted}%`);
          console.log(
            `Loaded: ${progressEvent.loaded}, Total: ${progressEvent.total}`
          );
        },
      });

      const endTime = Date.now();
      console.log(`Upload took ${endTime - startTime} ms`);
      console.log("Upload response:", uploadResponse);

      // Artificial delay to simulate server processing time
      await new Promise((resolve) => setTimeout(resolve, 2000));

      return uploadResponse.data[0].id;
    } catch (error) {
      console.error(
        "File upload error:",
        error.response ? error.response.data : error
      );
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const file = form.getValues("file");
    if (file) {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadMessage(
        language === "french"
          ? "Le téléchargement peut prendre quelques minutes. Merci de patienter..."
          : "The upload may take a few minutes. Please be patient..."
      );

      try {
        console.log("Starting file upload...");
        const fileId = await uploadFile(file);
        console.log("File upload completed, ID:", fileId);

        setUploadMessage(
          language === "french"
            ? "Traitement des données..."
            : "Processing data..."
        );

        await submitData(fileId, false);
        console.log("Data submission completed");

        setUploadProgress(100);
        setUploadMessage(
          language === "french"
            ? "Téléchargement et soumission réussis!"
            : "Upload and submission successful!"
        );

        alert(
          language === "french"
            ? "Fichier téléchargé et données soumises avec succès"
            : "File uploaded and data submitted successfully"
        );
      } catch (err) {
        console.error("Error in upload and submit process:", err);
        setUploadMessage(
          language === "french"
            ? "Une erreur s'est produite. Veuillez réessayer."
            : "An error occurred. Please try again."
        );
      } finally {
        setIsUploading(false);
      }
    } else {
      form.setError("file", {
        type: "manual",
        message:
          language === "french"
            ? "Veuillez sélectionner un fichier"
            : "Please select a file",
      });
    }
  };

  const handleNextClickArchive = async (e) => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const file = form.getValues("file");
    if (file) {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadMessage(
        language === "french"
          ? "Le téléchargement peut prendre quelques minutes. Merci de patienter..."
          : "The upload may take a few minutes. Please be patient..."
      );

      try {
        console.log("Starting file upload...");
        const fileId = await uploadFile(file);
        console.log("File upload completed, ID:", fileId);

        setUploadMessage(
          language === "french"
            ? "Traitement des données..."
            : "Processing data..."
        );

        await submitData(fileId, true);
        console.log("Data submission completed");

        setUploadProgress(100);
        setUploadMessage(
          language === "french"
            ? "Téléchargement et archivage réussis!"
            : "Upload and archiving successful!"
        );

        alert(
          language === "french"
            ? "Fichier téléchargé et données archivées avec succès"
            : "File uploaded and data archived successfully"
        );
      } catch (err) {
        console.error("Error in upload and archive process:", err);
        setUploadMessage(
          language === "french"
            ? "Une erreur s'est produite. Veuillez réessayer."
            : "An error occurred. Please try again."
        );
      } finally {
        setIsUploading(false);
      }
    } else {
      form.setError("file", {
        type: "manual",
        message:
          language === "french"
            ? "Veuillez sélectionner un fichier"
            : "Please select a file",
      });
    }
  };

  const handlePayment = async (guideId) => {
    const stripe = await stripePromise;
    const requestData = {
      cost: costt,
      service: 3,
      patient: patientData.fullname,
      email: user.email,
      guideId: guideId,
    };

    try {
      const response = await axios.post(`${apiUrl}/commandes`, requestData, {
        headers: {
          Authorization: `Bearer ${getToken()}`, // Include the user's token for authentication
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

  const handlePreviousClick = () => {
    navigate("/guide-gingivectomie", { state: { fromSelectedItems: true } });
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
                  ? "Guide pour gingivectomie"
                  : "Gingivectomy Guide"}
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
                <h3 className="text-xl font-semibold mb-4">
                  {language === "french"
                    ? "Options sélectionnées"
                    : "Selected Options"}
                </h3>

                <div className="mb-6">
                  <h4 className="font-semibold mb-2">
                    {language === "french"
                      ? "Dents sélectionnées:"
                      : "Selected Teeth:"}
                  </h4>
                  <div className="flex justify-center">
                    <Dents
                      selectAll={false}
                      selectedTeethData={selectedTeethData}
                      isReadOnly={true}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <p>{language === "french" ? "avec DICOM" : "with DICOM"}</p>
                  <Switch checked={previousStates?.first} />
                </div>

                <div className="flex items-center justify-between mb-4">
                  <p>
                    {language === "french" ? "Smile Design" : "Smile Design"}
                  </p>
                  <Switch checked={previousStates?.second} />
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <p>
                      {language === "french"
                        ? "Suppression numérique de dents"
                        : "Digital extraction of teeth"}
                    </p>
                    <Switch checked={previousStates?.third} />
                  </div>
                  {previousStates?.third && (
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

                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <p>
                      {language === "french"
                        ? "Impression Formlabs®"
                        : "Formlabs® impression"}
                    </p>
                    <Switch checked={previousStates?.fourth} />
                  </div>
                  {previousStates?.fourth && (
                    <Input
                      value={selectedItemsData.additionalGuides}
                      readOnly
                      className="w-full mt-2"
                    />
                  )}
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold mb-2">
                    {language === "french" ? "Commentaire" : "Comment"}
                  </h4>
                  <Input
                    value={selectedItemsData ? selectedItemsData.comment : ""}
                    readOnly
                    className="w-full"
                  />
                </div>

                <Form {...form}>
                  <form onSubmit={(e) => e.preventDefault()}>
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
                                    if (file.size > MAX_FILE_SIZE) {
                                      form.setError("file", {
                                        type: "manual",
                                        message:
                                          language === "french"
                                            ? "La taille du fichier ne doit pas dépasser 400 Mo"
                                            : "File size should not exceed 400MB",
                                      });
                                    } else if (
                                      !ALLOWED_FILE_TYPES.includes(
                                        `.${file.name
                                          .split(".")
                                          .pop()
                                          .toLowerCase()}`
                                      )
                                    ) {
                                      form.setError("file", {
                                        type: "manual",
                                        message:
                                          language === "french"
                                            ? `Veuillez sélectionner un fichier ${ALLOWED_FILE_TYPES.join(
                                                ", "
                                              )}`
                                            : `Please select a ${ALLOWED_FILE_TYPES.join(
                                                ", "
                                              )} file`,
                                      });
                                    } else {
                                      form.clearErrors("file");
                                      field.onChange(file);
                                    }
                                    ("");
                                  } else {
                                    field.onChange(undefined);
                                    form.setError("file", {
                                      type: "manual",
                                      message:
                                        language === "french"
                                          ? "Veuillez sélectionner un fichier"
                                          : "Please select a file",
                                    });
                                  }
                                }}
                                className={`flex-grow ${
                                  form.formState.errors.file
                                    ? "border-red-500"
                                    : ""
                                }`}
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
                          {isUploading && (
                            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                              <p className="text-sm text-red-500  text-center font-medium mb-2">
                                {uploadMessage}
                              </p>
                            </div>
                          )}
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

                      <div className="flex space-x-3">
                        <Button
                          type="button"
                          onClick={handleArchiveClick}
                          disabled={isUploading}
                          className={`w-32 h-auto flex items-center justify-center gap-3 rounded-lg px-3 py-2 ${
                            isUploading ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          {isUploading ? (
                            <Loader className="h-4 w-4 animate-spin" />
                          ) : language === "french" ? (
                            "Archiver"
                          ) : (
                            "Archive"
                          )}
                        </Button>

                        <Button
                          type="button"
                          onClick={handleSubmitClick}
                          disabled={isUploading}
                          className={`w-32 h-auto flex items-center justify-center gap-3 rounded-lg px-3 py-2 bg-[#0e0004] text-[#fffa1b] hover:bg-[#211f20] hover:text-[#fffa1b] transition-all ${
                            isUploading ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          {isUploading ? (
                            <Loader className="h-4 w-4 animate-spin" />
                          ) : language === "french" ? (
                            "Soumettre"
                          ) : (
                            "Submit"
                          )}
                        </Button>

                        <AlertDialog
                          open={showArchiveDialog}
                          onOpenChange={setShowArchiveDialog}
                        >
                          <AlertDialogTrigger asChild></AlertDialogTrigger>
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
                              <AlertDialogAction
                                onClick={() => {
                                  form.handleSubmit(handleNextClickArchive)();
                                  setShowArchiveDialog(false);
                                }}
                              >
                                {language === "french"
                                  ? "Continuer"
                                  : "Continue"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog
                          open={showSubmitDialog}
                          onOpenChange={setShowSubmitDialog}
                        >
                          <AlertDialogTrigger asChild></AlertDialogTrigger>
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
                              <AlertDialogAction
                                onClick={() => {
                                  form.handleSubmit(handleSubmit)();
                                  setShowSubmitDialog(false);
                                }}
                              >
                                {language === "french"
                                  ? "Continuer"
                                  : "Continue"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </form>
                </Form>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </SideBarContainer>
  );
};

export default SelectedItemsPageGging;
