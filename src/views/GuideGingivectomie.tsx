import { SetStateAction, useEffect, useState } from "react";
import Container from "@/components/Container";
import Dents from "@/components/Dents";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@radix-ui/react-hover-card";
import { Textarea } from "@/components/ui/textarea";
import { Info } from "lucide-react";
import Nouvelle from "@/components/Nouvelledemande";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SideBarContainer from "@/components/SideBarContainer";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/components/languageContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const GuideGingivectomie = () => {
  const navigate = useNavigate();
  const [cost, setCost] = useState(100);
  const [first, setFirst] = useState(false);
  const [second, setSecond] = useState(false);
  const [third, setThird] = useState(false);
  const [fourth, setFourth] = useState(false);
  const [comment, setComment] = useState("");
  const [showTextarea, setShowTextarea] = useState(false);
  const [impressionCost, setImpressionCost] = useState(0);
  const [additionalGuides, setAdditionalGuides] = useState(0);
  const [textareaValue, setTextareaValue] = useState("");
  const [selectedTeeth, setSelectedTeeth] = useState([]);
  const [patientData, setPatientData] = useState({ fullname: '', caseNumber: '' });

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await axios.get("http://localhost:1337/api/patients?sort=id:desc&pagination[limit]=1");
        if (response.data.data.length > 0) {
          const patient = response.data.data[0].attributes;
          setPatientData({
            fullname: patient.fullname,
            caseNumber: patient.caseNumber
          });
        } else {
          console.error('No patient data found.');
        }
      } catch (error) {
        console.error('Error fetching patient data:', error);
      }
    };
  
    fetchPatientData();
  }, []);

  const handleDicomSwitch = () => {
    setFirst(!first);
    setCost(!first ? cost + 100 : cost - 100);
  };

  const handleSmileDesignSwitch = () => {
    setSecond(!second);
    setCost(!second ? cost + 40 : cost - 40);
  };

  const handleSuppressionSwitch = () => {
    setThird(!third);
    setCost(!third ? cost + 10 : cost - 10);
    setShowTextarea(!showTextarea);
  };

  const handleImpressionSwitch = () => {
    setFourth(!fourth);
    if (fourth) {
      setCost(cost - impressionCost);
      setImpressionCost(0);
      setAdditionalGuides(0); // reset additionalGuides back to 0
    } else {
      const newImpressionCost = 40 + additionalGuides * 40;
      setCost(cost - impressionCost + newImpressionCost);
      setImpressionCost(newImpressionCost);
    }
  };

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleTextareaChange = (event) => {
    setTextareaValue(event.target.value);
  };

  const handleToothClick = (toothIndex) => {
    setSelectedTeeth((prevSelectedTeeth) => {
      const newSelectedTeeth = new Set(prevSelectedTeeth);
      if (newSelectedTeeth.has(toothIndex)) {
        newSelectedTeeth.delete(toothIndex);
      } else {
        newSelectedTeeth.add(toothIndex);
      }
      return Array.from(newSelectedTeeth);
    });
  };

  const isCommentEmpty = !comment.trim();

  const handleNextClick = () => {
    const yourData = {
      title: language === "french" ? "Guide pour gingivectomie" : "Gingivectomy guide",
      cost: cost,
      first: first,
      second: second,
      third: third,
      fourth: fourth,
      comment: comment,
      additionalGuides: additionalGuides,
      textareaValue: textareaValue,
      selectedTeeth: selectedTeeth, // only the indexes
    };

    navigate("/selectedItemsPageGging", {
      state: {
        selectedItemsData: yourData,
        previousStates: {
          first: first,
          second: second,
          third: third,
          fourth: fourth,
          additionalGuides: additionalGuides,
          textareaValue: textareaValue,
          selectedTeeth: selectedTeeth, // only the indexes
        },
      },
    });
  };

  const { language } = useLanguage();

  return (
    <SideBarContainer>
      <div className="m-4">
        <Container>
          <Nouvelle />
          <br />
          <Card className="p-3">
            <div className="flex items-center justify-center">
              <h1 className="font-lato text-5xl">
                {language === "french" ? "Guide pour gingivectomie" : "Gingivectomy guide"}
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
                  {language === "french" ? "Offre actuelle:" : "Current offer:"}
                </p>
                <p>
                  {language === "french" ? "Coût:" : "Cost:"}
                  {cost} €
                </p>
              </div>
            </div>
            <br />
            <div className="flex flex-col items-center justify-center ">
              <h1 className="font-bold">
                {language === "french"
                  ? "Sélectionner la (les) dent(s) à traiter."
                  : "Select the tooth (teeth) to be treated."}
              </h1>
              <p>
                {language === "french"
                  ? "Si vous souhaitez un guide pour les deux arcades, veuillez ajouter une tâche par arcade."
                  : "Select the tooth (teeth) to treat. If you want to have a guide for both arches, please add a task for each arch.                  "}
              </p>
              <div>
                <Dents 
                  selectAll={false}
                  selectedTeethData={selectedTeeth}
                  onToothClick={handleToothClick}
                  isReadOnly={false}
                />
                <br />
              </div>

              <div className="items-center space-x-2">
                <Switch onClick={handleDicomSwitch} checked={first} />
                <Label htmlFor="airplane-mode">
                  {language === "french" ? "avec DICOM" : "with DICOM "}
                </Label>
              </div>

              <br />
              <div>
                <br />

                <div>
                  <p className="font-semibold text-lg">
                    {language === "french"
                      ? "Pour ce type de travail, les options génériques ci-dessous sont disponibles:"
                      : "For this type of work, the following generic options are available:"}
                  </p>
                  <br />
                  <div className="flex-col space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        onClick={handleSmileDesignSwitch}
                        checked={second}
                      />
                      <p>
                        {language === "french"
                          ? "Smile Design"
                          : "Smile Design"}
                      </p>
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Info className="h-4 w-auto" />
                        </HoverCardTrigger>
                        <HoverCardContent className="bg-gray-200 bg-opacity-95">
                          <p>
                            {language === "french"
                              ? "Veuillez inclure, en plus des fichiers transmis, une photographie en vue de face du patient avec un sourire, afin de réaliser le Smile Design"
                              : "Please include, in addition to the files provided, a front-facing photograph of the patient smiling, to facilitate smile design."}
                          </p>
                        </HoverCardContent>
                      </HoverCard>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          onClick={handleSuppressionSwitch}
                          checked={third}
                        />
                        <p>
                          {language === "french"
                            ? "Suppression numérique de dents"
                            : "Digital extraction of teeth"}
                        </p>
                      </div>
                      {showTextarea && (
                        <Textarea
                          placeholder={
                            language === "french"
                              ? "Veuillez indiquer le numéro des dents à extraire."
                              : "Please indicate the number of teeth to be extracted."
                          }
                          value={textareaValue}
                          onChange={handleTextareaChange}
                        />
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        onClick={handleImpressionSwitch}
                        checked={fourth}
                      />
                      <p>
                        {language === "french"
                          ? "Impression Formlabs®"
                          : "Formlabs® impression"}
                      </p>
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Info className="h-4 w-auto" />
                        </HoverCardTrigger>
                        <HoverCardContent className="bg-gray-200 bg-opacity-95">
                          <p>
                            {language === "french"
                              ? "Sélectionnez cette option si vous souhaitez que le guide soit produit et expédié par 3D Guide Dental."
                              : "Select this option if you want the guide to be produced and shipped by 3D Guide Dental."}
                          </p>
                        </HoverCardContent>
                      </HoverCard>
                    </div>
                    {fourth && (
                      <>
                        <p>
                          {language === "french"
                            ? "Guide(s) supplémentaire(s)"
                            : "Additional guide(s)"}
                        </p>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          className="w-auto"
                          onChange={(event) => {
                            const additionalGuides = parseInt(event.target.value) || 0;
                            setAdditionalGuides(additionalGuides);
                            const newImpressionCost = 40 + additionalGuides * 40;
                            setCost(cost - impressionCost + newImpressionCost);
                            setImpressionCost(newImpressionCost);
                          }}
                        />
                      </>
                    )}
                    <div className="font-semibold text-lg">
                      <p>
                        {language === "french"
                          ? "Commentaire sur ce travail:"
                          : "Comment on this work:"}
                      </p>
                      <Textarea
                        placeholder={
                          language === "french"
                            ? "Ajoutez vos instructions cliniques"
                            : "Add your clinical instructions"
                        }
                        onChange={handleCommentChange}
                      />
                    </div>
                  </div>
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
                className={`w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2 bg-[#0e0004] text-[#fffa1b] hover:bg-[#211f20] hover:text-[#fffa1b] transition-all mt-9 ${
                  isCommentEmpty && "opacity-50 cursor-not-allowed"
                }`}
                disabled={isCommentEmpty}
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
  );
};

export default GuideGingivectomie;