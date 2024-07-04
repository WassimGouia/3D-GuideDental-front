import UKFlag from "@/assets/united-kingdom-flag_11654500.png";
import FranceFlag from "@/assets/france_3909323.png";
import { useLanguage } from "@/components/languageContext";
import { Button } from "@/components/ui/button";

const SwitchChangeLanguage = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <Button variant="outline" size="sm" onClick={() => language === "english" ? setLanguage("french") : setLanguage("english")}>
      {language === "english" ? 
        <>Switch to <img src={FranceFlag} alt="French" className="w-5 h-5  rotate-0 scale-100 transition-all ml-3" /></> : 
        <>Passer à <img src={UKFlag} alt="English" className="w-5 h-5  rotate-0 scale-100 transition-all ml-3"/></>}
    </Button>
  );
}

export default SwitchChangeLanguage