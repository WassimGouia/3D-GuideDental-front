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
import { Link } from "react-router-dom";
import SideBarContainer from "@/components/SideBarContainer";
import { useLanguage } from "@/components/languageContext";
import { useNavigate } from "react-router-dom";
import { FaTooth } from "react-icons/fa";
import axios from "axios";
import { useAuthContext } from "@/components/AuthContext";
import { getToken } from "@/components/Helpers";

const GuideClassique = () => {
  const [originalCost, setOriginalCost] = useState(50);
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
  const [additionalGuidesClavettes, setAdditionalGuidesClavettes] = useState(0);
  const [additionalGuidesImpression, setAdditionalGuidesImpression] =
    useState(0);
    const [deliveryCost, setDeliveryCost] = useState(0);
  const [implantBrandInputs, setImplantBrandInputs] = useState<number[]>([]);
  const [brandSurgeonKit, setBrandSurgeonKit] = useState("");
  const [implantBrandValues, setImplantBrandValues] = useState({});
  const [textareaValue, setTextareaValue] = useState("");
  const [patientData, setPatientData] = useState({
    fullname: "",
    caseNumber: "",
  });
  const [currentOffer, setCurrentOffer] = useState(null);

  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuthContext();

  // useEffect(() => {
  //   const storedFullname = localStorage.getItem("fullName");
  //   const storedCaseNumber = localStorage.getItem("caseNumber");

  //   if (!storedFullname || !storedCaseNumber) {
  //     navigate("/sign/nouvelle-demande");
  //   } else {
  //     setPatientData({
  //       fullname: storedFullname,
  //       caseNumber: storedCaseNumber,
  //     });

  //     const fetchOfferData = async () => {
  //       const token = getToken();
  //       if (token && user && user.id) {
  //         try {
  //           const userResponse = await axios.get(
  //             `http://localhost:1337/api/users/${user.id}?populate=offre`,
  //             {
  //               headers: {
  //                 Authorization: `Bearer ${token}`,
  //               },
  //             }
  //           );

  //           if (userResponse.data && userResponse.data.offre) {
  //             const offerData = userResponse.data.offre;
  //             const offer = {
  //               currentPlan: offerData.CurrentPlan,
  //               discount: getDiscount(offerData.CurrentPlan),
  //             };
  //             setCurrentOffer(offer);

  //             // Apply initial discount
  //             const discountedCost = applyDiscount(
  //               originalCost,
  //               offer.discount
  //             );
  //             setCost(discountedCost);
  //           } else {
  //             console.error("Offer data not found in the user response");
  //             setCurrentOffer(null);
  //           }
  //         } catch (error) {
  //           console.error("Error fetching offer data:", error);
  //           setCurrentOffer(null);
  //         }
  //       }
  //     };

  //     fetchOfferData();
  //   }
  // }, [navigate, user]);

  useEffect(() => {
    const storedState = localStorage.getItem("guideClassiqueState");
    if (storedState) {
      try {
        const {
          originalCost,
          cost,
          foragePilote,
          fullGuide,
          first,
          second,
          third,
          showAdditionalGuidesInput,
          selectedTeeth,
          showTextarea,
          comment,
          additionalGuidesClavettes,
          additionalGuidesImpression,
          deliveryCost,
          implantBrandInputs,
          brandSurgeonKit,
          implantBrandValues,
          textareaValue,
          patientData,
          currentOffer,
        } = JSON.parse(storedState);

        setOriginalCost(originalCost);
        setCost(cost);
        setForagePilote(foragePilote);
        setFullGuide(fullGuide);
        setFirst(first);
        setSecond(second);
        setThird(third);
        setShowAdditionalGuidesInput(showAdditionalGuidesInput);
        setSelectedTeeth(selectedTeeth);
        setShowTextarea(showTextarea);
        setComment(comment);
        setAdditionalGuidesClavettes(additionalGuidesClavettes);
        setAdditionalGuidesImpression(additionalGuidesImpression);
        setDeliveryCost(deliveryCost);
        setImplantBrandInputs(implantBrandInputs);
        setBrandSurgeonKit(brandSurgeonKit);
        setImplantBrandValues(implantBrandValues);
        setTextareaValue(textareaValue);
        setPatientData(patientData);
        setCurrentOffer(currentOffer);
        console.log("log", implantBrandValues)

        const storedFullname = localStorage.getItem("fullName");
      const storedCaseNumber = localStorage.getItem("caseNumber");

      if (!storedFullname || !storedCaseNumber) {
        navigate("/sign/nouvelle-demande");
      } else {
        setPatientData({ fullname: storedFullname, caseNumber: storedCaseNumber });

        const fetchOfferData = async () => {
          const token = getToken();
          if (token && user && user.id) {
            try {
              const userResponse = await axios.get(
                `http://localhost:1337/api/users/${user.id}?populate=offre`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              if (userResponse.data && userResponse.data.offre) {
                const offerData = userResponse.data.offre;
                const offer = { currentPlan: offerData.CurrentPlan, discount: getDiscount(offerData.CurrentPlan) };
                setCurrentOffer(offer);
                const discountedCost = applyDiscount(originalCost, offer.discount);
                setCost(discountedCost);
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
      } catch (error) {
        console.error("Error parsing stored state:", error);
        localStorage.removeItem("guideClassiqueState");
      }
    } else {
      const storedFullname = localStorage.getItem("fullName");
      const storedCaseNumber = localStorage.getItem("caseNumber");

      if (!storedFullname || !storedCaseNumber) {
        navigate("/sign/nouvelle-demande");
      } else {
        setPatientData({ fullname: storedFullname, caseNumber: storedCaseNumber });

        const fetchOfferData = async () => {
          const token = getToken();
          if (token && user && user.id) {
            try {
              const userResponse = await axios.get(
                `http://localhost:1337/api/users/${user.id}?populate=offre`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              if (userResponse.data && userResponse.data.offre) {
                const offerData = userResponse.data.offre;
                const offer = { currentPlan: offerData.CurrentPlan, discount: getDiscount(offerData.CurrentPlan) };
                setCurrentOffer(offer);
                const discountedCost = applyDiscount(originalCost, offer.discount);
                setCost(discountedCost);
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

  useEffect(() => {
    if (user && user.location && user.location[0] && user.location[0].country) {
      const country = user.location[0].country.toLocaleLowerCase();
      const europeanCountries = ["belgium", "portugal", "germany", "netherlands", "luxembourg", "italy", "spain"];

      const cost = country === "france" && third  ? 7 :
        europeanCountries.includes(country) && third ? 15 : 0;
      
      setDeliveryCost(cost);
    }
  }, [user,third]);

  const applyDiscount = (price, discountPercentage) => {
  const discountedPrice = price * (1 - discountPercentage / 100);
  return discountedPrice;
};

  const updateCost = (change) => {
    setOriginalCost((prevOriginalCost) => {
      const newOriginalCost = prevOriginalCost + change;
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

  const handleCommentChange = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setComment(e.target.value);
  };

  const handleSmileDesignSwitch = () => {
    setFirst(!first);
    updateCost(!first ? 40 : -40);
  };

  const handleSuppressionSwitch = () => {
    setSecond(!second);
    updateCost(!second ? 10 : -10);
    setShowTextarea(!showTextarea);
  };

  const handleTextareaChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setTextareaValue(event.target.value);
  };

  const handleAdditionalGuidesSwitch = () => {
    setShowAdditionalGuidesInput((prev) => {
      const newShowAdditionalGuidesInput = !prev;
      if (!newShowAdditionalGuidesInput) {
        // Removing Stabilization pins
        updateCost(-additionalGuidesClavettes * 30);
        setAdditionalGuidesClavettes(0);
      }
      return newShowAdditionalGuidesInput;
    });
  };

  const handleImpressionSwitch = () => {
    setThird((prevThird) => {
      const newThird = !prevThird;
      if (newThird) {
        // Adding Formlabs® impression
        updateCost(40 + additionalGuidesImpression * 40);
      } else {
        // Removing Formlabs® impression
        updateCost(-(40 + additionalGuidesImpression * 40));
        setAdditionalGuidesImpression(0);
      }
      return newThird;
    });
  };

  const handleToothClick = (index: number) => {
    if (selectedTeeth.includes(index)) {
      setSelectedTeeth(selectedTeeth.filter((i) => i !== index));
      updateCost(-30);
      setImplantBrandInputs(implantBrandInputs.filter((i) => i !== index));
    } else {
      setSelectedTeeth([...selectedTeeth, index]);
      updateCost(30);
      setImplantBrandInputs([...implantBrandInputs, index]);
    }
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
      cost: third ? cost+ deliveryCost : cost+ 0,
      originalCost: originalCost,
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
      textareaValue: second ? textareaValue : "",
      selectedTeeth: selectedTeeth,
      implantBrandInputs: implantBrandInputs,
    };

    localStorage.setItem("guideClassiqueState", JSON.stringify(yourData));

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
          textareaValue: second ? textareaValue : "",
          selectedTeeth: selectedTeeth,
        },
      },
    });
  };
console.log("additionalGuidesImpression",additionalGuidesImpression)
  const isCommentFilled = comment.trim() !== "";
  const supportedCountries = ["france", "belgium", "portugal", "germany", "netherlands", "luxembourg", "italy", "spain"];
  const country = user && user.location[0].country.toLowerCase();
  if (!user) {
    return <div>Loading...</div>; // or any other loading indicator
  }
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
                  <p>
                    <span className="font-semibold">
                      {language === "french" ? "Coût: " : "Cost: "}
                    </span>
                    <span className="line-through">
                      {originalCost.toFixed(2)} €
                    </span>{" "}
                    <span className="font-bold text-green-600">
                      {cost.toFixed(2)} €
                    </span>
                  </p>
                </div>
                <p className="text-center mt-3">
                  <span className="font-semibold">
                    {language === "french" ? "Coût: " : "Cost: "}
                  </span>
                  <span className="text-gray-500 font-bold">
                    ({originalCost.toFixed(2)} - {currentOffer ? `${currentOffer.discount}%` : "Loading..."}) +{deliveryCost} = <span className="text-green-500">{(third ? cost+ deliveryCost : cost+ 0).toFixed(2)} €</span>
                  </span>{" "}
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
                          value={implantBrandValues[index] || ""}
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
                  <Switch onClick={handleAdditionalGuidesSwitch} checked={showAdditionalGuidesInput}  />
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
                          const newAdditionalGuides =
                            parseInt(event.target.value) || 0;
                          const costDifference =
                            (newAdditionalGuides - additionalGuidesClavettes) *
                            30;
                          updateCost(costDifference);
                          setAdditionalGuidesClavettes(newAdditionalGuides);
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
                    {second && (
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
                  {supportedCountries.includes(country) ? (
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
                ) : (
                  <></>
                )}
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
                        value={additionalGuidesImpression}
                        onChange={(event) => {
                          const newAdditionalGuides =
                            parseInt(event.target.value) || 0;
                          const costDifference =
                            (newAdditionalGuides - additionalGuidesImpression) *
                            40;
                          updateCost(costDifference);
                          setAdditionalGuidesImpression(newAdditionalGuides);
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
