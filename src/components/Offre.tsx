import { Button } from "@/components/ui/button";
import img1English from "@/assets/3 (2).png";
import img1French from "@/assets/4 (2).png";
import img2English from "@/assets/1 (2).png";
import img2French from "@/assets/2 (1).png";
// import img2 from "@/assets/offre2.png";
import Container from "@/components/Container";
import { useLanguage } from "@/components/languageContext";
import SideBarContainer from "@/components/SideBarContainer";
import { Link } from "react-router-dom";

const Offre = () => {
  const { language } = useLanguage();
  return (
    <SideBarContainer>
      <Container>
        <div className="overflow-auto">
          <div className="mt-4">
            <img
              src={language === "french" ? img1French : img1English}
              className="h-auto w-full"
            />
            <img
              src={language === "french" ? img2French : img2English}
              className="h-auto w-full"
            />
          </div>
          <div className="flex justify-between p-4">
            <div className="flex flex-col items-center">
              <p className="underline mb-2 text-zinc-700">
                {language === "french"
                  ? "Vous n'avez pas de compte?"
                  : "Don't have an account?"}
              </p>
              <Link to="/sign/createAccount">
                <Button className="bg-[#fffa1b] text-[#0e0004] hover:bg-[#fffb1b95] px-2 py-2 rounded-md shadow-md transition duration-500 ease-in-out transform hover:-translate-y-1  h-12 w-52">
                  {language === "french"
                    ? "Créer un compte"
                    : "Create an account"}
                </Button>
              </Link>
            </div>

            <div className="flex flex-col items-center">
              <p className="underline mb-2 text-zinc-700">
                {language === "french"
                  ? "Vous avez déjà un compte?"
                  : "Already have an account?"}
              </p>
              <Link to="/login">
                <Button className="bg-[#0e0004] text-[#fffa1b] px-2 py-2 rounded-md shadow-md transition duration-500 ease-in-out transform hover:-translate-y-1 h-12 w-52">
                  {language === "french" ? "Se connecter" : "Login"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </SideBarContainer>
  );
};

export default Offre;
