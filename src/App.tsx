import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import AuthProvider from "@/components/AuthProvider";
import { CaseCounterProvider } from "@/components/CaseCounterContext";
import { StepTrackingProvider } from "@/components/StepTrackingContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Import all your components here
import CreateAccount from "./components/CreateAccount";
import Offre from "./components/Offre";
import InformationForm from "./components/InformationForm";
import Nouvelled from "@/views/Nouvelledemand";
import Nouvellemodd from "@/components/Nouvellemod";
import Demandemodification from "@/components/Demandemodification";
import Cabinet from "@/views/Cabinet";
import Mesfiche from "./views/Mesfichiet";
import GuideEtage from "@/views/GuideEtage";
import GuideClassique from "@/views/GuideClassique";
import GuideGingivectomie from "@/views/GuideGingivectomie";
import GouttiereBruxismes from "@/views/GouttiereBruxismes";
import RapportRadiologique from "@/views/RapportRadiologique";
import AutreServices from "@/views/AutreServices";
import SelectedItemsPageGETAGE from "@/views/SelectedItemsPageGetage";
import Login from "./components/Login";
import SelectedItemsPageGclassique from "@/views/SelectedItemsPageGclassique";
import SelectedItemsPageGging from "@/views/SelectedItemsPageGging";
import SelectedItemsPageAutreService from "@/views/SelectedItemsPageAutreService";
import SelectedItemsPageRapportRad from "@/views/SelectedItemsPageRapportRad";
import SelectedItemsPageGbruxisme from "@/views/SelectedItemsPageGbruxisme";
import DemandeProdExpGuideEtage from "@/views/DemandeProdExpGuideEtage";
import DemandeProdExpAutreGuides from "./views/DemandeProdExpAutreGuides";
import OTP from "@/views/OTP";
import ResetPassword from "@/views/ResetPassword";
import ResetPasswordSendMail from "@/views/ResetPasswordSendMail";
import EmailConfirmation from "./components/emailConfirmation";
import EmailConfirmationMessage from "./components/EmailConfirmationMessage";
import PaymentCancel from "./views/paymentCancel";
import Service1Success from "./views/successPages/service1success";
import Service6Success from "./views/successPages/service6success";
import Service4Success from "./views/successPages/service4success";
import Service2Success from "./views/successPages/service2success";
import Service3Success from "./views/successPages/service3success";
import Service7Success from "./views/successPages/service7success";
import Service8Success from "./views/successPages/service8success";
import Service5Success from "./views/successPages/service5success";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <AuthProvider>
        <CaseCounterProvider>
          <StepTrackingProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Navigate to="/offre" />} />
              
              <Route path="/offre" element={<Offre />} />
              <Route path="/service1-success" element={<Service1Success />} />
              <Route path="/service2-success" element={<Service2Success />} />
              <Route path="/service3-success" element={<Service3Success />} />
              <Route path="/service4-success" element={<Service4Success />} />
              <Route path="/service5-success" element={<Service5Success />} />
              <Route path="/service6-success" element={<Service6Success />} />
              <Route path="/service7-success" element={<Service7Success />} />
              <Route path="/service8-success" element={<Service8Success />} />
              <Route path="/payment-cancel" element={<PaymentCancel />} />

              <Route path="/login" element={<Login />} />
              <Route path="/sign/createAccount" element={<CreateAccount />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/reset-password-send-mail"
                element={<ResetPasswordSendMail />}
              />
              <Route path="/otp-verif" element={<OTP />} />
              <Route path="/sign/information" element={<InformationForm />} />

              {/* Protected routes */}

              <Route
                path="/sign/Nouvelle-demande"
                element={
                    <Nouvelled />
                }
              />
              <Route
                path="/sign/Nouvelle-modelisation"
                element={
                    <Nouvellemodd />
                }
              />
              <Route
                path="/sign/Demande-de-modification"
                element={
                    <Demandemodification />
                }
              />
              <Route
                path="/sign/Demande-de-production-et-expedition-guide-etage"
                element={
                    <DemandeProdExpGuideEtage />
                }
              />
              <Route
                path="/sign/Demande-de-production-et-expedition-autre-guides"
                element={
                    <DemandeProdExpAutreGuides />
                }
              />
              <Route
                path="/cabinet"
                element={
                    <Cabinet />
                }
              />
              <Route
                path="/mes-fichiers"
                element={
                    <Mesfiche />
                }
              />
              <Route
                path="/SelectedItemsPageGETAGE"
                element={
                    <SelectedItemsPageGETAGE />
                }
              />
              <Route
                path="/SelectedItemsPageGbruxisme"
                element={
                    <SelectedItemsPageGbruxisme />
                }
              />
              <Route
                path="/selectedItemsPageGclassique"
                element={
                    <SelectedItemsPageGclassique />
                }
              />
              <Route
                path="/selectedItemsPageAutreService"
                element={
                    <SelectedItemsPageAutreService />
                }
              />
              <Route path="/confirm/:code" element={<EmailConfirmation />} />
              <Route
                path="/confirmation"
                element={<EmailConfirmationMessage />}
              />
              <Route
                path="/reset-password/:token"
                element={<ResetPassword />}
              />
              <Route
                path="/reset-password-send-mail"
                element={<ResetPasswordSendMail />}
              />
              <Route
                path="/selectedItemsPageGging"
                element={
                    <SelectedItemsPageGging />
                }
              />
              <Route
                path="/selectedItemsPageRapportRad"
                element={
                    <SelectedItemsPageRapportRad />
                }
              />
              <Route
                path="/guide-etage"
                element={
                    <GuideEtage />
                }
              />
              <Route
                path="/guide-classique"
                element={
                    <GuideClassique />
                }
              />
              <Route
                path="/guide-gingivectomie"
                element={
                    <GuideGingivectomie />
                }
              />
              <Route
                path="/gouttiere-bruxismes"
                element={
                    <GouttiereBruxismes />
                }
              />
              <Route
                path="/rapport-radiologique"
                element={
                     <RapportRadiologique />
                }
              />
              <Route
                path="/autre-services"
                element={
                    <AutreServices />
                }
              />
            </Routes>
          </StepTrackingProvider>
        </CaseCounterProvider>
      </AuthProvider>
    </div>
  );
};

export default App;
