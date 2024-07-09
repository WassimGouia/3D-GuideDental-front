import Container from "@/components/Container";
import Dents from "@/components/Dents";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@radix-ui/react-hover-card";
import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import Nouvelle from "@/components/Nouvelledemande";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SideBarContainer from "@/components/SideBarContainer";
import { useLanguage } from "@/components/languageContext";
import { useStepTracking } from "@/components/StepTrackingContext";
import { FaTooth } from "react-icons/fa";
// import  { loadStripe }  from '@stripe/stripe-js';
import axios from "axios";

const GuideEtage = () => {
  const { completeStep } = useStepTracking();
  const navigate = useNavigate();
  const [cost, setCost] = useState(450 + (localStorage.getItem("country") === "france" ? 7 : 15));
  const [immediateLoad, setImmediateLoad] = useState(false);
  const [secondSwitch, setSecondSwitch] = useState(false);
  const [thirdSwitch, setThirdSwitch] = useState(false);
  const [fourthSwitch, setFourthSwitch] = useState(false);
  const [fifthSwitch, setFifthSwitch] = useState(false);
  const [smileDesign, setSmileDesign] = useState(false);
  const [comment, setComment] = useState("");
  const [foragePilote, setForagePilote] = useState(false);
  const [fullGuide, setFullGuide] = useState(false);
  const [selectedTeeth, setSelectedTeeth] = useState<number[]>([]);
  const [implantBrandInputs, setImplantBrandInputs] = useState<number[]>([]);
  const [selectSurgicalKitBrand, setSelectSurgicalKitBrand] = useState([]);
  const [lateralPinBrand, setLateralPinBrand] = useState([]);
  const [implantBrandValues, setImplantBrandValues] = useState({});
  const location = useLocation();
  //condition ken 3andhom nafss case number matit3adech request
  const [patientData, setPatientData] = useState({
    fullname: "",
    caseNumber: "",
  });
  // const stripepromise = loadStripe('pk_test_51P7FeV2LDy5HINSgFRIn3T8E8B3HNESuLslHURny1RAImgxfy0VV9nRrTEpmlSImYA55xJWZQEOthTLzabxrVDLl00vc2xFyDt');
  // const handelepayment =async()=>{
  //   try{
  // const stripe= await stripepromise ;
  // const res =  await Request.post('/orders',{
  //   cart

  // })
  //   }catch(eror){

  //   }
  // }
  // useEffect(() => {
  //   axios.get("http://localhost:1337/api/services").then((res) => {
  //     setCost(res.data.data[0].attributes.initial_price);
  //   });
  // }, []);
  // const handleForagePiloteSwitch = () => {
  //   setForagePilote(!foragePilote);
  //   if (!foragePilote) {
  //     setFullGuide(false);
  //     setCost(cost + 0);
  //   } else {
  //     setCost(cost - 0);
  //   }
  // };

  // const handleFullGuideSwitch = () => {
  //   setFullGuide(!fullGuide);
  //   if (!fullGuide) {
  //     setForagePilote(false);
  //     setCost(cost + 0);
  //   } else {
  //     setCost(cost - 0);
  //   }
  // };
  useEffect(() => {
    // const fetchPatientData = async () => {
    //   // Assuming the API is set up to return patients sorted by creation time descending
    //   try {
    //     // Modify the URL to include sorting and potentially filtering by service if required
    //     const response = await axios.get(
    //       "http://localhost:1337/api/patients?sort=id:desc&pagination[limit]=1"
    //     );
    //     if (response.data.data.length > 0) {
    //       const patient = response.data.data[0].attributes;
    //       setPatientData({
    //         fullname: patient.fullname,
    //         caseNumber: patient.caseNumber,
    //       });
    //     } else {
    //       console.error("No patient data found.");
    //     }
    //   } catch (error) {
    //     console.error("Error fetching patient data:", error);
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

  const handleImmediateLoadToggle = () => {
    setImmediateLoad((prev) => !prev);
    immediateLoad ? setCost(cost - 150) : setCost(cost + 150);
  };
  const handleSecondSwitchToggle = () => {
    setSecondSwitch((prev) => !prev);
    secondSwitch ? setCost(cost - 100) : setCost(cost + 100);
  };

  const handleThirdSwitchToggle = () => {
    setThirdSwitch((prev) => !prev);
    thirdSwitch ? setCost(cost - 300) : setCost(cost + 300);
  };

  const handleFourthSwitchToggle = () => {
    setFourthSwitch((prev) => !prev);
    fourthSwitch ? setCost(cost - 400) : setCost(cost + 400);
  };

  const handleFifthSwitchToggle = () => {
    setFifthSwitch((prev) => !prev);
    fifthSwitch ? setCost(cost - 0) : setCost(cost + 0);
  };

  const smileDesignToggle = () => {
    setSmileDesign((prev) => !prev);
    smileDesign ? setCost(cost - 40) : setCost(cost + 40);
  };

  const handleCommentChange = (e: any) => {
    setComment(e.target.value);
  };

  const handleTeethSelectionChange = (selectedTeeth: number[]) => {
    setSelectedTeeth(selectedTeeth);
  };

  const handleNextClick = () => {
    completeStep("guide-etage");
    const selectedSwitchLabel = foragePilote
      ? language === "french"
        ? "Forage pilote"
        : "Pilot drilling"
      : language === "french"
      ? "Full guidée"
      : "Fully guided";

    const yourData = {
      title: language === "french" ? "Guide à étages" : "Stackable Guide",
      cost: cost,
      immediateLoad: immediateLoad,
      secondSwitch: secondSwitch,
      thirdSwitch: thirdSwitch,
      fourthSwitch: fourthSwitch,
      fifthSwitch: fifthSwitch,
      smileDesign: smileDesign,
      comment: comment,
      selectedSwitchLabel: selectedSwitchLabel,
      selectedTeeth: selectedTeeth,
      lateralPinBrand: lateralPinBrand,
      selectSurgicalKitBrand: selectSurgicalKitBrand,
      implantBrandValues: implantBrandValues,
      implantBrandInputs: implantBrandInputs,
      // selectedSwitch: foragePilote
      //   ? { checked: foragePilote }
      //   : { checked: fullGuide },
      foragePilote: foragePilote,
      fullGuide: fullGuide,
    };
    navigate("/SelectedItemsPageGETAGE", {
      state: {
        selectedItemsData: yourData,
        previousStates: {
          immediateLoad: immediateLoad,
          secondSwitch: secondSwitch,
          thirdSwitch: thirdSwitch,
          fourthSwitch: fourthSwitch,
          fifthSwitch: fifthSwitch,
          smileDesign: smileDesign,
          selectedTeeth: selectedTeeth,
          lateralPinBrand: lateralPinBrand,
          foragePilote: foragePilote,
          fullGuide: fullGuide,
          selectSurgicalKitBrand: selectSurgicalKitBrand,
          implantBrandInputs: implantBrandInputs,
          implantBrandValues: implantBrandValues,
        },
      },
    });
  };

  // const handleForagePiloteSwitch = () => {
  //   setForagePilote(!foragePilote);
  //   if (!foragePilote) {
  //     setFullGuide(false);
  //     setCost(cost + 0);
  //   } else {
  //     setCost(cost - 0);
  //   }
  // };

  // const handleFullGuideSwitch = () => {
  //   setFullGuide(!fullGuide);
  //   if (!fullGuide) {
  //     setForagePilote(false);
  //     setCost(cost + 0);
  //   } else {
  //     setCost(cost - 0);
  //   }
  // };
  const handleImplantBrandChange = (index: number, value: string) => {
    setImplantBrandValues((prevValues) => ({
      ...prevValues,
      [index]: value,
    }));
  };

  const handleToothClick = (index) => {
    // Toggle the selected tooth index in the state array using functional update form
    setSelectedTeeth((prevSelectedTeeth) => {
      if (prevSelectedTeeth.includes(index)) {
        // If the index is already selected, remove it from the array
        return prevSelectedTeeth.filter((i) => i !== index);
      } else {
        // Otherwise, add the index to the array
        return [...prevSelectedTeeth, index];
      }
    });

    // Also update the implantBrandInputs in a similar way
    setImplantBrandInputs((prevImplantInputs) => {
      if (prevImplantInputs.includes(index)) {
        // If the index is already in implantBrandInputs, remove it
        return prevImplantInputs.filter((i) => i !== index);
      } else {
        // Otherwise, add the index to the array
        return [...prevImplantInputs, index];
      }
    });
  };

  const { language } = useLanguage();

  return (
    <SideBarContainer>
      <div className="m-4">
        <Nouvelle />
        <br />
        <Container>
          <Card className=" p-3 font-SF-Pro-Display">
            <div className="flex items-center justify-center">
              <h1 className="font-lato text-5xl ">
                {language === "french" ? "Guide à étages" : "Stackable Guide"}
              </h1>
            </div>
            <div>
              <div className="flex-col">
                <p className="text-lg font-semibold">
                  Patient: {patientData.fullname}
                </p>
                <p>
                  {language === "french" ? "Numéro du cas:" : "Case number:"}
                  {patientData.caseNumber}
                </p>
                <p>
                  {language === "french"
                    ? "Offre actuelle:"
                    : "Current offer: "}
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
                  ? "Sélectionner la (les) dent(s) à traiter"
                  : "Select the tooth (teeth) to treat."}
              </h1>

              <p>
                {language === "french"
                  ? "Si vous souhaitez un guide pour les deux arcades, veuillez ajouter une tâche par arcade."
                  : "If you want a guide for both arches, please add a task for each arch."}
              </p>
              <div>
                <Dents
                  selectAll={false}
                  selectedTeethData={selectedTeeth}
                  onToothClick={handleToothClick}
                  onTeethSelectionChange={handleTeethSelectionChange}
                />

                <br />
              </div>
              <div className="flex space-x-2">
                <div className="items-center space-x-2">
                  <Switch
                    checked={foragePilote}
                    onClick={handleForagePiloteSwitch}
                  />
                  <Label htmlFor="airplane-mode">
                    {language === "french" ? "Forage pilote" : "Pilot drilling"}
                  </Label>
                </div>
                <div className="items-center space-x-2">
                  <Switch checked={fullGuide} onClick={handleFullGuideSwitch} />
                  <Label htmlFor="airplane-mode">
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
                  ? "Pour le full guidée, vous devez disposer de la trousse adéquate fournie par votre fabricant."
                  : "For fully guided drilling, you must have the appropriate kit provided by your manufacturer."}
              </p>
              <br />
              <p className="">
                {language === "french"
                  ? "3D Guide Dental peut commander à votre place les douilles (directement de chez le fabricant) si vous optez pour l'option de production. Vous pouvez aussi commander les douilles et les envoyez à notre siège. Pour plus de détails, n'hésitez pas à nous contacter."
                  : "3D Guide Dental can order sleeves on your behalf (directly from the manufacturer) if you opt for the production option. Alternatively, you can order the sleeves and send them to our headquarters. For further details, please feel free to contact us."}
              </p>
            </div>
            <div>
              <br />

              <div>
                <h1 className="font-bold">
                  {language === "french"
                    ? "Marque de la clavette:"
                    : "Brand of the lateral pin"}
                </h1>

                <Input
                  type="text"
                  placeholder="Ex: IDI, Nobel, Straumann ..."
                  className="w-2/5"
                  value={lateralPinBrand}
                  onChange={(event) => setLateralPinBrand(event.target.value)}
                />
              </div>
              <div>
                <h1 className="font-bold">
                  {language === "french"
                    ? "Marque de la trousse de chirugie utilisée:"
                    : "Brand of the surgical kit used: "}
                </h1>

                <Input
                  type="text"
                  placeholder="Ex: IDI, Nobel, Straumann ..."
                  className="w-2/5"
                  value={selectSurgicalKitBrand}
                  onChange={(event) =>
                    setSelectSurgicalKitBrand(event.target.value)
                  }
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
                  ? "Options supplémentaires:"
                  : "Additional options:"}
              </p>
              <br />
              <div className="flex-col items-center space-y-2">
                <div className="flex space-x-2 justify-between">
                  <p>
                    {language === "french"
                      ? "Mise en charge immédiate (impression de la prothèse immédiate)"
                      : "Immediate loading (impression of the immediate prosthesis)"}
                  </p>
                  <Switch
                    onClick={handleImmediateLoadToggle}
                    checked={immediateLoad}
                  />
                </div>
                <div className="flex space-x-2 justify-between">
                  <p>
                    {language === "french"
                      ? "Impression des 2 étages en résine (prothèse immédiate non incluse)"
                      : "Resin impression of both guide parts (immediate prosthesis not included) "}
                  </p>
                  <Switch
                    onClick={handleSecondSwitchToggle}
                    checked={secondSwitch}
                  />
                </div>
                <div className="flex space-x-2 justify-between">
                  <p>
                    {language === "french"
                      ? "Impression du premier étage en métal + deuxième étage en résine (prothèse immédiate non incluse)"
                      : "Metal impression of first part + Resin impression of second part (immediate prosthesis not included) "}
                  </p>
                  <Switch
                    onClick={handleThirdSwitchToggle}
                    checked={thirdSwitch}
                  />
                </div>
                <div className="flex space-x-2 justify-between">
                  <p>
                    {language === "french"
                      ? "Impression des 2 étages en métal (prothèse immédiate non incluse)"
                      : "Metal impression of both guide parts (immediate prosthesis not included) "}
                  </p>
                  <Switch
                    onClick={handleFourthSwitchToggle}
                    checked={fourthSwitch}
                  />
                </div>
                <div className="flex space-x-2 justify-between">
                  <p>
                    {language === "french"
                      ? "Ajout d'aimants pour solidariser les étages"
                      : "Addition of magnets to secure the parts"}
                  </p>
                  <Switch
                    onClick={handleFifthSwitchToggle}
                    checked={fifthSwitch}
                  />
                </div>
              </div>
              <br />
              <br />
              <div className="flex-col items-center">
                <p className="font-semibold text-lg">
                  {language === "french"
                    ? "Pour ce type de travail, les options génériques ci-dessous sont disponibles:"
                    : "For this type of work, the following generic options are available:"}
                </p>
                <br />
                <div className="flex items-center space-x-2">
                  <Switch onClick={smileDesignToggle} checked={smileDesign} />
                  <Label htmlFor="airplane-mode">
                    {language === "french" ? "Smile Design" : "Smile Design"}
                  </Label>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Info className="h-4 w-auto" />
                    </HoverCardTrigger>
                    <HoverCardContent className="bg-gray-200 bg-opacity-95 h-auto w-72">
                      <p>
                        {language === "french"
                          ? "Veuillez inclure, en plus des fichiers transmis, une  photographie en vue de face du patient avec un sourire, afin de réaliser le Smile Design."
                          : "Please include, in addition to the files provided, a front-facing photograph of the patient smiling, to facilitate the Smile Design."}
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                <br />
                <div>
                  <br />
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
                className={`w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2 bg-[#0e0004] text-[#fffa1b] hover:bg-[#211f20] hover:text-[#fffa1b] transition-all mt-9`}
                disabled={!comment.trim()}
                onClick={handleNextClick}
              >
                <Link to="/SelectedItemsPageGETAGE">
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

export default GuideEtage;
