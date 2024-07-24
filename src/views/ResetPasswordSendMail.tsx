import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SideBarContainer from "@/components/SideBarContainer";
import axios from "axios";
import { useLanguage } from "@/components/languageContext";

const ResetPasswordSendMail = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();
  const isFrench = language === 'french';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:1337/api/auth/forgot-password",
        {
          email,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setMessage(isFrench ? "Lien de réinitialisation du mot de passe envoyé à votre email." : "Reset password link sent to your email.");
      } else {
        setMessage(isFrench ? "Échec de l'envoi du lien de réinitialisation du mot de passe." : "Failed to send reset password link.");
      }
    } catch (error) {
      setMessage(isFrench ? "Une erreur s'est produite. Veuillez réessayer." : "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SideBarContainer>
      <div className="flex items-center justify-center min-h-screen">
        <div className="mx-auto w-full max-w-md space-y-6 py-12">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">
              {isFrench ? 'Réinitialiser le mot de passe' : 'Reset Password'}
            </h1>
            <p className="text-muted-foreground">
              {isFrench ? 'Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.' : 'Enter your email address and we\'ll send you a link to reset your password.'}
            </p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">{isFrench ? 'Email' : 'Email'}</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-yellow-500 text-white">
              {isFrench ? 'Réinitialiser le mot de passe' : 'Reset Password'}
            </Button>
          </form>
          {message && (
            <p className="text-center text-sm text-muted-foreground">
              {message}
            </p>
          )}
          <div className="text-center text-sm text-muted-foreground">
            <Link to="/login" className="underline underline-offset-4">
              {isFrench ? 'Retour à la connexion' : 'Return to login'}
            </Link>
          </div>
        </div>
        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-t-transparent"></div>
          </div>
        )}
      </div>
    </SideBarContainer>
  );
};

export default ResetPasswordSendMail;
