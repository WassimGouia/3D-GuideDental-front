import { Card, CardContent } from '@/components/ui/card';
import SideBarContainer from '@/components/SideBarContainer';
import { useLanguage } from './languageContext';

const EmailConfirmationMessage = () => {
  const { language } = useLanguage();

  const isFrench = language === 'french';

  return (
    <SideBarContainer>
      <div className="flex items-center justify-center min-h-screen">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-black">
              {isFrench ? 'Confirmez Votre Email' : 'Confirm Your Email'}
            </h1>
            <p className="text-black">
              {isFrench ? 'Vous devez confirmer votre adresse e-mail en cliquant sur le lien qui vous a été envoyé.' : 'You should confirm your email address by clicking on the link sent to you.'}
            </p>
          </div>
          <Card className="transform rounded-lg bg-white shadow-lg transition-transform duration-300 hover:scale-105">
            <CardContent className="p-6 space-y-4 text-center">
              <p className="text-black">
                {isFrench ? 'Un lien de confirmation a été envoyé à votre adresse e-mail. Veuillez vérifier votre boîte de réception et cliquer sur le lien pour confirmer votre email.' : 'A confirmation link has been sent to your email address. Please check your inbox and click on the link to confirm your email.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </SideBarContainer>
  );
};

export default EmailConfirmationMessage;
