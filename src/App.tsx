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
                  <ProtectedRoute requiredSteps={[]}>
                    <Nouvelled />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sign/Nouvelle-modelisation"
                element={
                  <ProtectedRoute requiredSteps={["Nouvelle-demande"]}>
                    <Nouvellemodd />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sign/Demande-de-modification"
                element={
                  <ProtectedRoute
                    requiredSteps={[
                      "Nouvelle-demande",
                      "Nouvelle-modelisation",
                    ]}
                  >
                    <Demandemodification />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sign/Demande-de-production-et-expedition-guide-etage"
                element={
                  <ProtectedRoute
                    requiredSteps={[
                      "Nouvelle-demande",
                      "Nouvelle-modelisation",
                    ]}
                  >
                    <DemandeProdExpGuideEtage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sign/Demande-de-production-et-expedition-autre-guides"
                element={
                  <ProtectedRoute
                    requiredSteps={[
                      "Nouvelle-demande",
                      "Nouvelle-modelisation",
                    ]}
                  >
                    <DemandeProdExpAutreGuides />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cabinet"
                element={
                  <ProtectedRoute>
                    <Cabinet />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mes-fichier"
                element={
                  <ProtectedRoute>
                    <Mesfiche />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/SelectedItemsPageGETAGE"
                element={
                  <ProtectedRoute
                    requiredSteps={[
                      "Nouvelle-demande",
                      "Nouvelle-modelisation",
                      "guide-etage",
                    ]}
                  >
                    <SelectedItemsPageGETAGE />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/SelectedItemsPageGbruxisme"
                element={
                  <ProtectedRoute
                    requiredSteps={[
                      "Nouvelle-demande",
                      "Nouvelle-modelisation",
                      "gouttiere-bruxismes",
                    ]}
                  >
                    <SelectedItemsPageGbruxisme />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/selectedItemsPageGclassique"
                element={
                  <ProtectedRoute
                    requiredSteps={[
                      "Nouvelle-demande",
                      "Nouvelle-modelisation",
                      "guide-classique",
                    ]}
                  >
                    <SelectedItemsPageGclassique />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/selectedItemsPageAutreService"
                element={
                  <ProtectedRoute
                    requiredSteps={[
                      "Nouvelle-demande",
                      "Nouvelle-modelisation",
                      "autre-services",
                    ]}
                  >
                    <SelectedItemsPageAutreService />
                  </ProtectedRoute>
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
                  <ProtectedRoute
                    requiredSteps={[
                      "Nouvelle-demande",
                      "Nouvelle-modelisation",
                      "guide-gingivectomie",
                    ]}
                  >
                    <SelectedItemsPageGging />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/selectedItemsPageRapportRad"
                element={
                  <ProtectedRoute
                    requiredSteps={[
                      "Nouvelle-demande",
                      "Nouvelle-modelisation",
                      "rapport-radiologique",
                    ]}
                  >
                    <SelectedItemsPageRapportRad />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/guide-etage"
                element={
                  <ProtectedRoute
                    requiredSteps={[
                      "Nouvelle-demande",
                      "Nouvelle-modelisation",
                    ]}
                  >
                    <GuideEtage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/guide-classique"
                element={
                  <ProtectedRoute
                    requiredSteps={[
                      "Nouvelle-demande",
                      "Nouvelle-modelisation",
                    ]}
                  >
                    <GuideClassique />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/guide-gingivectomie"
                element={
                  <ProtectedRoute
                    requiredSteps={[
                      "Nouvelle-demande",
                      "Nouvelle-modelisation",
                    ]}
                  >
                    <GuideGingivectomie />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gouttiere-bruxismes"
                element={
                  <ProtectedRoute
                    requiredSteps={[
                      "Nouvelle-demande",
                      "Nouvelle-modelisation",
                    ]}
                  >
                    <GouttiereBruxismes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rapport-radiologique"
                element={
                  <ProtectedRoute
                    requiredSteps={[
                      "Nouvelle-demande",
                      "Nouvelle-modelisation",
                    ]}
                  >
                    <RapportRadiologique />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/autre-services"
                element={
                  <ProtectedRoute
                    requiredSteps={[
                      "Nouvelle-demande",
                      "Nouvelle-modelisation",
                    ]}
                  >
                    <AutreServices />
                  </ProtectedRoute>
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
