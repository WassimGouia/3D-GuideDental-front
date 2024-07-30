import { BEARER } from '@/components/Constant';
import { getToken } from '@/components/Helpers';
import axios, { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Service8Success = () => {
  const apiUrl = import.meta.env.VITE_BACKEND_API_ENDPOINT;
  const location = useLocation();
  const [requestMade, setRequestMade] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const sessionId = queryParams.get('session_id');
    const type_travail = queryParams.get('type_travail');
    const caseNumber = queryParams.get('caseNumber');
    const patient = queryParams.get('patient');
    const guideType = localStorage.getItem('guideType');
    const guideId = localStorage.getItem('guideId');
    const data = JSON.parse(localStorage.getItem('data') || '{}');

    if (sessionId && !requestMade) {
      setRequestMade(true);

      fetch(`${apiUrl}/demande-produire-et-expide-guide-etage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, type_travail, caseNumber,patient,
          Immediate_Loading: data.Immediate_Loading,
          Metal_Impression_First_Stage: data.Metal_Impression_First_Stage,
          Metal_Impression_of_Both_Stages: data.Metal_Impression_of_Both_Stages,
          Resin_Impression_of_Both_Stages: data.Resin_Impression_of_Both_Stages,
          offre:data.offre,
          originalCost:data.Cost}),
      })
        .then(response => response.json())
        .then(async data => {
          if (data.success) {
              try {
                  await updateGuideStatus();
                  localStorage.clear()
                  setTimeout(function() {
                    window.location.href = "/mes-fichiers";
                }, 3000);
              } catch (error) {
                console.error("Failed to submit data:", error);
                alert("Failed to submit the data due to an error.");
              }


          } else {
            console.error('Payment confirmation failed', data.error);
          }
        })
        .catch(error => {
          console.error('Error confirming payment', error);
        });
    }
  
    const getAuthHeaders = () => {
      const token = getToken();
      return {
        Authorization: `${BEARER} ${token}`,
        "Content-Type": "application/json",
      };
    };
  
    const updateGuideStatus = async () => {
      const statusUpdateData = {
        data: {
          produire_expide: true,
          En_cours_de_modification: false,
          En_attente_approbation: false,
          approuve: false,
          archive: false,
          soumis: false,
        },
      };
  
      try {
        const response = await axios.put(
          `${apiUrl}/${guideType}/${guideId}`,
          statusUpdateData,
          { headers: getAuthHeaders() }
        );
      } catch (error) {
        console.error("Failed to update guide status:", error);
        if (error instanceof AxiosError) {
          alert(
            "Failed to update guide status due to an error: " +
              (error.response?.data?.error?.message || error.message)
          );
        } else {
          alert("An unknown error occurred");
        }
      }
    };

  }, [location, requestMade]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-gray-800">Payment Success</h1>
          <p className="mt-2 text-gray-600">Thank you for your payment. Your order is being processed.</p>
          <div className="mt-6">
            <Link to="/" className="text-blue-500 hover:underline">Go to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Service8Success;