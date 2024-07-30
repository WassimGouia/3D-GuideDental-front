import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SideBarContainer from "@/components/SideBarContainer";
import Container from "@/components/Container";
import { BEARER } from "@/components/Constant";
import { useLanguage } from "./languageContext";
import { getToken } from "./Helpers";

const Nouvmod = () => {
  const apiUrl = import.meta.env.VITE_BACKEND_API_ENDPOINT;
  const navigate = useNavigate();
  const location = useLocation();
  const { caseNumber, patient, typeDeTravail, guideType, guideId } = location.state;
  const [comment, setComment] = useState("You: ");
  const [modificationData, setModificationData] = useState([]);
  const {language} = useLanguage()
  const getAuthHeaders = () => {
    const token = getToken();
    return {
      Authorization: `${BEARER} ${token}`,
      "Content-Type": "application/json",
    };
  };

  const fetchModificationData = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/demande-de-modifications`,
        {
          params: { 'filters[caseNumber][$eq]': caseNumber },
          headers: getAuthHeaders(),
        }
      );
      setModificationData(response.data.data);
    } catch (error) {
      console.error("Failed to fetch modification data:", error);
      alert("Failed to fetch modification data.");
    }
  };

  useEffect(() => {
    fetchModificationData();
  }, []);

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
        `${apiUrl}/${guideType}/${guideId}`,
        statusUpdateData,
        { headers: getAuthHeaders() }
      );
      console.log("Update response:", response);
      const em = await axios.post(`${apiUrl}/sendEmailToNotify`,{
        email:"no-reply@3dguidedental.com",
        subject: "Case Status Update",
        content: `We would like to inform you that the client of case number ${caseNumber} has requested a modification.`,
      })

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
        `${apiUrl}/demande-de-modifications`,
        { data: postData },
        { headers: getAuthHeaders() }
      );
      if (response.status === 200) {
        await updateGuideStatus();
        navigate("/mes-fichiers");
      } else {
        alert(`Submission failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to submit data:", error);
      alert("Failed to submit the data due to an error.");
    }
  };
  const handleCommentChange = (e) => {
    const inputValue = e.target.value;
    if (inputValue.startsWith("You: ")) {
      setComment(inputValue);
    } else {
      setComment("You: " + inputValue.slice(5));
    }
  };
  return (
    <SideBarContainer>
      <Container>
        <Card className="p-3">
          <div className="flex items-center justify-center">
            <h1 className="font-extrabold font-roboto text-lg">
              {language === "french" ? "Demande de modification" : "Request for Modification"}
            </h1>
          </div>
          <div className="flex-col">
            <p className="text-lg font-semibold">{language === "french" ? `Patient: ${patient}` : `Patient: ${patient}`}</p>
            <p>{language === "french" ? `Numéro du cas: ${caseNumber}` : `Case Number: ${caseNumber}`}</p>
            <p>{language === "french" ? `Type de travail: ${typeDeTravail}` : `Type of Work: ${typeDeTravail}`}</p>
          </div>
          {modificationData.map((modification, index) => (
            <div key={index} className="mt-2">
              <Label htmlFor={`modification-comment-${index}`}>
                {language === "french" ? `Date: ${new Date(modification.attributes.createdAt).toLocaleDateString()}` : `Date: ${new Date(modification.attributes.createdAt).toLocaleDateString()}`}
              </Label>
              <Input
                id={`modification-comment-${index}`}
                type="text"
                value={modification.attributes.comment || ""}
                disabled
                className="mt-1"
              />
            </div>
          ))}
          <Label htmlFor="new-comment">
            {language === "french" ? `Date: ${new Date().toLocaleDateString()}` : `Date: ${new Date().toLocaleDateString()}`}
          </Label>
          <Input
            id="new-comment"
            type="text"
            placeholder={language === "french" ? "Commentaires et demandes spéciales" : "Comments and special requests"}
            value={comment}
            onChange={handleCommentChange}
          />
          <div className="flex justify-between mt-9">
            <Button
              className="bg-[#fffa1b] text-[#0e0004] px-4 py-2 rounded-md"
              onClick={() => navigate(-1)}
            >
              {language === "french" ? "Précédent" : "Previous"}
            </Button>
            <Button
              className="bg-[#0e0004] text-[#fffa1b] px-4 py-2 rounded-md"
              onClick={handleNextClick}
            >
              {language === "french" ? "Mettre à jour le statut" : "Update Status"}
            </Button>
          </div>
        </Card>
      </Container>
    </SideBarContainer>
  );
};

export default Nouvmod;
