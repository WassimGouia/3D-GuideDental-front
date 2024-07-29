import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Container from "@/components/Container";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import validator from "validator";
import { z } from "zod";
import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import ClientSign from "@/views/ClientSign";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/components/languageContext";
import { useNavigate } from "react-router-dom";
import SideBarContainer from "@/components/SideBarContainer";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Country, State, City, IState, ICity } from "country-state-city";
import { setToken } from "@/components/Helpers";
import { useAuthContext } from "@/components/AuthContext";

const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

const FormSchema = z.object({
  email: z
    .string({ required_error: "email est requis" })
    .email("Veuillez entrer une adresse e-mail valide"),
  name: z
    .string({ required_error: "Nom est requis" })
    .min(2, "Nom doit comporter au moins 2 caractères"), // Example rule
  Tel: z
    .string({ required_error: "Numero de telephone est requis" })
    .regex(phoneRegex, "ce numero est invalide")
    .min(8, "Le numéro doit comporter au moins 8 caractères")
    .max(13, "Le numéro ne doit pas dépasser 13 caractères")
    .refine(validator.isMobilePhone, "Numéro de téléphone invalide"),
  bureau: z.string().optional(),
  nom_cabinet: z.string().optional(),
  siret: z.string().optional(),
  Pays: z.string().nonempty({ message: "Country is required" }),
  State: z.string().nonempty({ message: "State is required" }),
  Ville: z.string().nonempty({ message: "City is required" }),
  Adresse: z
    .string({ required_error: "Adresse est requis" })
    .min(5, "L'adresse doit comporter au moins 5 caractères"), // Example rule
  Code_postal: z
    .string()
    .nonempty("Code postale est requis")
    .refine((value) => /^\d{3,10}$/.test(value), "Code postal invalide"),
  departement: z.string().optional(),
});

