import { useEffect, useState } from "react";
import Container from "@/components/Container";
import Dents from "@/components/Dents";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
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
  ReceiptEuro,
  FileDigit,
  Truck,
  UsersRound,
  Package,
} from "lucide-react";

const GouttiereBruxismes = () => {
  const navigate = useNavigate();
  const [originalCost, setOriginalCost] = useState(0);
  const [cost, setCost] = useState(0);
  const [first, setFirst] = useState(false);
  const [second, setSecond] = useState(false);
  const [comment, setComment] = useState("");
  const [showTextarea, setShowTextarea] = useState(false);
  const [showAdditionalGuides, setShowAdditionalGuides] = useState(false);
  // const [impressionCost, setImpressionCost] = useState(0);
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
  const [deliveryCost, setDeliveryCost] = useState(0);
  const { language } = useLanguage();

  const formSchema = z.object({
    selectedTeeth: z
      .array(z.number())
      .min(1, "Please select at least one tooth"),
    comment: z.string().min(1, "Comment is required"),
    digitalExtraction: z
      .string()
      .optional()
      .refine((val) => !first || (val && val.trim() !== ""), {
        message:
          language === "french"
            ? "Veuillez spécifier les dents à extraire"
            : "Please specify the teeth to be extracted",
      }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      selectedTeeth: [],
      comment: "",
      digitalExtraction: "",
    },
  });

  useEffect(() => {
    const storedFullname = localStorage.getItem("fullName");
    const storedCaseNumber = localStorage.getItem("caseNumber");
    const storedState = localStorage.getItem("guideBruxismeState");

    const restoreState = (parsedState) => {
      setAdditionalGuides(parsedState.additionalGuides);
      setComment(parsedState.comment);
      setCost(parsedState.cost);
      setFirst(parsedState.first);
      setOriginalCost(parsedState.originalCost);
      setSecond(parsedState.second);
      setSelectedTeeth(parsedState.selectedTeeth);
      setTextareaValue(parsedState.textareaValue);

      form.reset({
        selectedTeeth: parsedState.selectedTeeth,
        comment: parsedState.comment,
        digitalExtraction: parsedState.textareaValue, // Add this line
      });
    };

    const fetchOfferData = async (originalCost) => {
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
            const offer = {
              currentPlan: offerData.CurrentPlan,
              discount: getDiscount(offerData.CurrentPlan),
            };
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

    if (!storedFullname || !storedCaseNumber) {
      navigate("/sign/nouvelle-demande");
    } else {
      setPatientData({
        fullname: storedFullname,
        caseNumber: storedCaseNumber,
      });

      if (storedState) {
        try {
          const parsedState = JSON.parse(storedState);
          restoreState(parsedState);
          fetchOfferData(parsedState.originalCost);
        } catch (error) {
          console.error("Error parsing stored state:", error);
          localStorage.removeItem("guideBruxismeState");
          fetchOfferData(0);
        }
      } else {
        setOriginalCost(0);
        setCost(0);
        fetchOfferData(0);
      }
    }

    // Check if we're coming back from the selected items page
    if (location.state && location.state.fromSelectedItems) {
      const storedState = localStorage.getItem("guideBruxismeState");
      if (storedState) {
        try {
          const parsedState = JSON.parse(storedState);
          restoreState(parsedState);
        } catch (error) {
          console.error("Error parsing stored state when returning:", error);
        }
      }
    }
  }, [navigate, user, location, form]);

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
      const europeanCountries = [
        "belgium",
        "portugal",
        "germany",
        "netherlands",
        "luxembourg",
        "italy",
        "spain",
      ];

      // const cost =
      //   country === "france" && second
      //     ? 7
      //     : europeanCountries.includes(country) && second
      //     ? 15
      //     : 0;

      const cost = country === "france" && second  ? 7.5 :
        europeanCountries.includes(country) && second ? 15 : 0;
      
      setDeliveryCost(cost);
    }
  }, [user, second]);

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

  const handleSuppressionSwitch = () => {
    setFirst(!first);
    updateCost(!first ? 10 : -10);
    setShowTextarea(!showTextarea);
  };

  const handleTextareaChange = (event) => {
    setTextareaValue(event.target.value);
  };

  const handleImpressionSwitch = () => {
    setSecond((prevSecond) => {
      const newSecond = !prevSecond;
      if (newSecond) {
        // Adding Formlabs® impression
        updateCost(40 + additionalGuides * 40);
      } else {
        // Removing Formlabs® impression
        updateCost(-(40 + additionalGuides * 40));
        setAdditionalGuides(0);
      }
      setShowAdditionalGuides(newSecond);
      return newSecond;
    });
  };

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleToothClick = (
    toothIndex: number,
    currentSelectedTeeth: number[]
  ) => {
    const isUpper = upperTeethIndexes.includes(toothIndex);
    const affectedIndexes = isUpper ? upperTeethIndexes : lowerTeethIndexes;

    const isEntireArchSelected = affectedIndexes.every((index) =>
      currentSelectedTeeth.includes(index)
    );

    let newSelectedTeeth: number[];

    if (isEntireArchSelected) {
      newSelectedTeeth = currentSelectedTeeth.filter(
        (index) => !affectedIndexes.includes(index)
      );
      updateCost(-100);
    } else {
      newSelectedTeeth = [
        ...new Set([...currentSelectedTeeth, ...affectedIndexes]),
      ];
      updateCost(100);
    }

    setSelectedTeeth(newSelectedTeeth);
    return newSelectedTeeth;
  };
  const handleNextClick = (values: z.infer<typeof formSchema>) => {
    const yourData = {
      title: language === "french" ? "Gouttière de bruxisme" : "Bruxism splint",
      cost: second ? cost + deliveryCost : cost + 0,
      originalCost: originalCost,
      comment: values.comment,
      additionalGuides: additionalGuides,
      textareaValue: values.digitalExtraction, // Update this line
      selectedTeeth: values.selectedTeeth,
      first: first,
      second: second,
    };

    localStorage.setItem("guideBruxismeState", JSON.stringify(yourData));

    navigate("/SelectedItemsPageGbruxisme", {
      state: {
        selectedItemsData: yourData,
        previousState: {
          first: first,
          second: second,
          additionalGuides: additionalGuides,
          textareaValue: first ? textareaValue : "",
          selectedTeeth: values.selectedTeeth,
        },
      },
    });
  };

  const supportedCountries = [
    "france",
    "belgium",
    "portugal",
    "germany",
    "netherlands",
    "luxembourg",
    "italy",
    "spain",
  ];
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
          <Card className="w-full max-w-4xl mx-auto my-8 shadow-lg">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleNextClick)}>
                <CardHeader className="bg-gray-100">
                  <CardTitle className="text-3xl font-bold text-center text-gray-800">
                    {language === "french"
                      ? "Gouttière de bruxisme"
                      : "Bruxism splint"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex-col mt-3 bg-gray-100 p-4 rounded-lg shadow-sm">
                    <h2 className="text-xl font-bold mb-3">
                      {language === "french"
                        ? "Détails du cas"
                        : "Case Details"}
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
                          {currentOffer
                            ? currentOffer.currentPlan
                            : "Loading..."}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Percent className="text-yellow-600" />
                        <p>
                          <span className="font-semibold">
                            {language === "french"
                              ? "Réduction: "
                              : "Discount: "}
                          </span>
                          {currentOffer
                            ? `${currentOffer.discount}%`
                            : "Loading..."}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Truck className="text-yellow-600" />
                        <p>
                          <span className="font-semibold">
                            {language === "french"
                              ? "livraison: "
                              : "Delivery: "}
                          </span>
                          {deliveryCost} €
                        </p>
                      </div>
                    </div>
                    <div className="flex text-center mt-3 space-x-2">
                      <ReceiptEuro className="text-yellow-600" />
                      <span className="font-semibold">
                        {language === "french" ? "Coût: " : "Cost: "}
                      </span>
                      <span className="text-gray-500 font-bold">
                        ({originalCost.toFixed(2)} -{" "}
                        {currentOffer
                          ? `${currentOffer.discount}%`
                          : "Loading..."}
                        ) +{deliveryCost} ={" "}
                        <span className="text-green-500">
                          {(second ? cost + deliveryCost : cost + 0).toFixed(2)}{" "}
                          €
                        </span>
                      </span>{" "}
                    </div>
                  </div>
                  <br />
                  <div className="flex flex-col items-center justify-center ">
                    <FormField
                      control={form.control}
                      name="selectedTeeth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {language === "french"
                              ? "Choisissez l'arcade concernée. Si vous souhaitez une autre gouttière pour l'arcade antagoniste, veuillez créer un nouveau cas."
                              : "Choose the concerned arch. If you want another splint for the antagonist arch, please create a new case."}
                          </FormLabel>
                          <FormControl>
                            <Dents
                              selectAll={true}
                              selectedTeethData={field.value}
                              onToothClick={(toothIndex) => {
                                const newSelectedTeeth = handleToothClick(
                                  toothIndex,
                                  field.value
                                );
                                field.onChange(newSelectedTeeth);
                              }}
                              isReadOnly={false}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                            <FormField
                              control={form.control}
                              name="digitalExtraction"
                              render={({ field }) => (
                                <FormItem className="space-y-0">
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      onClick={() => {
                                        setFirst(!first);
                                        if (!first) {
                                          form.setValue(
                                            "digitalExtraction",
                                            ""
                                          );
                                        }
                                        handleSuppressionSwitch();
                                      }}
                                      checked={first}
                                    />
                                    <FormLabel
                                      className={cn(
                                        form.formState.errors.digitalExtraction
                                          ? "text-red-500"
                                          : ""
                                      )}
                                    >
                                      {language === "french"
                                        ? "Suppression numérique de dents"
                                        : "Digital extraction of teeth"}
                                    </FormLabel>
                                  </div>
                                  {first && (
                                    <FormControl>
                                      <Textarea
                                        {...field}
                                        placeholder={
                                          language === "french"
                                            ? "Veuillez indiquer le numéro des dents à extraire."
                                            : "Please indicate the number of teeth to be extracted."
                                        }
                                        onChange={(e) => {
                                          field.onChange(e);
                                          setTextareaValue(e.target.value);
                                        }}
                                      />
                                    </FormControl>
                                  )}
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          {supportedCountries.includes(country) ? (
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
                          ) : (
                            <></>
                          )}
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
                                  value={additionalGuides}
                                  onChange={(event) => {
                                    const newAdditionalGuides =
                                      parseInt(event.target.value) || 0;
                                    const costDifference =
                                      (newAdditionalGuides - additionalGuides) *
                                      40;
                                    updateCost(costDifference);
                                    setAdditionalGuides(newAdditionalGuides);
                                  }}
                                />
                              </>
                            )}
                          </div>
                          <FormField
                            control={form.control}
                            name="comment"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-lg font-semibold">
                                  {language === "french"
                                    ? "Commentaire sur ce travail:"
                                    : "Comment on this work:"}
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    placeholder={
                                      language === "french"
                                        ? "Ajoutez vos instructions cliniques"
                                        : "Add your clinical instructions"
                                    }
                                    value={comment}
                                    onChange={(e) => {
                                      field.onChange(e);
                                      handleCommentChange(e);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
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
                      type="submit"
                      className="w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2 bg-[#0e0004] text-[#fffa1b] hover:bg-[#211f20] hover:text-[#fffa1b] transition-all mt-9"
                    >
                      {language === "french" ? "Suivant" : "Next"}
                    </Button>
                  </div>
                </CardContent>
              </form>
            </Form>
          </Card>
        </Container>
      </div>
    </SideBarContainer>
  );
};

export default GouttiereBruxismes;
