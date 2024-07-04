import { Card } from "@/components/ui/card";
import SideBarContainer from "@/components/SideBarContainer";
import Container from "@/components/Container";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/components/languageContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Label } from "@/components/ui/label";

const DemandeProdExpGuideEtage = () => {
  const [cost, setCost] = useState(0);
  const [firstSwitch, setFirstSwitch] = useState(false);
  const [activeSwitch, setActiveSwitch] = useState<number | null>(null);
  const [additionalCost, setAdditionalCost] = useState(0);

  const handleFirstSwitch = () => {
    setFirstSwitch((prev) => !prev);
    setAdditionalCost((prev) => (prev === 0 ? 150 : 0));
  };

  const handleSwitch = (switchNumber: number) => {
    setActiveSwitch((prevSwitch) => {
      if (prevSwitch === switchNumber) {
        setCost(0);
        return null;
      } else {
        switch (switchNumber) {
          case 1:
            setCost(150);
            break;
          case 2:
            setCost(100);
            break;
          case 3:
            setCost(300);
            break;
          case 4:
            setCost(400);
            break;
          default:
            break;
        }
        return switchNumber;
      }
    });
  };

  const { language } = useLanguage();
  return (
    <SideBarContainer>
      <Container>
        <Card className="p-3">
          <div className="flex items-center justify-center">
            <h1 className="font-extrabold font-roboto text-lg">
              {language === "french"
                ? "Demande de production et expédition"
                : "Production Inquiry and Shipping"}
            </h1>
          </div>
          <div>
            <div className="flex-col">
              <p className="text-lg  font-semibold">
                {language === "french" ? "Nom du patient:" : "Patient's name:"}
              </p>
              <p>{language === "french" ? "Numéro du cas:" : "Case number:"}</p>
              <p>
                {language === "french" ? "Type de travail:" : "Type of work:"}
              </p>
              <p>
                {language === "french" ? "coût" : "Cost"}{" "}
                {cost + additionalCost}€
              </p>
            </div>
          </div>
          <br />
          <div className="flex-col items-center space-y-2 ">
            <div className="flex space-x-2 justify-between">
              <p>
                {language === "french"
                  ? "Mise en charge immédiate (impression de la prothèse immédiate)"
                  : "Immediate loading (impression of the immediate prosthesis)"}
              </p>
              <Switch checked={firstSwitch} onClick={handleFirstSwitch} />
            </div>
            <div className="flex space-x-2 justify-between">
              <Label htmlFor="airplane-mode">
                {language === "french"
                  ? "Impression des 2étages en résine (prothèse immédiate non incluse)"
                  : "Resin impression of both guide parts (immediate prosthesis not included)"}
              </Label>
              <Switch
                checked={activeSwitch === 2}
                onClick={() => handleSwitch(2)}
              />
            </div>
            <div className="flex space-x-2 justify-between">
              <Label htmlFor="airplane-mode">
                {language === "french"
                  ? "Impression du premier étage en métal + deuxième étage en résine (prothèse immédiate non incluse)"
                  : "Metal impression of the first guide part + second guide part in resin (immediate prosthesis not included)"}
              </Label>
              <Switch
                checked={activeSwitch === 3}
                onClick={() => handleSwitch(3)}
              />
            </div>
            <div className="flex space-x-2 justify-between">
              <Label htmlFor="airplane-mode">
                {language === "french"
                  ? "Impression des 2 étages en métal (prothèse immédiate non incluse)"
                  : " Metal impression of both guide parts (immediate prosthesis not included)"}
              </Label>
              <Switch
                checked={activeSwitch === 4}
                onClick={() => handleSwitch(4)}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between">
              <Button className="bg-[#fffa1b] text-[#0e0004] px-4 py-2 rounded-md mt-9">
                {language === "french" ? "Précédent" : "Previous"}
              </Button>
              <Button className="bg-[#0e0004] text-[#fffa1b] px-4 py-2 rounded-md mt-9">
                {language === "french" ? "Suivant" : "Next"}
              </Button>
            </div>
          </div>
        </Card>
      </Container>
    </SideBarContainer>
  );
};

export default DemandeProdExpGuideEtage;
