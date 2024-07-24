import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SideBarContainer from "@/components/SideBarContainer";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/components/languageContext";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isFrench = language === 'french';

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setMessage(isFrench ? "Les mots de passe ne correspondent pas." : "Passwords do not match.");
      return;
    }

    if (!validatePassword(password)) {
      setMessage(
        isFrench 
          ? "Le mot de passe doit comporter au moins 8 caractères, inclure au moins une lettre minuscule, une lettre majuscule et un chiffre."
          : "Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, and one number."
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:1337/api/auth/reset-password",
        {
          code: token,
          password,
          passwordConfirmation: confirmPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setMessage(isFrench ? "Mot de passe mis à jour avec succès." : "Password updated successfully.");
        setTimeout(() => {
          setIsLoading(false);
          navigate('/login');
        }, 3000);
      } else {
        setMessage(isFrench ? "Échec de la mise à jour du mot de passe." : "Failed to update password.");
        setIsLoading(false);
      }
    } catch (error) {
      setMessage(isFrench ? "Une erreur s'est produite. Veuillez réessayer." : "An error occurred. Please try again.");
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
              {isFrench ? 'Entrez un nouveau mot de passe pour votre compte.' : 'Enter a new password for your account.'}
            </p>
          </div>
          <Card className="rounded-lg bg-white shadow-lg">
            <CardContent className="space-y-4">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="password">{isFrench ? 'Nouveau mot de passe' : 'New Password'}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={isFrench ? 'Entrez le nouveau mot de passe' : 'Enter new password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{isFrench ? 'Confirmer le mot de passe' : 'Confirm Password'}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder={isFrench ? 'Confirmez le nouveau mot de passe' : 'Confirm new password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <CardFooter>
                  <Button type="submit" className="w-full bg-yellow-500 text-white">
                    {isFrench ? 'Mettre à jour le mot de passe' : 'Update Password'}
                  </Button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>
          {message && (
            <p className="text-center text-sm text-muted-foreground">{message}</p>
          )}
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

export default ResetPassword;
