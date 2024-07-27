import { useEffect, useState } from "react";
import Container from "@/components/Container";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import Nouvelle from "@/components/Nouvelledemande";
import { Link, useNavigate } from "react-router-dom";
import SideBarContainer from "@/components/SideBarContainer";
import { Info } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useLanguage } from "@/components/languageContext";
import axios from "axios";
import { useAuthContext } from "@/components/AuthContext";
import { getToken } from "@/components/Helpers";
import {
  Percent,
  ReceiptEuro,
  FileDigit,
  UsersRound,
  Package,
} from "lucide-react";

const RapportRadiologique = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [checkedValues, setCheckedValues] = useState({
    implantationPrevue: false,
    implantationPrevueInverse: false,
    evaluerImplantExistant: false,
    evaluerImplantExistantInverse: false,
    evaluationATM: false,
    evaluationATMInverse: false,
    eliminerPathologie: false,
    eliminerPathologieInverse: false,
    autre: false,
    autreInverse: false,
  });
  const [patientData, setPatientData] = useState({
    fullname: "",
    caseNumber: "",
  });
  const [originalCost, setOriginalCost] = useState(70);
  const [cost, setCost] = useState(70);
  const [currentOffer, setCurrentOffer] = useState(null);
  const { user } = useAuthContext();
  const { language } = useLanguage();

  useEffect(() => {
    const storedState = localStorage.getItem("rapportRadiologiqueState");
    const storedFullname = localStorage.getItem("fullName");
    const storedCaseNumber = localStorage.getItem("caseNumber");

    if (!storedFullname || !storedCaseNumber) {
      navigate("/sign/nouvelle-demande");
    } else {
      setPatientData({
        fullname: storedFullname,
        caseNumber: storedCaseNumber,
      });

      if (storedState) {
        const parsedState = JSON.parse(storedState);

        // Handle date
        const savedDate = parsedState.selectedDate
          ? new Date(parsedState.selectedDate)
          : null;
        setSelectedDate(savedDate);
        form.setValue("dob", savedDate);

        // Handle other fields
        form.reset({
          ...parsedState,
          dob: savedDate,
          checkboxGroup: parsedState.checkboxGroup || {},
        });

        setCheckedValues(parsedState.checkedValues || {});
        setOriginalCost(parsedState.originalCost);
        setCost(parsedState.cost);
        setComment(parsedState.comment || "");
        setSecondComment(parsedState.secondComment || "");
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

              // Apply initial discount
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
  const formSchema = z
    .object({
      dob: z.date({
        required_error:
          language === "french"
            ? "La date de l'examen est requise"
            : "Date of examination is required",
      }),
      comment: z
        .string()
        .min(
          1,
          language === "french"
            ? "Le commentaire est requis"
            : "Comment is required"
        ),
      secondComment: z
        .string()
        .min(
          1,
          language === "french"
            ? "Le commentaire est requis"
            : "Comment is required"
        ),
      checkboxGroup: z.object({
        implantationPrevue: z
          .string()
          .min(
            1,
            language === "french"
              ? "Ce champ est requis"
              : "This field is required"
          ),
        evaluerImplantExistant: z
          .string()
          .min(
            1,
            language === "french"
              ? "Ce champ est requis"
              : "This field is required"
          ),
        evaluationATM: z
          .string()
          .min(
            1,
            language === "french"
              ? "Ce champ est requis"
              : "This field is required"
          ),
        eliminerPathologie: z
          .string()
          .min(
            1,
            language === "french"
              ? "Ce champ est requis"
              : "This field is required"
          ),
        autre: z
          .string()
          .min(
            1,
            language === "french"
              ? "Ce champ est requis"
              : "This field is required"
          ),
      }),
      autreInput: z.string().optional(),
    })
    .refine(
      (data) => {
        if (data.checkboxGroup.autre === "oui") {
          return data.autreInput && data.autreInput.trim().length > 0;
        }
        return true;
      },
      {
        message:
          language === "french"
            ? "Veuillez préciser les autres indications"
            : "Please specify other indications",
        path: ["autreInput"],
      }
    );

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dob: null,
      comment: "",
      secondComment: "",
      checkboxGroup: {
        implantationPrevue: "",
        evaluerImplantExistant: "",
        evaluationATM: "",
        eliminerPathologie: "",
        autre: "",
      },
      autreInput: "",
    },
  });

  const [comment, setComment] = useState("");
  const [secondComment, setSecondComment] = useState("");
  const [lastChecked, setLastChecked] = useState("");
  const handleCheck = (name: string) => {
    setCheckedValues((prevState) => {
      const newState = { ...prevState };
      if (lastChecked === name) {
        newState[name] = !newState[name];
        setLastChecked("");
      } else {
        for (const key in newState) {
          if (key === name) {
            newState[key] = true;
            setLastChecked(name);
          } else if (key === `${name}Inverse`) {
            newState[key] = false;
          }
        }
      }
      return newState;
    });
  };

  const validateCheckboxes = () => {
    const values = form.getValues();
    return (
      values.implantationPrevue ||
      values.evaluerImplantExistant ||
      values.evaluationATM ||
      values.eliminerPathologie ||
      values.autre
    );
  };

  const handleInverseCheck = (name: string) => {
    setCheckedValues((prevState) => {
      const newState = { ...prevState };
      if (lastChecked === `${name}Inverse`) {
        newState[`${name}Inverse`] = !newState[`${name}Inverse`];
        setLastChecked("");
      } else {
        for (const key in newState) {
          if (key === `${name}Inverse`) {
            newState[key] = true;
            setLastChecked(`${name}Inverse`);
          } else if (key === name) {
            newState[key] = false;
          }
        }
      }
      return newState;
    });
  };

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleCommentChange2 = (event) => {
    setSecondComment(event.target.value);
  };

  const onSubmit = (data) => {
    if (
      data.checkboxGroup.autre === "oui" &&
      (!data.autreInput || data.autreInput.trim() === "")
    ) {
      form.setError("autreInput", {
        type: "manual",
        message:
          language === "french"
            ? "Veuillez préciser les autres indications"
            : "Please specify other indications",
      });
      return;
    }

    // If we get here, the form is valid
    const stateToStore = {
      date: data.dob ? data.dob.toISOString() : null,
      selectedDate: data.dob ? data.dob.toISOString() : null,
      checkboxGroup: data.checkboxGroup,
      autreInput: data.autreInput,
      originalCost,
      cost,
      comment: data.comment,
      secondComment: data.secondComment,
    };
    localStorage.setItem(
      "rapportRadiologiqueState",
      JSON.stringify(stateToStore)
    );
    handleNextClick(data);
  };

  const handleNextClick = (formData) => {
    const stateToStore = {
      selectedDate: selectedDate ? selectedDate.toISOString() : null,
      checkboxGroup: formData.checkboxGroup,
      autreInput: formData.autreInput,
      originalCost,
      cost,
      comment: formData.comment,
      secondComment: formData.secondComment,
    };
    localStorage.setItem(
      "rapportRadiologiqueState",
      JSON.stringify(stateToStore)
    );

    navigate("/selectedItemsPageRapportRad", {
      state: {
        selectedItemsData: {
          title:
            language === "french"
              ? "Rapport radiologique"
              : "Radiological report",
          cost: cost,
          originalCost: originalCost,
          date: selectedDate
            ? format(selectedDate, "dd/MM/yyyy", { locale: fr })
            : "",

          comment1: formData.comment,
          comment2: formData.secondComment,
        },
        checkboxGroup: formData.checkboxGroup,
        autreInput: formData.autreInput,
      },
    });
  };

  const fieldLabels = {
    implantationPrevue: {
      fr: "Implantation prévue",
      en: "Planned implantation",
    },
    evaluerImplantExistant: {
      fr: "Evaluer l'implant existant",
      en: "Evaluate the existing implant",
    },
    evaluationATM: {
      fr: "Evaluation de ATM",
      en: "Evaluation of TMJ",
    },
    eliminerPathologie: {
      fr: "Eliminer une pathologie",
      en: "Eliminate a pathology",
    },
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
                      ? "Rapport radiologique"
                      : "Radiological report"}
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
                        <ReceiptEuro className="text-yellow-600" />
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
                  </div>
                  <br />
                  <div className="flex flex-col items-center justify-center ">
                    <div className="flex-col w-full font-semibold">
                      <h1 className="font-bold text-xl">
                        {language === "french"
                          ? "Toutes les cases doivent être complétées et cochées pour passer à l'étape suivante de la soumission"
                          : "All boxes must be completed and checked to proceed to the next step of submission"}
                      </h1>
                      <br />
                      <p>
                        {language === "french"
                          ? "Antécédents médicaux du patient:"
                          : "Patient's medical history:"}
                      </p>
                      <FormField
                        control={form.control}
                        name="comment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold">
                              {language === "french"
                                ? "Commentaires:"
                                : "Comments:"}
                            </FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <br />
                    <div className="w-full">
                      <div className="flex-col w-full font-semibold">
                        <div className="flex space-x-2 ">
                          <FormField
                            control={form.control}
                            name="dob"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel className="text-base font-semibold">
                                  {language === "french"
                                    ? "Date de l'examen radiologique:"
                                    : "Date of radiological examination:"}
                                </FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "w-[240px] pl-3 text-left font-normal",
                                          !field.value &&
                                            "text-muted-foreground"
                                        )}
                                      >
                                        {field.value ? (
                                          format(field.value, "PPP", {
                                            locale: fr,
                                          })
                                        ) : (
                                          <span>
                                            {language === "french"
                                              ? "JJ/MM/AAAA"
                                              : "DD/MM/YYYY"}
                                          </span>
                                        )}
                                        <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                  >
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={(date) => {
                                        field.onChange(date);
                                        setSelectedDate(date);
                                      }}
                                      disabled={(date) =>
                                        date > new Date() ||
                                        date < new Date("1900-01-01")
                                      }
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      <br />
                      <div className="flex-col w-full ">
                        <div className="flex-col w-full">
                          <p
                            className={`font-semibold ${
                              form.formState.errors.checkboxGroup
                                ? "text-red-500"
                                : ""
                            }`}
                          >
                            {language === "french"
                              ? "Indication de l'examen radiologique tridimensionnel"
                              : "Indication of the three-dimensional radiological examination"}
                          </p>

                          {[
                            "implantationPrevue",
                            "evaluerImplantExistant",
                            "evaluationATM",
                            "eliminerPathologie",
                          ].map((fieldName) => (
                            <FormField
                              key={fieldName}
                              control={form.control}
                              name={`checkboxGroup.${fieldName}`}
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 justify-between">
                                  <FormLabel
                                    className={
                                      form.formState.errors.checkboxGroup
                                        ? "text-red-500"
                                        : ""
                                    }
                                  >
                                    {language === "french"
                                      ? fieldLabels[fieldName].fr
                                      : fieldLabels[fieldName].en}
                                  </FormLabel>
                                  <div>
                                    <Checkbox
                                      checked={field.value === "oui"}
                                      onCheckedChange={() =>
                                        field.onChange("oui")
                                      }
                                    />
                                    <Label htmlFor={`${fieldName}-oui`}>
                                      {language === "french" ? "Oui" : "Yes"}
                                    </Label>
                                    <Checkbox
                                      checked={field.value === "non"}
                                      onCheckedChange={() =>
                                        field.onChange("non")
                                      }
                                    />
                                    <Label htmlFor={`${fieldName}-non`}>
                                      {language === "french" ? "Non" : "No"}
                                    </Label>
                                  </div>
                                </FormItem>
                              )}
                            />
                          ))}

                          <FormField
                            control={form.control}
                            name="checkboxGroup.autre"
                            render={({ field }) => (
                              <FormItem className="flex flex-col items-start">
                                <div className="flex items-center space-x-2 justify-between w-full">
                                  <div className="flex">
                                    <FormLabel
                                      className={
                                        form.formState.errors.checkboxGroup
                                          ? "text-red-500"
                                          : ""
                                      }
                                    >
                                      {language === "french"
                                        ? "Autres"
                                        : "Others"}
                                    </FormLabel>
                                    <HoverCard>
                                      <HoverCardTrigger asChild>
                                        <Info className="h-4 w-auto" />
                                      </HoverCardTrigger>
                                      <HoverCardContent className="bg-gray-200 bg-opacity-95">
                                        <p className="text-sm font-thin">
                                          {language === "french"
                                            ? "Si l'indication de l'examen radiologique n'est pas répertoriée ci-dessus, veuillez cliquez sur 'oui' et nous la préciser dans le champ commentaire ci-dessous."
                                            : "If the indication of the radiological examination is not listed above, please click 'yes' and specify it in the comment field below."}
                                        </p>
                                      </HoverCardContent>
                                    </HoverCard>
                                  </div>
                                  <div>
                                    <Checkbox
                                      checked={field.value === "oui"}
                                      onCheckedChange={(checked) => {
                                        field.onChange(checked ? "oui" : "non");
                                        if (!checked) {
                                          form.setValue("autreInput", "");
                                        }
                                      }}
                                    />
                                    <Label htmlFor="autre-oui">
                                      {language === "french" ? "Oui" : "Yes"}
                                    </Label>
                                    <Checkbox
                                      checked={field.value === "non"}
                                      onCheckedChange={(checked) => {
                                        field.onChange(checked ? "non" : "oui");
                                        if (checked) {
                                          form.setValue("autreInput", "");
                                        }
                                      }}
                                    />
                                    <Label htmlFor="autre-non">
                                      {language === "french" ? "Non" : "No"}
                                    </Label>
                                  </div>
                                </div>
                                {field.value === "oui" && (
                                  <FormField
                                    control={form.control}
                                    name="autreInput"
                                    render={({ field: inputField }) => (
                                      <FormItem className="w-full mt-2">
                                        <FormControl>
                                          <Textarea
                                            {...inputField}
                                            placeholder={
                                              language === "french"
                                                ? "Veuillez préciser"
                                                : "Please specify"
                                            }
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                )}
                              </FormItem>
                            )}
                          />

                          {form.formState.errors.checkboxGroup && (
                            <p className="text-sm text-red-500 mt-2 font-bold">
                              {language === "french"
                                ? "Veuillez sélectionner une option pour chaque indication"
                                : "Please select an option for each indication"}
                            </p>
                          )}
                        </div>
                        <br />
                        <FormField
                          control={form.control}
                          name="secondComment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-semibold">
                                {language === "french"
                                  ? "Commentaires:"
                                  : "Comments:"}
                              </FormLabel>
                              <FormControl>
                                <Textarea {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {form.formState.errors.checkboxGroup && (
                          <p className="text-sm text-red-500 mt-1">
                            {form.formState.errors.checkboxGroup.message}
                          </p>
                        )}
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

export default RapportRadiologique;
