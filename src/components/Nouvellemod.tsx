import React, { useEffect, useState } from "react";
import { AppstoreOutlined } from "@ant-design/icons";
import { Menu } from "antd";
import Container from "@/components/Container";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Nouvelle from "@/components/Nouvelledemande";
import {
  Description1,
  Description2,
  Description3,
  Description4,
  Description5,
  Description6,
} from "@/components/Descrptionn";
import SideBarContainer from "@/components/SideBarContainer";
import { useLanguage } from "@/components/languageContext";
import { useAuthContext } from "@/components/AuthContext";
import { getToken } from "@/components/Helpers";
import { useStepTracking } from "@/components/StepTrackingContext";
import axios from "axios";

const { SubMenu } = Menu;

function Nouvellemodd() {
  const [selectedDescription, setSelectedDescription] =
    useState<React.ReactNode | null>(null);
  const [caseDetails, setCaseDetails] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext();
  const { language } = useLanguage();
  const { completeStep, isStepCompleted } = useStepTracking();

  const formData = location.state?.formData;

  useEffect(() => {
    if (
      !isStepCompleted("Nouvelle-demande") ||
      !formData ||
      !formData.fullname ||
      !formData.caseNumber
    ) {
      // If the previous step is not completed or formData is missing/incomplete, redirect to Nouvelle-demande
      navigate("/sign/Nouvelle-demande", { replace: true });
    } else {
      // Fetch case details
      const fetchData = async () => {
        const token = getToken();
        if (token && user && user.id) {
          try {
            const response = await axios.get(
              `http://localhost:1337/api/cases/${formData.caseNumber}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            setCaseDetails(response.data);
          } catch (error) {
            console.error("Error fetching case details:", error);
          }
        }
      };
      fetchData();
    }
  }, [user, formData, navigate, isStepCompleted]);

  const handleItemClick = (description: React.ReactNode) => {
    setSelectedDescription(description);
  };

  // const handleCompletion = () => {
  //   completeStep("Nouvelle-modelisation");
  //   // Navigate to the next step or perform other actions
  //   // For example: navigate("/sign/next-step");
  // };

  if (!formData) {
    return null; // or return a loading spinner
  }

  return (
    <SideBarContainer>
      <div className="flex-col p-1">
        <div className="m-4 ">
          <Nouvelle />

          <div className="flex-col mt-3">
            <p className="text-lg font-semibold">
              Patient: {formData.fullname}
            </p>
            <p>
              {language === "french" ? "Numéro du cas: " : "Case number: "}
              {formData.caseNumber}
            </p>
            <p>
              {language === "french" ? " Offre actuelle:" : "Current offer:"}
            </p>
          </div>
          <br />
          <div className="flex flex-col md:flex-row">
            <div className="overflow-auto max-h-max md:max-h-full md:w-64">
              <Menu mode="inline">
                <SubMenu
                  title={
                    language === "french"
                      ? "Guides chirurgicaux"
                      : "Surgical guides"
                  }
                  icon={<AppstoreOutlined />}
                >
                  <Menu.Item
                    key="1"
                    onClick={() => handleItemClick(<Description1 />)}
                  >
                    {language === "french"
                      ? "Guide à étages"
                      : "Stackable guide"}
                  </Menu.Item>
                  <Menu.Item
                    key="2"
                    onClick={() => handleItemClick(<Description2 />)}
                  >
                    {language === "french"
                      ? "Guide classique"
                      : "Classic guide"}
                  </Menu.Item>
                </SubMenu>
                <SubMenu
                  title={
                    language === "french"
                      ? "Services de conception"
                      : "Design services"
                  }
                  icon={<AppstoreOutlined />}
                >
                  <Menu.Item
                    key="3"
                    onClick={() => handleItemClick(<Description3 />)}
                  >
                    {language === "french"
                      ? "Guide pour gingivectomie"
                      : "Gingivectomy guide"}
                  </Menu.Item>
                  <Menu.Item
                    key="4"
                    onClick={() => handleItemClick(<Description4 />)}
                  >
                    {language === "french"
                      ? "Gouttière de bruxisme"
                      : "Bruxism splint"}
                  </Menu.Item>
                  <Menu.Item
                    key="5"
                    onClick={() => handleItemClick(<Description5 />)}
                  >
                    {language === "french"
                      ? "Autres services de conception"
                      : "Other design services"}
                  </Menu.Item>
                </SubMenu>
                <Menu.Item
                  key="sub3"
                  icon={<AppstoreOutlined />}
                  onClick={() => handleItemClick(<Description6 />)}
                >
                  {language === "french"
                    ? "Rapport radiologique"
                    : "Radiological report"}
                </Menu.Item>
              </Menu>
            </div>
            <Container>{selectedDescription}</Container>
          </div>

          <div className="flex justify-between mt-4">
            <Link to="/sign/Nouvelle-demande">
              <Button className="w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2 bg-[#fffa1b] text-[#0e0004] hover:bg-[#fffb1bb5] hover:text-[#0e0004] transition-all">
                {language === "french" ? "Précédent" : "Previous"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </SideBarContainer>
  );
}

export default Nouvellemodd;
