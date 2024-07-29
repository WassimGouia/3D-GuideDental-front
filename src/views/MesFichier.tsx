import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BEARER } from "@/components/Constant";
import { useAuthContext } from "@/components/AuthContext";
import { useLanguage } from "@/components/languageContext";
import { FileText, Box, Trash, CheckCheck, ThumbsUp, Edit, Factory, Truck, FilePenLineIcon, PaperclipIcon, File, Pencil, Send, SendHorizonal, User, Package, Percent } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { Button } from "@/components/ui/button";
import { Search, CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
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
import ReactPaginate from "react-paginate";
import { statuses } from "@/components/DummyData";
import { getToken } from "@/components/Helpers";
import { Tooltip } from "@material-tailwind/react";
import { loadStripe } from "@stripe/stripe-js";
import { InfoCircleOutlined, NumberOutlined } from "@ant-design/icons";

interface Guide {
  id: string;
  offre: string;
  type: string;
  attributes: {
    numero_cas: string;
    patient: string;
    createdAt: string;
    service?: {
      data?: {
        attributes?: {
          title?: string;
        };
      };
    };
    En_attente_approbation: boolean;
    en__cours_de_modification: boolean;
    archive: boolean;
    soumis: boolean;
    approuve: boolean;
    produire_expide: boolean;
    cout?: number;
    Demande_devis?: boolean;
  };
}
type State = {
  status: string;
  message: string;
};
const MesFichier: React.FC = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchName, setSearchName] = useState("");
  const [searchCaseNumber, setSearchCaseNumber] = useState("");

  const [searchDate, setSearchDate] = useState<Date | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedService, setSelectedService] = useState("");

  const [services, setServices] = useState(null);
  const { user } = useAuthContext();
  console.log("user",user)
  const navigate = useNavigate();
  const [currentOffer, setCurrentOffer] = useState<{
    currentPlan: string;
    discount: number;
  } | null>(null);
  const { language } = useLanguage();
  const apiUrl = import.meta.env.VITE_BACKEND_API_ENDPOINT;

  const guidesPerPage = 10;

  useEffect(() => {
    const fetchOfferData = async () => {
      if (!user) return;

      const token = getToken();
      if (!token) return;

      try {
        const response = await axios.get(
          `${apiUrl}/users/${user.id}?populate=offre`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && response.data.offre) {
          const offerData = response.data.offre;
          const offer = {
            currentPlan: offerData.CurrentPlan,
            discount: getDiscount(offerData.CurrentPlan),
          };
          setCurrentOffer(offer);

          const originalCost = 100;

          const discountAmount = (originalCost * offer.discount) / 100;
          const newCost = originalCost - discountAmount;
        }
      } catch (error) {
        console.error("Error fetching offer data:", error);
      }
    };

    fetchOfferData();
  }, [user]);

  const getDiscount = (plan: string): number => {
    const discounts: { [key: string]: number } = {
      Essential: 5,
      Privilege: 10,
      Elite: 15,
      Premium: 20,
    };
    return discounts[plan] || 0;
  };
  const fetchGuides = async () => {
    if (!user) return;

    const token = getToken()
    if (!token) return;

    try {
      const headers = { Authorization: `${BEARER} ${token}` };
      const guideTypes = [
        "guide-pour-gingivectomies",
        "gouttiere-de-bruxismes",
        "guide-a-etages",
        "guide-classiques",
        "autres-services-de-conceptions",
        "rapport-radiologiques",
      ];
      // populate=*
      const responses = await Promise.all(
        guideTypes.map((type) =>
          axios.get(
            `${apiUrl}/${type}?filters[user][id][$eq]=${user.id}&populate[options_generiques][populate]=*&populate[service]=*&populate[pdfFile]=*&populate[model3d]=*&populate[user]=*&populate[Options_supplementaires]=*`,
            { headers }
          )
        )
      );

      const allGuides = responses.flatMap((response, index) =>
        response.data.data.map((guide: any) => ({
          ...guide,
          type: guideTypes[index],
        }))
      );

      const sortedGuides = allGuides.sort((a, b) => 
        new Date(b.attributes.createdAt).getTime() - new Date(a.attributes.createdAt).getTime()
      );

      setGuides(sortedGuides);
      console.log("mmmmmmmmmmmmmmmmmmmmmmmm",sortedGuides)
      
    } catch (error) {
      console.error("Error fetching guides:", error);

    }
  };
  const fetchServices = async () => {
    try {

      const responses = await axios.get(
            `${apiUrl}/services`,
          )
        
      setServices(responses.data.data);
      
    } catch (error) {
      console.error("Error fetching guides:", error);

    }
  };

  useEffect(() => {
    fetchGuides();
  }, [user]);
  useEffect(() => {
    fetchServices()
  }, []);

  const getCurrentState = (
    attributes: Guide["attributes"],
    type: string
  ): State => {
    if (type === "rapport-radiologiques") {
      if (attributes.archive) return { status: "Archivé", message: "Le cas sera archivé pendant une période de 3 mois à partir de sa date de création. En l'absence d'une action de votre part au-delà de cette période, il sera automatiquement et définitivement supprimé." };
      if (attributes.soumis) return { status: "Soumis", message: "La demande de rapport radiologique a été soumise. Si le rapport n'apparaît pas sur votre compte dans les 3 jours ouvrés suivant sa soumission, veuillez nous contacter." };
      return { status: "Indéfini", message: "" };
    }
    
  
    if (type === "autres-services-de-conceptions") {
      if (attributes.Demande_devis) return {status:"Devis Demandé",message:"Le traitement de votre demande est en cours. Si vous ne recevez pas un devis dans les 3 jours ouvrés suivant la date de la demande, n'hésitez pas à nous contacter."};
      if (attributes.En_attente_approbation) return {status:"En attente d'approbation",message:"En attente d'approbation"};
      if (attributes.en__cours_de_modification) return {status:"En cours de modification",message:"Votre demande de modification a été enregistrée. Si le résultat ne figure pas sur votre compte dans les 2 jours ouvrés suivant la soumission, veuillez nous contacter."};
      if (attributes.archive) return { status: "Archivé", message: "Le cas sera archivé pendant une période de 3 mois à partir de sa date de création. En l'absence d'une action de votre part au-delà de cette période, il sera automatiquement et définitivement supprimé." };
      if (attributes.soumis) return { status: "Soumis", message: "Votre cas a été soumis. Si le résultat ne s'affiche pas sur votre compte dans les 3 jours ouvrés suivant la soumission, veuillez nous contacter." };
      if (attributes.approuve) return {status:"Approuvé",message:"Approuvé"};
      if (attributes.produire_expide) return {status:"Cas produit et expédié",message:"Votre cas a été expédié. Si vous ne recevez pas le cas dans un délai de 7 jours ouvrables à compter de la date d'approbation de la production, n'hésitez pas à nous contacter."};
      return {status:"Indéfini",message:""};
    }
    if(type === "guide-a-etages"){
      if (attributes.soumis) return { status: "Soumis", message: "Votre demande de guide à étages a été soumise. Si le résultat ne figure pas sur votre compte dans les 5 jours ouvrés suivant la soumission, veuillez nous contacter." };
      if (attributes.en__cours_de_modification) return {status:"En cours de modification",message:"Votre demande de modification a été enregistrée. Si le résultat ne figure pas sur votre compte dans les 3 jours ouvrés suivant la soumission, veuillez nous contacter."};
    }
    if (attributes.En_attente_approbation) return {status:"En attente d'approbation",message:"En attente d'approbation"};
    if (attributes.en__cours_de_modification) return {status:"En cours de modification",message:"Votre demande de modification a été enregistrée. Si le résultat ne figure pas sur votre compte dans les 2 jours ouvrés suivant la soumission, veuillez nous contacter."};
    if (attributes.archive) return { status: "Archivé", message: "Le cas sera archivé pendant une période de 3 mois à partir de sa date de création. En l'absence d'une action de votre part au-delà de cette période, il sera automatiquement et définitivement supprimé." };
    if (attributes.soumis) return { status: "Soumis", message: "Votre cas a été soumis. Si le résultat ne s'affiche pas sur votre compte dans les 3 jours ouvrés suivant la soumission, veuillez nous contacter." };
    if (attributes.approuve) return {status:"Approuvé",message:"Approuvé"};
    if (attributes.produire_expide) return {status:"Cas produit et expédié",message:"Votre cas a été expédié. Si vous ne recevez pas le cas dans un délai de 7 jours ouvrables à compter de la date d'approbation de la production, n'hésitez pas à nous contacter."};
    return {status:"Indéfini",message:""};
  };
  
  const handleSelectChange = (event) => {
    const selectedValue = event.target.value;
    console.log('Selected value:', selectedValue);
    setSelectedStatus(selectedValue);
  };
  
  const handleSelectChangeServices = (event) => {
    // Handle the change event here
    console.log(event.target.value);
    setSelectedService(event.target.value);

  };
  const filteredGuides = useMemo(() => {
    const filtered = guides.filter((guide) => {
      const nameMatch = guide.attributes.patient
        .toLowerCase()
        .includes(searchName.toLowerCase());
      const dateMatch =
        !searchDate ||
        new Date(guide.attributes.createdAt).toDateString() ===
          searchDate.toDateString();
      const statusMatch =
        !selectedStatus || getCurrentState(guide.attributes, guide.type).status === selectedStatus;
      const serviceMatch =
        !selectedService || guide.attributes.service?.data?.attributes?.title === selectedService;
      const caseNumberMatch = guide.attributes.numero_cas
        .toLowerCase()
        .includes(searchCaseNumber.toLowerCase());
      return nameMatch && dateMatch && statusMatch && serviceMatch && caseNumberMatch;
    });
    console.log("Filtered Guides:", filtered);
    return filtered;
  }, [guides, searchName, searchDate, selectedStatus, selectedService, searchCaseNumber]);
  
  const pageCount = Math.ceil(filteredGuides.length / guidesPerPage);
  const offset = currentPage * guidesPerPage;
  const currentPageData = filteredGuides.slice(offset, offset + guidesPerPage);


  const getEndpoint = (guideType: string): string => {
    switch (guideType) {
      case "guide-pour-gingivectomies":
        return `${apiUrl}/guide-pour-gingivectomies`;
      case "gouttiere-de-bruxismes":
        return `${apiUrl}/gouttiere-de-bruxismes`;
      case "guide-a-etages":
        return `${apiUrl}/guide-a-etages`;
      case "guide-classiques":
        return `${apiUrl}/guide-classiques`;
      case "autres-services-de-conceptions":
        return `${apiUrl}/autres-services-de-conceptions`;
      case "rapport-radiologiques":
        return `${apiUrl}/rapport-radiologiques`;
      default:
        throw new Error("Unknown guide type: " + guideType);
    }
  };

  const handleDemandeDevis = async (guide: Guide) => {
    try {
      const endpoint = getEndpoint(guide.type);
      const token = getToken();

      const response = await axios.put(
        `${endpoint}/${guide.id}`,
        {
          data: {
            archive: false,
            Demande_devis: true,
            En_attente_approbation: false,
            soumis: false,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const em = await axios.post(`${apiUrl}/sendEmailToNotify`,{
        email:"no-reply@3dguidedental.com",
        subject: "Case Status Update",
        content: `We would like to inform you that the client of case number ${guide.attributes.numero_cas} has requested a quote.`,
      })


      if (response.status === 200) {
        setGuides((prevGuides) =>
          prevGuides.map((g) =>
            g.id === guide.id
              ? {
                  ...g,
                  attributes: {
                    ...g.attributes,
                    archive: false,
                    Demande_devis: true,
                    En_attente_approbation: false,
                    soumis: false,
                  },
                }
              : g
          )
        );
        alert(
          language === "french"
            ? "Demande de devis envoyée avec succès"
            : "Quote request sent successfully"
        );
      }
    } catch (error) {
      console.error("Error sending quote request:", error);
      alert(
        language === "french"
          ? "Erreur lors de l'envoi de la demande de devis"
          : "Error sending quote request"
      );
    }
  };

  const stripePromise = loadStripe(
    "pk_test_51P7FeV2LDy5HINSgFRIn3T8E8B3HNESuLslHURny1RAImgxfy0VV9nRrTEpmlSImYA55xJWZQEOthTLzabxrVDLl00vc2xFyDt"
  ); 

  const handlesoumettre = async (guide: Guide) => {
    try {
      // const endpoint = getEndpoint(guide.type);
      localStorage.setItem("caseNumber",guide.attributes.numero_cas)
      localStorage.setItem("fullName",guide.attributes.patient)
      const requestData = {
        // cost: guide.attributes.service?.data.id === 5 ? guide.attributes.service_impression_et_expedition === false ? (guide.attributes.cout * (1 - getDiscount(currentOffer.currentPlan) /100)) : ((guide.attributes.cout * (1 - getDiscount(currentOffer.currentPlan) /100)) + user.location[0].country.toLowerCase() === "france" ? 7.5 : 15) :guide.attributes.cout,
        cost: guide.attributes.service?.data.id === 5 
        ? (guide.attributes.service_impression_et_expedition === false 
            ? (guide.attributes.cout * (1 - getDiscount(currentOffer.currentPlan) / 100)) 
            : ((guide.attributes.cout * (1 - getDiscount(currentOffer.currentPlan) / 100)) + (user.location[0].country.toLowerCase() === "france" ? 7.5 : 15))) 
        : guide.attributes.cout,
        service: guide.attributes.service?.data.id,
        patient: guide.attributes.patient,
        email: user && user.email,
        guideId:guide.id,
        numero_cas:guide.attributes.numero_cas
      };

      console.log("req",requestData)
  
      try {
        const stripe = await stripePromise;
        const response = await axios.post(
          `${apiUrl}/commandes`,
          requestData
        );
        const { error } = await stripe.redirectToCheckout({
          sessionId: response.data.stripeSession.id,
        });
        if (error) {
          console.error("Stripe checkout error:", error);
        }
      } catch (err) {
        console.log(err);
      }

    } catch (error) {
      console.error("Failed to soumettre guide:", error);
      if (axios.isAxiosError(error)) {
        console.error("Error response:", error.response?.data);
      }
      alert("Échec de la soumission du guide: " + (error as Error).message);
    }
  };


  const handlesoumettrePiecephysique = async (guide: Guide) => {
    try {  
      localStorage.setItem("guideType",guide.type)
      localStorage.setItem("guideId",guide.id)
      localStorage.setItem("offre",guide.attributes.offre)
      localStorage.setItem("originalCost",guide.attributes.piece_physique_cout)
  
      const requestData = {
        cost: ((guide.attributes.piece_physique_cout * (1 - getDiscount(guide.attributes.offre) / 100)) + (user.location[0].country.toLowerCase() === "france" ? 7.5 : 15)),
        patient: guide.attributes.patient,
        email: user && user.email,
        caseNumber:guide.attributes.numero_cas,
        type_travail: guide.type,
      };
      console.log("req",requestData)

      try {
        const stripe = await stripePromise;
        const response = await axios.post(
          `${apiUrl}/demande-produire-et-expidees`,
          requestData
        );
        const { error } = await stripe.redirectToCheckout({
          sessionId: response.data.stripeSession.id,
        });
        if (error) {
          console.error("Stripe checkout error:", error);
        }
      } catch (err) {
        console.log(err);
      }
    } catch (error) {
      console.error("Failed to soumettre guide:", error);
      if (axios.isAxiosError(error)) {
        console.error("Error response:", error.response?.data);
      }
      alert("Échec de la soumission du guide: " + (error as Error).message);
    }
  };


  const handleapprouver = async (guide: Guide) => {
    try {
      const endpoint = getEndpoint(guide.type);
      const token = getToken();
      if(guide.type === "guide-a-etages"){
        if(guide.attributes.Options_supplementaires.every(option => option.active === false)){
          const response = await axios.put(
            `${endpoint}/${guide.id}`,
            {
              data: {
                En_attente_approbation: false,
                approuve: true,
                soumis: false,
                en__cours_de_modification: false,
                archive: false,
                produire_expide: false,
              },
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          //guide.attributes.user.data.attributes.email
          const em = await axios.post(`${apiUrl}/sendEmailToNotify`,{
            email:"no-reply@3dguidedental.com",
            subject:"Case Status Update",
            content:`We would like to inform you that the status of case number ${guide.attributes.numero_cas} has been changed to "Approved".`
          })
          setGuides((prevGuides) =>
            prevGuides.map((g) =>
              g.id === guide.id
                ? {
                    ...g,
                    attributes: {
                      ...g.attributes,
                      En_attente_approbation: false,
                      approuve: true,
                      soumis: false,
                      en__cours_de_modification: false,
                      archive: false,
                      produire_expide: false,
                    },
                  }
                : g
            )
          );
        }else{
          const response = await axios.put(
            `${endpoint}/${guide.id}`,
            {
              data: {
                En_attente_approbation: false,
                approuve: false,
                soumis: false,
                en__cours_de_modification: false,
                archive: false,
                produire_expide: true,
              },
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const em = await axios.post(`${apiUrl}/sendEmailToNotify`,{
            email:"no-reply@3dguidedental.com",
            subject:"Case Status Update",
            content:`We would like to inform you that the status of case number ${guide.attributes.numero_cas} has been changed to "Produced and Shipped".`
          })
          setGuides((prevGuides) =>
            prevGuides.map((g) =>
              g.id === guide.id
                ? {
                    ...g,
                    attributes: {
                      ...g.attributes,
                      En_attente_approbation: false,
                      approuve: false,
                      soumis: false,
                      en__cours_de_modification: false,
                      archive: false,
                      produire_expide: true,
                    },
                  }
                : g
            )
          );
        }
      }else if (guide.type === "autres-services-de-conceptions"){
        if(guide.attributes.service_impression_et_expedition === true){
          const response = await axios.put(
            `${endpoint}/${guide.id}`,
            {
              data: {
                En_attente_approbation: false,
                approuve: false,
                soumis: false,
                en__cours_de_modification: false,
                archive: false,
                produire_expide: true,
              },
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const em = await axios.post(`${apiUrl}/sendEmailToNotify`,{
            email:"no-reply@3dguidedental.com",
            subject:"Case Status Update",
            content:`We would like to inform you that the status of case number ${guide.attributes.numero_cas} has been changed to "Produced and shipped".`
          })
  
          setGuides((prevGuides) =>
            prevGuides.map((g) =>
              g.id === guide.id
                ? {
                    ...g,
                    attributes: {
                      ...g.attributes,
                      En_attente_approbation: false,
                      approuve: false,
                      soumis: false,
                      en__cours_de_modification: false,
                      archive: false,
                      produire_expide: true,
                    },
                  }
                : g
            )
          );
        }else{
          const response = await axios.put(
            `${endpoint}/${guide.id}`,
            {
              data: {
                En_attente_approbation: false,
                approuve: true,
                soumis: false,
                en__cours_de_modification: false,
                archive: false,
                produire_expide: false,
              },
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const em = await axios.post(`${apiUrl}/sendEmailToNotify`,{
            email:"no-reply@3dguidedental.com",
            subject:"Case Status Update",
            content:`We would like to inform you that the status of case number ${guide.attributes.numero_cas} has been changed to "Approved".`
          })
  
          setGuides((prevGuides) =>
            prevGuides.map((g) =>
              g.id === guide.id
                ? {
                    ...g,
                    attributes: {
                      ...g.attributes,
                      En_attente_approbation: false,
                      approuve: true,
                      soumis: false,
                      en__cours_de_modification: false,
                      archive: false,
                      produire_expide: false,
                    },
                  }
                : g
            )
          );
        }

      }
      else{
        if(guide.attributes.options_generiques[0].Impression_Formlabs[0].active === false){
          const response = await axios.put(
            `${endpoint}/${guide.id}`,
            {
              data: {
                En_attente_approbation: false,
                approuve: true,
                soumis: false,
                en__cours_de_modification: false,
                archive: false,
                produire_expide: false,
              },
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const em = await axios.post(`${apiUrl}/sendEmailToNotify`,{
            email:"no-reply@3dguidedental.com",
            subject:"Case Status Update",
            content:`We would like to inform you that the status of case number ${guide.attributes.numero_cas} has been changed to "Approved".`
          })

          setGuides((prevGuides) =>
            prevGuides.map((g) =>
              g.id === guide.id
                ? {
                    ...g,
                    attributes: {
                      ...g.attributes,
                      En_attente_approbation: false,
                      approuve: true,
                      soumis: false,
                      en__cours_de_modification: false,
                      archive: false,
                      produire_expide: false,
                    },
                  }
                : g
            )
          );
        }else{
          const response = await axios.put(
            `${endpoint}/${guide.id}`,
            {
              data: {
                En_attente_approbation: false,
                approuve: false,
                soumis: false,
                en__cours_de_modification: false,
                archive: false,
                produire_expide: true,
              },
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const em = await axios.post(`${apiUrl}/sendEmailToNotify`,{
            email:"no-reply@3dguidedental.com",
            subject:"Case Status Update",
            content:`We would like to inform you that the status of case number ${guide.attributes.numero_cas} has been changed to "Produced and Shipped".`
          })

          setGuides((prevGuides) =>
            prevGuides.map((g) =>
              g.id === guide.id
                ? {
                    ...g,
                    attributes: {
                      ...g.attributes,
                      En_attente_approbation: false,
                      approuve: false,
                      soumis: false,
                      en__cours_de_modification: false,
                      archive: false,
                      produire_expide: true,
                    },
                  }
                : g
            )
          );
        }
      }




      alert("Guide approuvé avec succès");
    } catch (error) {
      console.error(`Error approving guide of type ${guide.type}:`, error);
      if (axios.isAxiosError(error)) {
        console.error("Error response:", error.response?.data);
        console.error("Error status:", error.response?.status);
      }
      alert(`Échec de l'approbation du guide: ${(error as Error).message}`);
    }
  };

  const handleModificationRequest = (guide: Guide) => {
    navigate("/sign/Demande-de-modification", {
      state: {
        caseNumber: guide.attributes.numero_cas,
        patient: guide.attributes.patient,
        typeDeTravail: guide.attributes.service?.data?.attributes?.title,
        guideType: guide.type,
        guideId: guide.id,
      },
    });
  };

  const handledemandedemodification1 = (guide: Guide) => {
    const route =
      guide.type === "guide-a-etages"
        ? "/sign/Demande-de-production-et-expedition-guide-etage"
        : "/sign/Demande-de-production-et-expedition-autre-guides";

    navigate(route, {
      state: {
        caseNumber: guide.attributes.numero_cas,
        patient: guide.attributes.patient,
        typeDeTravail: guide.attributes.service?.data?.attributes?.title,
        cost: guide.attributes.cout,
        guideType: guide.type,
        guideId: guide.id,
        offre:guide.attributes.offre
      },
    });
  };

  const handleDelete = async (guide: Guide) => {
    try {
      const endpoint = getEndpoint(guide.type);
      const token = getToken();

      const response = await axios.delete(`${endpoint}/${guide.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setGuides(filteredGuides.filter((g) => g.id !== guide.id));

    } catch (error) {
      console.error(`Error deleting guide of type ${guide.type}:`, error);
      if (axios.isAxiosError(error)) {
        console.error("Error response:", error.response?.data);
        console.error("Error status:", error.response?.status);
      }
      alert(`Échec de la suppression: ${(error as Error).message}`);
    }
  };

  const handlePageClick = (data: { selected: number }) => {
    setCurrentPage(data.selected);
  };

  const supportedCountries = ["france", "belgium", "portugal", "germany", "netherlands", "luxembourg", "italy", "spain"];
  const country = user && user.location[0].country.toLowerCase();
  return (
    <main className="bg-white flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 w-auto min-h-screen ">
      <div className="flex-col mt-3 bg-gray-100 p-4 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-3">
          {language === "french" ? "Détails de l'utilisateur" : "User Details"}
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <p className="text-lg flex space-x-2">
            <User className="text-yellow-600"/>
            <span className="font-semibold">
              {language === "french" ? "Utilisateur: " : "User: "}
            </span>
            <span>{user ? user.username : "Loading..."}</span>

          </p>
          <p className="text-lg flex space-x-2">
          <Package className="text-yellow-600" />
            <span className="font-semibold">
              {language === "french" ? "Offre actuelle: " : "Current offer: "}
            </span>
            <span>            {currentOffer ? currentOffer.currentPlan : "Loading..."}</span>
          </p>
          <p className="text-lg flex space-x-2">
          <Percent className="text-yellow-600" />
            <span className="font-semibold">
              {language === "french" ? "Réduction: " : "Discount: "}
            </span>
            <span>            {currentOffer ? `${currentOffer.discount}%` : "Loading..."}</span>
          </p>
        </div>
      </div>
      <div className="border shadow-sm rounded-lg p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">N°</TableHead>
              <TableHead className="text-center">{language === 'french' ? 'Nom du patient' : 'Patient Name'}</TableHead>
              <TableHead className="text-center">{language === 'french' ? 'Date de création' : 'Creation Date'}</TableHead>
              <TableHead className="text-center">{language === 'french' ? 'Type de travail' : 'Type of Work'}</TableHead>
              <TableHead className="text-center">{language === 'french' ? 'État' : 'Status'}</TableHead>
              <TableHead className="text-center">{language === 'french' ? 'Action à faire' : 'Action Required'}</TableHead>
              <TableHead className="text-center">{language === 'french' ? 'Fichiers' : 'Files'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">
              <TableHead className="text-center">
                <div className="relative">
                  <Input
                    id="search-bar"
                    type="number"
                    placeholder={`${language === "french" ? "Rechercher ..." : "Search ..."}`}
                    className="pl-10 pr-4 py-2 w-32 rounded-lg border border-gray-300 focus:outline-none focus:border-indigo-500"
                    value={searchCaseNumber}
                    onChange={(e) => setSearchCaseNumber(e.target.value)}
                  />
                  <NumberOutlined
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                    size={24}
                  />
                </div>
              </TableHead>
              </TableHead>
              <TableHead className="text-center">
                <div className="relative">
                  <Input
                    id="search-bar"
                    type="text"
                    placeholder={`${language === "french" ? "Rechercher ..." : "Search ..."}`}
                    className="pl-10 pr-4 py-2 w-32 rounded-lg border border-gray-300 focus:outline-none focus:border-indigo-500"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                    size={24}
                  />
                </div>
              </TableHead>
              <TableHead className="text-center">
                <div className="flex items-center space-x-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className="w-32 justify-start text-left font-normal"
                      >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {searchDate ? (
                          format(searchDate, "PPP")
                        ) : (
                          <span>Date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={searchDate}
                        onSelect={setSearchDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </TableHead>
              <TableHead className="text-center">
              <div className="flex items-center space-x-4">
                <select
                  onChange={handleSelectChangeServices}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:text-gray-500 sm:text-sm bg-white text-gray-900"
                >
                    <option value="">{language === "french" ? "Tout" : "All"}</option>
                    {services?.map((service) => (
                      <option key={service.id} value={service.attributes.title} >
                        {service.attributes.title}
                      </option>
                    ))}
                  </select>
                </div>
              </TableHead>
              <TableHead className="text-center">
                <div className="flex items-center space-x-4">
                  <select
                    onChange={handleSelectChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:text-gray-500 focus:text-gray-500 sm:text-sm bg-white text-gray-900"
                  >
                      <option value="" >
                      {language === "french" ? "Tout" : "All"}
                      </option>
                      {statuses.map((status) => (
                        <option key={status.value} value={status.value} >
                          {status.value}
                        </option>
                      ))}
                  </select>
                </div>
              </TableHead>
              <TableHead className="text-center"></TableHead>
              <TableHead className="text-center"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPageData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  {language === "french" ? "Aucune donnée disponible": "No data available"}
                </TableCell>
              </TableRow>
            ) : (
              currentPageData.map((guide,index) => (
                <TableRow key={index}>
                  <TableCell className="text-center">{guide.attributes.numero_cas}</TableCell>
                  <TableCell className="text-center">{guide.attributes.patient}</TableCell>
                  <TableCell className="text-center">
                    {new Date(guide.attributes.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-center">
                    {guide.attributes.service?.data?.attributes?.title || "No service"}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex space-x-4">
                      {getCurrentState(guide.attributes, guide.type).status}
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <InfoCircleOutlined className="h-4 w-auto cursor-pointer" />
                        </HoverCardTrigger>
                        <HoverCardContent className="bg-gray-200 bg-opacity-95">
                          <p>
                            {getCurrentState(guide.attributes, guide.type).message}
                          </p>
                        </HoverCardContent>
                      </HoverCard>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {guide.type === "rapport-radiologiques" ? (
                      <div className="flex space-x-4">
                        {guide.attributes.archive && (
                          <div className="flex space-x-4">
                            <AlertDialog>
                            <Tooltip content={`${language === "french"
                                      ? "Soumettre"
                                      : "Submit"}`}>
                              <AlertDialogTrigger asChild>
                                <div className="relative">
                                  <CheckCheck className="text-green-500 cursor-pointer w-6 h-6 animate-check" />
                                </div>
                              </AlertDialogTrigger>
                              </Tooltip>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                  {language === "french"
                                    ? "Êtes-vous sûr de vouloir soumettre ce cas ?"
                                    : "Are you sure you want to submit this case?"}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                  {language === "french"
                                    ? "Soumettez votre cas pour profiter d'une interprétation radiologique précise. Nos spécialistes en imagerie orale et maxillo-faciale vous fourniront un rapport détaillé couvrant votre domaine d'intérêt spécifique ainsi que toute pathologie identifiée."
                                    : "Submit your case to benefit from precise radiological interpretation. Our specialists in oral and maxillofacial imaging will provide you with a detailed report covering your specific area of interest as well as any identified pathology."}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    {language === "french" ? "Annuler" : "Cancel"}
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handlesoumettre(guide)}
                                  >
                                    {language === "french"
                                      ? "Soumettre"
                                      : "Submit"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>


                            <AlertDialog>
                            <Tooltip content={`${language === "french"
                                      ? "Supprimer"
                                      : "Delete"}`}>
                              <AlertDialogTrigger asChild>
                                  <div className="relative">
                                    <Trash className="text-red-500 cursor-pointer w-6 h-6 hover:animate-delete" />
                                  </div>
                              </AlertDialogTrigger>
                              </Tooltip>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    {language === "french"
                                      ? "Êtes-vous sûr(e) de vouloir supprimer définitivement le cas ?"
                                      : "Are you sure you want to permanently delete the case?"}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {language === "french"
                                      ? "Êtes-vous sûr de vouloir supprimer ce cas ? Cette action est irréversible."
                                      : "Are you sure you want to delete this case? This action cannot be undone."}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    {language === "french" ? "Annuler" : "Cancel"}
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(guide)}
                                  >
                                    {language === "french"
                                      ? "Supprimer"
                                      : "Delete"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                        {guide.attributes.soumis && (
                          <Tooltip content={`${language === "french"
                            ? "Soumis"
                            : "Submitted"}`}>
                            <div className="relative">
                              <CheckCheck className="text-gray-400 cursor-pointer w-6 h-6 animate-check" />
                            </div>
                          </Tooltip>
                        )}
                      </div>
                    ) : guide.type === "autres-services-de-conceptions" ? (
                      <div className="flex space-x-4">
                        {guide.attributes.archive && (
                          <>
                            <AlertDialog>
                            <Tooltip content={`${language === "french"
                                      ? "Demander un devis"
                                      : "Request a quote"}`}>
                              <AlertDialogTrigger asChild>
                              <div className="relative cursor-pointer">
                                <File className="text-gray-600 w-6 h-6" />
                                <Pencil className="absolute text-gray-600 w-4 h-4 animate-write top-2 left-4 transform -translate-x-1/2 -translate-y-1/2" />
                              </div>
                              </AlertDialogTrigger>
                              </Tooltip>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    {language === "french"
                                      ? "Êtes-vous sûr(e) de vouloir demander un devis ?"
                                      : "Are you sure you want to request a quote?"}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {language === "french"
                                      ? "Cliquez sur 'Demander un devis' pour obtenir gratuitement un devis sur votre demande."
                                      : "Click 'Request a quote' to get a free quote on your request."}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    {language === "french" ? "Annuler" : "Cancel"}
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDemandeDevis(guide)}
                                  >
                                    {language === "french"
                                      ? "Demander un devis"
                                      : "Request a quote"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog>
                            <Tooltip content={`${language === "french"
                                      ? "Supprimer"
                                      : "Delete"}`}>
                              <AlertDialogTrigger asChild>
                                <div className="relative">
                                    <Trash className="text-red-500 cursor-pointer w-6 h-6 hover:animate-delete" />
                                  </div>
                              </AlertDialogTrigger>
                              </Tooltip>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    {language === "french"
                                      ? "Êtes-vous sûr(e) de vouloir supprimer définitivement le cas ?"
                                      : "Are you sure you want to permanently delete the case?"}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {language === "french"
                                      ? "Êtes-vous sûr de vouloir supprimer ce cas ? Cette action est irréversible."
                                      : "Are you sure you want to delete this case? This action cannot be undone."}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    {language === "french" ? "Annuler" : "Cancel"}
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(guide)}
                                  >
                                    {language === "french"
                                      ? "Supprimer"
                                      : "Delete"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}

                        {guide.attributes.Demande_devis && (
                          <>
                            {guide.attributes.cout === 0 || guide.attributes.cout === null ? (
                              <Tooltip content={language === "french" ? "Demande de devis envoyée" : "Request for quote sent"}>
                                <div className="relative">
                                  <SendHorizonal className="text-purple-500 cursor-pointer w-6 h-6 animate-rocket" />
                                </div>
                              </Tooltip>
                            ) : (
                              <>
                                <AlertDialog>
                                <Tooltip content={`${language === "french"
                                          ? "Soumettre"
                                          : "Submit"}`}>
                                  <AlertDialogTrigger asChild>
                                    <div className="relative">
                                      <CheckCheck className="text-green-400 cursor-pointer w-6 h-6 animate-check" />
                                    </div>
                                  </AlertDialogTrigger>
                                  </Tooltip>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                      {language === "french"
                                          ? "Êtes-vous sûr de vouloir soumettre ce cas ?"
                                          : "Are you sure you want to submit this case?"}
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                      {language === "french"
                                        ? "Soumettez votre cas pour bénéficier d'une révision illimitée. Nos praticiens experts examineront le cas et vous enverront la planification pour validation."
                                        : "Submit your case to benefit from unlimited revision. Our expert practitioners will review the case and send you the plan for validation."}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        {language === "french" ? "Annuler" : "Cancel"}
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handlesoumettre(guide)}
                                      >
                                        {language === "french"
                                          ? "Soumettre"
                                          : "Submit"}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                                <AlertDialog>
                              <Tooltip content={language === "french" ? "Supprimer" : "Delete"}>
                                <AlertDialogTrigger asChild>
                                  <div className="relative">
                                    <Trash className="text-red-500 cursor-pointer w-6 h-6 hover:animate-delete" />
                                  </div>
                                </AlertDialogTrigger>
                              </Tooltip>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    {language === "french" ? "Êtes-vous sûr(e) de vouloir supprimer définitivement le cas ?" : "Are you sure you want to permanently delete the case?"}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {language === "french" ? "Êtes-vous sûr de vouloir supprimer ce cas ? Cette action est irréversible." : "Are you sure you want to delete this case? This action cannot be undone."}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    {language === "french" ? "Annuler" : "Cancel"}
                                  </AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(guide)}>
                                    {language === "french" ? "Supprimer" : "Delete"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                                </AlertDialog>
                          </>
                        )}


                        {guide.attributes.En_attente_approbation && (
                          <div className="flex space-x-4">
                            <AlertDialog>
                            <Tooltip content={`${language==="french" ? "Approuver":"Approuve"}`}>
                                <AlertDialogTrigger asChild>
                                    <div className="relative">
                                      <ThumbsUp className="text-blue-500 cursor-pointer w-6 h-6 hover:animate-thumbs-up" />
                                    </div>
                                </AlertDialogTrigger>
                              </Tooltip>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                  {language === "french"
                                    ? "Êtes-vous sûr de vouloir approuver le cas ?"
                                    : "Are you sure you want to approve the case?"}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                  {language === "french"
                                    ? "Si la planification proposée vous convient, cliquez sur 'Approuver' pour valider le cas."
                                    : "If the proposed planning is suitable for you, click on 'Approve' to validate the case."}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    {language === "french" ? "Annuler" : "Cancel"}
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleapprouver(guide)}
                                  >
                                    {language === "french"
                                      ? "Approuver"
                                      : "Approve"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog>
                              <Tooltip content={`${language==="french" ? "Demande de modification":"Request for modification"}`}>
                                <AlertDialogTrigger asChild>
                                    <div className="relative w-10 h-10">
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <Pencil className="text-orange-600 w-6 h-6 cursor-pointer hover:animate-edit-pencil" />
                                      </div>
                                    </div>
                                </AlertDialogTrigger>
                              </Tooltip>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                  {language === "french"
                                    ? "Êtes-vous sûr de vouloir modifier la planification ?"
                                    : "Are you sure you want to modify the planning?"}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {language === "french"
                                      ? "Si la planification proposée ne vous convient pas, cliquez sur 'Demande de modification' pour demander des rectifications"
                                      : "If the proposed planning does not suit you, click 'Request modification' to request corrections"}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    {language === "french" ? "Annuler" : "Cancel"}
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleModificationRequest(guide)
                                    }
                                  >
                                    {language === "french"
                                      ? "Demande de modification"
                                      : "Request modification"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}

                        {guide.attributes.en__cours_de_modification && (
                          <Tooltip content={`${language === "french"
                            ? "En cours de modification"
                            : "In progress of modification"}
                          `}>
                          <div className="cursor-pointer spinner-border animate-spin inline-block w-4 h-4 border-4 rounded-full border-t-transparent border-orange-500"></div>
                          </Tooltip>
                        )}

                        {guide.attributes.soumis && (
                          <Tooltip content={`${language === "french"
                            ? "Soumis"
                            : "Submitted"}`}>
                            <div className="relative">
                              <CheckCheck className="text-gray-400 cursor-pointer w-6 h-6 animate-check" />
                            </div>
                          </Tooltip>
                        )}

                        {guide.attributes.approuve && 
                          supportedCountries.includes(country) && guide.attributes.service_impression_et_expedition === false && guide.attributes.piece_physique_cout > 0 && (
                            <>
                              <AlertDialog>
                                <Tooltip content={language === "french" ? "Produire et expédier" : "Produce and ship"}>
                                  <AlertDialogTrigger asChild>
                                    <div className="relative flex space-x-2 text-gray-600 cursor-pointer">
                                      <Factory className="relative z-10" />
                                      <div className="absolute -left-2 -top-5 flex flex-col items-center space-y-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-smoke"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-smoke delay-200"></div>
                                      </div>
                                    </div>
                                  </AlertDialogTrigger>
                                </Tooltip>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      {language === "french" ? "Confirmer la demande Produire et expédier" : "Confirm Production and Shipping"}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {language === "french" ? "Êtes-vous sûr de vouloir produire et expédier ce cas ?" : "Are you sure you want to produce and ship this case?"}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      {language === "french" ? "Annuler" : "Cancel"}
                                    </AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handlesoumettrePiecephysique(guide)}>
                                      {language === "french" ? "Produire et expédier" : "Produce and ship"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )
                        }
                        {guide.attributes.produire_expide && (
                          <Tooltip content={language === "french" ? 
                            `Cas produire et expédier${guide.attributes.delivery_number ? `: ${guide.attributes.delivery_number}` : ""}` :
                            `Case produced and shipped${guide.attributes.delivery_number ? `: ${guide.attributes.delivery_number}` : ""}`}>
                            <Truck className="animate-move inline-block text-blue-300 cursor-pointer" />
                          </Tooltip>
                        )}
                      </div>
                    ) : guide.type === "guide-a-etages"?(
                      <div className="flex space-x-4">
                        {guide.attributes.produire_expide && (
                          <Tooltip content={language === "french" ? 
                            `Cas produire et expédier${guide.attributes.delivery_number ? `: ${guide.attributes.delivery_number}` : ""}` :
                            `Case produced and shipped${guide.attributes.delivery_number ? `: ${guide.attributes.delivery_number}` : ""}`}>
                            <Truck className="animate-move inline-block text-blue-300 cursor-pointer" />
                          </Tooltip>
                        )}
                        {guide.attributes.En_attente_approbation && (
                          <div className="flex space-x-4">
                            <AlertDialog>
                            <Tooltip content={`${language==="french" ? "Approuver":"Approuve"}`}>
                                <AlertDialogTrigger asChild>
                                <div className="relative">
                                      <ThumbsUp className="text-blue-500 cursor-pointer w-6 h-6 hover:animate-thumbs-up" />
                                </div>
                                </AlertDialogTrigger>
                              </Tooltip>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                  {language === "french"
                                    ? "Êtes-vous sûr de vouloir approuver le cas ?"
                                    : "Are you sure you want to approve the case?"}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                  {language === "french"
                                    ? "Si la planification proposée vous convient, cliquez sur 'Approuver' pour valider le cas."
                                    : "If the proposed planning is suitable for you, click on 'Approve' to validate the case."}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    {language === "french" ? "Annuler" : "Cancel"}
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleapprouver(guide)}
                                  >
                                    {language === "french"
                                      ? "Approuver"
                                      : "Approve"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog>
                              <Tooltip content={`${language==="french" ? "Demande de modification":"Request for modification"}`}>
                                <AlertDialogTrigger asChild>
                                <div className="relative w-10 h-10">
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <Pencil className="text-orange-600 w-6 h-6 cursor-pointer hover:animate-edit-pencil" />
                                      </div>
                                    </div>
                                </AlertDialogTrigger>
                              </Tooltip>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                  {language === "french"
                                    ? "Êtes-vous sûr de vouloir modifier la planification ?"
                                    : "Are you sure you want to modify the planning?"}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {language === "french"
                                      ? "Si la planification proposée ne vous convient pas, cliquez sur 'Demande de modification' pour demander des rectifications"
                                      : "If the proposed planning does not suit you, click 'Request modification' to request corrections"}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    {language === "french" ? "Annuler" : "Cancel"}
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleModificationRequest(guide)
                                    }
                                  >
                                    {language === "french"
                                      ? "Demande de modification"
                                      : "Request modification"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                        {guide.attributes.soumis && (
                          <Tooltip content={`${language === "french"
                            ? "Soumis"
                            : "Submitted"}`}>
                            <div className="relative">
                              <CheckCheck className="text-gray-400 cursor-pointer w-6 h-6 animate-check" />
                            </div>
                          </Tooltip>
                        )}

                        {guide.attributes.en__cours_de_modification && (
                          <Tooltip content={`${language === "french"
                            ? "En cours de modification"
                            : "In progress of modification"}
                          `}>
                          <div className="cursor-pointer spinner-border animate-spin inline-block w-4 h-4 border-4 rounded-full border-t-transparent border-orange-500"></div>
                          </Tooltip>
                        )}
                        {guide.attributes.approuve &&
                              supportedCountries.includes(country) &&
                              guide.attributes.Options_supplementaires.every(option => option.active === false) && (                            <>
                              <AlertDialog>
                                <Tooltip content={language === "french" ? "Produire et expédier" : "Produce and ship"}>
                                  <AlertDialogTrigger asChild>
                                    <div className="relative flex space-x-2 text-gray-600 cursor-pointer">
                                      <Factory className="relative z-10" />
                                      <div className="absolute -left-2 -top-5 flex flex-col items-center space-y-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-smoke"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-smoke delay-200"></div>
                                      </div>
                                    </div>
                                  </AlertDialogTrigger>
                                </Tooltip>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      {language === "french" ? "Confirmer la demande Produire et expédier" : "Confirm Production and Shipping"}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {language === "french" ? "Êtes-vous sûr de vouloir produire et expédier ce cas ?" : "Are you sure you want to produce and ship this case?"}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      {language === "french" ? "Annuler" : "Cancel"}
                                    </AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handledemandedemodification1(guide)}>
                                      {language === "french" ? "Produire et expédier" : "Produce and ship"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )
                        }
                        {guide.attributes.archive && (
                            <div className="flex space-x-4">
                            <AlertDialog>
                            <Tooltip content={`${language === "french"
                                      ? "Soumettre"
                                      : "Submit"}`}>
                              <AlertDialogTrigger asChild>
                                <div className="relative">
                                  <CheckCheck className="text-green-400 cursor-pointer w-6 h-6 animate-check" />
                                </div>
                              </AlertDialogTrigger>
                              </Tooltip>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                  {language === "french"
                                      ? "Êtes-vous sûr de vouloir soumettre ce cas ?"
                                      : "Are you sure you want to submit this case?"}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                  {language === "french"
                                    ? "Soumettez votre cas pour bénéficier d'une révision illimitée. Nos praticiens experts examineront le cas et vous enverront la planification pour validation."
                                    : "Submit your case to benefit from unlimited revision. Our expert practitioners will review the case and send you the plan for validation."}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    {language === "french" ? "Annuler" : "Cancel"}
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handlesoumettre(guide)}
                                  >
                                    {language === "french"
                                      ? "Soumettre"
                                      : "Submit"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>



                            <AlertDialog>
                            <Tooltip content={`${language === "french"
                                      ? "Supprimer"
                                      : "Delete"}`}>
                              <AlertDialogTrigger asChild>
                                  <div className="relative">
                                    <Trash className="text-red-500 cursor-pointer w-6 h-6 hover:animate-delete" />
                                  </div>
                              </AlertDialogTrigger>
                              </Tooltip>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    {language === "french"
                                      ? "Êtes-vous sûr(e) de vouloir supprimer définitivement le cas ?"
                                      : "Are you sure you want to permanently delete the case?"}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {language === "french"
                                      ? "Êtes-vous sûr de vouloir supprimer ce cas ? Cette action est irréversible."
                                      : "Are you sure you want to delete this case? This action cannot be undone."}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    {language === "french" ? "Annuler" : "Cancel"}
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(guide)}
                                  >
                                    {language === "french"
                                      ? "Supprimer"
                                      : "Delete"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                    ): (
                      <> 
                      <div className="flex space-x-4">
                      {guide.attributes.produire_expide && (
                          <Tooltip content={language === "french" ? 
                            `Cas produire et expédier${guide.attributes.delivery_number ? `: ${guide.attributes.delivery_number}` : ""}` :
                            `Case produced and shipped${guide.attributes.delivery_number ? `: ${guide.attributes.delivery_number}` : ""}`}>
                            <Truck className="animate-move inline-block text-blue-300 cursor-pointer" />
                          </Tooltip>
                        )}
                        {guide.attributes.En_attente_approbation && (
                          <>
                            <AlertDialog>
                            <Tooltip content={`${language==="french" ? "Approuver":"Approuve"}`}>
                                <AlertDialogTrigger asChild>
                                <div className="relative">
                                      <ThumbsUp className="text-blue-500 cursor-pointer w-6 h-6 hover:animate-thumbs-up" />
                                </div>
                                </AlertDialogTrigger>
                              </Tooltip>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                  {language === "french"
                                    ? "Êtes-vous sûr de vouloir approuver le cas ?"
                                    : "Are you sure you want to approve the case?"}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                  {language === "french"
                                    ? "Si la planification proposée vous convient, cliquez sur 'Approuver' pour valider le cas."
                                    : "If the proposed planning is suitable for you, click on 'Approve' to validate the case."}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    {language === "french" ? "Annuler" : "Cancel"}
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleapprouver(guide)}
                                  >
                                    {language === "french"
                                      ? "Approuver"
                                      : "Approve"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>


                            <AlertDialog>
                              <Tooltip content={`${language==="french" ? "Demande de modification":"Request for modification"}`}>
                                <AlertDialogTrigger asChild>
                                    <div className="relative w-10 h-10">
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <Pencil className="text-orange-600 w-6 h-6 cursor-pointer hover:animate-edit-pencil" />
                                      </div>
                                    </div>
                                </AlertDialogTrigger>
                              </Tooltip>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                  {language === "french"
                                    ? "Êtes-vous sûr de vouloir modifier la planification ?"
                                    : "Are you sure you want to modify the planning?"}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {language === "french"
                                      ? "Si la planification proposée ne vous convient pas, cliquez sur 'Demande de modification' pour demander des rectifications"
                                      : "If the proposed planning does not suit you, click 'Request modification' to request corrections"}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    {language === "french" ? "Annuler" : "Cancel"}
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleModificationRequest(guide)
                                    }
                                  >
                                    {language === "french"
                                      ? "Demande de modification"
                                      : "Request modification"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                        {guide.attributes.soumis && (
                          <Tooltip content={`${language === "french"
                            ? "Soumis"
                            : "Submitted"}`}>
                            <div className="relative">
                              <CheckCheck className="text-gray-400 cursor-pointer w-6 h-6 animate-check" />
                            </div>
                          </Tooltip>
                        )}

                        {guide.attributes.approuve && 
                          guide.attributes.options_generiques[0].Impression_Formlabs[0].active === false &&
                          supportedCountries.includes(country) && (
                            <>
                              <AlertDialog>
                                <Tooltip content={language === "french" ? "Produire et expédier" : "Produce and ship"}>
                                  <AlertDialogTrigger asChild>
                                    <div className="relative flex space-x-2 text-gray-600 cursor-pointer">
                                      <Factory className="relative z-10" />
                                      <div className="absolute -left-2 -top-5 flex flex-col items-center space-y-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-smoke"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-smoke delay-200"></div>
                                      </div>
                                    </div>
                                  </AlertDialogTrigger>
                                </Tooltip>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      {language === "french" ? "Confirmer la demande Produire et expédier" : "Confirm Production and Shipping"}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {language === "french" ? "Êtes-vous sûr de vouloir produire et expédier ce cas ?" : "Are you sure you want to produce and ship this case?"}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      {language === "french" ? "Annuler" : "Cancel"}
                                    </AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handledemandedemodification1(guide)}>
                                      {language === "french" ? "Produire et expédier" : "Produce and ship"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )
                        }
                        {guide.attributes.en__cours_de_modification && (
                          <Tooltip content={`${language === "french"
                            ? "En cours de modification"
                            : "In progress of modification"}
                          `}>
                          <div className="cursor-pointer spinner-border animate-spin inline-block w-4 h-4 border-4 rounded-full border-t-transparent border-orange-500"></div>
                          </Tooltip>
                        )}
                        {guide.attributes.archive && (
                          <div className="flex space-x-4">
                          <AlertDialog>
                          <Tooltip content={`${language === "french"
                                    ? "Soumettre"
                                    : "Submit"}`}>
                            <AlertDialogTrigger asChild>
                            <div className="relative">
                              <CheckCheck className="text-green-500 cursor-pointer w-6 h-6 animate-check" />
                            </div>
                            </AlertDialogTrigger>
                            </Tooltip>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                {language === "french"
                                    ? "Êtes-vous sûr de vouloir soumettre ce cas ?"
                                    : "Are you sure you want to submit this case?"}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                {language === "french"
                                  ? "Soumettez votre cas pour bénéficier d'une révision illimitée. Nos praticiens experts examineront le cas et vous enverront la planification pour validation."
                                  : "Submit your case to benefit from unlimited revision. Our expert practitioners will review the case and send you the plan for validation."}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  {language === "french" ? "Annuler" : "Cancel"}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handlesoumettre(guide)}
                                >
                                  {language === "french"
                                    ? "Soumettre"
                                    : "Submit"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <AlertDialog>
                          <Tooltip content={`${language === "french"
                                    ? "Supprimer"
                                    : "Delete"}`}>
                            <AlertDialogTrigger asChild>
                                  <div className="relative">
                                    <Trash className="text-red-500 cursor-pointer w-6 h-6 hover:animate-delete" />
                                  </div>
                            </AlertDialogTrigger>
                            </Tooltip>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {language === "french"
                                    ? "Êtes-vous sûr(e) de vouloir supprimer définitivement le cas ?"
                                    : "Are you sure you want to permanently delete the case?"}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {language === "french"
                                    ? "Êtes-vous sûr de vouloir supprimer ce cas ? Cette action est irréversible."
                                    : "Are you sure you want to delete this case? This action cannot be undone."}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  {language === "french" ? "Annuler" : "Cancel"}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(guide)}
                                >
                                  {language === "french"
                                    ? "Supprimer"
                                    : "Delete"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                        )}
                      </div>
                      </>
                    )}
                    </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center space-x-4">
                      <div className="flex flex-col items-center">
                        {guide.attributes.pdfFile?.data?.attributes?.url ? (
                          <a
                            href={`https://admin.3dguidedental.com${guide.attributes.pdfFile.data.attributes.url}`}
                            download
                            target="_blank"
                            className="text-blue-500 hover:text-blue-700"
                            title="Download PDF"
                          >
                            <FileText size={24} />
                          </a>
                        ) : (
                          <FileText
                            size={24}
                            className="text-gray-300"
                            title="PDF not available"
                          />
                        )}
                        <span className="text-xs mt-1">PDF</span>
                      </div>
                      {guide.type !== "rapport-radiologiques" && (
                        <div className="flex flex-col items-center">
                          {guide.attributes.model3d?.data?.attributes?.url ? (
                            <a
                              href={`https://admin.3dguidedental.com${guide.attributes.model3d.data.attributes.url}`}
                              download
                              className="text-blue-500 hover:text-blue-700"
                              title="Download 3D Model"
                            >
                              <Box size={24} />
                            </a>
                          ) : (
                            <Box
                              size={24}
                              className="text-gray-300"
                              title="3D Model not available"
                            />
                          )}
                          <span className="text-xs mt-1">3D</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}

          </TableBody>
        </Table>
      </div>
      <div className="flex justify-center">
        <ReactPaginate
          previousLabel={`← ${language==="french" ? "Précédent" : "Previous"}`}
          nextLabel={`${language==="french" ? "Suivant" : "Next"} →`}
          breakLabel={"..."}
          pageCount={pageCount}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={handlePageClick}
          containerClassName={"pagination flex justify-center"}
          activeClassName={""}
          pageLinkClassName={
            "text-black hover:bg-white hover:text-black px-4 py-2 mx-1"
          }
          previousLinkClassName={
            "text-black hover:bg-white hover:text-black px-4 py-2  mx-1"
          }
          nextLinkClassName={
            "text-black hover:bg-white hover:text-black px-4 py-2  mx-1"
          }
          activeLinkClassName={
            "bg-white text-black px-4 py-2 border border-black mx-1 rounded"
          }
          disabledClassName={"opacity-50 cursor-not-allowed"}
          className="flex flex-row gap-4 mb-4"
        />
      </div>
    </main>
  );
};

export default MesFichier;
