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
import { Card } from "@/components/ui/card";
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

const RapportRadiologique = () => {
  const navigate = useNavigate();

  const [date, setDate] = useState<Date>();
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
  const [patientData, setPatientData] = useState({ fullname: '', caseNumber: '' });
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const response = await axios.get("http://localhost:1337/api/patients?sort=id:desc&pagination[limit]=1");
        // Assuming the first patient is the one you want
        const patient = response.data.data[0].attributes;
        setPatientData({
          fullname: patient.fullname,
          caseNumber: patient.caseNumber
        });
      } catch (error) {
        console.error('Error fetching patient data:', error);
      }
    };

    fetchPatientData();
  }, []);
  const FormSchema = z.object({
    dob: z.date(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
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

  const handleNextClick = () => {
    const yourData = {
      title: language === "french" ? "Guide à étages" : "Stackable Guide",
      cost: "70 €",
      date: format(selectedDate, "dd/MM/yyyy", { locale: fr }), // pass the selected date
      comment1: comment,
      comment2: secondComment,
    };
    navigate("/selectedItemsPageRapportRad", {
      state: {
        selectedItemsData: yourData,
        previousState: {
          implantationPrevue: checkedValues.implantationPrevue,
          evaluerImplantExistant: checkedValues.evaluerImplantExistant,
          evaluationATM: checkedValues.evaluationATM,
          eliminerPathologie: checkedValues.eliminerPathologie,
          autre: checkedValues.autre,
          implantationPrevueInverse: checkedValues.implantationPrevueInverse,
          evaluerImplantExistantInverse:
            checkedValues.evaluerImplantExistantInverse,
          evaluationATMInverse: checkedValues.evaluationATMInverse,
          eliminerPathologieInverse: checkedValues.eliminerPathologieInverse,
          autreInverse: checkedValues.autreInverse,
        },
        isBoxCheckedImplantation: checkedValues.implantationPrevue,
        isBoxCheckeEvaluerImplant: checkedValues.evaluerImplantExistant,
        isBoxCheckedEvaluationATM: checkedValues.evaluationATM,
        isBoxCheckedEliminerPathologie: checkedValues.eliminerPathologie,
        isBoxCheckedAutre: checkedValues.autre,
      },
    });
  };

  const { language } = useLanguage();

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
                  ? "Rapport radiologique"
                  : "Radiological report"}
              </h1>
            </div>
            <div>
              <div className="flex-col">
                <p className="text-lg  font-semibold">
                  {language === "french" ? "Patient:" : "Patient:"}{patientData.fullname}
                </p>
                <p>
                  {language === "french" ? "Numéro du cas:" : "Case number:"}{patientData.caseNumber}
                </p>
                <p>
                  {language === "french" ? "Offre actuelle:" : "Current offer:"}
                </p>
                <p>{language === "french" ? "Coût:" : "Cost:"} 70 € </p>
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
                <Textarea
                  placeholder={
                    language === "french" ? "Commentaires" : "Comments"
                  }
                  onChange={handleCommentChange}
                />
              </div>
              <br />
              <div className="w-full">
                <div className="flex-col w-full font-semibold">
                  <div className="flex space-x-2 ">
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onsubmit)}
                        className="space-y-8"
                      >
                        <FormField
                          control={form.control}
                          name="dob"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <div className="flex align-middle">
                                <FormLabel className="text-base  font-semibold">
                                  {language === "french"
                                    ? "Date de l'examen radiologique:"
                                    : "Date of radiological examination:"}
                                </FormLabel>
                                <HoverCard>
                                  <HoverCardTrigger asChild>
                                    <Info className="h-4 w-auto" />
                                  </HoverCardTrigger>
                                  <HoverCardContent className="bg-gray-200 bg-opacity-95">
                                    <p className="text-sm font-thin">
                                      {language === "french"
                                        ? "Merci d'indiquer la date de l'examen radiologique tridimensionnel. Pour une interprétation radiologique plus précise, il est recommendé que l'examen ait été effectué dans les 6 derniers mois à compter de la date actuelle."
                                        : "Please indicate the date of the three-dimensional radiological examination. For a more accurate radiological interpretation, it is recommended that the examination be performed within the last 6 months from the current date."}
                                    </p>
                                  </HoverCardContent>
                                </HoverCard>
                              </div>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-[240px] pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
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
                                    locale={fr}
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
                      </form>
                    </Form>
                  </div>
                </div>
                <br />
                <div className="flex-col w-full ">
                  <p className="font-semibold">
                    {language === "french"
                      ? "Indication de l'examen radiologique tridimensionnel"
                      : "Indication of the three-dimensional radiological examination"}
                  </p>
                  <div className="flex items-center space-x-2 justify-between">
                    <p>
                      {language === "french"
                        ? "Implantation prévue"
                        : "Planned implantation"}
                    </p>
                    <div>
                      <Checkbox
                        checked={checkedValues.implantationPrevue}
                        onClick={() => handleCheck("implantationPrevue")}
                      />

                      <Label htmlFor="implantationPrevue">
                        {language === "french" ? "Oui" : "Yes"}
                      </Label>
                      <Checkbox
                        checked={checkedValues.implantationPrevueInverse}
                        onClick={() => handleInverseCheck("implantationPrevue")}
                      />
                      <Label htmlFor="implantationPrevue">
                        {language === "french" ? "Non" : "No"}
                      </Label>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 justify-between">
                    <p>
                      {language === "french"
                        ? "Evaluer l'implant existant"
                        : "Evaluate the existing implant"}
                    </p>
                    <div>
                      <Checkbox
                        checked={checkedValues.evaluerImplantExistant}
                        onClick={() => handleCheck("evaluerImplantExistant")}
                      />

                      <Label htmlFor="evaluerImplantExistant">
                        {language === "french" ? "Oui" : "Yes"}
                      </Label>
                      <Checkbox
                        checked={checkedValues.evaluerImplantExistantInverse}
                        onClick={() =>
                          handleInverseCheck("evaluerImplantExistant")
                        }
                      />
                      <Label htmlFor="evaluerImplantExistant">
                        {language === "french" ? "Non" : "No"}
                      </Label>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 justify-between">
                    <p>
                      {language === "french"
                        ? "Evaluation de ATM"
                        : "Evaluation of TMJ"}
                    </p>
                    <div>
                      <Checkbox
                        checked={checkedValues.evaluationATM}
                        onClick={() => handleCheck("evaluationATM")}
                      />

                      <Label htmlFor="evaluationATM">
                        {language === "french" ? "Oui" : "Yes"}
                      </Label>
                      <Checkbox
                        checked={checkedValues.evaluationATMInverse}
                        onClick={() => handleInverseCheck("evaluationATM")}
                      />
                      <Label htmlFor="evaluationATM">
                        {language === "french" ? "Non" : "No"}
                      </Label>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 justify-between">
                    <p>
                      {language === "french"
                        ? "Eliminer une pathologie"
                        : "Eliminate a pathology"}
                    </p>
                    <div>
                      <Checkbox
                        checked={checkedValues.eliminerPathologie}
                        onClick={() => handleCheck("eliminerPathologie")}
                      />

                      <Label htmlFor="eliminerPathologie">
                        {language === "french" ? "Oui" : "Yes"}
                      </Label>
                      <Checkbox
                        checked={checkedValues.eliminerPathologieInverse}
                        onClick={() => handleInverseCheck("eliminerPathologie")}
                      />
                      <Label htmlFor="eliminerPathologie">
                        {language === "french" ? "Non" : "No"}
                      </Label>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 justify-between">
                    <div className="flex">
                      <p>{language === "french" ? "Autres" : "Others"}</p>
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
                        checked={checkedValues.autre}
                        onClick={() => handleCheck("autre")}
                      />

                      <Label htmlFor="autre">
                        {language === "french" ? "Oui" : "Yes"}
                      </Label>
                      <Checkbox
                        checked={checkedValues.autreInverse}
                        onClick={() => handleInverseCheck("autre")}
                      />
                      <Label htmlFor="autre">
                        {language === "french" ? "Non" : "No"}
                      </Label>
                    </div>
                  </div>
                  <br />
                  <div>
                    <h1 className="font-semibold">
                      {language === "french" ? "Commentaires:" : "Comments:"}
                    </h1>
                    <Textarea
                      placeholder={
                        language === "french" ? "Commentaires" : "Comments"
                      }
                      onChange={handleCommentChange2}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <Button className="w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2 bg-[#fffa1b] text-[#0e0004] hover:bg-[#fffb1bb5] hover:text-[#0e0004] transition-all mt-9">
                <Link to="/sign/offre">
                  {language === "french" ? "Précédent" : "Previous"}
                </Link>
              </Button>
              <Button
                className={`w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2 bg-[#0e0004] text-[#fffa1b] hover:bg-[#211f20] hover:text-[#fffa1b] transition-all mt-9`}
                disabled={!comment.trim()}
                onClick={handleNextClick}
              >
                <Link to="/selectedItemsPageRapportRad">
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

export default RapportRadiologique;
