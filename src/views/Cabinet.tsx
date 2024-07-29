import { useEffect, useState } from "react";
import { useAuthContext } from "@/components/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import validator from "validator";
import qrcode from "@/assets/qrCodeTechnicalSupport.jpg";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Container from "@/components/Container";
import SideBarContainer from "@/components/SideBarContainer";
import axios from "axios";
import { useLanguage } from "@/components/languageContext";
import { Separator } from "@/components/ui/separator";
import { getToken, setToken } from "@/components/Helpers";

const Cabinet = () => {
  const apiUrl = import.meta.env.VITE_BACKEND_API_ENDPOINT;
  const { language } = useLanguage();
  const { user, setUser, isLoading } = useAuthContext();
  const [formData, setFormData] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [error, setError] = useState("");
  const [passwordChangeError, setPasswordChangeError] = useState("");
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState("");
  const [currentPasswordValid, setCurrentPasswordValid] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const FormSchema = z.object({
    email: z
      .string({ required_error: "email est requis" })
      .email("Veuillez entrer une adresse e-mail valide"),
    name: z.string({ required_error: "Nom est requis" }),
    Tel: z
      .string({ required_error: "Numero de telephone est requis" })
      .min(8)
      .max(13)
      .refine((val) => validator.isMobilePhone(val, "any"), {
        message: "Veuillez entrer un numéro de téléphone valide",
      }),
    bureau: z.string().optional(),
    nom_cabinet: z.string().optional(),
    siret: z.string().optional(),
    Pays: z.string().optional(),
    Ville: z.string().optional(),
    Adresse: z.string({ required_error: "Adresse est requis" }),
    Code_postal: z.string({ required_error: "Code postale est requis" }),
    departement: z.string().optional(),
    State: z.string().optional(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      name: "",
      Tel: "",
      bureau: "",
      nom_cabinet: "",
      siret: "",
      Pays: "",
      Ville: "",
      Adresse: "",
      Code_postal: "",
      departement: "",
      State: "",
    },
  });

  const passwordFormSchema = z
    .object({
      currentPassword: z.string().nonempty("Current password is required"),
      newPassword: z
        .string()
        .min(8, "New password must be at least 8 characters long"),
      confirmNewPassword: z.string().min(8, "Confirm new password is required"),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: "Passwords do not match",
      path: ["confirmNewPassword"],
    });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  useEffect(() => {
    if (user) {
      const location = user.location?.[0] || {};
      setFormData({
        email: user.email || "",
        name: user.username || "",
        Tel: user.phone || "",
        bureau: location.Office || "",
        nom_cabinet: user.cabinetName || "",
        siret: user.siretNumber || "",
        Pays: location.country || "",
        Ville: location.city || "",
        Adresse: location.Address || "",
        Code_postal: location.zipCode || "",
        departement: location.department || "",
        State: location.State || "",
      });
      setEmailVerified(user.confirmed); // Check if email is confirmed
    }
  }, [user]);

  useEffect(() => {
    const confirmEmail = async () => {
      const params = new URLSearchParams(location.search);
      const confirmationToken = params.get("confirmation");

      if (confirmationToken) {
        try {
          await axios.get(
            `${apiUrl}/auth/email-confirmation?confirmation=${confirmationToken}`
          );
          alert("Email confirmed successfully!");
          setEmailVerified(true);
          navigate("/cabinet");
        } catch (error) {
          console.error("Error during email confirmation:", error);
          setError("Email confirmation failed. Please try again.");
        }
      }
    };

    confirmEmail();
  }, [location, navigate]);

  const resendVerificationEmail = async () => {
    try {
      await axios.post(
        `${apiUrl}/auth/send-email-confirmation`,
        {
          email: user.email,
        }
      );
      alert("Verification email resent successfully!");
    } catch (error) {
      console.error("Error resending verification email:", error);
      setError("Failed to resend verification email. Please try again.");
    }
  };

  const handleChangePassword = async (data: any) => {
    setPasswordChangeError("");
    setPasswordChangeSuccess("");

    try {
      const token = getToken();
      const response = await axios.post(
         `${apiUrl}/auth/change-password`,
        {
          password: data.newPassword,
          currentPassword: data.currentPassword,
          passwordConfirmation: data.confirmNewPassword, // Include this field in the request body
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include the JWT token in the headers
          },
        }
      );

      // Update the JWT token in local storage
      setToken(response.data.jwt);

      // Update the user info in the AuthContext
      setUser(response.data.user);

      setCurrentPasswordValid(true);
      setPasswordChangeSuccess("Password changed successfully!");
    } catch (error) {
      setCurrentPasswordValid(false);
      setPasswordChangeError("Failed to change password. Please try again.");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>No user data available.</div>;
  }

  return (
    <SideBarContainer>
      <div className="p-2">
        <Container>
          <Card>
            <CardHeader className="items-center">
              <CardTitle>
                {language === "french" ? "Mes informations" : "My information"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                {!emailVerified && (
                  <div className="text-red-500">
                    {language === "french"
                      ? "Votre e-mail n'est pas vérifié. "
                      : "Your email is not verified. "}
                    <Button onClick={resendVerificationEmail}>
                      {language === "french"
                        ? "Renvoyer l'e-mail de vérification"
                        : "Resend verification email"}
                    </Button>
                  </div>
                )}
                {emailVerified && (
                  <div className="text-green-500">
                    {language === "french"
                      ? "Votre e-mail est vérifié."
                      : "Your email is verified."}
                  </div>
                )}
              </div>
              <CardDescription>
                <Form {...form}>
                  <form className="w-full space-y-6 mt-4 mb-4">
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
                              className="w-full"
                              type="text"
                              {...field}
                              value={formData?.name}
                              readOnly
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                              className="w-full"
                              type="email"
                              {...field}
                              value={formData?.email}
                              readOnly
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
                              className="w-full"
                              {...field}
                              value={formData?.nom_cabinet}
                              readOnly
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
                              className="w-full"
                              {...field}
                              value={formData?.siret}
                              readOnly
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
                            {language === "french" ? "Adresse :" : "Address :"}
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="w-full"
                              {...field}
                              value={formData?.Adresse}
                              readOnly
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
                            {language === "french" ? "Bureau :" : "Office :"}
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="w-full"
                              {...field}
                              value={formData?.bureau}
                              readOnly
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
                              className="w-full"
                              {...field}
                              value={formData?.departement}
                              readOnly
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
                            {language === "french" ? "Pays" : "Country"}
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="w-full"
                              {...field}
                              value={formData?.Pays}
                              readOnly
                            />
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
                            {language === "french" ? "Etat" : "State"}
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="w-full"
                              {...field}
                              value={formData?.State}
                              readOnly
                            />
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
                            {language === "french" ? "Ville" : "City"}
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="w-full"
                              {...field}
                              value={formData?.Ville}
                              readOnly
                            />
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
                            {language === "french" ? "Code postal" : "ZIP Code"}
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="w-full"
                              {...field}
                              value={formData?.Code_postal}
                              readOnly
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
                              ? "Numéro de téléphone"
                              : "Phone number"}
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="w-full"
                              {...field}
                              value={formData?.Tel}
                              readOnly
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-start space-x-2 mt-8">
                      <img src={qrcode} alt="QR Code" className="w-44 h-44" />
                      <div className="text-start mt-2 text-base ">
                        {language === "french"
                          ? "Pour toute modification des informations, contactez le support technique, soit en scannant le code QR, soit en envoyant un e-mail "
                          : "For any changes to the information, contact technical support, either by scanning the QR code or by sending an email "}
                        <a
                          href="mailto:info@3dguidedental.com"
                          className="text-blue-500 underline"
                        >
                          {language === "french" ? "Ici" : "here"}
                        </a>
                        
                      </div>
                    </div>
                  </form>
                </Form>
              </CardDescription>
            </CardContent>
          </Card>
          <Separator />
          <Card>
            <CardHeader className="items-center">
              <CardTitle>
                {language === "french"
                  ? "Changer le mot de passe"
                  : "Change Password"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form
                  className="w-full space-y-6 mt-4 mb-4"
                  onSubmit={passwordForm.handleSubmit(handleChangePassword)}
                >
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {language === "french"
                            ? "Mot de passe actuel"
                            : "Current password"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            className={`w-full ${
                              passwordForm.watch("currentPassword") &&
                              currentPasswordValid
                                ? "border-green-500"
                                : passwordForm.watch("currentPassword")
                                ? "border-red-500"
                                : ""
                            }`}
                            placeholder={
                              language === "french"
                                ? "***********"
                                : "***********"
                            }
                            type="password"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              handlePasswordInputChange(e);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {language === "french"
                            ? "Nouveau mot de passe"
                            : "New password"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            className={`w-full ${
                              passwordForm.getFieldState("confirmNewPassword")
                                .isDirty &&
                              passwordForm.watch("newPassword") !==
                                passwordForm.watch("confirmNewPassword")
                                ? "border-red-500"
                                : ""
                            }`}
                            placeholder={
                              language === "french"
                                ? "***********"
                                : "***********"
                            }
                            type="password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmNewPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {language === "french"
                            ? "Confirmer le nouveau mot de passe"
                            : "Confirm new password"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            className={`w-full ${
                              passwordForm.getFieldState("confirmNewPassword")
                                .isDirty &&
                              passwordForm.watch("newPassword") !==
                                passwordForm.watch("confirmNewPassword")
                                ? "border-red-500"
                                : ""
                            }`}
                            placeholder={
                              language === "french"
                                ? "***********"
                                : "***********"
                            }
                            type="password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {passwordChangeError && (
                    <div className="text-red-500 bg-red-200 p-4 w-full">
                      {passwordChangeError}
                    </div>
                  )}
                  {passwordChangeSuccess && (
                    <div className="text-green-500 bg-green-200 p-4 w-full">
                      {passwordChangeSuccess}
                    </div>
                  )}

                  <Button
                    className="bg-[#0e0004] text-[#fffa1b] px-4 py-2 rounded-md mt-9"
                    type="submit"
                  >
                    {language === "french"
                      ? "Changer le mot de passe"
                      : "Change password"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          <CardFooter></CardFooter>
        </Container>
      </div>
    </SideBarContainer>
  );
};

export default Cabinet;
