import Container from "@/components/Container";
import { Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import Nouvelle from "@/components/Nouvelledemande";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SideBarContainer from "@/components/SideBarContainer";
import { useLanguage } from "@/components/languageContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const AutreServices = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [comment, setComment] = useState("");
  const [patientData, setPatientData] = useState({ fullname: '', caseNumber: '' });
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await axios.get("http://localhost:1337/api/patients?sort=id:desc&pagination[limit]=1");
        // Assuming the first patient is the one you want
        const patient = response.data.data[0].attributes;
        setPatientData({
          fullname: patient.fullname,
          caseNumber: patient.caseNumber
        });
      } catch (error) {
        console.error('Error fetching patient data:', error);
      }
    };

    fetchPatientData();
  }, []);
  const [checkedValues, setCheckedValues] = useState({
    implantationPrevue: false,
    implantationPrevueInverse: false,
  });

  const handleNextClick = () => {
    const yourData = {
      title:
        language === "french"
          ? "Autres services de conception"
          : "Other design services",
      comment: comment,
      implementationYes: checkedValues.implantationPrevue,
      implementationNo: checkedValues.implantationPrevueInverse,
    };

    navigate("/selectedItemsPageAutreService", {
      state: {
        selectedItemsData: yourData,
        previousState: {
          implementationYes: checkedValues.implantationPrevue,
          implementationNo: checkedValues.implantationPrevueInverse,
        },
        isCheckboxChecked: checkedValues.implantationPrevue,   
         },
    });
  };
  const handleCheck = (name) => {
    setCheckedValues((prevValues) => ({
      ...prevValues,
      [name]: !prevValues[name], // Toggle the checked state
      [name + "Inverse"]: false, // Uncheck the inverse checkbox
    }));
  };

  const handleInverseCheck = (name) => {
    setCheckedValues((prevValues) => ({
      ...prevValues,
      [name]: false, // Uncheck the normal checkbox
      [name + "Inverse"]: !prevValues[name + "Inverse"], // Toggle the checked state
    }));
  };

  return (
    <div>
      <SideBarContainer>
        <div className="m-4">
          <Container>
            <Nouvelle />
            <br />
            <Card className="p-3">
              <div className="flex items-center justify-center">
                <h1 className="font-lato text-5xl">
                  {language === "french"
                    ? "Autres services de conception"
                    : "Other design services"}
                </h1>
              </div>
              <div>
                <div className="flex-col">
                  <p className="text-lg  font-semibold">
                    {language === "french" ? "Patient:" : "Patient:"}{patientData.fullname}
                  </p>
                  <p>
                    {language === "french" ? "Numéro du cas:" : "Case number:"}{patientData.caseNumber}
                  </p>
                  <p>
                    {language === "french"
                      ? " Offre actuelle:"
                      : "Current offer:"}
                  </p>
                </div>
              </div>
              <br />
              <div className="flex flex-col items-center justify-center ">
                <div className="flex-col w-full">
                  <p className="font-semibold text-base">
                    {language === "french"
                      ? "Saisissez votre requête dans la section des commentaires et obtenez un devis (si le service est proposé par 3D Guide Dental)"
                      : "Enter your request in the comments section and get a quote (if the service is offered by 3D Guide Dental)"}
                  </p>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={
                      language === "french"
                        ? "Commentaires et demandes spéciales..."
                        : "Comments and special requests..."
                    }
                  />
                </div>

                <br />
                <div className="w-full">
                  <div className="flex">
                    <p className="font-semibold text-base">
                      {language === "french"
                        ? "Ajoutez les fichiers requis (CBCT, empreintes numériques, etc.) afin que 3D Guide Dental puisse fournir le service proposé."
                        : "Add the required files (CBCT, digital impressions, etc.) so that 3D Guide Dental can provide the service offered."}
                    </p>
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Info className="h-4 w-auto" />
                      </HoverCardTrigger>
                      <HoverCardContent className="bg-gray-200 bg-opacity-95">
                        <p>
                          {language === "french"
                            ? "Merci de télécharger les fichiers nécessaires pour le service proposé. N'oubliez pas de les regrouper dans un dossier contenant des fichiers compressés qui peuvent atteindre 400Mo."
                            : "Thank you for downloading the necessary files for the service offered. Don't forget to group them in a folder containing compressed files that can reach 400Mb."}
                        </p>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                  <Input
                    type="file"
                    accept=".zip,.rar,.7z,.tar"
                    placeholder={
                      language === "french"
                        ? "Ajouter des fichiers"
                        : "Add files"
                    }
                    className="w-auto"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const fileName = file.name;
                        const fileExtension = fileName.slice(
                          ((fileName.lastIndexOf(".") - 1) >>> 0) + 2
                        );
                        if (
                          !["zip", "rar", "7z", "tar"].includes(fileExtension)
                        ) {
                          alert("Please select a ZIP, RAR, 7Z, or TAR file");
                          e.target.value = ""; // Reset the input value
                        }
                      }
                    }}
                  />
                </div>
                <br />
                <div className="w-full flex space-x-2">
                  <p className="font-semibold text-base">
                    {language === "french"
                      ? "Souhaitez-vous bénéficier du service d'impression et d'expédition?"
                      : "Do you want to take advantage of the printing and shipping service?"}
                  </p>
                  <div>
                    <Checkbox
                      checked={checkedValues.implantationPrevue}
                      onClick={() => handleCheck("implantationPrevue")}
                    />
                    <Label htmlFor="implantationPrevue">
                      {language === "french" ? "Oui" : "Yes"}
                    </Label>
                    <Checkbox
                      checked={checkedValues.implantationPrevueInverse}
                      onClick={() => handleInverseCheck("implantationPrevue")}
                    />
                    <Label htmlFor="implantationPrevue">
                      {language === "french" ? "Non" : "No"}
                    </Label>
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <Button className="w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2 bg-[#fffa1b] text-[#0e0004] hover:bg-[#fffb1bb5] hover:text-[#0e0004] transition-all mt-9">
                  <Link to="/sign/offre">
                    {language === "french" ? "Précédent" : "Previous"}
                  </Link>
                </Button>
                <Button
                  className="w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2 bg-[#0e0004] text-[#fffa1b] hover:bg-[#211f20] hover:text-[#fffa1b] transition-all mt-9"
                  onClick={handleNextClick}
                >
                  <Link to="/sign/information">
                    {language === "french" ? "Suivant" : "Next"}
                  </Link>
                </Button>
              </div>
            </Card>
          </Container>
        </div>
      </SideBarContainer>
    </div>
  );
};

export default AutreServices;
