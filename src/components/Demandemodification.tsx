import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SideBarContainer from "@/components/SideBarContainer";
import Container from "@/components/Container";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { BEARER } from "@/components/Constant";

const Nouvmod = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { caseNumber, patient, typeDeTravail, guideType, guideId } =
    location.state;
  const [comment, setComment] = useState("");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return {
      Authorization: `${BEARER} ${token}`,
      "Content-Type": "application/json",
    };
  };

  const updateGuideStatus = async () => {
    const statusUpdateData = {
      data: {
        en__cours_de_modification: true,
        En_attente_approbation: false,
        archive: false,
      },
    };

    try {
      const response = await axios.put(
        `http://localhost:1337/api/${guideType}/${guideId}`,
        statusUpdateData,
        { headers: getAuthHeaders() }
      );
      console.log("Update response:", response);
      alert("Guide status updated successfully!");
    } catch (error) {
      console.error("Failed to update guide status:", error);
      alert(
        "Failed to update guide status due to an error: " +
          (error.response?.data?.error?.message || error.message)
      );
    }
  };

  const handleNextClick = async () => {
    const postData = {
      patient,
      caseNumber,
      type_travail: typeDeTravail,
      comment,
    };

    try {
      const response = await axios.post(
        "http://localhost:1337/api/demande-de-modifications",
        { data: postData },
        { headers: getAuthHeaders() }
      );
      if (response.status === 200) {
        await updateGuideStatus();
        navigate("/successPage");
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
            <h1 className="font-extrabold font-roboto text-lg">
              Demande de modification
            </h1>
          </div>
          <div className="flex-col">
            <p className="text-lg font-semibold">Patient: {patient}</p>
            <p>Numéro du cas: {caseNumber}</p>
            <p>Type de travail: {typeDeTravail}</p>
          </div>
          <Label htmlFor="new-comment">
            Date: {new Date().toLocaleDateString()}
          </Label>
          <Input
            id="new-comment"
            type="text"
            placeholder="Commentaires et demandes spéciales"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="flex justify-between mt-9">
            <Button
              className="bg-[#fffa1b] text-[#0e0004] px-4 py-2 rounded-md"
              onClick={() => navigate(-1)}
            >
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
