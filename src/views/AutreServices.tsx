import Container from "@/components/Container";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import Nouvelle from "@/components/Nouvelledemande";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SideBarContainer from "@/components/SideBarContainer";
import { useLanguage } from "@/components/languageContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthContext } from "@/components/AuthContext";
import { getToken } from "@/components/Helpers";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
  FileDigit,
  UsersRound,
  Package,
} from "lucide-react";

const AutreServices = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState({
    fullname: "",
    caseNumber: "",
  });
  const [currentOffer, setCurrentOffer] = useState(null);
  const { user } = useAuthContext();

  const formSchema = z.object({
    comment: z.string().min(1, "Comment is required"),
    implantationPrevue: z.boolean().default(false),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comment: "",
      implantationPrevue: false,
    },
  });

  useEffect(() => {
    const storedState = localStorage.getItem("autreServiceState");
    const storedFullname = localStorage.getItem("fullName");
    const storedCaseNumber = localStorage.getItem("caseNumber");

    if (storedState) {
      const parsedState = JSON.parse(storedState);
      form.reset(parsedState);
    }

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

            if (userResponse.data && userResponse.data.offre) {
              const offerData = userResponse.data.offre;
              setCurrentOffer({
                currentPlan: offerData.CurrentPlan,
                discount: getDiscount(offerData.CurrentPlan),
              });

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
  }, [navigate, user, form]);

  const getDiscount = (plan) => {
    const discounts = {
      Essential: 5,
      Privilege: 10,
      Elite: 15,
      Premium: 20,
    };
    return discounts[plan] || 0;
  };

  const onSubmit = (data) => {
    localStorage.setItem("autreServiceState", JSON.stringify(data));

    navigate("/selectedItemsPageAutreService", {
      state: { formData: data },
    });
  };


  const supportedCountries = ["france", "belgium", "portugal", "germany", "netherlands", "luxembourg", "italy", "spain"];
  const country = user && user.location[0].country.toLowerCase();

  return (
    <div>
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
                        ? "Autres services de conception"
                        : "Other design services"}
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
                      </div>
                    </div>
                    <br />
                    <div className="flex flex-col items-center justify-center ">
                      <FormField
                        control={form.control}
                        name="comment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {language === "french"
                                ? "Commentaires"
                                : "Comments"}
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder={
                                  language === "french"
                                    ? "Saisissez votre requête ici..."
                                    : "Enter your request here..."
                                }
                              />
                            </FormControl>
                            <FormDescription>
                              {language === "french"
                                ? "Saisissez votre requête dans la section des commentaires et obtenez un devis (si le service est proposé par 3D Guide Dental)"
                                : "Enter your request in the comments section and get a quote (if the service is offered by 3D Guide Dental)"}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <br />
                      {supportedCountries.includes(country) ? (
                      <FormField
                        control={form.control}
                        name="implantationPrevue"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                {language === "french"
                                  ? "Souhaitez-vous bénéficier du service d'impression et d'expédition?"
                                  : "Do you want to take advantage of the printing and shipping service?"}
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      ) : null }
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
    </div>
  );
};

export default AutreServices;
