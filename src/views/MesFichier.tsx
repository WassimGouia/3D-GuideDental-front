import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import React, { useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { CalendarDays } from "lucide-react";
import { statuses } from "@/components/DummyData";
import { useState } from "react";
import cn from "classnames";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import ReactPaginate from "react-paginate";
import axios from "axios";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
// import Container from "@/components/Container";

const MesFichier = () => {
  const [guides, setGuides] = useState([]); // State to store guide data
  const [currentPage, setCurrentPage] = useState(0);
  const [services, setServices] = useState({});
  const guidesPerPage = 10;
  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const [
          // etagesResponse, classiquesResponse,
           ginResponse, bruxResponse
           , autreserviceResponse
          // , rapportResponse
          ] = await Promise.all([
          // axios.get('http://localhost:1337/api/guide-a-etages?populate=service'),
          axios.get('http://localhost:1337/api/guide-classiques?populate=service'),
          axios.get('http://localhost:1337/api/guide-pour-gingivectomies?populate=service'),
          axios.get('http://localhost:1337/api/gouttiere-de-bruxismes?populate=service'),
          axios.get('http://localhost:1337/api/autres-services-de-conceptions?populate=service'),
          // axios.get('http://localhost:1337/api/rapport-radiologiques?populate=service'),
        ]);
  
        const combinedGuides = [
          // ...etagesResponse.data.data, ...classiquesResponse.data.data,
           ...ginResponse.data.data, ...bruxResponse.data.data
           , ...autreserviceResponse.data.data
          // , ...rapportResponse.data.data
          ]
          // Adjust this condition based on your data structure
  
        setGuides(combinedGuides);
      } catch (error) {
        console.error('Error fetching guide data:', error);
      }
    };
  
    fetchGuides();
  }, []);
  
  
  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const urls = [
          'http://localhost:1337/api/guide-pour-gingivectomies?populate=service',
          'http://localhost:1337/api/gouttiere-de-bruxismes?populate=service'
        ];
  
        const responses = await Promise.all(urls.map(url => axios.get(url)));
        const guides = responses.map((response, index) => {
          return response.data.data.map(guide => ({
            ...guide,
            type: index === 0 ? 'gingivectomies' : 'etage', // Distinguish the type of guide
            status: guide.attributes.En_attente_approbation ? 'En attente d’approbation' :
                    guide.attributes.en__cours_de_modification ? 'En cours de modification' :
                    guide.attributes.archive ? 'Archivé' : 
                    guide.attributes.soumis ? 'Soumis' :
                    guide.attributes.approuve ? 'Approuvé' : 
                    guide.attributes.produire_expide ? 'Cas produit et expédié' : 'Undefined'
          }));
        }).flat(); // Flatten the array since map returns an array of arrays
  
        setGuides(guides); // Assuming you have a setGuides state updater function
      } catch (error) {
        console.error('Error fetching guide data:', error);
      }
    };
  
    fetchGuides();
  }, []);
  const [date, setDate] = React.useState<Date>();
  const [open, setOpen] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<Status | null>(
    null
  );
  const offset = currentPage * guidesPerPage;
  const currentPageData = guides.slice(offset, offset + guidesPerPage);
  const pageCount = Math.ceil(guides.length / guidesPerPage);

  const handlePageClick = (data: { selected: number }) => {
    setCurrentPage(data.selected);
  };

  const handlesoumettre = async (guideId) => {
    try {
      await Promise.all([
        axios.put(`http://localhost:1337/api/guide-pour-gingivectomies/${guideId}`, {
          data: {
            status: 'En attente d’approbation', 
            En_attente_approbation: true,
            archive: false 
          }
        }),

        axios.put(`http://localhost:1337/api/gouttiere-de-bruxismes/${guideId}`, {
          data: {
            status: 'En attente d’approbation', 
            En_attente_approbation: true,
            archive: false          }
        })
      ]);
  
      setGuides(guides.map(guide => {
        if (guide.id === guideId) {
          return { ...guide, attributes: { ...guide.attributes, status: 'En attente d’approbation', En_attente_approbation: true } };
        }
        return guide;
      }));
  
      alert('Failed to soumettre guide:');
    } catch (error) {
      console.error('Failed to soumettre guide:', error);
      alert('Guide soumis avec succès');
    }
  };
  
  
  const handleapprouver = async (guideId) => {
    try {
      await Promise.all([
        axios.put(`http://localhost:1337/api/guide-pour-gingivectomies/${guideId}`, {
          data: {
            status: 'Approuvé',
            soumis: false,
            En_attente_approbation: false,
            archive: false,
            approuve: true,
          }
        }),
        axios.put(`http://localhost:1337/api/gouttiere-de-bruxismes/${guideId}`, {
          data: {
            status: 'Approuvé',
            soumis: false,
            En_attente_approbation: false,
            archive: false,
            approuve: true,
          }
        })
      ]);

      setGuides(guides.map(guide => {
        if (guide.id === guideId) {
          return { ...guide, status: 'Approuvé', attributes: { ...guide.attributes, approuve: true, En_attente_approbation: false, soumis: false } };
        }
        return guide;
      }));

      alert('Guide approuvé successfully');
    } catch (error) {
      console.error('Failed to approuver guide:', error);
      alert('Failed to approuver the guide');
    }
  };
  const handleDelete = async (guideId) => {
    try {
      // Sending DELETE requests to both endpoints
      await axios.delete(`http://localhost:1337/api/guide-pour-gingivectomies/${guideId}`);
      await axios.delete(`http://localhost:1337/api/gouttiere-de-bruxismes/${guideId}`);
      
      // Update the guides state to filter out the deleted guide
      setGuides(prevGuides => prevGuides.filter(guide => guide.id !== guideId));
      alert('Guide deleted successfully');
    } catch (error) {
      console.error('Error deleting guide:', error);
      alert('Failed to delete the guide');
    }
  };

  const handleModificationRequest = async (guide) => {
    try {
      const bruxismId = guide.type === 'Bruxism' ? guide.id : null;
      const gingivectomyId = guide.type === 'Gingivectomy' ? guide.id : null;
  
      // Sending concurrent PUT requests using Promise.all
      const responses = await Promise.all([
        bruxismId && axios.put(`http://localhost:1337/api/gouttiere-de-bruxismes/${bruxismId}`, {
          data: {
            status: 'En cours de modification',
            En_cours_de_modification: false,
            En_attente_approbation: true
          }
        }),
        gingivectomyId && axios.put(`http://localhost:1337/api/guide-pour-gingivectomies/${gingivectomyId}`, {
          data: {
            status: 'En cours de modification',
            En_cours_de_modification: false,
            En_attente_approbation: true
          }
        })
      ].filter(Boolean)); // Filter out null values
  
      // Update the guide locally
      setGuides(guides.map(g => g.id === guide.id ? { ...g, attributes: { ...g.attributes, status: 'En cours de modification', En_cours_de_modification: false }} : g));
  
      // Navigate to the modification request page with necessary state
      navigate('/sign/Demande-de-modification', { 
        state: { 
          caseNumber: guide.attributes.numero_cas, 
          patient: guide.attributes.patient, 
          typeDeTravail: guide.attributes.service?.data?.attributes?.title 
        } 
      });
  
    } catch (error) {
      console.error('Error updating guide:', error);
      alert('Failed to update the guide');
    }
  };
  
  
