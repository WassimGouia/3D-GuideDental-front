import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import SideBarContainer from "@/components/SideBarContainer";
import Container from "@/components/Container";
import { useLanguage } from "@/components/languageContext";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const DemandeProdExpAutreGuides = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const [inputValue, setInputValue] = useState(0);
  const [cost, setCost] = useState(0);
  const [guideData, setGuideData] = useState(null); // state to store guide data
  const { caseNumber, patient, typeDeTravail } = location.state;
  const [comment, setComment] = useState("");

  useEffect(() => {
    setCost(inputValue * 40);
  }, [inputValue]);

  useEffect(() => {
    const fetchGuideData = async () => {
      try {
        const response = await axios.get(`http://localhost:1337/api/guide-pour-gingivectomies`);
        setGuideData(response.data);
      } catch (error) {
        console.error('Error fetching guide data:', error);
        alert('Failed to fetch guide data');
      }
    };
    fetchGuideData();
  }, []);

  const updateGuideStatus = async (guideId) => {
    const statusUpdateData = {
      data: {
        produire_expide: true,
        En_cours_de_modification: false,
        En_attente_approbation: false,
        approuve: false,
        archive: false,
        soumis: false
      }
    };
  
    try {
      const response = await axios.put(`http://localhost:1337/api/guide-pour-gingivectomies/${guideId}`, statusUpdateData);
      console.log('Update response:', response);
      alert("Guide status updated successfully!");
    } catch (error) {
      console.error("Failed to update guide status:", error);
      alert("Failed to update guide status due to an error: " + (error.response?.data?.error?.message || error.message));
    }
  };

  const handleNextClick = async () => {
    const postData = {
      patient,
      caseNumber,
      type_travail: typeDeTravail,
      cost:cost
    };
    try {
      const response = await axios.post("http://localhost:1337/api/demande-produire-et-expidees", { data: postData });
      if (response.status === 200) {
        const guideId = guideData && guideData.data.find(guide => guide.attributes.numero_cas === caseNumber)?.id;
        if (guideId) {
          await updateGuideStatus(guideId);
          navigate("/successPage");
        } else {
          alert('No matching guide found for the case number.');
        }
      } else {
        alert(`Submission failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to submit data:", error);
      alert("Failed to submit the data due to an error.");
    }
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  return (
    <SideBarContainer>
      <Container>
        <Card className="p-3">
          <div className="flex items-center justify-center">
            <h1 className="font-extrabold font-roboto text-lg">
              {language === "french" ? "Demande de production et expédition" : "Production Inquiry and Shipping"}
            </h1>
          </div>
          <div className="flex-col">
            <p className="text-lg font-semibold">
              {language === "french" ? "Nom du patient:" : "Patient's name:"} {patient}
            </p>
            <p>{language === "french" ? "Numéro du cas:" : "Case number:"}{caseNumber}</p>
            <p>{language === "french" ? "Type de travail:" : "Type of work:"}{typeDeTravail}</p>
            <p>{language === "french" ? "coût:" : "Cost:"} {cost}€</p>
          </div>
          <br />
          <div className="flex flex-col">
            <h1>
              {language === "french" ? "Guide supplémentaire(s)" : "Additional guide(s)"}
            </h1>
            <Input
              type="number"
              min="0"
              placeholder="0"
              className="w-1/3"
              value={inputValue}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex justify-between">
            <Button className="w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2 bg-[#fffa1b] text-[#0e0004] hover:bg-[#fffb1bb5] hover:text-[#0e0004] transition-all  mt-9">
              {language === "french" ? "Précédent" : "Previous"}
            </Button>
            <Button className="bg-[#0e0004] text-[#fffa1b] px-4 py-2 rounded-md mt-9" onClick={handleNextClick}>
              {language === "french" ? "Suivant" : "Next"}
            </Button>
          </div>
        </Card>
      </Container>
    </SideBarContainer>
  );
};

export default DemandeProdExpAutreGuides;