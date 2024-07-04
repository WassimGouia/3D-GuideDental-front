// import React, { useEffect, useState } from "react";
// import axios from "axios";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { Link, useNavigate } from "react-router-dom";
import SideBarContainer from "@/components/SideBarContainer";
import Container from "@/components/Container";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
const Nouvmod = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { caseNumber, patient, typeDeTravail } = location.state;
  const [comment, setComment] = useState("");
  const [guideData, setGuideData] = useState(null);

  // Fetch guide data from the server
  useEffect(() => {
    const fetchGuideData = async () => {
      try {
        // Fetch data from both endpoints concurrently
        const [response1, response2] = await Promise.all([
          axios.get(`http://localhost:1337/api/guide-pour-gingivectomies`),
          axios.get(`http://localhost:1337/api/gouttiere-de-bruxismes`)
        ]);
  
        // Combine the data from both responses
        const combinedData = {
          guidePourGingivectomies: response1.data,
          gouttiereDeBruxismes: response2.data
        };
  
        // Set the combined data to the state
        setGuideData(combinedData);
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
            en__cours_de_modification: true,
            En_attente_approbation: false,
            archive: false
        }
    };

    const urls = [
        `http://localhost:1337/api/guide-pour-gingivectomies/${guideId}`,
        `http://localhost:1337/api/gouttiere-de-bruxismes/${guideId}`
    ];

    try {
        const responses = await Promise.all(urls.map(url => axios.put(url, statusUpdateData)));
        responses.forEach(response => console.log('Update response:', response));
        alert("Guide statuses updated successfully!");
    } catch (error) {
        console.error("Failed to update guide status:", error);
        alert("Failed to update guide statuses due to an error: " + (error.response?.data?.error?.message || error.message));
    }
};


  const handleNextClick = async () => {
    const postData = {
      patient,
      caseNumber,
      type_travail: typeDeTravail,
      comment
    };

    try {
      const response = await axios.post("http://localhost:1337/api/demande-de-modifications", { data: postData });
      if (response.status === 200) {
        // Assume you find the correct guide ID from the fetched guide data
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

  return (
    <SideBarContainer>
      <Container>
        <Card className="p-3">
          <div className="flex items-center justify-center">
            <h1 className="font-extrabold font-roboto text-lg">Demande de modification</h1>
          </div>
          <div className="flex-col">
            <p className="text-lg font-semibold">Patient: {patient}</p>
            <p>Numéro du cas: {caseNumber}</p>
            <p>Type de travail: {typeDeTravail}</p>
          </div>
          <Label htmlFor="new-comment">Date: {new Date().toLocaleDateString()}</Label>
          <Input
            id="new-comment"
            type="text"
            placeholder="Commentaires et demandes spéciales"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="flex justify-between mt-9">
            <Button className="bg-[#fffa1b] text-[#0e0004] px-4 py-2 rounded-md" onClick={() => navigate(-1)}>
              Précédent
            </Button>
            <Button
              className="bg-[#0e0004] text-[#fffa1b] px-4 py-2 rounded-md"
              onClick={handleNextClick}
            >
              Update Status
            </Button>
          </div>
        </Card>
      </Container>
    </SideBarContainer>
  );
};

export default Nouvmod;