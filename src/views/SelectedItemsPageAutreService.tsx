import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import SideBarContainer from "@/components/SideBarContainer";
import Container from "@/components/Container";
import { useLanguage } from "@/components/languageContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { loadStripe } from "@stripe/stripe-js";
import { useAuthContext } from "@/components/AuthContext";
import { getToken } from "@/components/Helpers";

const SelectedItemsPageAutreService = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const selectedItemsData = location.state.selectedItemsData;
  const previousState = location.state.previousState;
  const comment = location.state.selectedItemsData.comment;
  const [currentOffer, setCurrentOffer] = useState(null);
  const { user } = useAuthContext();
  const checkedValues = location.state.selectedItemsData.checkedValues; // to do
  // const implantationPrevue = location.state.selectedItemsData.implantationPrevue;
  // const implantationPrevueInverse = location.state.selectedItemsData.implantationPrevueInverse;
  const isCheckboxChecked = location.state.isCheckboxChecked;
  const [patientData, setPatientData] = useState({
    fullname: "",
    caseNumber: "",
  });
  useEffect(() => {
    // const fetchPatientData = async () => {
    //   try {
    //     const response = await axios.get(
    //       "http://localhost:1337/api/patients?sort=id:desc&pagination[limit]=1"
    //     );
    //     // Assuming the first patient is the one you want
    //     const patient = response.data.data[0].attributes;
    //     setPatientData({
    //       fullname: patient.fullname,
    //       caseNumber: patient.caseNumber,
    //     });
    //   } catch (error) {
    //     console.error("Error fetching patient data:", error);
    //   }
    // };

    // fetchPatientData();
    const storedFullname = localStorage.getItem("fullName");
    const storedCaseNumber = localStorage.getItem("caseNumber");

    if (!storedFullname || !storedCaseNumber) {
      // Redirect to /sign/nouvelle-demande if data is missing
      navigate("/sign/nouvelle-demande");
    } else {
      // If data exists in local storage, set it to patientData
      setPatientData({
        fullname: storedFullname,
        caseNumber: storedCaseNumber,
      });
    }
  }, [navigate]);
  useEffect(() => {
    axios.get("http://localhost:1337/api/services").then(() => {});
  }, []);
  const handleNextClick = async () => {
    // Check if the comment field is filled
    const isCommentFilled = comment.trim() !== "";

    if (isCommentFilled) {
      // Store the data
      const dataToStore = {
        comment,
      };

      const res = await axios.post(
        "http://localhost:1337/api/autres-services-de-conceptions",
        {
          data: {
            service: 5,
            comment,
            patient: patientData.fullname,
            numero_cas: patientData.caseNumber,
            service_impression_et_expedition: isCheckboxChecked,
            submit: true,
            archive: false,
          },
        }
        // {
        //   headers: {
        //     "Content-Type": "application/json",
        //     Authorization:
        //       "Bearer " +
        //       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzExMzIwNjU0LCJleHAiOjE3MTM5MTI2NTR9.3lmhTvg2sW893Hyz3y3MscmQDCt23a1QqdyHq1jmYto",
        //   },
        // }
      );

      if (res.status === 200) {
        navigate("/selectedItemsPage", {
          state: { selectedItemsData: dataToStore },
        });
      } else {
        alert(res.status);
      }
    }
  };

  const stripePromise = loadStripe(
    "pk_live_51P7FeV2LDy5HINSgXOwiSvMNT7A8x0OOUaTFbu07yQlFBd2Ek5oMCj3eo0aSORCDwI4javqv9tIpEsS8dc8FQT2700vuuVUdFS"
  );

  const handlePayment = async (event) => {
    event.preventDefault();

    // Get Stripe.js instance
    const stripe = await stripePromise;

    // Call your backend to create the Checkout Session
    const response = await axios.post("http://localhost:1337/api/commandes", {
      // Include any data you want to send to the server
      paymentId: "testPaymentId", // replace with actual paymentId
      cost: 100, // replace with actual cost
      client: { id: "testClientId" }, // replace with actual client data
    });

    const session = response.data.stripeSession;

    // When the customer clicks on the button, redirect them to Checkout.
    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      // If `redirectToCheckout` fails due to a browser or network
      // error, display the localized error message to your customer
      console.error(result.error.message);
    }
  };

  useEffect(() => {
    const storedFullname = localStorage.getItem("fullName");
    const storedCaseNumber = localStorage.getItem("caseNumber");

    if (!storedFullname || !storedCaseNumber) {
      navigate("/sign/nouvelle-demande");
    } else {
      setPatientData({
        fullname: storedFullname,
        caseNumber: storedCaseNumber,
      });

      const fetchOfferData = async () => {
        const token = getToken();
        if (token && user && user.id) {
          try {
            const userResponse = await axios.get(
              `http://localhost:1337/api/users/${user.id}?populate=offre`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (userResponse.data && userResponse.data.offre) {
              const offerData = userResponse.data.offre;
              setCurrentOffer({
                currentPlan: offerData.CurrentPlan,
                discount: getDiscount(offerData.CurrentPlan),
              });
            } else {
              console.error("Offer data not found in the user response");
              setCurrentOffer(null);
            }
          } catch (error) {
            console.error("Error fetching offer data:", error);
            setCurrentOffer(null);
          }
        }
      };

      fetchOfferData();
    }
  }, [navigate, user]);

  const getDiscount = (plan) => {
    const discounts = {
      Essential: 5,
      Privilege: 10,
      Elite: 15,
      Premium: 20,
    };
    return discounts[plan] || 0;
  };

  const handleNextClickArchive = async () => {
    // Check if the comment field is filled
    const isCommentFilled = comment.trim() !== "";

    if (isCommentFilled) {
      // Store the data
      const dataToStore = {
        comment,
      };

      const res = await axios.post(
        "http://localhost:1337/api/autres-services-de-conceptions",
        {
          data: {
            service: 5,
            comment,
            patient: patientData.fullname,
            numero_cas: patientData.caseNumber,
            service_impression_et_expedition: isCheckboxChecked,
            submit: false,
            archive: true,
          },
        }
        // {
        //   headers: {
        //     "Content-Type": "application/json",
        //     Authorization:
        //       "Bearer " +
        //       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzExMzIwNjU0LCJleHAiOjE3MTM5MTI2NTR9.3lmhTvg2sW893Hyz3y3MscmQDCt23a1QqdyHq1jmYto",
        //   },
        // }
      );

      if (res.status === 200) {
        navigate("/selectedItemsPage", {
          state: { selectedItemsData: dataToStore },
        });
      } else {
        alert(res.status);
      }
    }
  };

  return (
    <div>
      <SideBarContainer>
        <Container>
          <Card className="h-auto m-2">
            <div className="m-2">
              <div>
                <div className="flex items-center justify-center">
                  <h1 className="font-lato text-5xl ">
                    {language === "french"
                      ? "Autres services de conception"
                      : "Other design services"}
                  </h1>
                </div>
                <div className="flex-col mt-3 bg-gray-100 p-4 rounded-lg shadow-sm">
                  <h2 className="text-xl font-bold mb-3">
                    {language === "french" ? "Détails du cas" : "Case Details"}
                  </h2>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-lg">
                      <span className="font-semibold">
                        {language === "french" ? "Patient: " : "Patient: "}
                      </span>
                      {patientData.fullname}
                    </p>
                    <p>
                      <span className="font-semibold">
                        {language === "french"
                          ? "Numéro du cas: "
                          : "Case number: "}
                      </span>
                      {patientData.caseNumber}
                    </p>
                    <p>
                      <span className="font-semibold">
                        {language === "french"
                          ? "Offre actuelle: "
                          : "Current offer: "}
                      </span>
                      {currentOffer ? currentOffer.currentPlan : "Loading..."}
                    </p>
                    <p>
                      <span className="font-semibold">
                        {language === "french" ? "Réduction: " : "Discount: "}
                      </span>
                      {currentOffer
                        ? `${currentOffer.discount}%`
                        : "Loading..."}
                    </p>
                  </div>
                </div>
                <p className="font-bold">Options: </p>
                <div className="flex flex-col">
                  <p>Comment: </p>
                  <Input
                    value={selectedItemsData.comment}
                    readOnly
                    className="w-2/5 h-auto"
                  />
                </div>
                <div>
                  <h1 className="font-semibold">
                    {language === "french"
                      ? "Souhaitez-vous profiter du service d'impression et d'expédition?"
                      : "Do you want to take advantage of the printing and shipping service?"}
                  </h1>
                  <Label>{language === "french" ? "Oui" : "Yes"}</Label>
                  <Checkbox checked={previousState.implementationYes} />
                  <Label>{language === "french" ? "Non" : "No"}</Label>
                  <Checkbox checked={previousState.implementationNo} />
                </div>
              </div>

              <div className="mt-5 flex justify-between mb-4">
                <Button className="w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2 bg-[#fffa1b] text-[#0e0004] hover:bg-[#fffb1bb5] hover:text-[#0e0004] transition-all">
                  {language === "french" ? "Précédent" : "Previous"}
                </Button>

                <div className="flex space-x-3">
                  <Button
                    className="w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2"
                    onClick={handleNextClickArchive}
                  >
                    {language === "french" ? "Archiver" : "Archive"}
                  </Button>

                  <Button
                    className="w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2 bg-[#0e0004] text-[#fffa1b] hover:bg-[#211f20] hover:text-[#fffa1b] transition-all"
                    disabled={!comment.trim()}
                    onClick={handleNextClick}
                  >
                    <Link to="/selectedItemsPage">
                      {language === "french"
                        ? "Demander un devis"
                        : "Request a quote"}
                    </Link>
                  </Button>
                </div>
                <Button onClick={handlePayment}>Pay</Button>
              </div>
            </div>
          </Card>
        </Container>
      </SideBarContainer>
    </div>
  );
};

export default SelectedItemsPageAutreService;