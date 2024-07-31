import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Percent,
  Archive,
  FileDigit,
  FolderUp,
  UsersRound,
  Package,
  Info,
  Loader,
} from "lucide-react";
import Nouvelle from "@/components/Nouvelledemande";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";

const SelectedItemsPageRapportRad = () => {
  const MAX_FILE_SIZE = 400 * 1024 * 1024; // 400MB in bytes
  const ALLOWED_FILE_TYPES = [".zip", ".rar", ".7z", ".tar"];
  const apiUrl = import.meta.env.VITE_BACKEND_API_ENDPOINT;
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const [currentOffer, setCurrentOffer] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState(""); 
  const { user } = useAuthContext();
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const originalCost = location.state?.selectedItemsData?.originalCost || 0;
  const cost = location.state?.selectedItemsData?.cost || 0;
  const selectedItemsData = location.state?.selectedItemsData;
  const previousState = location.state?.previousState;
  const comment = location.state?.selectedItemsData.comment1 || "";
  const secondComment = location.state?.selectedItemsData.comment2 || "";
  // const date = location.state?.selectedItemsData?.date;
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
  const checkboxGroup = location.state?.checkboxGroup || {};
  const autreInput = location.state?.autreInput || "";

  const renderCheckboxValue = (value) => {
    return value === "oui" ? (
      <Checkbox checked={true} />
    ) : (
      <Checkbox checked={false} />
    );
  };

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

  const handleArchiveClick = async (e) => {
    e.preventDefault();
    const isValid = await form.trigger();
    if (!form.getValues().file) {
      form.setError("file", {
        type: "manual",
        message:
          language === "french"
            ? "Veuillez sélectionner un fichier"
            : "Please select a file",
      });
    }
    if (isValid && form.getValues().file) {
      setShowArchiveDialog(true);
    }
  };

  const handleSubmitClick = async (e) => {
    e.preventDefault();
    const isValid = await form.trigger();
    if (!form.getValues().file) {
      form.setError("file", {
        type: "manual",
        message:
          language === "french"
            ? "Veuillez sélectionner un fichier"
            : "Please select a file",
      });
    }
    if (isValid && form.getValues().file) {
      setShowSubmitDialog(true);
    }
  };

  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_API);
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
    if (!isValid) return;

    const file = form.getValues().file;
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

        const reportData = {
          service: 6,
          first_comment: comment,
          date: selectedItemsData?.date,
          second_comment: secondComment,
          Implantation_prevue: checkboxGroup.implantationPrevue === "oui",
          Evaluer_implant_existant:
            checkboxGroup.evaluerImplantExistant === "oui",
          Evaluation_de_ATM: checkboxGroup.evaluationATM === "oui",
          Eliminer_une_pathologie: checkboxGroup.eliminerPathologie === "oui",
          autres: checkboxGroup.autre === "oui",
          patient: patientData.fullname,
          numero_cas: patientData.caseNumber,
          soumis: false,
          archive: true,
          user: user.id,
          originalCost: originalCost,
          cout: cost,
          other_description: autreInput,
          User_Upload: fileId,
        };

        const response = await axios.post(
          `${apiUrl}/rapport-radiologiques`,
          { data: reportData },
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );

        console.log("Report submitted successfully:", response.data);

        setUploadProgress(100);
        setUploadMessage(
          language === "french"
            ? "Téléchargement et soumission réussis!"
            : "Upload and submission successful!"
        );

        // Proceed with payment
        const requestData = {
          cost: cost,
          service: 6,
          patient: patientData.fullname,
          email: user.email,
          guideId: response.data.data.id,
        };

        const stripe = await stripePromise;
        const paymentResponse = await axios.post(
          `${apiUrl}/commandes`,
          requestData,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );
        const { error } = await stripe.redirectToCheckout({
          sessionId: paymentResponse.data.stripeSession.id,
        });
        if (error) {
          console.error("Stripe checkout error:", error);
        }
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

  const handleNextClickArchive = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const file = form.getValues().file;
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

        const reportData = {
          service: 6,
          first_comment: comment,
          date: selectedItemsData?.date,
          second_comment: secondComment,
          Implantation_prevue: checkboxGroup.implantationPrevue === "oui",
          Evaluer_implant_existant:
            checkboxGroup.evaluerImplantExistant === "oui",
          Evaluation_de_ATM: checkboxGroup.evaluationATM === "oui",
          Eliminer_une_pathologie: checkboxGroup.eliminerPathologie === "oui",
          autres: checkboxGroup.autre === "oui",
          patient: patientData.fullname,
          numero_cas: patientData.caseNumber,
          soumis: false,
          archive: true,
          user: user.id,
          originalCost: originalCost,
          cout: cost,
          other_description: autreInput,
          User_Upload: fileId,
        };

        const response = await axios.post(
          `${apiUrl}/rapport-radiologiques`,
          { data: reportData },
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );

        console.log("Report archived successfully:", response.data);

        setUploadProgress(100);
        setUploadMessage(
          language === "french"
            ? "Téléchargement et archivage réussis!"
            : "Upload and archiving successful!"
        );

        localStorage.clear();
        navigate("/mes-fichiers");
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

  const handlePreviousClick = () => {
    const currentState = {
      ...location.state,
      selectedItemsData: {
        ...location.state.selectedItemsData,
        date: selectedItemsData?.date
          ? new Date(selectedItemsData.date).toISOString()
          : null,
      },
    };
    navigate("/rapport-radiologique", { state: currentState });
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
                  ? "Rapport radiologique"
                  : "Radiological Report"}
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
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {language === "french"
                      ? "Antécédents médicaux du patient:"
                      : "Patient's medical history:"}
                  </h3>
                  <p className="bg-gray-50 p-3 rounded">
                    {selectedItemsData.comment1}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {language === "french"
                      ? "Date de l'examen:"
                      : "Examination Date:"}
                  </h3>
                  <p className="bg-gray-50 p-3 rounded">
                    {selectedItemsData?.date || "No date selected"}
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    {language === "french"
                      ? "Indication de l'examen radiologique tridimensionnel"
                      : "Indication of the three-dimensional radiological examination"}
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        label:
                          language === "french"
                            ? "Implantation prévue"
                            : "Planned implantation",
                        value: checkboxGroup.implantationPrevue,
                      },
                      {
                        label:
                          language === "french"
                            ? "Évaluer l'implant existant"
                            : "Evaluate existing implant",
                        value: checkboxGroup.evaluerImplantExistant,
                      },
                      {
                        label:
                          language === "french"
                            ? "Évaluer l'ATM existante"
                            : "Evaluation of TMJ",
                        value: checkboxGroup.evaluationATM,
                      },
                      {
                        label:
                          language === "french"
                            ? "Eliminer une pathologie"
                            : "Eliminate a pathology",
                        value: checkboxGroup.eliminerPathologie,
                      },
                      {
                        label: language === "french" ? "Autres" : "Others",
                        value: checkboxGroup.autre,
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded"
                      >
                        <span>{item.label}</span>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {renderCheckboxValue(item.value)}
                            <Label>
                              {language === "french" ? "Oui" : "Yes"}
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            {renderCheckboxValue(
                              item.value === "non" ? "oui" : "non"
                            )}
                            <Label>
                              {language === "french" ? "Non" : "No"}
                            </Label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {checkboxGroup.autre === "oui" && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">
                        {language === "french"
                          ? "Précisions pour 'Autre':"
                          : "Details for 'Other':"}
                      </h4>
                      <p className="bg-gray-50 p-3 rounded">{autreInput}</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {language === "french" ? "Commentaires:" : "Comments:"}
                  </h3>
                  <Input
                    value={selectedItemsData.comment2}
                    readOnly
                    className="w-full bg-gray-50"
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
                              <p className="text-sm text-red-500 text-center font-medium mb-2">
                                {uploadMessage}
                              </p>
                              <div className="flex space-x-2">
                              
                              <span className="-mt-2">{uploadProgress}%</span>
                              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                <div
                                  className="bg-red-600 h-2.5 rounded-full"
                                  style={{ width: `${uploadProgress}%` }}
                                ></div>
                              </div>
                              </div>
                            </div>
                          )}
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>

                <div className="flex items-center space-x-2 text-sm">
                  <p>
                    {language === "french"
                      ? "En cliquant sur le bouton Soumettre ci-dessous, vous acceptez la clause de non-responsabilité "
                      : "By clicking the Submit button below, you agree to the disclaimer "}
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <a className="text-blue-600 underline cursor-pointer">
                        {language === "french" ? "ici." : "stated here."}
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
                            ? "3D Guide Dental n'offre aucune garantie quant à la suffisance ou à la pertinence de ses services d'interprétation radiologique et ne garantit ni leur exactitude ni leur exhaustivité. Les résultats doivent impérativement être vérifiés par un médecin clinicien afin d'assurer leur précision avant toute utilisation ou comparaison avec les images médicales fournies à l'entreprise. En aucun cas, 3D Guide Dental ne saurait être tenu responsable envers quiconque pour des actions entreprises en relation avec l'utilisation de ses services d'interprétation radiologique."
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

                <div className="flex justify-between items-center mt-8">
                  <Button
                    onClick={handlePreviousClick}
                    className="w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2 bg-[#fffa1b] text-[#0e0004] hover:bg-[#fffb1bb5] hover:text-[#0e0004] transition-all"
                  >
                    {language === "french" ? "Précédent" : "Previous"}
                  </Button>

                  <div className="flex space-x-4">
                    <Button
                      onClick={handleArchiveClick}
                      disabled={isUploading}
                      className={`w-32 h-auto flex items-center justify-center gap-3 rounded-lg px-3 py-2 bg-[#0e0004] text-[#fffa1b] hover:bg-[#211f20] hover:text-[#fffa1b] transition-all ${
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
                  </div>
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
                      <AlertDialogCancel>
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

                <AlertDialog
                  open={showSubmitDialog}
                  onOpenChange={setShowSubmitDialog}
                >
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {language === "french"
                          ? "Êtes-vous sûr de vouloir soumettre ce cas ?"
                          : "Are you sure you want to submit this case?"}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {language === "french"
                          ? "Soumettez votre cas pour profiter d'une interprétation radiologique précise. Nos spécialistes en imagerie orale et maxillo-faciale vous fourniront un rapport détaillé couvrant votre domaine d'intérêt spécifique ainsi que toute pathologie identifiée."
                          : "Submit your case to benefit from precise radiological interpretation. Our specialists in oral and maxillofacial imaging will provide you with a detailed report covering your specific area of interest as well as any identified pathology."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>
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
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </SideBarContainer>
  );
};

export default SelectedItemsPageRapportRad;
