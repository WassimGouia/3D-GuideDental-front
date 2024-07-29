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
import {
  Percent,
  ReceiptEuro,
  FileDigit,
  Truck,
  UsersRound,
  Package,
} from "lucide-react";

const { SubMenu } = Menu;

function Nouvellemodd() {
  const [selectedDescription, setSelectedDescription] =
    useState<React.ReactNode | null>(null);
  const [currentOffer, setCurrentOffer] = useState<any>(null); // Adjust the type based on your offer data structure
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext();
  const { language } = useLanguage();
  const { isStepCompleted } = useStepTracking();
  const storedFullname = localStorage.getItem("fullName");
  const storedCaseNumber = localStorage.getItem("caseNumber");

  useEffect(() => {
    if (!storedFullname || !storedCaseNumber) {
      navigate("/sign/Nouvelle-demande", { replace: true });
    } else {
      const fetchData = async () => {
        const token = getToken();
        if (token && user && user.id) {
          try {
            // Fetch user data including the offer
            const userResponse = await axios.get(
              `https://admin.3dguidedental.com/api/users/${user.id}?populate=offre`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            console.log("User Response:", userResponse.data);

            if (userResponse.data && userResponse.data.offre) {
              const offerData = userResponse.data.offre;
              setCurrentOffer({
                currentPlan: offerData.CurrentPlan,
                discount: getDiscount(offerData.CurrentPlan), // Assuming getDiscount is a function you have defined
              });
            } else {
              console.error("Offer data not found in the user response");
              setCurrentOffer(null);
            }
          } catch (error) {
            console.error(
              "Error fetching data:",
              error.response ? error.response.data : error.message
            );
            setCurrentOffer(null);
          }
        }
      };
      fetchData();
    }
  }, [user, navigate]);

  // Assuming you have a function to get the discount based on the plan
  const getDiscount = (plan) => {
    const discounts = {
      Essential: 5,
      Privilege: 10,
      Elite: 15,
      Premium: 20,
    };
    return discounts[plan] || 0;
  };

  const handleItemClick = (description: React.ReactNode) => {
    setSelectedDescription(description);
  };
  const supportedCountries = [
    "france",
    "belgium",
    "portugal",
    "germany",
    "netherlands",
    "luxembourg",
    "italy",
    "spain",
  ];
  const country = user && user.location[0].country.toLowerCase();

  // if (!formData) {
  //   return <><div>loading ...</div></>; // or return a loading spinner
  // }

  return (
    <SideBarContainer>
      <div className="flex-col p-1">
        <div className="m-4 ">
          <Nouvelle />

          <div className="flex-col mt-3 bg-gray-100 p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-3">
              {language === "french" ? "Détails du cas" : "Case Details"}
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <UsersRound className="text-yellow-600" />
                <p className="text-lg">
                  <span className="font-semibold">
                    {language === "french" ? "Patient: " : "Patient: "}
                  </span>
                  {storedFullname}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <FileDigit className="text-yellow-600" />
                <p>
                  <span className="font-semibold">
                    {language === "french"
                      ? "Numéro du cas: "
                      : "Case number: "}
                  </span>
                  {storedCaseNumber}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Package className="text-yellow-600" />
                <p>
                  <span className="font-semibold">
                    {language === "french"
                      ? "Offre actuelle: "
                      : "Current offer: "}
                  </span>
                  {currentOffer ? currentOffer.currentPlan : "Loading..."}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Percent className="text-yellow-600" />
                <p>
                  <span className="font-semibold">
                    {language === "french" ? "Réduction: " : "Discount: "}
                  </span>
                  {currentOffer ? `${currentOffer.discount}%` : "Loading..."}
                </p>
              </div>
            </div>
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
                  {supportedCountries.includes(country) ? (
                    <Menu.Item
                      key="1"
                      onClick={() => handleItemClick(<Description1 />)}
                    >
                      {language === "french"
                        ? "Guide à étages"
                        : "Stackable guide"}
                    </Menu.Item>
                  ) : (
                    <></>
                  )}
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
