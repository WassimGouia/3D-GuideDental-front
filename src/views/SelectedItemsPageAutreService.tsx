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

  const formSchema = z.object({
    file: z.any().refine((file) => file instanceof File, "File is required"),
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
          `http://localhost:1337/api/users/${user.id}?populate=offre`,
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

  const handleArchiveClick = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      setShowArchiveDialog(true);
    }
  };

  const handleSubmitClick = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      setShowSubmitDialog(true);
    }
  };

  const handleNextClick = async () => {
    const fileData = form.getValues("file");
    if (!fileData) {
      form.setError("file", { type: "manual", message: "File is required" });
      return;
    }

    const token = getToken();
    if (!token) {
      console.error("No auth token found");
      return;
    }

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        comment: selectedItemsData.comment,
        service_impression_et_expedition: selectedItemsData.implantationPrevue,
        patient: patientData.fullname,
        numero_cas: patientData.caseNumber,
        submit: false,
        archive: false,
        En_attente_approbation: true,
        en__cours_de_modification: false,
        soumis: true,
        approuve: false,
        produire_expide: false,
        Demande_devis: true,
        user: user.id,
        service: 5, // Assuming this is the ID for Autres services de conception
      })
    );

    formData.append("files.User_Upload", fileData);

    try {
      const response = await axios.post(
        "http://localhost:1337/api/autres-services-de-conceptions",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        alert(
          language === "french"
            ? "Demande de devis soumise avec succès"
            : "Quote request submitted successfully"
        );
        navigate("/sign/mes-fichier");
      }
    } catch (error) {
      console.error("Error submitting quote request:", error);
      alert(
        language === "french"
          ? "Erreur lors de la soumission de la demande de devis"
          : "Error submitting quote request"
      );
    }
  };

  const handleNextClickArchive = async () => {
    const fileData = form.getValues("file");
    if (!fileData) {
      form.setError("file", { type: "manual", message: "File is required" });
      return;
    }

    const token = getToken();
    if (!token) {
      console.error("No auth token found");
      return;
    }

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        comment: selectedItemsData.comment,
        service_impression_et_expedition: selectedItemsData.implantationPrevue,
        patient: patientData.fullname,
        numero_cas: patientData.caseNumber,
        submit: false,
        archive: true,
        En_attente_approbation: false,
        en__cours_de_modification: false,
        soumis: false,
        approuve: false,
        produire_expide: false,
        Demande_devis: false,
        user: user.id,
        service: 5, // Assuming this is the ID for Autres services de conception
      })
    );

    formData.append("files.User_Upload", fileData);

    try {
      const response = await axios.post(
        "http://localhost:1337/api/autres-services-de-conceptions",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        localStorage.removeItem("autreServiceState");
        navigate("/");
      } else {
        alert(response.status);
      }
    } catch (error) {
      console.error("Error archiving service:", error);
      alert(
        language === "french"
          ? "Erreur lors de l'archivage du service"
          : "Error archiving service"
      );
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
                        <FormLabel className="text-base font-medium">
                          {language === "french"
                            ? "Ajouter des fichiers"
                            : "Add files"}
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="file"
                              accept=".zip,.rar,.7z,.tar"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  const fileName = file.name;
                                  const fileExtension = fileName
                                    .split(".")
                                    .pop()
                                    .toLowerCase();
                                  if (
                                    !["zip", "rar", "7z", "tar"].includes(
                                      fileExtension
                                    )
                                  ) {
                                    alert(
                                      "Please select a ZIP, RAR, 7Z, or TAR file"
                                    );
                                    e.target.value = "";
                                  } else {
                                    field.onChange(file);
                                  }
                                }
                              }}
                              className="flex-grow"
                            />
                            <FolderUp className="text-yellow-600 w-5 h-5" />
                          </div>
                        </FormControl>
                        <FormDescription className="text-sm text-gray-500">
                          {language === "french"
                            ? "Ajoutez les fichiers requis (CBCT, empreintes numériques, etc.) afin que 3D Guide Dental puisse fournir le service proposé."
                            : "Add the required files (CBCT, digital impressions, etc.) so that 3D Guide Dental can provide the service offered."}
                        </FormDescription>
                        <FormMessage />
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
                        className="w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2"
                        onClick={handleArchiveClick}
                      >
                        {language === "french" ? "Archiver" : "Archive"}
                      </Button>

                      <Button
                        type="button"
                        className="w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2 bg-[#0e0004] text-[#fffa1b] hover:bg-[#211f20] hover:text-[#fffa1b] transition-all"
                        onClick={handleSubmitClick}
                      >
                        {language === "french"
                          ? "Demande de devis"
                          : "Request a quote"}
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
                        ? "Voulez-vous vraiment archiver ce cas?"
                        : "Are you sure you want to archive this case?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {language === "french"
                        ? "Cela archivera le cas."
                        : "This will archive the case."}
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
                        ? "Voulez-vous vraiment soumettre cette demande de devis?"
                        : "Are you sure you want to submit this quote request?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {language === "french"
                        ? "Cela soumettra la demande de devis."
                        : "This will submit the quote request."}
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
