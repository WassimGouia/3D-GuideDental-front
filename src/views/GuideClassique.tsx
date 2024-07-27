import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [showStabilizationPins, setShowStabilizationPins] = useState(false);
  const [showDigitalExtraction, setShowDigitalExtraction] = useState(false);
  const [showFormlabsImpression, setShowFormlabsImpression] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(null);

  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuthContext();

  console.log("mmmmmmmmmmmmmmmmmmmmmm:",showStabilizationPins)

  const formSchema = z
    .object({
      selectedTeeth: z
        .array(z.number())
        .min(1, "Please select at least one tooth"),
      drillingType: z.enum(["foragePilote", "fullGuide"], {
        required_error: "Please select either Pilot drilling or Fully guided",
      }),
      brandSurgeonKit: z.string().min(1, "Surgical kit brand is required"),
      implantBrandValues: z.record(
        z.string().min(1, "Implant brand is required")
      ),
      comment: z.string().min(1, "Comment is required"),
      stabilizationPins: z.number().min(0).optional(),
      formlabsImpression: z.number().min(0).optional(),
      smileDesign: z.boolean().optional(),
      digitalExtraction: z
        .string()
        .optional()
        .refine((val) => !showDigitalExtraction || (val && val.trim() !== ""), {
          message:
            language === "french"
              ? "Veuillez spécifier les dents à extraire"
              : "Please specify the teeth to be extracted",
        }),
    })
    .refine(
      (data) => {
        if (
          showStabilizationPins &&
          (!data.stabilizationPins || data.stabilizationPins < 1)
        ) {
          return false;
        }
        if (
          showDigitalExtraction &&
          (!data.digitalExtraction || data.digitalExtraction.trim() === "")
        ) {
          return false;
        }
        return true;
      },
      {
        message:
          language === "french"
            ? "Veuillez remplir tous les champs sélectionnés avec des valeurs valides."
            : "Please fill in all selected fields with valid values.",
        path: ["formErrors"],
      }
    );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      selectedTeeth: [],
      drillingType: undefined,
      brandSurgeonKit: "",
      implantBrandValues: {},
      comment: "",
      stabilizationPins: 0,
      digitalExtraction: "",
      formlabsImpression: 0,
      smileDesign: false,
    },
  });

  useEffect(() => {
    if (!showStabilizationPins) {
      form.setValue("stabilizationPins", 0);
    }
    if (!showDigitalExtraction) {
      form.setValue("digitalExtraction", "");
    }
    if (!showFormlabsImpression) {
      form.setValue("formlabsImpression", 0);
    }
  }, [
    showStabilizationPins,
    showDigitalExtraction,
    showFormlabsImpression,
    form,
  ]);

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
        console.log("log", implantBrandValues);

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
    const savedState = localStorage.getItem("guideClassiqueState");
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      setSelectedTeeth(parsedState.selectedTeeth || []);
      form.setValue("selectedTeeth", parsedState.selectedTeeth || []);
    }
  }, []);

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

      const cost = country === "france" && third  ? 7.5 :
        europeanCountries.includes(country) && third ? 15 : 0;
      
      setDeliveryCost(cost);
    }
  }, [user, third]);

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

  useEffect(() => {
    const storedState = localStorage.getItem("guideClassiqueState");
    if (storedState) {
      try {
        const parsedState = JSON.parse(storedState);

        setOriginalCost(parsedState.originalCost);
        setCost(parsedState.cost);
        setForagePilote(parsedState.foragePilote);
        setFullGuide(parsedState.fullGuide);
        setFirst(parsedState.first);
        setSecond(parsedState.second);
        setThird(parsedState.third);
        setShowAdditionalGuidesInput(parsedState.showAdditionalGuidesInput);
        setSelectedTeeth(parsedState.selectedTeeth);
        setShowTextarea(parsedState.showTextarea);
        setComment(parsedState.comment);
        setAdditionalGuidesClavettes(parsedState.additionalGuidesClavettes);
        setAdditionalGuidesImpression(parsedState.additionalGuidesImpression);
        setDeliveryCost(parsedState.deliveryCost);
        setImplantBrandInputs(parsedState.implantBrandInputs);
        setBrandSurgeonKit(parsedState.brandSurgeonKit);
        setImplantBrandValues(parsedState.implantBrandValues);
        setTextareaValue(parsedState.textareaValue);
        setShowStabilizationPins(!!parsedState.stabilizationPins);
        setShowDigitalExtraction(!!parsedState.digitalExtraction);

        form.reset({
          selectedTeeth: parsedState.selectedTeeth,
          drillingType: parsedState.foragePilote ? "foragePilote" : "fullGuide",
          brandSurgeonKit: parsedState.brandSurgeonKit,
          implantBrandValues: parsedState.implantBrandValues,
          comment: parsedState.comment,
          stabilizationPins: parsedState.stabilizationPins,
          digitalExtraction: parsedState.digitalExtraction,
          smileDesign: parsedState.smileDesign,
          formlabsImpression: parsedState.formlabsImpression,
        });
      } catch (error) {
        console.error("Error parsing stored state:", error);
        localStorage.removeItem("guideClassiqueState");
      }
    }
  }, [form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Handle form submission
    console.log(values);
    handleNextClickClassique(values);
  };

  const handleNextClickClassique = (values: z.infer<typeof formSchema>) => {
    const yourData = {
      title: language === "french" ? "Guide classique" : "Classic guide",
      cost: third ? cost + deliveryCost : cost,
      originalCost: originalCost,
      first: first,
      second: second,
      third: third,
      comment: values.comment,
      showAdditionalGuidesInput: showAdditionalGuidesInput,
      selectedSwitchLabel:
        values.drillingType === "foragePilote"
          ? language === "french"
            ? "Forage pilote"
            : "Pilot drilling"
          : language === "french"
          ? "Full guidée"
          : "Fully guided",
      brandSurgeonKit: values.brandSurgeonKit,
      implantBrandValues: values.implantBrandValues,
      implantBrandInputs: implantBrandInputs,
      selectedSwitch: { checked: values.drillingType === "foragePilote" },
      foragePilote: values.drillingType === "foragePilote",
      fullGuide: values.drillingType === "fullGuide",
      additionalGuidesClavettes: values.stabilizationPins,
      additionalGuidesImpression: additionalGuidesImpression,
      textareaValue: values.digitalExtraction,
      selectedTeeth: values.selectedTeeth,
      stabilizationPins: values.stabilizationPins,
      smileDesign: first,
      digitalExtraction: values.digitalExtraction,
      formlabsImpression: additionalGuidesImpression,
      showStabilizationPins:showStabilizationPins
    };

    localStorage.setItem("guideClassiqueState", JSON.stringify(yourData));

    navigate("/SelectedItemsPageGclassique", {
      state: {
        selectedItemsData: yourData,
        previousStates: {
          first: first,
          second: second,
          third: third,
          showStabilizationPins:showStabilizationPins,
          showAdditionalGuidesInput: showAdditionalGuidesInput,
          implantBrandValues: values.implantBrandValues,
          implantBrandInputs: implantBrandInputs,
          brandSurgeonKit: values.brandSurgeonKit,
          additionalGuidesClavettes: values.stabilizationPins,
          additionalGuidesImpression: additionalGuidesImpression,
          textareaValue: values.digitalExtraction,
          selectedTeeth: values.selectedTeeth,
          drillingType: values.drillingType,
          comment: values.comment,
          stabilizationPins: values.stabilizationPins,
          smileDesign: first,
          digitalExtraction: values.digitalExtraction,
          formlabsImpression: additionalGuidesImpression,
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
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader className="bg-gray-100">
                  <CardTitle className="text-3xl font-bold text-center text-gray-800">
                    {language === "french"
                      ? "Guide classique"
                      : "Classic guide"}
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
                          {(third ? cost + deliveryCost : cost + 0).toFixed(2)}{" "}
                          €
                        </span>
                      </span>{" "}
                    </div>
                  </div>
                  <br />
                  <div>
                    <div className="flex flex-col items-center justify-center ">
                      <FormField
                        control={form.control}
                        name="selectedTeeth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-lg font-semibold">
                              {language === "french"
                                ? "Sélectionner la (les) dent(s) à traiter."
                                : "Select the tooth (teeth) to treat."}
                            </FormLabel>
                            <FormDescription>
                              {language === "french"
                                ? "Si vous souhaitez un guide pour les deux arcades, veuillez ajouter une tâche par arcade."
                                : "If you require a guide for both arches, please add a task per arch."}
                            </FormDescription>
                            <FormControl>
                              <Dents
                                selectAll={false}
                                selectedTeethData={field.value}
                                onToothClick={(index) => {
                                  const updatedTeeth = field.value.includes(
                                    index
                                  )
                                    ? field.value.filter((t) => t !== index)
                                    : [...field.value, index];
                                  field.onChange(updatedTeeth);
                                  handleToothClick(index);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <br />
                      <FormField
                        control={form.control}
                        name="drillingType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-lg font-semibold">
                              {language === "french"
                                ? "Type de forage"
                                : "Drilling Type"}
                            </FormLabel>
                            <FormControl>
                              <div className="flex space-x-2">
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={field.value === "foragePilote"}
                                    onCheckedChange={() => {
                                      handleForagePiloteSwitch();
                                      field.onChange("foragePilote");
                                    }}
                                  />
                                  <Label htmlFor="forage-pilote">
                                    {language === "french"
                                      ? "Forage pilote"
                                      : "Pilot drilling"}
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={field.value === "fullGuide"}
                                    onCheckedChange={() => {
                                      handleFullGuideSwitch();
                                      field.onChange("fullGuide");
                                    }}
                                  />
                                  <Label htmlFor="full-guide">
                                    {language === "french"
                                      ? "Full guidée"
                                      : "Fully guided"}
                                  </Label>
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                      <FormField
                        control={form.control}
                        name="brandSurgeonKit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-lg font-semibold">
                              {language === "french"
                                ? "Marque de la trousse de chirurgie utilisée:"
                                : "Brand of the surgical kit used:"}
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Ex: IDI, Nobel, Straumann ..."
                                className="w-2/5"
                                onChange={(e) => {
                                  field.onChange(e);
                                  setBrandSurgeonKit(e.target.value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="space-y-4 mt-4">
                        <h2 className="text-lg font-semibold">
                          {language === "french"
                            ? "Marque de l'implant pour la dent:"
                            : "Brand of the implant for the tooth:"}
                        </h2>
                        {implantBrandInputs.map((index) => (
                          <FormField
                            key={index}
                            control={form.control}
                            name={`implantBrandValues.${index}`}
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-4">
                                <FormLabel className="flex items-center space-x-2 min-w-[60px]">
                                  <FaTooth />
                                  <span>{index}</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Ex: IDI, Nobel, Straumann ..."
                                    className="w-2/5"
                                    value={implantBrandValues[index] || ""}
                                    onChange={(e) => {
                                      handleImplantBrandChange(
                                        index,
                                        e.target.value
                                      );
                                      field.onChange(e);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
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
                      <FormField
                        control={form.control}
                        name="stabilizationPins"
                        render={({ field }) => (
                          <FormItem className="space-y-0">
                            <div className="flex items-center space-x-2">
                              <Switch
                                onClick={() => {
                                  setShowStabilizationPins(
                                    !showStabilizationPins
                                  );
                                  if (!showStabilizationPins) {
                                    form.setValue("stabilizationPins", 0);
                                  }
                                }}
                                checked={showStabilizationPins}
                              />
                              <FormLabel
                                className={cn(
                                  form.formState.errors.stabilizationPins
                                    ? "text-red-500"
                                    : ""
                                )}
                              >
                                {language === "french"
                                  ? "Clavettes de stabilisation"
                                  : "Stabilization pins"}
                              </FormLabel>
                            </div>
                            {showStabilizationPins && (
                              <FormControl>
                                <Input
                                  className="w-2/5"
                                  type="number"
                                  min="1"
                                  {...field}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    field.onChange(value);
                                    setAdditionalGuidesClavettes(value);
                                    updateCost(
                                      (value - additionalGuidesClavettes) * 30
                                    );
                                  }}
                                />
                              </FormControl>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                          <Switch
                            onClick={handleSmileDesignSwitch}
                            checked={first}
                          />
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
                          <FormField
                            control={form.control}
                            name="digitalExtraction"
                            render={({ field }) => (
                              <FormItem className="space-y-0">
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    onClick={() => {
                                      setShowDigitalExtraction(
                                        !showDigitalExtraction
                                      );
                                      if (!showDigitalExtraction) {
                                        form.setValue("digitalExtraction", "");
                                      }
                                    }}
                                    checked={showDigitalExtraction}
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
                                {showDigitalExtraction && (
                                  <FormControl>
                                    <Textarea
                                      {...field}
                                      placeholder={
                                        language === "french"
                                          ? "Veuillez indiquer le numéro des dents à extraire."
                                          : "Please indicate the number of teeth to be extracted."
                                      }
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
                              checked={third}
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
                                  (newAdditionalGuides -
                                    additionalGuidesImpression) *
                                  40;
                                updateCost(costDifference);
                                setAdditionalGuidesImpression(
                                  newAdditionalGuides
                                );
                              }}
                            />
                          </>
                        )}
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

export default GuideClassique;
