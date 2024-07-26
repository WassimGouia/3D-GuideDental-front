import Container from "@/components/Container";
import Dents from "@/components/Dents";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Percent,
  ReceiptEuro,
  FileDigit,
  Truck,
  UsersRound,
  Package,
} from "lucide-react";

const GuideEtage = () => {
  const { completeStep } = useStepTracking();
  const navigate = useNavigate();
  const [originalCost, setOriginalCost] = useState(450);
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
  const [formState, setFormState] = useState({
    originalCost: 450,
    cost: 450,
    immediateLoad: false,
    secondSwitch: false,
    thirdSwitch: false,
    fourthSwitch: false,
    fifthSwitch: false,
    smileDesign: false,
    comment: "",
    foragePilote: false,
    fullGuide: false,
    selectedTeeth: [],
    implantBrandInputs: [],
    selectSurgicalKitBrand: "",
    lateralPinBrand: "",
    implantBrandValues: {},
  });
  const [patientData, setPatientData] = useState({
    fullname: "",
    caseNumber: "",
  });

  interface Offer {
    currentPlan: string;
    discount: number;
  }

  const formSchema = z.object({
    selectedTeeth: z
      .array(z.number())
      .min(1, "Please select at least one tooth"),
    drillingType: z.enum(["foragePilote", "fullGuide"], {
      required_error: "Please select either Pilot drilling or Fully guided",
    }),
    lateralPinBrand: z.string().min(1, "Lateral pin brand is required"),
    selectSurgicalKitBrand: z.string().min(1, "Surgical kit brand is required"),
    implantBrandValues: z.record(
      z.string().min(1, "Implant brand is required")
    ),
    comment: z.string().min(1, "Comment is required"),
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("Form submitted with values:", values);
    handleNextClick(values);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      selectedTeeth: [],
      drillingType: undefined,
      lateralPinBrand: "",
      selectSurgicalKitBrand: "",
      implantBrandValues: {},
      comment: "",
    },
  });

  const [currentOffer, setCurrentOffer] = useState<Offer | null>(null);
  const { user } = useAuthContext();
  const { language } = useLanguage();

  useEffect(() => {
    const storedFormState = localStorage.getItem("guideEtageFormState");
    const locationState = location.state;
    const storedFullname = localStorage.getItem("fullName");
    const storedCaseNumber = localStorage.getItem("caseNumber");

    const setStateFromData = (data) => {
      setFormState(data);
      setSelectedTeeth(data.selectedTeeth || []);
      setImplantBrandInputs(data.implantBrandInputs || []);
      setImplantBrandValues(data.implantBrandValues || {});
      setLateralPinBrand(data.lateralPinBrand || "");
      setSelectSurgicalKitBrand(data.selectSurgicalKitBrand || "");
      setComment(data.comment || "");
      setImmediateLoad(data.immediateLoad || false);
      setSecondSwitch(data.secondSwitch || false);
      setThirdSwitch(data.thirdSwitch || false);
      setFourthSwitch(data.fourthSwitch || false);
      setFifthSwitch(data.fifthSwitch || false);
      setSmileDesign(data.smileDesign || false);
      setForagePilote(data.foragePilote || false);
      setFullGuide(data.fullGuide || false);
      setCost(data.cost || 450);
      setOriginalCost(data.originalCost || 450);

      form.reset({
        selectedTeeth: data.selectedTeeth || [],
        drillingType: data.foragePilote ? "foragePilote" : "fullGuide",
        lateralPinBrand: data.lateralPinBrand || "",
        selectSurgicalKitBrand: data.selectSurgicalKitBrand || "",
        implantBrandValues: data.implantBrandValues || {},
        comment: data.comment || "",
      });
    };

    if (!storedFullname || !storedCaseNumber) {
      navigate("/sign/nouvelle-demande");
    } else {
      setPatientData({
        fullname: storedFullname,
        caseNumber: storedCaseNumber,
      });

      if (locationState) {
        setStateFromData(locationState);
      } else if (storedFormState) {
        const parsedState = JSON.parse(storedFormState);
        setStateFromData(parsedState);
      }

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

            if (userResponse.data && userResponse.data.offre) {
              const offerData = userResponse.data.offre;
              const offer = {
                currentPlan: offerData.CurrentPlan,
                discount: getDiscount(offerData.CurrentPlan),
              };
              setCurrentOffer(offer);

              const discountedCost = applyDiscount(
                formState.originalCost,
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
  }, [navigate, location, form, user]);

  const getDiscount = (plan) => {
    const discounts = {
      Essential: 5,
      Privilege: 10,
      Elite: 15,
      Premium: 20,
    };
    return discounts[plan] || 0;
  };

  const deliveryCost =
    user && user.location[0].country?.toLocaleLowerCase() === "france"
      ? 7.5
      : 15;

  const updateFormState = (field, value, costChange = 0) => {
    setFormState((prevState) => {
      const newState = { ...prevState, [field]: value };
      const newOriginalCost =
        prevState.originalCost + (value ? costChange : -costChange);
      const newDiscountedCost = currentOffer
        ? applyDiscount(newOriginalCost, currentOffer.discount)
        : newOriginalCost;
      return {
        ...newState,
        originalCost: newOriginalCost,
        cost: newDiscountedCost,
      };
    });
  };

  const applyDiscount = (price, discountPercentage) => {
    const discountedPrice = price * (1 - discountPercentage / 100);
    return discountedPrice + deliveryCost;
  };

  const updateCost = (change) => {
    setFormState((prevState) => {
      const newOriginalCost = prevState.originalCost + change;
      const newDiscountedCost = currentOffer
        ? applyDiscount(newOriginalCost, currentOffer.discount)
        : newOriginalCost;
      return {
        ...prevState,
        originalCost: newOriginalCost,
        cost: newDiscountedCost,
      };
    });
  };

  const handleSwitchToggle = (field, costChange = 0) => {
    setFormState((prevState) => {
      const newState = { ...prevState, [field]: !prevState[field] };
      updateCost(newState[field] ? costChange : -costChange);
      return newState;
    });
    form.setValue(field, !form.getValues(field));
  };

  const handleImmediateLoadToggle = () =>
    updateFormState("immediateLoad", !formState.immediateLoad, 150);
  const handleSecondSwitchToggle = () =>
    updateFormState("secondSwitch", !formState.secondSwitch, 100);
  const handleThirdSwitchToggle = () =>
    updateFormState("thirdSwitch", !formState.thirdSwitch, 300);
  const handleFourthSwitchToggle = () =>
    updateFormState("fourthSwitch", !formState.fourthSwitch, 400);
  const handleFifthSwitchToggle = () =>
    updateFormState("fifthSwitch", !formState.fifthSwitch);
  const smileDesignToggle = () =>
    updateFormState("smileDesign", !formState.smileDesign, 40);

  const handleForagePiloteSwitch = () => {
    updateFormState("foragePilote", true);
    updateFormState("fullGuide", false);
    form.setValue("drillingType", "foragePilote");
  };

  const handleFullGuideSwitch = () => {
    updateFormState("foragePilote", false);
    updateFormState("fullGuide", true);
    form.setValue("drillingType", "fullGuide");
  };

  // const handleForagePiloteSwitch = () => {
  //   setForagePilote(true);
  //   setFullGuide(false);
  //   form.setValue("drillingType", "foragePilote");
  // };

  // const handleFullGuideSwitch = () => {
  //   setFullGuide(true);
  //   setForagePilote(false);
  //   form.setValue("drillingType", "fullGuide");
  // };

  // const handleImmediateLoadToggle = () => {
  //   setImmediateLoad((prev) => {
  //     const newValue = !prev;
  //     updateCost(newValue ? 150 : -150);
  //     return newValue;
  //   });
  // };

  // const handleSecondSwitchToggle = () => {
  //   setSecondSwitch((prev) => {
  //     const newValue = !prev;
  //     updateCost(newValue ? 100 : -100);
  //     return newValue;
  //   });
  // };

  // const handleThirdSwitchToggle = () => {
  //   setThirdSwitch((prev) => {
  //     const newValue = !prev;
  //     updateCost(newValue ? 300 : -300);
  //     return newValue;
  //   });
  // };

  // const handleFourthSwitchToggle = () => {
  //   setFourthSwitch((prev) => {
  //     const newValue = !prev;
  //     updateCost(newValue ? 400 : -400);
  //     return newValue;
  //   });
  // };

  // const handleFifthSwitchToggle = () => {
  //   setFifthSwitch((prev) => !prev);
  // };

  // const smileDesignToggle = () => {
  //   setSmileDesign((prev) => {
  //     const newValue = !prev;
  //     updateCost(newValue ? 40 : -40);
  //     return newValue;
  //   });
  // };
  const handleCommentChange = (e: any) => {
    setComment(e.target.value);
  };

  const handleTeethSelectionChange = (selectedTeeth) => {
    form.setValue("selectedTeeth", selectedTeeth);
  };

  const handleNextClick = (values: z.infer<typeof formSchema>) => {
    completeStep("guide-etage");
    const yourData = {
      ...formState,
      comment: values.comment,
      selectedSwitchLabel:
        values.drillingType === "foragePilote"
          ? language === "french"
            ? "Forage pilote"
            : "Pilot drilling"
          : language === "french"
          ? "Full guidée"
          : "Fully guided",
      selectedTeeth: values.selectedTeeth,
      lateralPinBrand: values.lateralPinBrand,
      selectSurgicalKitBrand: values.selectSurgicalKitBrand,
      implantBrandValues: values.implantBrandValues,
    };
    localStorage.setItem("guideEtageFormState", JSON.stringify(yourData));

    navigate("/SelectedItemsPageGETAGE", {
      state: {
        selectedItemsData: yourData,
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
    setFormState((prevState) => {
      const newSelectedTeeth = prevState.selectedTeeth.includes(index)
        ? prevState.selectedTeeth.filter((i) => i !== index)
        : [...prevState.selectedTeeth, index];

      const newImplantBrandInputs = prevState.implantBrandInputs.includes(index)
        ? prevState.implantBrandInputs.filter((i) => i !== index)
        : [...prevState.implantBrandInputs, index];

      return {
        ...prevState,
        selectedTeeth: newSelectedTeeth,
        implantBrandInputs: newImplantBrandInputs,
      };
    });
  };

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
                      ? "Guide à étages"
                      : "Stackable Guide"}
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
                          {cost.toFixed(2)} €
                        </span>
                      </span>{" "}
                    </div>
                  </div>
                  <br />

                  <div className="flex flex-col items-center justify-center ">
                    <h1 className="font-bold">
                      {language === "french"
                        ? "Sélectionner la (les) dent(s) à traiter"
                        : "Select the tooth (teeth) to treat."}
                    </h1>

                    {/* <p>
                    {language === "french"
                      ? "Si vous souhaitez un guide pour les deux arcades, veuillez ajouter une tâche par arcade."
                      : "If you want a guide for both arches, please add a task for each arch."}
                  </p> */}
                    <div>
                      <FormField
                        control={form.control}
                        name="selectedTeeth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {language === "french"
                                ? "Sélectionner la (les) dent(s) à traiter"
                                : "Select the tooth (teeth) to treat"}
                            </FormLabel>
                            <FormDescription>
                              {language === "french"
                                ? "Si vous souhaitez un guide pour les deux arcades, veuillez ajouter une tâche par arcade."
                                : "If you want a guide for both arches, please add a task for each arch."}
                            </FormDescription>
                            <FormControl>
                              <Dents
                                selectAll={false}
                                selectedTeethData={field.value}
                                onToothClick={handleToothClick}
                                onTeethSelectionChange={(selectedTeeth) => {
                                  field.onChange(selectedTeeth);
                                  handleTeethSelectionChange(selectedTeeth);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <br />
                    </div>
                    <div className="flex space-x-8">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formState.foragePilote}
                          onCheckedChange={handleForagePiloteSwitch}
                        />
                        <Label htmlFor="foragePilote" className="text-base">
                          {language === "french"
                            ? "Forage pilote"
                            : "Pilot drilling"}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formState.fullGuide}
                          onCheckedChange={handleFullGuideSwitch}
                        />
                        <Label htmlFor="fullGuide" className="text-base">
                          {language === "french"
                            ? "Full guidée"
                            : "Fully guided"}
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
                    <FormField
                      control={form.control}
                      name="lateralPinBrand"
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel className="text-lg font-semibold">
                            {language === "french"
                              ? "Marque de la clavette:"
                              : "Brand of the lateral pin:"}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ex: IDI, Nobel, Straumann ..."
                              className="w-full md:w-2/5"
                              value={formState.lateralPinBrand}
                              onChange={(e) => {
                                setFormState((prevState) => ({
                                  ...prevState,
                                  lateralPinBrand: e.target.value,
                                }));
                                field.onChange(e);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="selectSurgicalKitBrand"
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel className="text-lg font-semibold">
                            {language === "french"
                              ? "Marque de la trousse de chirugie utilisée:"
                              : "Brand of the surgical kit used:"}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ex: IDI, Nobel, Straumann ..."
                              className="w-full md:w-2/5"
                              value={formState.selectSurgicalKitBrand}
                              onChange={(e) => {
                                setFormState((prevState) => ({
                                  ...prevState,
                                  selectSurgicalKitBrand: e.target.value,
                                }));
                                field.onChange(e);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4 mt-4">
                      <h2 className="text-lg font-semibold mb-2">
                        {language === "french"
                          ? "Marque de l'implant pour la dent:"
                          : "Brand of the implant for the tooth:"}
                      </h2>
                      {formState.implantBrandInputs.map((index) => (
                        <FormField
                          key={index}
                          control={form.control}
                          name={`implantBrandValues.${index}`}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-4 mb-2">
                              <FormLabel className="flex items-center space-x-2 min-w-[60px]">
                                <FaTooth />
                                <span>{index}</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Ex: IDI, Nobel, Straumann ..."
                                  className="w-full md:w-2/5"
                                  value={
                                    formState.implantBrandValues[index] || ""
                                  }
                                  onChange={(e) => {
                                    const newValue = e.target.value;
                                    setFormState((prevState) => ({
                                      ...prevState,
                                      implantBrandValues: {
                                        ...prevState.implantBrandValues,
                                        [index]: newValue,
                                      },
                                    }));
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
                        ? "Options supplémentaires:"
                        : "Additional options:"}
                    </p>
                    <br />
                    <div className="flex-col items-center space-y-2">
                      <div className="flex space-x-2 justify-between">
                        <p>
                          {language === "french"
                            ? "Mise en charge immédiate"
                            : "Immediate loading"}
                        </p>
                        <Switch
                          checked={formState.immediateLoad}
                          onCheckedChange={handleImmediateLoadToggle}
                        />
                      </div>
                      <div className="flex space-x-2 justify-between">
                        <p>
                          {language === "french"
                            ? "Impression des 2 étages en résine"
                            : "Resin impression of both guide parts"}
                        </p>
                        <Switch
                          checked={formState.secondSwitch}
                          onCheckedChange={handleSecondSwitchToggle}
                        />
                      </div>
                      <div className="flex space-x-2 justify-between">
                        <p>
                          {language === "french"
                            ? "Impression du premier étage en métal + deuxième étage en résine"
                            : "Metal impression of first part + Resin impression of second part"}
                        </p>
                        <Switch
                          onClick={handleThirdSwitchToggle}
                          checked={formState.thirdSwitch}
                        />
                      </div>
                      <div className="flex space-x-2 justify-between">
                        <p>
                          {language === "french"
                            ? "Impression des 2 étages en métal"
                            : "Metal impression of both guide parts"}
                        </p>
                        <Switch
                          onClick={handleFourthSwitchToggle}
                          checked={formState.fourthSwitch}
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
                          checked={formState.fifthSwitch}
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
                        <Switch
                          onClick={smileDesignToggle}
                          checked={formState.smileDesign}
                        />
                        <Label htmlFor="airplane-mode">
                          {language === "french"
                            ? "Smile Design"
                            : "Smile Design"}
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

                        <FormField
                          control={form.control}
                          name="comment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
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
                                  value={formState.comment}
                                  onChange={(e) => {
                                    setFormState((prevState) => ({
                                      ...prevState,
                                      comment: e.target.value,
                                    }));
                                    field.onChange(e);
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

export default GuideEtage;
