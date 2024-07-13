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
import { Link, useNavigate } from "react-router-dom";
import SideBarContainer from "@/components/SideBarContainer";
import { useLanguage } from "@/components/languageContext";
import { useStepTracking } from "@/components/StepTrackingContext";
import { FaTooth } from "react-icons/fa";
import axios from "axios";
import { useAuthContext } from "@/components/AuthContext";
import { getToken } from "@/components/Helpers";

const GuideEtage = () => {
  const { completeStep } = useStepTracking();
  const navigate = useNavigate();
  const [originalCost, setOriginalCost] = useState(450 );
  const [cost, setCost] = useState(450);
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
  const [selectSurgicalKitBrand, setSelectSurgicalKitBrand] = useState("");
  const [lateralPinBrand, setLateralPinBrand] = useState("");
  const [implantBrandValues, setImplantBrandValues] = useState({});
  const [patientData, setPatientData] = useState({
    fullname: "",
    caseNumber: "",
  });

  interface Offer {
    currentPlan: string;
    discount: number;
  }

  const [currentOffer, setCurrentOffer] = useState<Offer | null>(null);
  const { user } = useAuthContext();
  const { language } = useLanguage();
  console.log("userrrrrrrr: ",user)

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
              `http://localhost:1337/api/users/${user.id}?populate=offre`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            console.log("User Response:", userResponse.data);

            if (userResponse.data && userResponse.data.offre) {
              const offerData = userResponse.data.offre;
              const offer = {
                currentPlan: offerData.CurrentPlan,
                discount: getDiscount(offerData.CurrentPlan),
              };
              setCurrentOffer(offer);

              const discountedCost = applyDiscount(
                originalCost,
                offer.discount
              );
              setCost(discountedCost);
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
  }, [navigate, user, originalCost]);

  const getDiscount = (plan) => {
    const discounts = {
      Essential: 5,
      Privilege: 10,
      Elite: 15,
      Premium: 20,
    };
    return discounts[plan] || 0;
  };

  const deliveryCost = user && user.location[0].country?.toLocaleLowerCase() === "france" ? 7 : 15;
  console.log(deliveryCost)
const applyDiscount = (price, discountPercentage) => {
  const discountedPrice = price * (1 - discountPercentage / 100);
  return discountedPrice + deliveryCost;
};


  const updateCost = (change) => {
    setOriginalCost((prevCost) => {
      const newOriginalCost = prevCost + change;
      const newDiscountedCost = currentOffer
        ? applyDiscount(newOriginalCost, currentOffer.discount)
        : newOriginalCost;
      setCost(newDiscountedCost);
      return newOriginalCost;
    });
  };

  const handleForagePiloteSwitch = () => {
    setForagePilote(!foragePilote);
    if (!foragePilote) {
      setFullGuide(false);
      updateCost(0);
    } else {
      updateCost(0);
    }
  };

  const handleFullGuideSwitch = () => {
    setFullGuide(!fullGuide);
    if (!fullGuide) {
      setForagePilote(false);
      updateCost(0);
    } else {
      updateCost(0);
    }
  };

  const handleImmediateLoadToggle = () => {
    setImmediateLoad((prev) => !prev);
    immediateLoad ? updateCost(-150) : updateCost(150);
  };

  const handleSecondSwitchToggle = () => {
    setSecondSwitch((prev) => !prev);
    secondSwitch ? updateCost(-100) : updateCost(100);
  };

  const handleThirdSwitchToggle = () => {
    setThirdSwitch((prev) => !prev);
    thirdSwitch ? updateCost(-300) : updateCost(300);
  };

  const handleFourthSwitchToggle = () => {
    setFourthSwitch((prev) => !prev);
    fourthSwitch ? updateCost(-400) : updateCost(400);
  };

  const handleFifthSwitchToggle = () => {
    setFifthSwitch((prev) => !prev);
    fifthSwitch ? updateCost(0) : updateCost(0);
  };

  const smileDesignToggle = () => {
    setSmileDesign((prev) => !prev);
    smileDesign ? updateCost(-40) : updateCost(40);
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
      originalCost: originalCost,
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

  const handleImplantBrandChange = (index: number, value: string) => {
    setImplantBrandValues((prevValues) => ({
      ...prevValues,
      [index]: value,
    }));
  };

  const handleToothClick = (index) => {
    setSelectedTeeth((prevSelectedTeeth) => {
      if (prevSelectedTeeth.includes(index)) {
        return prevSelectedTeeth.filter((i) => i !== index);
      } else {
        return [...prevSelectedTeeth, index];
      }
    });

    setImplantBrandInputs((prevImplantInputs) => {
      if (prevImplantInputs.includes(index)) {
        return prevImplantInputs.filter((i) => i !== index);
      } else {
        return [...prevImplantInputs, index];
      }
    });
  };

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
            <div className="flex-col mt-3 bg-gray-100 p-4 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold mb-3">
                {language === "french" ? "Détails du cas" : "Case Details"}
              </h2>
              <div className="grid grid-cols-2 gap-2">
                <p className="text-lg">
                  <span className="font-semibold">
                    {language === "french" ? "Patient: " : "Patient: "}
                  </span>
                  {patientData.fullname}
                </p>
                <p>
                  <span className="font-semibold">
                    {language === "french"
                      ? "Numéro du cas: "
                      : "Case number: "}
                  </span>
                  {patientData.caseNumber}
                </p>
                <p>
                  <span className="font-semibold">
                    {language === "french"
                      ? "Offre actuelle: "
                      : "Current offer: "}
                  </span>
                  {currentOffer ? currentOffer.currentPlan : "Loading..."}
                </p>
                <p>
                  <span className="font-semibold">
                    {language === "french" ? "Réduction: " : "Discount: "}
                  </span>
                  {currentOffer ? `${currentOffer.discount}%` : "Loading..."}
                </p>

                <p>
                  <span className="font-semibold">
                    {language === "french" ? "livraison: " : "Delivery: "}
                  </span>
                  {deliveryCost} €
                </p>



              </div>
              <p className="text-center mt-3">
                  <span className="font-semibold">
                    {language === "french" ? "Coût: " : "Cost: "}
                  </span>
                  <span className="text-gray-500 font-bold">
                    ({originalCost.toFixed(2)} - {currentOffer ? `${currentOffer.discount}%` : "Loading..."}) +{deliveryCost} = <span className="text-green-500">{cost.toFixed(2)} €</span>
                  </span>{" "}
                </p>
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
