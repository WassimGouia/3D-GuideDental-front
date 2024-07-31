import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import SideBarContainer from "@/components/SideBarContainer";
import Container from "@/components/Container";
import { useLanguage } from "@/components/languageContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { useAuthContext } from "@/components/AuthContext";
import { getToken } from "@/components/Helpers";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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

const SelectedItemsPageAutreService = () => {
  const MAX_FILE_SIZE = 400 * 1024 * 1024; // 400MB in bytes
  const ALLOWED_FILE_TYPES = [".zip", ".rar", ".7z", ".tar"];
  const apiUrl = import.meta.env.VITE_BACKEND_API_ENDPOINT;
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const { user } = useAuthContext();
  const [patientData, setPatientData] = useState({
    fullname: "",
    caseNumber: "",
  });
  const [currentOffer, setCurrentOffer] = useState(null);
  const [selectedItemsData, setSelectedItemsData] = useState(null);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState("");

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

  useEffect(() => {
    const storedState = localStorage.getItem("autreServiceState");
    const storedFullname = localStorage.getItem("fullName");
    const storedCaseNumber = localStorage.getItem("caseNumber");

    if (location.state?.selectedItemsData) {
      setSelectedItemsData(location.state.selectedItemsData);
    } else if (storedState) {
      setSelectedItemsData(JSON.parse(storedState));
    }

    if (!storedFullname || !storedCaseNumber) {
      navigate("/sign/nouvelle-demande");
    } else {
      setPatientData({
        fullname: storedFullname,
        caseNumber: storedCaseNumber,
      });
      fetchOfferData();
    }
  }, [navigate, location.state]);

  const fetchOfferData = async () => {
    const token = getToken();
    if (token && user && user.id) {
      try {
        const userResponse = await axios.get(
          `${apiUrl}/users/${user.id}?populate=offre`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (userResponse.data && userResponse.data.offre) {
          const offerData = userResponse.data.offre;
          setCurrentOffer({
            currentPlan: offerData.CurrentPlan,
            discount: getDiscount(offerData.CurrentPlan),
          });
        }
      } catch (error) {
        console.error("Error fetching offer data:", error);
      }
    }
  };

  const getDiscount = (plan) => {
    const discounts = {
      Essential: 5,
      Privilege: 10,
      Elite: 15,
      Premium: 20,
    };
    return discounts[plan] || 0;
  };

  const handlePreviousClick = () => {
    navigate("/autre-services", { state: { formData: selectedItemsData } });
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

  const handleNextClick = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;


    const file = form.getValues().file;
    if (file) {
      setIsUploading(true);
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

        const guideData = {
            comment: selectedItemsData.comment,
            service_impression_et_expedition: selectedItemsData.implantationPrevue,
            patient: patientData.fullname,
            numero_cas: patientData.caseNumber,
            archive: false,
            En_attente_approbation: false,
            en__cours_de_modification: false,
            soumis: false,
            approuve: false,
            produire_expide: false,
            Demande_devis: true,
            user: user.id,
            service: 5,
            offre: currentOffer?.currentPlan,
            User_Upload: fileId,
        };

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
  
    
        const response = await axios.post(
          `${apiUrl}/autres-services-de-conceptions`,
          { data: guideData },
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );

        console.log("Report archived successfully:", response.data);

        setUploadMessage(
          language === "french"
            ? "Téléchargement et archivage réussis!"
            : "Upload and archiving successful!"
        );

        localStorage.clear();
        navigate("/mes-fichiers");
      } catch (err) {
        alert("Case number already exists");
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

  const handleNextClickArchive = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;


    const file = form.getValues().file;
    if (file) {
      setIsUploading(true);
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

        const guideData = {
            comment: selectedItemsData.comment,
            service_impression_et_expedition: selectedItemsData.implantationPrevue,
            patient: patientData.fullname,
            numero_cas: patientData.caseNumber,
            archive: true,
            En_attente_approbation: false,
            en__cours_de_modification: false,
            soumis: false,
            approuve: false,
            produire_expide: false,
            Demande_devis: false,
            user: user.id,
            service: 5,
            offre: currentOffer?.currentPlan,
            User_Upload: fileId,
        };

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
  
    
        const response = await axios.post(
          `${apiUrl}/autres-services-de-conceptions`,
          { data: guideData },
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );

        console.log("Report archived successfully:", response.data);

        setUploadMessage(
          language === "french"
            ? "Téléchargement et archivage réussis!"
            : "Upload and archiving successful!"
        );

        localStorage.clear();
        navigate("/mes-fichiers");
      } catch (err) {
        alert("Case number already exists");
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

  return (
    <SideBarContainer>
      <Container>
        <Nouvelle />
        <br />
        <Card className="w-full max-w-4xl mx-auto my-8 shadow-lg">
          <CardHeader className="bg-gray-100">
            <CardTitle className="text-3xl font-bold text-center text-gray-800">
              {language === "french"
                ? "Autres services de conception"
                : "Other design services"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold mb-3">
                  {language === "french" ? "Détails du cas" : "Case Details"}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <UsersRound className="text-yellow-600 w-5 h-5" />
                    <p className="text-lg">
                      <span className="font-semibold">
                        {language === "french" ? "Patient: " : "Patient: "}
                      </span>
                      {patientData.fullname}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FileDigit className="text-yellow-600 w-5 h-5" />
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
                    <Package className="text-yellow-600 w-5 h-5" />
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
                    <Percent className="text-yellow-600 w-5 h-5" />
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

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  {language === "french" ? "Options" : "Options"}
                </h3>
                <div className="space-y-2">
                  <Label className="text-base font-medium">
                    {language === "french" ? "Commentaire" : "Comment"}
                  </Label>
                  <Textarea
                    value={selectedItemsData?.comment}
                    readOnly
                    className="w-full resize-none bg-gray-50"
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="printingService"
                    checked={selectedItemsData?.implantationPrevue}
                    readOnly
                  />
                  <Label htmlFor="printingService" className="text-base">
                    {language === "french"
                      ? "Service d'impression et d'expédition"
                      : "Printing and shipping service"}
                  </Label>
                </div>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleNextClick)}
                  className="space-y-6"
                >
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
                  <div className="flex justify-between pt-4">
                    <Button
                      onClick={handlePreviousClick}
                      className="w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2 bg-[#fffa1b] text-[#0e0004] hover:bg-[#fffb1bb5] hover:text-[#0e0004] transition-all"
                    >
                      {language === "french" ? "Précédent" : "Previous"}
                    </Button>

                    <div className="flex space-x-3">
                      <Button
                        type="button"
                        disabled={isUploading}
                        className={`w-32 h-auto flex items-center justify-center gap-3 rounded-lg px-3 py-2 bg-[#0e0004] text-[#fffa1b] hover:bg-[#211f20] hover:text-[#fffa1b] transition-all ${
                          isUploading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        onClick={handleArchiveClick}
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
                        disabled={isUploading}
                        className={`w-32 h-auto flex items-center justify-center gap-3 rounded-lg px-3 py-2 bg-[#0e0004] text-[#fffa1b] hover:bg-[#211f20] hover:text-[#fffa1b] transition-all ${
                          isUploading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        onClick={handleSubmitClick}
                      >
                      {isUploading ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : language === "french" ? (
                        "Demande de devis"
                      ) : (
                        "Request a quote"
                      )}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
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
                        ? "Êtes-vous sûr de vouloir demander un devis pour ce cas ?"
                        : "Are you sure you want to request a quote for this case?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {language === "french"
                        ? "Demander un devis pour votre cas."
                        : "Request a quote for your case."}
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
      </Container>
    </SideBarContainer>
  );
};

export default SelectedItemsPageAutreService;
