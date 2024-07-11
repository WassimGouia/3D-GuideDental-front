import React, { useEffect, useState } from "react";
import Container from "@/components/Container";
import Dents from "@/components/Dents";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@radix-ui/react-hover-card";
import { Info } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import Nouvelle from "@/components/Nouvelledemande";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SideBarContainer from "@/components/SideBarContainer";
import { useLanguage } from "@/components/languageContext";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/components/AuthContext";
import { getToken } from "@/components/Helpers";
import axios from "axios";

const GouttiereBruxismes = () => {
  const navigate = useNavigate();
  const [originalCost, setOriginalCost] = useState(0);
  const [cost, setCost] = useState(0);
  const [first, setFirst] = useState(false);
  const [second, setSecond] = useState(false);
  const [comment, setComment] = useState("");
  const [showTextarea, setShowTextarea] = useState(false);
  const [showAdditionalGuides, setShowAdditionalGuides] = useState(false);
  const [impressionCost, setImpressionCost] = useState(0);
  const [additionalGuides, setAdditionalGuides] = useState(0);
  const [selectedTeeth, setSelectedTeeth] = useState([]);
  const upperTeethIndexes = [
    11, 12, 13, 14, 15, 16, 17, 18, 21, 22, 23, 24, 25, 26, 27, 28,
  ];
  const lowerTeethIndexes = [
    31, 32, 33, 34, 35, 36, 37, 38, 41, 42, 43, 44, 45, 46, 47, 48,
  ];
  const [textareaValue, setTextareaValue] = useState("");
  const [currentOffer, setCurrentOffer] = useState(null);
  const [patientData, setPatientData] = useState({
    fullname: "",
    caseNumber: "",
  });
  const { user } = useAuthContext();
  const { language } = useLanguage();

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

              // Set initial costs
              setOriginalCost(0);
              setCost(0);
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

  const applyDiscount = (price, discountPercentage) => {
    return price * (1 - discountPercentage / 100);
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

  const handleSuppressionSwitch = () => {
    setFirst(!first);
    updateCost(!first ? 10 : -10);
    setShowTextarea(!showTextarea);
  };

  const handleTextareaChange = (event) => {
    setTextareaValue(event.target.value);
  };

  const handleImpressionSwitch = () => {
    setSecond(!second);
    if (second) {
      updateCost(-impressionCost);
      setImpressionCost(0);
    } else {
      const newImpressionCost = 40 + additionalGuides * 40;
      setImpressionCost(newImpressionCost);
      updateCost(newImpressionCost);
    }
    setShowAdditionalGuides(!showAdditionalGuides);
  };

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleToothClick = (toothIndex) => {
    setSelectedTeeth((prevSelectedTeeth) => {
      const isUpper = upperTeethIndexes.includes(toothIndex);
      const affectedIndexes = isUpper ? upperTeethIndexes : lowerTeethIndexes;

      const isEntireArchSelected = affectedIndexes.every((index) =>
        prevSelectedTeeth.includes(index)
      );

      const newSelectedTeeth = new Set(prevSelectedTeeth);

      if (isEntireArchSelected) {
        affectedIndexes.forEach((index) => newSelectedTeeth.delete(index));
        updateCost(-100);
      } else {
        affectedIndexes.forEach((index) => newSelectedTeeth.add(index));
        updateCost(100);
      }
      return Array.from(newSelectedTeeth);
    });
  };

  const handleNextClick = () => {
    const yourData = {
      title: language === "french" ? "Gouttière de bruxisme" : "Bruxism splint",
      cost: cost,
      originalCost: originalCost,
      comment: comment,
      additionalGuides: additionalGuides,
      textareaValue: textareaValue,
      selectedTeeth: selectedTeeth,
    };

    navigate("/SelectedItemsPageGbruxisme", {
      state: {
        selectedItemsData: yourData,
        previousState: {
          first: first,
          second: second,
          additionalGuides: additionalGuides,
          textareaValue: textareaValue,
          selectedTeeth: selectedTeeth,
        },
      },
    });
  };

  const isCommentEmpty = comment.trim() === "";

  return (
    <SideBarContainer>
      <div className="m-4">
        <Container>
          <Nouvelle />
          <br />
          <Card className="p-3">
            <div className="flex items-center justify-center">
              <h1 className="font-lato text-5xl">
                {language === "french"
                  ? "Gouttière de bruxisme"
                  : "Bruxism splint"}
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
            </div>
            <br />
            <div className="flex flex-col items-center justify-center ">
              <p>
                {language === "french"
                  ? "Choisissez l'arcade concernée. Si vous souhaitez une autre gouttière pour l'arcade antagoniste, veuillez créer un nouveau cas."
                  : "Choose the concerned arch. If you want another splint for the antagonist arch, please create a new case."}
              </p>
              <div>
                <Dents
                  selectAll={true}
                  selectedTeethData={selectedTeeth}
                  onToothClick={handleToothClick}
                  isReadOnly={false}
                />

                <br />
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
                    <div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          onClick={handleSuppressionSwitch}
                          checked={first}
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
                        checked={second}
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
                    <div className="flex space-x-2">
                      {second && (
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
                              setAdditionalGuides(additionalGuides);
                              const newImpressionCost =
                                40 + additionalGuides * 40;
                              setImpressionCost(newImpressionCost);
                              setCost(
                                cost - impressionCost + newImpressionCost
                              );
                            }}
                          />
                        </>
                      )}
                    </div>
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
                <Link to="/sign/Nouvelle-modelisation">
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

export default GouttiereBruxismes;
