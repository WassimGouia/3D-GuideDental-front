import { useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SideBarContainer from '@/components/SideBarContainer';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from './languageContext';

const EmailConfirmation = () => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { code } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isFrench = language === 'french';

  const handleConfirm = async () => {
    if (!code) {
      setMessage(isFrench ? 'Aucun jeton de confirmation trouvé.' : 'No confirmation token found.');
      return;
    }

    try {
      const response = await axios.get(
        `http://92.222.101.80:1337/api/auth/email-confirmation?confirmation=${code}`
      );

      if (response.status === 200) {
        setMessage(isFrench ? 'Email confirmé avec succès !' : 'Email confirmed successfully!');
        setIsLoading(true);  // Show the overlay and spinner
        setTimeout(() => {
          setIsLoading(false);
          navigate("/login");
        }, 5000);
      } else {
        setMessage(isFrench ? 'Échec de la confirmation de l\'email. Jeton invalide ou expiré.' : 'Failed to confirm email. Invalid or expired token.');
      }
    } catch (error) {
      setMessage(isFrench ? 'Une erreur s\'est produite. Veuillez réessayer.' : 'An error occurred. Please try again.');
    }
  };

  return (
    <SideBarContainer>
      <div className="flex items-center justify-center min-h-screen">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-black">
              {isFrench ? 'Confirmer l\'Email' : 'Confirm Email'}
            </h1>
            <p className="text-black">
              {isFrench ? 'Cliquez sur le bouton ci-dessous pour confirmer votre email.' : 'Click the button below to confirm your email.'}
            </p>
          </div>
          <Card className="transform rounded-lg bg-white shadow-lg transition-transform duration-300 hover:scale-105">
            <CardContent className="p-6 space-y-4 text-center">
              <Button type="button" onClick={handleConfirm} className="w-full bg-yellow-500 text-white">
                {isFrench ? 'Confirmer l\'Email' : 'Confirm Email'}
              </Button>
            </CardContent>
          </Card>
          {message && (
            <p className="text-center text-sm text-black">{message}</p>
          )}
        </div>
      </div>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-t-transparent"></div>
        </div>
      )}
    </SideBarContainer>
  );
};

export default EmailConfirmation;