const InformationForm = () => {
  const { setUser } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { language } = useLanguage();
  const location = useLocation();
  const { email, password } = location.state || {};
  const [formData, setFormData] = useState({});
  const [countries, setCountries] = useState(
    Country.getAllCountries().filter((country) => country.name !== "Israel")
  );

  const [selectedStates, setSelectedStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  const [selectedCountryIsoCode, setSelectedCountryIsoCode] =
    useState<string>();
  const [selectedStateCode, setSelectedStateCode] = useState<string>();
  const [selectedCityName, setSelectedCityName] = useState<string>();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: email || "",
      name: "",
      Tel: "",
      bureau: "",
      nom_cabinet: "",
      siret: "",
      Pays: "",
      Ville: "",
      State: "",
      Adresse: "",
      Code_postal: "",
      departement: "",
    },
  });

  const handleCountryChange = (data: string) => {
    setSelectedCountryIsoCode(data);
    form.setValue("Pays", data);
    // Perform actions based on the selected country ISO code
    console.log("Selected country ISO code:", data);
  };

  const handleStateChange = (data: string) => {
    setSelectedStateCode(data);
    form.setValue("State", data);
    console.log("Selected state code:", data);
  };

  const handleCityChange = (data: string) => {
    setSelectedCityName(data);
    form.setValue("Ville", data);
    console.log("Selected city name:", data);
  };

  useEffect(() => {
    // Filter out countries that have states and cities and are not Israel
    const filteredCountries = Country.getAllCountries().filter((country) => {
      if (country.name === "Israel") return false; // Exclude Israel
      const states = State.getStatesOfCountry(country.isoCode);
      if (states) {
        for (const state of states) {
          const cities = City.getCitiesOfState(country.isoCode, state.isoCode);
          if (cities && cities.length > 0) {
            return true;
          }
        }
      }
      return false; // No states or cities found for this country
    });

    setCountries(filteredCountries);
  }, []);

  const [statesAvailable, setStatesAvailable] = useState(true);

  useEffect(() => {
    if (selectedCountryIsoCode) {
      const states = State.getStatesOfCountry(selectedCountryIsoCode);
      if (states && states.length > 0) {
        setSelectedStates(states);
        setStatesAvailable(true);
      } else {
        setSelectedStates([]);
        setStatesAvailable(false);
      }
    }
  }, [selectedCountryIsoCode]);
  
  const [citiesAvailable, setCitiesAvailable] = useState(true);

  useEffect(() => {
    if (selectedCountryIsoCode && selectedStateCode) {
      const stateCities = City.getCitiesOfState(
        selectedCountryIsoCode,
        selectedStateCode
      );
      if (stateCities && stateCities.length > 0) {
        setCities(stateCities);
        setCitiesAvailable(true);
      } else {
        setCities([]);
        setCitiesAvailable(false);
      }
    }
  }, [selectedCountryIsoCode, selectedStateCode]);
  const validateAddress = async (
    address: string

  ): Promise<boolean> => {
    try {
      const apiKey = import.meta.env.VITE_GEOAPIFY_API; // process.env.GEOAPIFY_API;
      const addressUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
        address
      )}&apiKey=${apiKey}`;
      const addressResponse = await axios.get(addressUrl);
      const isValidAddress = addressResponse.data.features.length > 0;

      // const selectedCity = cities.find((city) => city.name === cityName);

      // console.log(isValidAddress && selectedCity?.stateCode === stateCode);

      return isValidAddress;
    } catch (error) {
      console.error("Error validating address:", error);
      return false;
    }
  };

  const onSubmit = async (data: any) => {
    console.log("Submitting data:", data);
    setIsLoading(true);
    setError("");
    const isAddressValid = await validateAddress(
      data.Adresse
    );

    if (!isAddressValid) {
      setError("Invalid postal code");
      setIsLoading(false);
      return;
    }

    // Get the selected state name based on the state code
    const selectedState = selectedStates.find(
      (state) => state.isoCode === selectedStateCode
    );

    const fullData = {
      ...data,
      role: 1,
      email: data.email,
      password,
      username: data.name,
      phone: data.Tel,
      cabinetName: data.nom_cabinet,
      siretNumber: data.siret,
      location: [
        {
          Address: data.Adresse,
          Office: data.bureau,
          zipCode: data.Code_postal,
          city: data.Ville,
          department: data.departement,
          country: Country.getCountryByCode(selectedCountryIsoCode as string)
            ?.name,
          State: selectedState?.name,
        },
      ],
    };

    if (!password) {
      setError("Missing password");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "https://admin.3dguidedental.com/api/auth/local/register",
        fullData
      );

      // setToken(response.data.jwt);
      // setUser(response.data.user);
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        console.log(err)
        setError(err.response.data.error.message);
      } else {
        setError("Registration failed. Please check the server logs.");
      }
      setIsLoading(false);
      return;
    }

    navigate("/confirmation");
    setIsLoading(false);
  };

  return (
    <div>
      <SideBarContainer>
        <Container>
          <ClientSign />
          <div className="mt-4">
            <Card className="">
              <CardHeader className="items-center">
                <CardTitle>
                  {language === "french"
                    ? "Veuillez entrer vos informations"
                    : "Please enter your information"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {isLoading && <div>Loading ...</div>}
                  {error && (
                    <div className="text-red-500 bg-red-200 p-4 w-full">
                      {error}
                    </div>
                  )}
                  {!isLoading && (
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="w-full space-y-6 mt-4 mb-4"
                      >
                        <p className="mt-4 mb-4">
                          {language === "french"
                            ? "Un mail est nécéssaire pour s'inscrire à la plateforme, il servira en cas d'oubli de mot de passe."
                            : "An email is required to register for the platform, it will be used in case of forgotten password."}
                        </p>
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {language === "french"
                                  ? "Adresse E-mail:"
                                  : "Email Address:"}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  className="w-3/5"
                                  placeholder={
                                    language === "french"
                                      ? "Email (requis)"
                                      : "Email (required)"
                                  }
                                  type="email"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {language === "french" ? "Nom :" : "Name :"}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  className="w-3/5"
                                  placeholder={
                                    language === "french"
                                      ? "Nom (requis)"
                                      : "Name (required)"
                                  }
                                  type="text"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="nom_cabinet"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {language === "french"
                                  ? "Nom du cabinet :"
                                  : "Cabinet name :"}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  className="w-3/5"
                                  placeholder="Nom du cabinet"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="siret"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {language === "french"
                                  ? "Numéro Siret :"
                                  : "Siret number :"}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  className="w-3/5"
                                  placeholder={
                                    language === "french"
                                      ? "Siret (requis)"
                                      : "Siret (required)"
                                  }
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="bureau"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {language === "french"
                                  ? "Bureau :"
                                  : "Office :"}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  className="w-3/5"
                                  placeholder={
                                    language === "french"
                                      ? "App, bureau, local, etc.."
                                      : "App, office, local, etc.."
                                  }
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="departement"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {language === "french"
                                  ? "Département :"
                                  : "Department :"}
                              </FormLabel>

                              <FormControl>
                                <Input
                                  className="w-3/5"
                                  placeholder={
                                    language === "french"
                                      ? "Département"
                                      : "Department"
                                  }
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="Pays"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {language === "french" ? "Pays :" : "Country :"}
                              </FormLabel>
                              <FormControl>
                                <Select onValueChange={handleCountryChange}>
                                  <SelectTrigger className="w-3/5">
                                    <SelectValue
                                      placeholder={
                                        language === "french"
                                          ? "Sélectionnez un pays"
                                          : "Select a country"
                                      }
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectGroup>
                                      {countries.map((country, index) => (
                                        <SelectItem
                                          key={country.isoCode || index}
                                          value={country.isoCode}
                                        >
                                          {country.name}
                                        </SelectItem>
                                      ))}
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
<FormField
  control={form.control}
  name="State"
  render={({ field }) => (
    <FormItem>
      <FormLabel>
        {language === "french" ? "Etat :" : "State :"}
      </FormLabel>
      <FormControl>
        {statesAvailable ? (
          <Select onValueChange={handleStateChange}>
            <SelectTrigger className="w-3/5">
              <SelectValue
                placeholder={
                  language === "french"
                    ? "Sélectionnez un état"
                    : "Select a state"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {selectedStates.map((state) => (
                  <SelectItem
                    key={state.isoCode}
                    value={state.isoCode}
                  >
                    {state.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        ) : (
          <Input
            className="w-3/5"
            placeholder={
              language === "french"
                ? "Entrez un état"
                : "Enter a state"
            }
            {...field}
          />
        )}
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
<FormField
  control={form.control}
  name="Ville"
  render={({ field }) => (
    <FormItem>
      <FormLabel>
        {language === "french" ? "Ville :" : "City :"}
      </FormLabel>
      <FormControl>
        {citiesAvailable ? (
          <Select onValueChange={handleCityChange}>
            <SelectTrigger className="w-3/5">
              <SelectValue
                placeholder={
                  language === "french"
                    ? "Sélectionnez une ville"
                    : "Select a city"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>
                  {language === "french"
                    ? "Villes"
                    : "Cities"}
                </SelectLabel>
                {cities.map((city) => (
                  <SelectItem
                    key={city.name}
                    value={city.name}
                  >
                    {city.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        ) : (
          <Input
            className="w-3/5"
            placeholder={
              language === "french"
                ? "Entrez une ville"
                : "Enter a city"
            }
            {...field}
          />
        )}
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
                        <FormField
                          control={form.control}
                          name="Code_postal"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {language === "french"
                                  ? "Code postale :"
                                  : "Postal code :"}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  className="w-3/5"
                                  placeholder={
                                    language === "french"
                                      ? "Code postale (requis)"
                                      : "Postal code (required)"
                                  }
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="Adresse"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {language === "french"
                                  ? "Adresse :"
                                  : "Address :"}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  className="w-3/5"
                                  placeholder={
                                    language === "french"
                                      ? "Adresse (requis)"
                                      : "Address (required)"
                                  }
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="Tel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {language === "french"
                                  ? "Numéro de téléphone :"
                                  : "Phone number :"}
                              </FormLabel>
                              <FormControl>
                                <div className="flex w-3/5 space-x-1">
                                  <div className="w-28">
                                    <Select>
                                      <SelectTrigger>
                                        <SelectValue
                                          placeholder={
                                            language === "french"
                                              ? "Entrer votre numéro de téléphone"
                                              : "Enter your phone number"
                                          }
                                        />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectGroup>
                                          <SelectLabel>
                                            {language === "french"
                                              ? "Villes"
                                              : "Cities"}
                                          </SelectLabel>
                                          {countries.map((country) => (
                                            <SelectItem
                                              value={`${country.phonecode}_${country.isoCode}`}
                                              key={`${country.phonecode}_${country.isoCode}`}
                                            >
                                              {country.phonecode}
                                            </SelectItem>
                                          ))}
                                        </SelectGroup>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <Input
                                    className="w-full"
                                    placeholder={
                                      language === "french"
                                        ? "Numéro de téléphone (requis)"
                                        : "Phone number (required)"
                                    }
                                    {...field}
                                    type="tel"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-between">
                          <Button className="w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2 bg-[#fffa1b] text-[#0e0004] hover:bg-[#fffb1bb5] hover:text-[#0e0004] transition-all  mt-9">
                            <Link to="/sign/createAccount">
                              {language === "french" ? "Précédent" : "Previous"}
                            </Link>
                          </Button>
                          <Button
                            className="w-36 h-auto flex items-center gap-3 rounded-lg px-3 py-2 bg-[#0e0004] text-[#fffa1b] hover:bg-[#211f20] hover:text-[#fffa1b] transition-all  mt-9"
                            type="submit"
                          >
                            {language === "french"
                              ? "Confirmer l'inscription"
                              : "Confirm registration"}
                            {/* <Link to='/selectedItemsPage'>
                          </Link> */}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  )}
                </CardDescription>
              </CardContent>
              <CardFooter></CardFooter>
            </Card>
          </div>
        </Container>
      </SideBarContainer>
    </div>
  );
};

export default InformationForm;
