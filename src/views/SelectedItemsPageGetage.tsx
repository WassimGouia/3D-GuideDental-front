import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SideBarContainer from "@/components/SideBarContainer";
import Container from "@/components/Container";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/components/languageContext";
import Dents from "@/components/Dents";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaTooth } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loadStripe } from "@stripe/stripe-js";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
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
import { getToken } from "@/components/Helpers";
import { useAuthContext } from "@/components/AuthContext";
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

const SelectedItemsPageGETAGE = () => {
  const MAX_FILE_SIZE = 400 * 1024 * 1024; // 400MB in bytes
  const ALLOWED_FILE_TYPES = [".zip", ".rar", ".7z", ".tar"];
  const apiUrl = import.meta.env.VITE_BACKEND_API_ENDPOINT;
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const [calculatedCost, setCalculatedCost] = useState(0);
  const { user } = useAuthContext();
  const { selectedItemsData, previousStates } = location.state || {
    selectedItemsData: {},
    previousStates: {},
  };
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState("");


  const cost = location.state?.selectedItemsData?.cost;
  const immediateLoad = location.state?.selectedItemsData?.immediateLoad;
  const secondSwitch = location.state?.selectedItemsData?.secondSwitch;
  const comment = location.state?.selectedItemsData?.comment;
  const smileDesign = location.state?.selectedItemsData?.smileDesign;
  const foragePilote = location.state?.selectedItemsData?.foragePilote;
  const thirdSwitch = location.state?.selectedItemsData?.thirdSwitch;
  const fourthSwitch = location.state?.selectedItemsData?.fourthSwitch;
  const fullGuide = location.state?.selectedItemsData?.fullGuide;
  const fifthSwitch = location.state?.selectedItemsData?.fifthSwitch;
  const implantBrandValue =
    location.state?.selectedItemsData?.implantBrandValues;
  const originalCost = location.state?.selectedItemsData?.originalCost;

  const [patientData, setPatientData] = useState({
    fullname: "",
    caseNumber: "",
  });
  const [currentOffer, setCurrentOffer] = useState(null);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  const [formState, setFormState] = useState(selectedItemsData);

  console.log(import.meta.env.VITE_STRIPE_API);
  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_API);

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
    defaultValues: { file: null },
  });

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

  useEffect(() => {
    const storedFullname = localStorage.getItem("fullName");
    const storedCaseNumber = localStorage.getItem("caseNumber");
    const storedFormState = localStorage.getItem("guideEtageFormState");

    if (!storedFullname || !storedCaseNumber) {
      navigate("/sign/nouvelle-demande");
    } else {
      setPatientData({
        fullname: storedFullname,
        caseNumber: storedCaseNumber,
      });

      let stateToUse;

      if (location.state && location.state.selectedItemsData) {
        stateToUse = location.state.selectedItemsData;
      } else if (storedFormState) {
        stateToUse = JSON.parse(storedFormState);
      } else {
        // Handle the case where no state is available
        console.error("No state available");
        return;
      }

      setFormState(stateToUse);
      setCalculatedCost(stateToUse.cost);

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
              const offer = {
                currentPlan: offerData.CurrentPlan,
                discount: getDiscount(offerData.CurrentPlan),
              };
              setCurrentOffer(offer);
            } else {
              console.error("Offer data not found in the user response");
              setCurrentOffer(null);
            }
          } catch (error) {
            console.error(
              "Error fetching offer data:",
              error.response ? error.response.data : error.message
            );
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


  const handleSubmit = async () => {
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
          service: 1,
          comment,
          patient: patientData.fullname,
          numero_cas: patientData.caseNumber,
          marque_implant_pour_la_dent: { " index": implantBrandValue },
          Marque_de_la_clavette: [
            {
              title: "Marque de la clavette",
              description: formState.lateralPinBrand,
            },
          ],
          Marque_de_la_trousse: [
            {
              title: "Marque de la trousse",
              description: formState.selectSurgicalKitBrand,
            },
          ],
          Full_guidee: [
            {
              title: "full guidée",
              active: fullGuide,
            },
          ],
          Forage_pilote: [
            {
              title: "forage pilote",
              active: foragePilote,
            },
          ],
          Options_supplementaires: [
            {
              title: "Immediate loading",
              active: immediateLoad,
            },
            {
              title: "Resin impression of both guide parts",
              active: secondSwitch,
            },
            {
              title:
                "Metal impression of first part + Resin impression of second part",
              active: thirdSwitch,
            },
            {
              title: "Metal impression of both guide parts",
              active: fourthSwitch,
            },
            {
              title: "Addition of magnets to secure the parts",
              active: fifthSwitch,
            },
          ],
          cout: cost,
          options_generiques: [
            {
              title: "Smile Design",
              active: smileDesign,
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

        console.log("check:",checkRes)
        console.log("check data:",checkRes.data)
        console.log("check exist:",checkRes.data.exists)
  
        if (checkRes.data.status === 200) {
          alert("Case number already exists");
          return;
        }
  
    
        const response = await axios.post(
          `${apiUrl}/guide-a-etages`,
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

        const requestData = {
          cost: cost,
          service: 1,
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
          service: 1,
          comment,
          patient: patientData.fullname,
          numero_cas: patientData.caseNumber,
          marque_implant_pour_la_dent: { " index": implantBrandValue },
          Marque_de_la_clavette: [
            {
              title: "Marque de la clavette",
              description: formState.lateralPinBrand,
            },
          ],
          Marque_de_la_trousse: [
            {
              title: "Marque de la trousse",
              description: formState.selectSurgicalKitBrand,
            },
          ],
          Full_guidee: [
            {
              title: "full guidée",
              active: fullGuide,
            },
          ],
          Forage_pilote: [
            {
              title: "forage pilote",
              active: foragePilote,
            },
          ],
          Options_supplementaires: [
            {
              title: "Immediate loading",
              active: immediateLoad,
            },
            {
              title: "Resin impression of both guide parts",
              active: secondSwitch,
            },
            {
              title:
                "Metal impression of first part + Resin impression of second part",
              active: thirdSwitch,
            },
            {
              title: "Metal impression of both guide parts",
              active: fourthSwitch,
            },
            {
              title: "Addition of magnets to secure the parts",
              active: fifthSwitch,
            },
          ],
          cout: cost,
          options_generiques: [
            {
              title: "Smile Design",
              active: smileDesign,
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

        console.log("check:",checkRes)
        console.log("check data:",checkRes.data)
        console.log("check exist:",checkRes.data.exists)
  
        if (checkRes.data.exists) {
          alert("Case number already exists");
          return;
        }
  
    
        const response = await axios.post(
          `${apiUrl}/guide-a-etages`,
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

  const handlePreviousClick = () => {
    navigate("/guide-etage", { state: { formState: formState } });
  };

  return (
    <SideBarContainer>
      <Container>
        <Nouvelle />
        <br />
        <div className="p-2">
          <Card className="w-full max-w-4xl mx-auto my-8 shadow-lg">
            <CardHeader className="bg-gray-100">
              <CardTitle className="text-3xl font-bold text-center text-gray-800">
                {language === "french" ? "Guide à étages" : "Stackable Guide"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex-col mt-3 bg-gray-100 p-4 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold mb-3">
                  {language === "french" ? "Détails du cas" : "Case Details"}
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <UsersRound className="text-yellow-600" />
                    <p className="text-lg">
                      <span className="font-semibold">
                        {language === "french" ? "Patient: " : "Patient: "}
                      </span>
                      {patientData.fullname}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileDigit className="text-yellow-600" />
                    <p>
                      <span className="font-semibold">
                        {language === "french"
                          ? "Numéro du cas: "
                          : "Case number: "}
                      </span>
                      {patientData.caseNumber}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Package className="text-yellow-600" />
                    <p>
                      <span className="font-semibold">
                        {language === "french"
                          ? "Offre actuelle: "
                          : "Current offer: "}
                      </span>
                      {currentOffer ? currentOffer.currentPlan : "Loading..."}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Percent className="text-yellow-600" />
                    <p>
                      <span className="font-semibold">
                        {language === "french" ? "Réduction: " : "Discount: "}
                      </span>
                      {currentOffer
                        ? `${currentOffer.discount}%`
                        : "Loading..."}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-4">
                  <Archive className="text-yellow-600" />
                  <p>
                    <p>
                      <span className="font-semibold">
                        {language === "french" ? "Coût: " : "Cost: "}
                      </span>
                      <span className="font-bold text-green-600">
                        {calculatedCost.toFixed(2)} €
                      </span>
                    </p>
                  </p>
                </div>
              </div>
              <br />
              <div>
                <p className="text-lg font-semibold">
                  {language === "french"
                    ? "Dents sélectionnées:"
                    : "Selected Teeth:"}
                </p>
                <div className="flex flex-col items-center justify-center ">
                  <Dents
                    selectAll={false}
                    selectedTeethData={formState.selectedTeeth || []}
                    isReadOnly={true}
                  />
                </div>
              </div>
              <br />
              <p className="text-lg font-semibold">
                {language === "french"
                  ? "Options sélectionnées"
                  : "Selected Options"}
              </p>
              <div className="flex space-x-2">
                <p>{formState.selectedSwitchLabel}</p>
              </div>
              <p className="font-semibold">
                {language === "french"
                  ? "Marque de la clavette:"
                  : "Brand of the lateral pin"}
              </p>
              <Input
                value={formState.lateralPinBrand}
                readOnly
                className="w-2/5"
              />
              <p className="font-semibold">
                {language === "french"
                  ? "Marque de la trousse de chirugie utilisée:"
                  : "Brand of the surgical kit used:"}
              </p>
              <Input
                value={formState.selectSurgicalKitBrand}
                readOnly
                className="w-2/5"
              />

              <div className="flex-col space-y-1">
                <h1 className="font-bold">
                  {language === "french"
                    ? "Marque de l'implant pour la dent:"
                    : "Brand of the implant for the tooth:"}
                </h1>
                {(formState.implantBrandInputs || []).map((index) => (
                  <div key={index}>
                    <div className="flex items-center ">
                      <div className="flex space-x-2 items-center mr-2">
                        <FaTooth />
                        <span className=" flex items-center">{index}</span>
                      </div>
                      <Input
                        value={formState.implantBrandValues[index] || ""}
                        readOnly
                        className="w-2/5"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <br />
              <div className="space-y-4 mb-6">
                {[
                  {
                    label:
                      language === "french"
                        ? "Mise en charge immédiate (impression de la prothèse immédiate)"
                        : "Immediate loading (impression of the immediate prosthesis)",
                    checked: formState.immediateLoad,
                  },
                  {
                    label:
                      language === "french"
                        ? "Impression des 2 étages en résine (prothèse immédiate non incluse)"
                        : "Resin impression of both guide parts (immediate prosthesis not included)",
                    checked: formState.secondSwitch,
                  },
                  {
                    label:
                      language === "french"
                        ? "Impression du premier étage en métal + deuxième étage en résine (prothèse immédiate non incluse)"
                        : "Metal impression of first part + Resin impression of second part (immediate prosthesis not included)",
                    checked: formState.thirdSwitch,
                  },
                  {
                    label:
                      language === "french"
                        ? "Impression des 2 étages en métal (prothèse immédiate non incluse)"
                        : "Metal impression of both guide parts (immediate prosthesis not included)",
                    checked: formState.fourthSwitch,
                  },
                  {
                    label:
                      language === "french"
                        ? "Ajout d'aimants pour solidariser les étages"
                        : "Addition of magnets to secure the parts",
                    checked: formState.fifthSwitch,
                  },
                  {
                    label:
                      language === "french" ? "Smile Design" : "Smile Design",
                    checked: formState.smileDesign,
                  },
                ].map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <p>{option.label}</p>
                    <Switch checked={option.checked} readOnly />
                  </div>
                ))}
              </div>
              <div className="flex-col">
                <p className="text-lg font-semibold">
                  {language === "french" ? "commentaire" : "comment"}
                </p>
                <Input value={formState.comment} readOnly className="w-2/5" />
              </div>

              <div>
                <Form {...form}>
                  <form>
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

                <div className="mt-5 flex justify-between">
                  <Button
                    className="w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2 bg-[#fffa1b] text-[#0e0004] hover:bg-[#fffb1bb5] hover:text-[#0e0004] transition-all"
                    onClick={handlePreviousClick}
                  >
                    {language === "french" ? "Précédent" : "Previous"}
                  </Button>

                  <div className="flex space-x-3">
                    <AlertDialog
                      open={showArchiveDialog}
                      onOpenChange={setShowArchiveDialog}
                    >
                      <AlertDialogTrigger asChild>
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
                      </AlertDialogTrigger>
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
                      <AlertDialogTrigger asChild>
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
                      </AlertDialogTrigger>
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
                            {language === "french" ? "Continuer" : "Continue"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </SideBarContainer>
  );
};

export default SelectedItemsPageGETAGE;
