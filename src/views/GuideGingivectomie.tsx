import { useEffect, useState } from "react";
import Container from "@/components/Container";
import Dents from "@/components/Dents";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useAuthContext } from "@/components/AuthContext";
import { getToken } from "@/components/Helpers";
import axios from "axios";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { cn } from "@/lib/utils";

const GuideGingivectomie = () => {
  const navigate = useNavigate();
  const [originalCost, setOriginalCost] = useState(100);
  const [cost, setCost] = useState(100);
  const [first, setFirst] = useState(false);
  const [second, setSecond] = useState(false);
  const [third, setThird] = useState(false);
  const [fourth, setFourth] = useState(false);
  const [comment, setComment] = useState("");
  const [showTextarea, setShowTextarea] = useState(false);
  const [additionalGuides, setAdditionalGuides] = useState(0);
  const [textareaValue, setTextareaValue] = useState("");
  const [selectedTeeth, setSelectedTeeth] = useState([]);
  const [patientData, setPatientData] = useState({
    fullname: "",
    caseNumber: "",
  });
  const [currentOffer, setCurrentOffer] = useState(null);
  const { user } = useAuthContext();
  const { language } = useLanguage();
  const [deliveryCost, setDeliveryCost] = useState(0);

  const formSchema = z.object({
    selectedTeeth: z
      .array(z.number())
      .min(1, "Please select at least one tooth"),
    comment: z.string().min(1, "Comment is required"),
    digitalExtraction: z
      .string()
      .optional()
      .refine((val) => !third || (val && val.trim() !== ""), {
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
    const storedState = localStorage.getItem("guideginState");

    if (!storedFullname || !storedCaseNumber) {
      navigate("/sign/nouvelle-demande");
      return;
    }

    setPatientData({
      fullname: storedFullname,
      caseNumber: storedCaseNumber,
    });

    const restoreState = (parsedState) => {
      setAdditionalGuides(parsedState.additionalGuides);
      setFourth(parsedState.fourth);
      setOriginalCost(parsedState.originalCost);
      setCost(parsedState.cost);
      setFirst(parsedState.first);
      setSecond(parsedState.second);
      setThird(parsedState.third);
      setSelectedTeeth(parsedState.selectedTeeth);
      setComment(parsedState.comment);
      setTextareaValue(parsedState.textareaValue);

      form.reset({
        selectedTeeth: parsedState.selectedTeeth,
        comment: parsedState.comment,
        digitalExtraction: parsedState.textareaValue,
      });
    };

    if (storedState) {
      try {
        const parsedState = JSON.parse(storedState);
        restoreState(parsedState);
      } catch (error) {
        console.error("Error parsing stored state:", error);
        localStorage.removeItem("guideginState");
      }
    }

    const fetchOfferData = async () => {
      const token = getToken();
      if (token && user && user.id) {
        try {
          const userResponse = await axios.get(
            `https://admin.3dguidedental.com/api/users/${user.id}?populate=offre`,
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

    fetchOfferData();


    if (location.state && location.state.fromSelectedItems) {
      const storedState = localStorage.getItem("guideginState");
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
      //   country === "france" && fourth
      //     ? 7
      //     : europeanCountries.includes(country) && fourth
      //     ? 15
      //     : 0;

      const cost = country === "france" && fourth  ? 7.5 :
        europeanCountries.includes(country) && fourth ? 15 : 0;
      
      setDeliveryCost(cost);
    }
  }, [user, fourth]);

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

  const handleDicomSwitch = () => {
    setFirst(!first);
    updateCost(!first ? 100 : -100);
  };

  const handleSmileDesignSwitch = () => {
    setSecond(!second);
    updateCost(!second ? 40 : -40);
  };

  const handleSuppressionSwitch = () => {
    setThird(!third);
    updateCost(!third ? 10 : -10);
    setShowTextarea(!showTextarea);
  };

  const handleImpressionSwitch = () => {
    setFourth((prevFourth) => {
      const newFourth = !prevFourth;
      if (newFourth) {
        // Adding Formlabs® impression
        updateCost(40 + additionalGuides * 40);
      } else {
        // Removing Formlabs® impression
        updateCost(-(40 + additionalGuides * 40));
        setAdditionalGuides(0);
      }
      return newFourth;
    });
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

  // const isCommentEmpty = !comment.trim();

  const handleNextClick = (values: z.infer<typeof formSchema>) => {
    const yourData = {
      title:
        language === "french"
          ? "Guide pour gingivectomie"
          : "Gingivectomy guide",
      cost: fourth ? cost + deliveryCost : cost + 0,
      originalCost: originalCost,
      first: first,
      second: second,
      third: third,
      fourth: fourth,
      comment: values.comment,
      additionalGuides: additionalGuides,
      textareaValue: values.digitalExtraction,
      selectedTeeth: values.selectedTeeth,
    };

    localStorage.setItem("guideginState", JSON.stringify(yourData));

    navigate("/selectedItemsPageGging", {
      state: {
        selectedItemsData: yourData,
        previousStates: {
          first: first,
          second: second,
          third: third,
          fourth: fourth,
          additionalGuides: additionalGuides,
          textareaValue: values.digitalExtraction, 
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
    return <div>Loading...</div>;
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
                      ? "Guide pour gingivectomie"
                      : "Gingivectomy guide"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div>
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
                              {language === "french"
                                ? "Patient: "
                                : "Patient: "}
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
                            {(fourth ? cost + deliveryCost : cost + 0).toFixed(
                              2
                            )}{" "}
                            €
                          </span>
                        </span>{" "}
                      </div>
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
                            <h1 className="font-bold">
                              {language === "french"
                                ? "Sélectionner la (les) dent(s) à traiter."
                                : "Select the tooth (teeth) to be treated."}
                            </h1>
                          </FormLabel>
                          <FormDescription>
                            {language === "french"
                              ? "Si vous souhaitez un guide pour les deux arcades, veuillez ajouter une tâche par arcade."
                              : "Select the tooth (teeth) to treat. If you want to have a guide for both arches, please add a task for each arch."}
                          </FormDescription>
                          <FormControl>
                            <Dents
                              selectAll={false}
                              selectedTeethData={field.value}
                              onToothClick={(toothIndex) => {
                                const newSelectedTeeth = field.value.includes(
                                  toothIndex
                                )
                                  ? field.value.filter((t) => t !== toothIndex)
                                  : [...field.value, toothIndex];
                                field.onChange(newSelectedTeeth);
                                setSelectedTeeth(newSelectedTeeth); // Update local state as well
                              }}
                              isReadOnly={false}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                            <FormField
                              control={form.control}
                              name="digitalExtraction"
                              render={({ field }) => (
                                <FormItem className="space-y-0">
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      onClick={() => {
                                        setThird(!third);
                                        if (!third) {
                                          form.setValue(
                                            "digitalExtraction",
                                            ""
                                          );
                                        }
                                        handleSuppressionSwitch();
                                      }}
                                      checked={third}
                                    />
                                    <p
                                      className={cn(
                                        form.formState.errors.digitalExtraction
                                          ? "text-red-500"
                                          : ""
                                      )}
                                    >
                                      {language === "french"
                                        ? "Suppression numérique de dents"
                                        : "Digital extraction of teeth"}
                                    </p>
                                  </div>
                                  {third && (
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
                          ) : (
                            <></>
                          )}
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
                          <FormField
                            control={form.control}
                            name="comment"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-semibold text-lg">
                                  {language === "french"
                                    ? "Commentaire sur ce travail:"
                                    : "Comment on this work:"}
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder={
                                      language === "french"
                                        ? "Ajoutez vos instructions cliniques"
                                        : "Add your clinical instructions"
                                    }
                                    {...field}
                                    onChange={(e) => {
                                      field.onChange(e);
                                      setComment(e.target.value); // Update local state as well
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
                    <Link to="/sign/Nouvelle-modelisation">
                      <Button className="w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2 bg-[#fffa1b] text-[#0e0004] hover:bg-[#fffb1bb5] hover:text-[#0e0004] transition-all mt-9">
                        {language === "french" ? "Précédent" : "Previous"}
                      </Button>
                    </Link>
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

export default GuideGingivectomie;
