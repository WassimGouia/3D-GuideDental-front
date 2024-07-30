import { Link, useNavigate } from "react-router-dom";
import { Library, LogOut, NotepadText, Files, Menu } from "lucide-react";
import logo from "@/assets/LOGO 3d guide dental (1).png";
import SwitchChangeLanguage from "@/components/SwitchChangeLanguage";
import { useLanguage } from "@/components/languageContext";
import { useAuthContext } from "@/components/AuthContext";
import { removeToken } from "@/components/Helpers";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
const SideBar = () => {
  const { language } = useLanguage();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear()
    removeToken();
    window.location.href="/login"
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <Button
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={toggleSidebar}
      >
        <Menu className="h-6 w-6" />
      </Button>

      <aside
        className={`fixed top-0 left-0 h-full bg-white z-40 transition-transform duration-300 transform md:w-1/6 ${
          isOpen ? "translate-x-0 w-2/3" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col justify-between h-full">
          <div className="flex-1">
            <Link
              className="flex items-center gap-2 font-semibold m-2"
              to={"https://www.3dguidedental.com/"}
            >
              <img src={logo} alt="Logo" />
            </Link>
            {user ? (
              <nav className="grid items-start px-4 space-y-2 text-base font-medium">
                <Link
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                  to={"/cabinet"}
                >
                  <Library className="h-4 w-4" />
                  {language === "french" ? "Mon Cabinet" : "My Office"}
                </Link>

                <Link
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                  to={"/sign/Nouvelle-demande"}
                >
                  <NotepadText className="h-4 w-4" />
                  {language === "french" ? "Nouvelle demande" : "New request"}
                </Link>
                <Link
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                  to={"/mes-fichiers"}
                >
                  <Files className="h-4 w-4" />
                  {language === "french" ? "Mes fichiers" : "My files"}
                </Link>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="flex items-center gap-3 rounded-lg px-3 py-2 bg-[#0e0004] text-[#fffa1b] hover:bg-[#211f20] hover:text-[#fffa1b] transition-all dark:text-gray-400 dark:hover:text-white"
                      
                    >
                      <LogOut className="h-4 w-4" />
                      {language === "french" ? "Déconnexion" : "Logout"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {language === "french"
                          ? "Voulez-vous vraiment vous déconnecter?"
                          : "Are you sure you want to log out?"}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {language === "french"
                          ? "Cela mettra fin à votre session."
                          : "This will end your session."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{language === "french" ? "Annuler" : "Cancel"}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleLogout}>{language === "french" ? "Oui, déconnecter" : "Yes, logout"}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </nav>
            ) : (
              <div className="grid items-start px-4 space-y-2 text-base font-medium">
                <Button
                  className="flex items-center gap-3 rounded-lg px-3 py-2 bg-[#fffa1b] text-[#0e0004] hover:bg-[#fffb1bb5] hover:text-[#0e0004] transition-all "
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </Button>
                <Button
                  className="flex items-center gap-3 rounded-lg px-3 py-2 bg-[#0e0004] text-[#fffa1b] hover:bg-[#211f20] hover:text-[#fffa1b] transition-all"
                  onClick={() => navigate("/sign/createAccount")}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center justify-center mb-3">
            <SwitchChangeLanguage />
          </div>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black opacity-50 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default SideBar;
