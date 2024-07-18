import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BEARER } from "@/components/Constant";
import { useAuthContext } from "@/components/AuthContext";
import { useLanguage } from "@/components/languageContext";
import { FileText, Box } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import cn from "classnames";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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

interface Guide {
  id: string;
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
    // Add other fields as needed
  };
}

interface Status {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MesFichier: React.FC = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState<Date | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [currentOffer, setCurrentOffer] = useState<{
    currentPlan: string;
    discount: number;
  } | null>(null);
  const [originalCost, setOriginalCost] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);
  const { language } = useLanguage(); // Add this line

  const guidesPerPage = 10;

  useEffect(() => {
    const fetchOfferData = async () => {
      if (!user) return;

      const token = localStorage.getItem("authToken");
      if (!token) return;

      try {
        const response = await axios.get(
          `http://localhost:1337/api/users/${user.id}?populate=offre`,
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

          // Assuming you have a way to get the original cost
          // You might need to adjust this based on your actual data structure
          const originalCost = 100; // Replace with actual original cost
          setOriginalCost(originalCost);

          const discountAmount = (originalCost * offer.discount) / 100;
          const newCost = originalCost - discountAmount;
          setCost(newCost);
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

  useEffect(() => {
    const fetchGuides = async () => {
      if (!user) return;

      const token = localStorage.getItem("authToken");
      if (!token) return;

      setIsLoading(true);
      setError(null);

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

        const responses = await Promise.all(
          guideTypes.map((type) =>
            axios.get(
              `http://localhost:1337/api/${type}?filters[user][id][$eq]=${user.id}&populate=*`,
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
        setGuides(allGuides);
      } catch (error) {
        console.error("Error fetching guides:", error);
        setError("Failed to fetch guides. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuides();
  }, [user]);

  const filteredGuides = useMemo(() => {
    return guides.filter((guide) => {
      const nameMatch = guide.attributes.patient
        .toLowerCase()
        .includes(searchName.toLowerCase());
      const dateMatch =
        !searchDate ||
        new Date(guide.attributes.createdAt).toDateString() ===
          searchDate.toDateString();
      const stateMatch =
        !selectedStatus ||
        getCurrentState(guide.attributes) === selectedStatus.label;
      return nameMatch && dateMatch && stateMatch;
    });
  }, [guides, searchName, searchDate, selectedStatus]);

  const pageCount = Math.ceil(filteredGuides.length / guidesPerPage);
  const offset = currentPage * guidesPerPage;
  const currentPageData = filteredGuides.slice(offset, offset + guidesPerPage);

  // const determineGuideType = (guide: any): string => {
  //   if (guide.attributes.hasOwnProperty("guide_pour_gingivectomies"))
  //     return "gingivectomies";
  //   if (guide.attributes.hasOwnProperty("gouttiere_de_bruxismes"))
  //     return "bruxism";
  //   if (guide.attributes.hasOwnProperty("autres_services_de_conceptions"))
  //     return "autres";
  //   return "unknown";
  // };

  const getCurrentState = (
    attributes: Guide["attributes"],
    type: string
  ): string => {
    if (type === "rapport-radiologiques") {
      if (attributes.archive) return "Archivé";
      if (attributes.submit) return "Soumis";
      return "Indéfini";
    }

    if (type === "autres-services-de-conceptions") {
      if (attributes.Demande_devis) return "Devis Demandé";
      if (attributes.En_attente_approbation) return "En attente d'approbation";
      if (attributes.en__cours_de_modification)
        return "En cours de modification";
      if (attributes.archive) return "Archivé";
      if (attributes.soumis) return "Soumis";
      if (attributes.approuve) return "Approuvé";
      if (attributes.produire_expide) return "Cas produit et expédié";
      return "Indéfini";
    }
    // Existing logic for other guide types
    if (attributes.En_attente_approbation) return "En attente d'approbation";
    if (attributes.en__cours_de_modification) return "En cours de modification";
    if (attributes.archive) return "Archivé";
    if (attributes.soumis) return "Soumis";
    if (attributes.approuve) return "Approuvé";
    if (attributes.produire_expide) return "Cas produit et expédié";
    return "Indéfini";
  };

  const getEndpoint = (guideType: string): string => {
    switch (guideType) {
      case "guide-pour-gingivectomies":
        return "http://localhost:1337/api/guide-pour-gingivectomies";
      case "gouttiere-de-bruxismes":
        return "http://localhost:1337/api/gouttiere-de-bruxismes";
      case "guide-a-etages":
        return "http://localhost:1337/api/guide-a-etages";
      case "guide-classiques":
        return "http://localhost:1337/api/guide-classiques";
      case "autres-services-de-conceptions":
        return "http://localhost:1337/api/autres-services-de-conceptions";
      case "rapport-radiologiques":
        return "http://localhost:1337/api/rapport-radiologiques";
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
  const handlesoumettre = async (guide: Guide) => {
    try {
      const endpoint = getEndpoint(guide.type);
      const token = localStorage.getItem("authToken");

      const response = await axios.put(
        `${endpoint}/${guide.id}`,
        {
          data: {
            En_attente_approbation: true,
            archive: false,
            soumis: true,
            submit: true,
            en__cours_de_modification: false,
            approuve: false,
            produire_expide: false,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the local state
      setGuides((prevGuides) =>
        prevGuides.map((g) =>
          g.id === guide.id
            ? {
                ...g,
                attributes: {
                  ...g.attributes,
                  En_attente_approbation: true,
                  archive: false,
                  soumis: true,
                  submit: true,
                  en__cours_de_modification: false,
                  approuve: false,
                  produire_expide: false,
                },
              }
            : g
        )
      );

      alert("Guide soumis avec succès");
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
      const token = localStorage.getItem("authToken");

      console.log(
        `Attempting to approve guide: ${guide.id} of type: ${guide.type}`
      );

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

      console.log(`Approve response:`, response.data);

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

    console.log("Navigating with guide:", guide); // Debug log

    navigate(route, {
      state: {
        caseNumber: guide.attributes.numero_cas,
        patient: guide.attributes.patient,
        typeDeTravail: guide.attributes.service?.data?.attributes?.title,
        cost: guide.attributes.cout,
        guideType: guide.type,
        guideId: guide.id, // Ensure this is the correct property for the guide ID
      },
    });
  };

  const handleDelete = async (guide: Guide) => {
    try {
      const endpoint = getEndpoint(guide.type);
      const token = localStorage.getItem("authToken");

      console.log(
        `Attempting to delete guide: ${guide.id} of type: ${guide.type}`
      );

      const response = await axios.delete(`${endpoint}/${guide.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(`Delete response:`, response);

      // Immediately remove the rapport radiologique from the state
      setGuides((prevGuides) => prevGuides.filter((g) => g.id !== guide.id));

      if (guide.type === "rapport-radiologiques") {
        alert("Rapport radiologique supprimé avec succès");
      } else {
        alert("Guide supprimé avec succès");
      }
    } catch (error) {
      console.error(`Error deleting guide of type ${guide.type}:`, error);
      if (axios.isAxiosError(error)) {
        console.error("Error response:", error.response?.data);
        console.error("Error status:", error.response?.status);
      }
      alert(`Échec de la suppression: ${(error as Error).message}`);
    }
  };

  const [open, setOpen] = React.useState(false);
  null;

  const handlePageClick = (data: { selected: number }) => {
    setCurrentPage(data.selected);
  };

  return (
    <main className="bg-white flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 w-auto min-h-screen ">
      <div className="flex-col mt-3 bg-gray-100 p-4 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-3">
          {language === "french" ? "Détails de l'utilisateur" : "User Details"}
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <p className="text-lg">
            <span className="font-semibold">
              {language === "french" ? "Utilisateur: " : "User: "}
            </span>
            {user ? user.username : "Loading..."}
          </p>
          <p>
            <span className="font-semibold">
              {language === "french" ? "Offre actuelle: " : "Current offer: "}
            </span>
            {currentOffer ? currentOffer.currentPlan : "Loading..."}
          </p>
          <p>
            <span className="font-semibold">
              {language === "french" ? "Réduction: " : "Discount: "}
            </span>
            {currentOffer ? `${currentOffer.discount}%` : "Loading..."}
          </p>
        </div>
      </div>
      <div className="border shadow-sm rounded-lg p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-max">N°</TableHead>
              <TableHead>Nom du patient</TableHead>
              <TableHead className="w-max">Date de création</TableHead>
              <TableHead>Type de travail</TableHead>
              <TableHead className="">Etat</TableHead>
              <TableHead className="text-center">Action à faire</TableHead>
              <TableHead className="text-center">Fichiers</TableHead>
            </TableRow>
          </TableHeader>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>
                <div className="relative">
                  <Input
                    id="search-bar"
                    type="text"
                    placeholder="Search"
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
              <TableHead className="text-right">
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
                          <span>Pick a date</span>
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
              <TableHead></TableHead>
              <TableHead className="text-right">
                <div className="flex items-center space-x-4">
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-[150px] justify-start"
                      >
                        {selectedStatus ? (
                          <>
                            <selectedStatus.icon className="mr-2 h-4 w-4 shrink-0" />
                            {selectedStatus.label}
                          </>
                        ) : (
                          <>+ Statut</>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" side="right" align="start">
                      <Command>
                        <CommandInput placeholder="Change status..." />
                        <CommandList>
                          <CommandEmpty>No results found.</CommandEmpty>
                          <CommandGroup>
                            {statuses.map((status) => (
                              <CommandItem
                                key={status.value}
                                value={status.value}
                                onSelect={(value) => {
                                  setSelectedStatus(
                                    statuses.find(
                                      (priority) => priority.value === value
                                    ) || null
                                  );
                                  setOpen(false);
                                }}
                              >
                                <status.icon
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    status.value === selectedStatus?.value
                                      ? "opacity-100"
                                      : "opacity-40"
                                  )}
                                />
                                <span>{status.label}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </TableHead>
              <TableHead className="text-right"></TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPageData.map((guide) => (
              <TableRow key={guide.id}>
                <TableCell>{guide.attributes.numero_cas}</TableCell>
                <TableCell>{guide.attributes.patient}</TableCell>
                <TableCell>
                  {new Date(guide.attributes.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {guide.attributes.service?.data?.attributes?.title ||
                    "No service"}
                </TableCell>
                <TableCell>
                  {getCurrentState(guide.attributes, guide.type)}
                </TableCell>
                <TableCell className="text-center">
                  {guide.type === "rapport-radiologiques" ? (
                    <>
                      {guide.attributes.archive && (
                        <>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mr-2"
                              >
                                Soumettre
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {language === "french"
                                    ? "Confirmer la soumission"
                                    : "Confirm Submission"}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {language === "french"
                                    ? "Êtes-vous sûr de vouloir soumettre ce rapport radiologique ?"
                                    : "Are you sure you want to submit this radiological report?"}
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
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" color="red">
                                Supprimer
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {language === "french"
                                    ? "Êtes-vous sûr(e) de vouloir supprimer définitivement le cas ?"
                                    : "Are you sure you want to permanently delete the case?"}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {language === "french"
                                    ? "Êtes-vous sûr de vouloir supprimer ce rapport radiologique ? Cette action est irréversible."
                                    : "Are you sure you want to delete this radiological report? This action cannot be undone."}
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
                      {guide.attributes.soumis && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2"
                          disabled
                        >
                          Soumis
                        </Button>
                      )}
                    </>
                  ) : guide.type === "autres-services-de-conceptions" ? (
                    <>
                      {guide.attributes.archive && (
                        <>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mr-2"
                              >
                                Demander un devis
                              </Button>
                            </AlertDialogTrigger>
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
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" color="red">
                                Supprimer
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {language === "french"
                                    ? "Confirmer la suppression"
                                    : "Confirm Deletion"}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {language === "french"
                                    ? "Êtes-vous sûr de vouloir supprimer ce service ? Cette action est irréversible."
                                    : "Are you sure you want to delete this service? This action cannot be undone."}
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2"
                          disabled
                        >
                          Demande de devis envoyée
                        </Button>
                      )}
                      {guide.attributes.En_attente_approbation && (
                        <>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mr-2"
                              >
                                Approuver
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {language === "french"
                                    ? "Êtes-vous sûr(e) de vouloir approuver le cas ?"
                                    : "Are you sure you want to approve the case?"}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {language === "french"
                                    ? "Si la planification proposée vous convient, cliquez sur 'Approuver' pour valider le cas"
                                    : "If the proposed planning suits you, click 'Approve' to validate the case"}
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
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" color="red">
                                Demande de modification
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {language === "french"
                                    ? "Êtes-vous sûr(e) de vouloir modifier la planification?"
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
                      {guide.attributes.en__cours_de_modification && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2"
                          disabled
                        >
                          En cours de modification
                        </Button>
                      )}
                      {guide.attributes.soumis && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2"
                          disabled
                        >
                          Soumis
                        </Button>
                      )}
                      {guide.attributes.approuve && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mr-2"
                            >
                              Produire et expédier
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {language === "french"
                                  ? "Confirmer la production et l'expédition"
                                  : "Confirm Production and Shipping"}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {language === "french"
                                  ? "Êtes-vous sûr de vouloir produire et expédier ce service ?"
                                  : "Are you sure you want to produce and ship this service?"}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                {language === "french" ? "Annuler" : "Cancel"}
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handledemandedemodification1(guide)
                                }
                              >
                                {language === "french"
                                  ? "Confirmer"
                                  : "Confirm"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                      {guide.attributes.produire_expide && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2"
                          disabled
                        >
                          Cas produit et expédié
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      {guide.attributes.En_attente_approbation && (
                        <>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mr-2"
                              >
                                Approuver
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {language === "french"
                                    ? "Confirmer l'approbation"
                                    : "Confirm Approval"}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {language === "french"
                                    ? "Êtes-vous sûr de vouloir approuver ce guide ?"
                                    : "Are you sure you want to approve this guide?"}
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
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" color="red">
                                Demande de modification
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {language === "french"
                                    ? "Confirmer la demande de modification"
                                    : "Confirm Modification Request"}
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
                      {guide.attributes.archive && (
                        <>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mr-2"
                              >
                                Soumettre
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {language === "french"
                                    ? "Confirmer la soumission"
                                    : "Confirm Submission"}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {language === "french"
                                    ? "Êtes-vous sûr de vouloir soumettre ce guide ?"
                                    : "Are you sure you want to submit this guide?"}
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
                          {/* <Button
                            variant="outline"
                            size="sm"
                            color="red"
                            onClick={() => handleDelete(guide)}
                          >
                            Supprimer
                          </Button> */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" color="red">
                                Supprimer
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {language === "french"
                                    ? "Confirmer la suppression"
                                    : "Confirm Deletion"}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {language === "french"
                                    ? "Êtes-vous sûr de vouloir supprimer ce guide ? Cette action est irréversible."
                                    : "Are you sure you want to delete this guide? This action cannot be undone."}
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
                      {guide.attributes.approuve && (
                        // <Button
                        //   variant="outline"
                        //   size="sm"
                        //   className="mr-2"
                        //   onClick={() => handledemandedemodification1(guide)}
                        // >
                        //   Produire et expédier
                        // </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" color="red">
                              Produire et expédier
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {language === "french"
                                  ? "Confirmer la demande Produire et expédier"
                                  : "Confirm Production and Shipping"}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {language === "french"
                                  ? " Êtes-vous sûr de vouloir produire et expédier ce guide ?"
                                  : " Are you sure you want to produce and ship this guide?"}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                {language === "french" ? "Annuler" : "Cancel"}
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handledemandedemodification1(guide)
                                }
                              >
                                {language === "french"
                                  ? "Produire et expédier"
                                  : "Produce and ship"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                      {guide.attributes.en__cours_de_modification && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2"
                          disabled
                        >
                          En cours de modification
                        </Button>
                      )}
                      {guide.attributes.soumis && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2"
                          disabled
                        >
                          Soumis
                        </Button>
                      )}
                      {guide.attributes.produire_expide && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2"
                          disabled
                        >
                          Cas produit et expédié
                        </Button>
                      )}
                    </>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center space-x-4">
                    <div className="flex flex-col items-center">
                      {console.log("PDF File Data:", guide.attributes.pdfFile)}
                      {guide.attributes.pdfFile?.data?.attributes?.url ? (
                        <>
                          {console.log(
                            "PDF URL:",
                            `http://localhost:1337${guide.attributes.pdfFile.data.attributes.url}`
                          )}
                          <a
                            href={`http://localhost:1337${guide.attributes.pdfFile.data.attributes.url}`}
                            download
                            className="text-blue-500 hover:text-blue-700"
                            title="Download PDF"
                            onClick={(e) => {
                              console.log("PDF download clicked");
                              // Uncomment the next line to prevent default behavior for debugging
                              // e.preventDefault();
                            }}
                          >
                            <FileText size={24} />
                          </a>
                        </>
                      ) : (
                        <>
                          {console.log("PDF not available")}
                          <FileText
                            size={24}
                            className="text-gray-300"
                            title="PDF not available"
                          />
                        </>
                      )}
                      <span className="text-xs mt-1">PDF</span>
                    </div>
                    {guide.type !== "rapport-radiologiques" && (
                      <div className="flex flex-col items-center">
                        {console.log(
                          "3D Model Data:",
                          guide.attributes.model3d
                        )}
                        {guide.attributes.model3d?.data?.attributes?.url ? (
                          <>
                            {console.log(
                              "3D Model URL:",
                              `http://localhost:1337${guide.attributes.model3d.data.attributes.url}`
                            )}
                            <a
                              href={`http://localhost:1337${guide.attributes.model3d.data.attributes.url}`}
                              download
                              className="text-blue-500 hover:text-blue-700"
                              title="Download 3D Model"
                              onClick={(e) => {
                                console.log("3D Model download clicked");
                                // Uncomment the next line to prevent default behavior for debugging
                                // e.preventDefault();
                              }}
                            >
                              <Box size={24} />
                            </a>
                          </>
                        ) : (
                          <>
                            {console.log("3D Model not available")}
                            <Box
                              size={24}
                              className="text-gray-300"
                              title="3D Model not available"
                            />
                          </>
                        )}
                        <span className="text-xs mt-1">3D</span>
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-center">
        <ReactPaginate
          previousLabel={"← Previous"}
          nextLabel={"Next →"}
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
