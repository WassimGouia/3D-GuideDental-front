import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import Container from "@/components/Container";
import Dents from "../components/Dents";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Textarea } from "@/components/ui/textarea";
import Nouvelle from "@/components/Nouvelledemande";
import { SetStateAction, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import SideBarContainer from "@/components/SideBarContainer";
import { useLanguage } from "@/components/languageContext";
import { useNavigate } from "react-router-dom";
import { FaTooth } from "react-icons/fa";
import axios from "axios";
const GuideClassique = () => {
  const [cost, setCost] = useState(50);
  const [foragePilote, setForagePilote] = useState(false);
  const [fullGuide, setFullGuide] = useState(false);
  const [first, setFirst] = useState(false);
  const [second, setSecond] = useState(false);
  const [third, setThird] = useState(false);
  const [showAdditionalGuidesInput, setShowAdditionalGuidesInput] =
    useState(false);
  const [selectedTeeth, setSelectedTeeth] = useState<number[]>([]);
  const [showTextarea, setShowTextarea] = useState(false);
  const [comment, setComment] = useState("");
  const [impressionCost, setImpressionCost] = useState(0);
  const [additionalGuidesClavettes, setAdditionalGuidesClavettes] = useState(0);
  const navigate = useNavigate();
  const [additionalGuidesImpression, setAdditionalGuidesImpression] =
    useState(0);
  const [implantBrandInputs, setImplantBrandInputs] = useState<number[]>([]);
  const [brandSurgeonKit, setBrandSurgeonKit] = useState("");
  const [implantBrandValues, setImplantBrandValues] = useState({});
  const [textareaValue, setTextareaValue] = useState("");
  const location = useLocation();
  const formData = location.state
    ? location.state.formData
    : { fullname: "", caseNumber: "" }; 
  const [patientData, setPatientData] = useState({ fullname: '', caseNumber: '' });

  useEffect(() => {
    // const fetchPatientData = async () => {
    //   try {
    //     const response = await axios.get("http://localhost:1337/api/patients?sort=id:desc&pagination[limit]=1");
    //     // Assuming the first patient is the one you want
    //     const patient = response.data.data[0].attributes;
    //     setPatientData({
    //       fullname: patient.fullname,
    //       caseNumber: patient.caseNumber
    //     });
    //   } catch (error) {
    //     console.error('Error fetching patient data:', error);
    //   }
    // };

    // fetchPatientData();


    const storedFullname = localStorage.getItem("fullName");
    const storedCaseNumber = localStorage.getItem("caseNumber");

    if (!storedFullname || !storedCaseNumber) {
      // Redirect to /sign/nouvelle-demande if data is missing
      navigate("/sign/nouvelle-demande");
    } else {
      // If data exists in local storage, set it to patientData
      setPatientData({
        fullname: storedFullname,
        caseNumber: storedCaseNumber,
      });
    }
  }, [navigate]);
  const handleForagePiloteSwitch = () => {
    setForagePilote(!foragePilote);
    if (!foragePilote) {
      setFullGuide(false);
      setCost(cost + 0);
    } else {
      setCost(cost - 0);
    }
  };

  const handleFullGuideSwitch = () => {
    setFullGuide(!fullGuide);
    if (!fullGuide) {
      setForagePilote(false);
      setCost(cost + 0);
    } else {
      setCost(cost - 0);
    }
  };

  const handleCommentChange = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setComment(e.target.value);
  };

  const handleSmileDesignSwitch = () => {
    setFirst(!first);
    setCost(!first ? cost + 40 : cost - 40);
  };

  const handleSuppressionSwitch = () => {
    setSecond(!second);
    setCost(!second ? cost + 10 : cost - 10);
    setShowTextarea(!showTextarea);
  };

  const handleTextareaChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setTextareaValue(event.target.value);
  };

  const isCommentFilled = comment.trim() !== "";

  const handleAdditionalGuidesSwitch = () => {
    setShowAdditionalGuidesInput(!showAdditionalGuidesInput);
    if (showAdditionalGuidesInput) {
      setAdditionalGuidesClavettes(0);
      const smileDesignCost = first ? 40 : 0;
      const suppressionCost = second ? 10 : 0;
      const impressionCost = third ? 40 : 0;
      const totalCost = 50 + smileDesignCost + suppressionCost + impressionCost;
      setCost(totalCost);
    }
  };

  const handleImpressionSwitch = () => {
    if (third) {
      setCost(cost - impressionCost);
      setImpressionCost(0);
      setAdditionalGuidesImpression(0); // reset additionalGuidesImpression back to 0
    } else {
      const newImpressionCost = 40 + additionalGuidesImpression * 40;
      setCost(cost - impressionCost + newImpressionCost);
      setImpressionCost(newImpressionCost);
    }
    setThird(!third);
  };

  const handleToothClick = (index: number) => {
    console.log("handleToothClick called with index:", index);
    console.log("Current cost:", cost);

    if (selectedTeeth.includes(index)) {
      setSelectedTeeth(selectedTeeth.filter((i) => i !== index));
      setCost(cost - 30);

      setImplantBrandInputs(implantBrandInputs.filter((i) => i !== index));
    } else {
      setSelectedTeeth([...selectedTeeth, index]);
      setCost(cost + 30);

      setImplantBrandInputs([...implantBrandInputs, index]);
    }

    console.log("Updated cost:", cost);
  };

  const handleImplantBrandChange = (index: number, value: string) => {
    setImplantBrandValues((prevValues) => ({
      ...prevValues,
      [index]: value,
    }));
  };

  const handleNextClickClassique = () => {
    const selectedSwitchLabel = foragePilote
      ? language === "french"
        ? "Forage pilote"
        : "Pilot drilling"
      : language === "french"
      ? "Full guidée"
      : "Fully guided";

    const yourData = {
      title: language === "french" ? "Guide classique" : "Classic guide",
      cost: cost,
      first: first,
      second: second,
      third: third,
      comment: comment,
      showAdditionalGuidesInput: showAdditionalGuidesInput,
      selectedSwitchLabel: selectedSwitchLabel,
      brandSurgeonKit: brandSurgeonKit,
      implantBrandValues: implantBrandValues,
      imantBrandInppluts: implantBrandInputs,
      selectedSwitch: foragePilote
        ? { checked: foragePilote }
        : { checked: fullGuide },
      foragePilote: foragePilote,
      fullGuide: fullGuide,
      additionalGuidesClavettes: additionalGuidesClavettes,
      additionalGuidesImpression: additionalGuidesImpression,
      textareaValue: textareaValue,
      selectedTeeth: selectedTeeth,
    };
    navigate("/SelectedItemsPageGclassique", {
      state: {
        selectedItemsData: yourData,
        previousStates: {
          first: first,
          second: second,
          third: third,
          showAdditionalGuidesInput: showAdditionalGuidesInput,
          implantBrandValues: implantBrandValues,
          implantBrandInputs: implantBrandInputs,
          brandSurgeonKit: brandSurgeonKit,
          additionalGuidesClavettes: additionalGuidesClavettes,
          additionalGuidesImpression: additionalGuidesImpression,
          textareaValue: textareaValue,
          selectedTeeth: selectedTeeth,
        },
      },
    });
  };

  // const postData = async () => {
  //   const res = await axios.post(
  //     "http://localhost:1337/api/requests",
  //     {
  //       data: {
  //         service: 2,
  //         comment,
  //         options: [
  //           {
  //             title: "handleForage PiloteSwitch",
  //             active: foragePilote,
  //           },
  //           {
  //             title: "Digital extraction of teeth",
  //             active: second,
  //           },
  //         ],
  //       },
  //     }
  //     // {
  //     //   headers: {
  //     //     "Content-Type": "application/json",
  //     //     Authorization:
  //     //       "Bearer " +
  //     //       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzExMzIwNjU0LCJleHAiOjE3MTM5MTI2NTR9.3lmhTvg2sW893Hyz3y3MscmQDCt23a1QqdyHq1jmYto",
  //     //   },
  //     // }
  //   );
  // };

  // postData();

  const { language } = useLanguage();
  return (
    <SideBarContainer>
      <div className="m-4">
        <Container>
          <Nouvelle />
          <br />
          <Card className="p-3">
            <div className="flex items-center justify-center">
              <h1 className="font-lato text-5xl ">
                {language === "french" ? "Guide classique" : "Classic guide"}
              </h1>
            </div>
            <div>
              <div className="flex-col">
              <p className="text-lg font-semibold">Patient: {patientData.fullname}</p>
                <p>
                  {" "}
                  {language === "french" ? "Numéro du cas:" : "Case number:" }{patientData.caseNumber}
                </p>
                <p>
                  {" "}
                  {language === "french" ? "Offre actuelle:" : "Current offer:"}
                </p>
                <p>
                  {" "}
                  {language === "french" ? "Coût:" : "Cost:"} {cost} €{" "}
                </p>
              </div>
            </div>
            <br />
            <div>
              <div className="flex flex-col items-center justify-center ">
                <h1 className="font-bold">
                  {language === "french"
                    ? "Sélectionner la (les) dent(s) à traiter."
                    : "Select the tooth (teeth) to treat."}
                </h1>
                <p>
                  {language === "french"
                    ? "Si vous souhaitez un guide pour les deux arcades, veuillez ajouter une tâche par arcade."
                    : "If you require a guide for both arches, please add a task per arch."}
                </p>

                <Dents
                  selectAll={false}
                  selectedTeethData={selectedTeeth}
                  onToothClick={handleToothClick}
                />

                <br />
                <div className="flex space-x-2">
                  <div className="items-center space-x-2">
                    <Switch
                      onClick={handleForagePiloteSwitch}
                      checked={foragePilote}
                    />
                    <Label htmlFor="forage-pilote">
                      {language === "french"
                        ? "Forage pilote"
                        : "Pilot drilling"}
                    </Label>
                  </div>
                  <div className="items-center space-x-2">
                    <Switch
                      onClick={handleFullGuideSwitch}
                      checked={fullGuide}
                    />
                    <Label htmlFor="full-guide">
                      {language === "french" ? "Full guidée" : "Fully guided"}
                    </Label>
                  </div>
                </div>
              </div>

              <br />
              <div>
                <p className="">
                  {language === "french"
                    ? "Pour le forage pilote, nous utilisons les douilles de 2mm et forets pilotes diponibles de chez"
                    : "For pilot drilling, we use 2mm sleeves and pilot drills available from"}
                  <span className="font-semibold">
                    {language === "french"
                      ? " Implants Diffusion International"
                      : " Implants Diffusion International"}
                  </span>
                  .
                </p>

                <br />
                <p>
                  {language === "french"
                    ? "Pour le full guidé, vous devez disposer de la trousse adéquate fournie par votre fabricant."
                    : "For the full guided, you must have the appropriate kit provided by your manufacturer."}
                </p>
                <br />
                <p>
                  {language === "french"
                    ? "3D Guide Dental peut commander à votre place les douilles (directement chez le fabricant) si vous optez pour l'option de production. Vous pouvez aussi commander les douilles et les envoyer à notre siège. Pour plus de détails, n'hésitez pas à nous contacter."
                    : "3D Guide Dental can order the sleeves for you (directly from the manufacturer) if you opt for the production option. You can also order the sleeves and send them to our office. For more details, feel free to contact us."}
                </p>
              </div>
              <br />
              <div>
                <div>
                  <h1 className="font-bold">
                    {language === "french"
                      ? "Marque de la trousse de chirurgie utilisée:"
                      : "Brand of the surgical kit used:"}
                  </h1>
                  <Input
                    type="text"
                    placeholder="Ex: IDI, Nobel, Straumann ..."
                    className="w-2/5"
                    value={brandSurgeonKit}
                    onChange={(event) => setBrandSurgeonKit(event.target.value)}
                  />
                </div>
                <div className="flex-col space-y-1">
                  <h1 className="font-bold">
                    {language === "french"
                      ? "Marque de l'implant pour la dent:"
                      : "Brand of the implant for the tooth:"}
                  </h1>
                  {implantBrandInputs.map((index) => (
                    <div key={index}>
                      <div className="flex items-center ">
                        <div className="flex space-x-2 items-center mr-2">
                          <FaTooth />
                          <span className=" flex items-center">{index}</span>
                        </div>
                        <Input
                          type="text"
                          placeholder="Ex: IDI, Nobel, Straumann ..."
                          className="w-2/5"
                          onChange={(event) =>
                            handleImplantBrandChange(index, event.target.value)
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <br />
              <div>
                <p className="font-semibold text-lg">
                  {language === "french"
                    ? "Marque de la clavette:"
                    : "Additional option: "}
                </p>
                <div className="flex">
                  <p>
                    {language === "french"
                      ? "Clavettes de stabilisation"
                      : "Stabilization pins"}
                  </p>
                  <Switch onClick={handleAdditionalGuidesSwitch} />
                </div>
                <div>
                  {showAdditionalGuidesInput && (
                    <div className="flex-col space-x-2">
                      <Input
                        type="number"
                        min="0"
                        value={additionalGuidesClavettes}
                        className="w-auto"
                        onChange={(event) => {
                          const additionalGuidesValue =
                            parseInt(event.target.value) || 0;
                          setAdditionalGuidesClavettes(additionalGuidesValue);
                          const additionalCost = additionalGuidesValue * 30;
                          setCost(
                            cost -
                              additionalGuidesClavettes * 30 +
                              additionalCost
                          );
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
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
                    <Switch onClick={handleSmileDesignSwitch} checked={first} />
                    <p>Smile Design</p>
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Info className="h-4 w-auto" />
                      </HoverCardTrigger>
                      <HoverCardContent className="bg-gray-200 bg-opacity-95">
                        <p>
                          {language === "french"
                            ? "Veuillez inclure, en plus des fichiers transmis, une photographie en vue de face du patient avec un sourire, afin de réaliser le Smile Design"
                            : "Please include, in addition to the files provided, a front-facing photograph of the patient smiling, to facilitate the Smile Design."}
                        </p>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        onClick={handleSuppressionSwitch}
                        checked={second}
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
                    <Switch onClick={handleImpressionSwitch} checked={third} />
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
                  {third && (
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
                          const additionalGuides =
                            parseInt(event.target.value) || 0;
                          setAdditionalGuidesImpression(additionalGuides);
                          const newImpressionCost = 40 + additionalGuides * 40;
                          setCost(cost - impressionCost + newImpressionCost);
                          setImpressionCost(newImpressionCost);
                        }}
                      />
                    </>
                  )}
                  <div>
                    <p className="font-semibold text-lg">
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
                      value={comment}
                      onChange={handleCommentChange}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <Button className="w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2 bg-[#fffa1b] text-[#0e0004] hover:bg-[#fffb1bb5] hover:text-[#0e0004] transition-all mt-9">
                <Link to="/sign/Nouvelle-modelisation">
                  {language === "french" ? "Précédent" : "Previous"}
                </Link>
              </Button>
              <Button
                disabled={!isCommentFilled}
                className={`w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2 bg-[#0e0004] text-[#fffa1b] hover:bg-[#211f20] hover:text-[#fffa1b] transition-all mt-9 ${
                  !isCommentFilled && "opacity-50 cursor-not-allowed"
                }`}
                onClick={handleNextClickClassique}
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

export default GuideClassique;