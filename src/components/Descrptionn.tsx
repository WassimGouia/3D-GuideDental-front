import img1 from "@/assets/Guide à étage.png";
import img2 from "@/assets/Guide classique.png";
import img4 from "@/assets/Goutière de bruxisme.png";
import img5 from "@/assets/Guide pour gingivectomie.png";
import img6 from "@/assets/autre service1.png";
import img7 from "@/assets/2.jpg";
import { Link } from "react-router-dom";
import { useLanguage } from "@/components/languageContext";

const DescriptionTemplate = ({ title, description, imgSrc, link }) => {
  const { language } = useLanguage();

  return (
    <div className="font-mono">
      <div className="mt-4 flex-col p-5">
        <h1 className="font-extrabold text-2xl">{title}</h1>
        <br />
        <p>{description}</p>
        <br />
        <img src={imgSrc} className="h-auto w-80" />
      </div>
        <div className="fixed -bottom-5 w-full flex justify-center">
          <Link to={link}>
            <button className="w-32 h-auto gap-3 rounded-lg px-3 py-2 bg-[#0e0004] text-[#fffa1b] hover:bg-[#211f20] hover:text-[#fffa1b] transition-all mb-9">
              {language === "french" ? "Suivant" : "Next"}
            </button>
          </Link>
        </div>
    </div>
  );
};

const Description1 = () => {
  const { language } = useLanguage();
  const title = language === "french" ? "Guide à étages" : "Stackable guide";
  const description =
    language === "french"
      ? "Le guide à étages est un guide chirurgical conçu pour orienter la pose d'implants et la mise en place de prothèses immédiates dans les cas de full arch. Il est constitué de plusieurs parties qui s'emboîtent grâce à un système mâle-femelle. La fixation de ce guide en bouche s'effectue à l'aide de plusieurs clavettes de fixation."
      : "The stackable guide is a surgical guide designed to guide the placement of implants and immediate prostheses in full arch cases. It consists of multiple parts that fit together using a male-female system. This guide is fixed in the mouth using several fixation pins.";
  return <DescriptionTemplate title={title} description={description} imgSrc={img1} link="/guide-etage" />;
};

const Description2 = () => {
  const { language } = useLanguage();
  const title = language === "french" ? "Guide classique" : "Classic guide";
  const description =
    language === "french"
      ? "Un guide classique est conçu pour orienter le forage et la pose d'implants dans les cas d'édentements partiels de petite étendue. En général, le guide sera principalement stabilisé par les dents restantes. Cependant, l'utilisation de clavettes de fixation peut être indiquée dans certaines situations spécifiques."
      : "A classic guide is designed to guide drilling and implant placement in cases of small partial edentulousness. In general, the guide will be mainly stabilized by the remaining teeth. However, the use of fixation pins may be indicated in certain specific situations.";
  return <DescriptionTemplate title={title} description={description} imgSrc={img2} link="/guide-classique" />;
};

const Description3 = () => {
  const { language } = useLanguage();
  const title = language === "french" ? "Guide pour gingivectomie" : "Gingivectomy guide";
  const description =
    language === "french"
      ? "Le guide pour gingivectomie est un guide chirurgical qui oriente le chemin de l'incision pour garantir une esthétique optimale des collets dentaires et traiter les sourires gingivaux. Ce guide est compatible avec les techniques conventionnelles utilisant une lame bistouri ainsi qu'avec la chirurgie au laser."
      : "The gingivectomy guide is a surgical guide that guides the path of the incision to ensure optimal aesthetics of the dental cervical part and treat gummy smiles. This guide is compatible with conventional techniques using a scalpel blade as well as with laser surgery.";
  return <DescriptionTemplate title={title} description={description} imgSrc={img5} link="/guide-gingivectomie" />;
};

const Description4 = () => {
  const { language } = useLanguage();
  const title = language === "french" ? "Gouttière de bruxisme" : "Bruxism splint";
  const description =
    language === "french"
      ? "La gouttière de bruxisme est un dispositif conçu pour atténuer les effets nocifs du grincement des dents, principalement observé pendant la nuit. Elle agit comme une barrière protectrice, réduisant ainsi l'usure excessive des dents. Son utilisation régulière peut contribuer à soulager les symptômes associés au bruxisme, tels que les maux de tête et les tensions musculaires."
      : "The bruxism splint is a device designed to mitigate the harmful effects of teeth grinding, mainly observed during the night. It acts as a protective barrier, thus reducing excessive wear of the teeth. Its regular use can help relieve symptoms associated with bruxism, such as headaches and muscle tension.";
  return <DescriptionTemplate title={title} description={description} imgSrc={img4} link="/gouttiere-bruxismes" />;
};

const Description5 = () => {
  const { language } = useLanguage();
  const title = language === "french" ? "Autres services de conception" : "Other design services";
  const description =
    language === "french"
      ? "Cette rubrique est ajoutée au cas où le service recherché ne serait pas répertorié. Faites votre demande en ajoutant les fichiers nécessaires (STL, DICOM, photos) ainsi que les renseignements cliniques. Nous vous répondrons avec un devis détaillé."
      : "This section is added in case the service you are looking for is not listed. Make your request by adding the necessary files (STL, DICOM, photos) as well as the clinical information. We will respond with a detailed quote.";
  return <DescriptionTemplate title={title} description={description} imgSrc={img6} link="/autre-services" />;
};

const Description6 = () => {
  const { language } = useLanguage();
  const title = language === "french" ? "Rapport radiologique" : "Radiological report";
  const description =
    language === "french"
      ? "Bénéficiez de nos rapports radiologiques rédigés par nos spécialistes en imagerie orale et maxillo-faciale. Envoyez vos fichiers radiologiques et remplissez le formulaire avec les observations cliniques. Nos experts vous fourniront ensuite un rapport détaillé."
      : "Benefit from our radiological reports written by our specialists in oral and maxillofacial imaging. Send your radiological files and fill out the form with clinical observations. Our experts will then provide you with a detailed report.";
  return <DescriptionTemplate title={title} description={description} imgSrc={img7} link="/rapport-radiologique" />;
};

export {
  Description1,
  Description2,
  Description3,
  Description4,
  Description5,
  Description6,
};