// status: 'En cours de modification',
// En_cours_de_modification: true,
// En_attente_approbation:false

const handledemandedemodification1 = async (guide) => {
  try {
    // Make the API request to update the status
    const response = await axios.put(`http://localhost:1337/api/guide-pour-gingivectomies/${guide.id}`, {
      data: {
        status: 'Cas produit et expédié',
        produire_expide:false,
        En_cours_de_modification: false,
        En_attente_approbation:false,
        approuve:true,
        archive:false,
        soumis:false

      }
    });

    // Check if the response is successful
    if (response.status === 200) {
      // Update the guide locally
      setGuides(guides.map(g => g.id === guide.id ? { ...g, attributes: { ...g.attributes, status: 'Cas produit et expédié', produire_expide: true }} : g));

      // Navigate to the modification request page with necessary state
      navigate('/sign/Demande-de-production-et-expedition-autre-guides', { state: { caseNumber: guide.attributes.numero_cas, patient: guide.attributes.patient  ,typeDeTravail: guide.attributes.service?.data?.attributes?.title,cost: guide.attributes.cout  }});
    } else {
      alert('Failed to update the guide status');
    }
  } catch (error) {
    console.error('Error updating guide:', error);
    alert('Failed to update the guide');
  }
};


  return (
    <main className="bg-white flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 w-auto min-h-screen ">
      <div className="border shadow-sm rounded-lg p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-max">N°</TableHead>
              <TableHead>Nom du patient</TableHead>
              <TableHead className="w-max">Date de création</TableHead>
              <TableHead>type de travail</TableHead>
              <TableHead className="">Etat</TableHead>
              <TableHead className="text-center">Action à faire</TableHead>
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
                      <Button variant={"outline"} className="w-32 justify-start text-left font-normal">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {searchDate ? format(searchDate, "PPP") : <span>Pick a date</span>}
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
                                    ) as unknown as Status | null
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
            </TableRow>
          </TableHeader>
          <TableBody>
  {guides.map((guide) => (
    <TableRow key={guide.id}>
      <TableCell>{guide.attributes.numero_cas}</TableCell>
      <TableCell>{guide.attributes.patient}</TableCell>
      <TableCell>{new Date(guide.attributes.createdAt).toLocaleDateString()}</TableCell>
      <TableCell>{guide.attributes.service?.data?.attributes?.title || 'No service'}</TableCell>
      <TableCell>{guide.status}</TableCell>
      <TableCell className="text-center">
        {guide.status === 'En attente d’approbation' ? (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              className="mr-2"
              onClick={() => handleapprouver(guide.id)} //mouch mriglaaa
            >
              Approuver
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              color="red"
              onClick={() => handleModificationRequest(guide)} //mriglaaa
            >
              Demande de modification
            </Button>
          </>
        ) : guide.status === 'Archivé' ? (
          <>
          <Button 
            variant="outline" 
            size="sm" 
            className="mr-2"
            onClick={() => handlesoumettre(guide.id)} //mriglaaa
            >
            Soumettre
          </Button>
          <Button 
           variant="outline" 
            size="sm" 
            color="red"
            onClick={() => handleDelete(guide)}  // Call handleDelete when the button is clicked
          >
            Supprimer
          </Button>
        </>
        ) : guide.status === 'Soumis' ? (
          <>
          <Button 
            // variant="outline" 
            // size="sm" 
            // className="mr-2"
            // onClick={() => handlesoumettre(guide.id)}
            >
            {/* Soumettre */}
          </Button>
          <Button 
          //  variant="outline" 
          //   size="sm" 
          //   color="red"
          //   onClick={() => handleDelete(guide.id)}  // Call handleDelete when the button is clicked
          >
            {/* Supprimer */}
          </Button>
        </>
        ) : guide.status === 'Approuvé' ? (
          <>
          <Button 
            variant="outline" 
            size="sm" 
            className="mr-2"
            onClick={() => handledemandedemodification1(guide)}
            >
            Produire et expédier
          </Button>
    
        </>
        ) : guide.status === 'En cours de modification' ? (
          <>
     
    
        </>
        ) : null}
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