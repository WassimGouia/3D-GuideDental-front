import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import ClientSign from "@/views/ClientSign";
import Container from "@/components/Container";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLanguage } from "@/components/languageContext";
import SideBarContainer from "@/components/SideBarContainer";

const CreateAccount = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const FormSchema = z
    .object({
      email: z.string().email("Veuillez entrer une adresse e-mail valide"),
      password: z
        .string()
        .regex(
          /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/,
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and be at least 8 characters long"
        ),

      confirmPassword: z
        .string()
        .min(8, "ce champ doit contenir au moins 8 caractère(s)"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Les mots de passe ne correspondent pas",
      path: ["confirmPassword"],
    });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(data: any) {
    setFormData(data);
    navigate("/sign/information", {
      state: { email: data.email, password: data.password },
    });
  }

  return (
    <div>
      <SideBarContainer>
        <Container>
          <ClientSign />
          <div className="m-2">
            <Card>
              <CardHeader className="items-center font-roboto font-bold">
                <CardTitle>
                  <h1>
                    {language === "french"
                      ? "Créer un compte"
                      : "Create an account"}
                  </h1>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="w-full space-y-6 mt-4 mb-4"
                    >
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {language === "french"
                                ? "L'adresse e-mail:"
                                : "E-mail address:"}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={
                                  language === "french"
                                    ? "L'adresse e-mail (requis)"
                                    : "E-mail (requis)"
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
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {language === "french"
                                ? "Mot de passe:"
                                : "Password:"}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={
                                  language === "french"
                                    ? "Mot de passe (requis)"
                                    : "Password (required)"
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
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {language === "french"
                                ? "Confirmer le mot de passe:"
                                : "Confirm password:"}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={
                                  language === "french"
                                    ? "Confirmer le mot de passe  (requis)"
                                    : "Confirm password (required)"
                                }
                                type="password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex space-x-2 justify-end">
                        <p>
                          {language === "french"
                            ? "Vous avez déjà un compte?"
                            : "Already have an account?"}
                        </p>
                        <p>
                          <Link
                            to="/sign/information"
                            className="underline font-bold"
                          >
                            {language === "french" ? "se connecter" : "sign in"}
                          </Link>
                        </p>
                      </div>

                      <div className="flex justify-between  items-center">
                        <Button className="w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2 bg-[#fffa1b] text-[#0e0004] hover:bg-[#fffb1bb5] hover:text-[#0e0004] transition-all ">
                          <Link to="/">
                            {language === "french" ? "Précédent" : "Previous"}
                          </Link>
                        </Button>
                        <Button
                          className="w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2 bg-[#0e0004] text-[#fffa1b] hover:bg-[#211f20] hover:text-[#fffa1b] transition-all"
                          type="submit"
                        >
                          {language === "french" ? "Suivant" : "Next"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </Container>
      </SideBarContainer>
    </div>
  );
};

export default CreateAccount;
