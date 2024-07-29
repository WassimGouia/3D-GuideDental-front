import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Container from "@/components/Container";
import { useState } from "react";
import axios from "axios";
import SideBarContainer from "@/components/SideBarContainer";
import { useLanguage } from "@/components/languageContext";
import { setToken } from "@/components/Helpers";
import { useAuthContext } from "@/components/AuthContext";

function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { setUser } = useAuthContext();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "https://admin.3dguidedental.com/api/auth/local",
        { identifier, password }
      );
      setToken(response.data.jwt);
      setUser(response.data.user);
      window.location.href="/cabinet"
    } catch (error) {
      console.error("Login failed:",error.response.data.error.message);
      setError(error.response ? error.response.data.error.message : "Failed to login. Please check your credentials and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const { language } = useLanguage();

  return (
    <SideBarContainer>
      <div className="mt-2">
        <Container>
          <Card>
            <CardHeader className="items-center font-roboto font-bold">
              <CardTitle>
                <h1>
                  {language === "french"
                    ? "se connecter à votre compte"
                    : "Login to your account"}
                </h1>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && <div className="text-red-500 bold text-center">{error}</div>}

              <CardDescription>
                <h3 className="mt-4 mb-4">
                  {language === "french"
                    ? "Veuillez entrer votre login et mot de passe pour vous connecter à la platerforme"
                    : "Please enter your login and password to connect to the platform"}
                </h3>
                <div className="mt-4 mb-4">
                  <Label htmlFor="email">
                    {language === "french" ? "Adresse email" : "Email address"}
                  </Label>
                  <Input
                    id="email"
                    placeholder="email"
                    type="email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </div>
                <div className="mt-4 mb-4">
                  <Label htmlFor="name">
                    {language === "french" ? "Mot De Passe" : "Password"}
                  </Label>
                  <Input
                    id="Mot De Passe"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="flex justify-between">
                  <p>
                    <Link
                      to="/reset-password-send-mail"
                      className="underline font-bold"
                    >
                      {language === "french"
                        ? "Mot de passe oublié ?"
                        : "Forgot password ?"}
                    </Link>
                  </p>

                  <div className="flex space-x-2">
                    <p>
                      {language === "french"
                        ? "Vous n'avez pas de compte?"
                        : "Don't have an account?"}
                    </p>
                    <p>
                      <Link
                        to="/sign/createAccount"
                        className="underline font-bold"
                      >
                        {language === "french"
                          ? "Créer un compte"
                          : "Create an account"}
                      </Link>
                    </p>
                  </div>
                </div>
              </CardDescription>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleLogin} disabled={isLoading}>
                {isLoading
                  ? "Loading..."
                  : language === "french"
                  ? "Se connecter"
                  : "Login"}
              </Button>
            </CardFooter>
          </Card>
        </Container>
      </div>
    </SideBarContainer>
  );
}

export default Login;
