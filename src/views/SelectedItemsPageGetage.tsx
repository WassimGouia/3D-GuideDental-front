import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import SideBarContainer from "@/components/SideBarContainer";
import Container from "@/components/Container";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/components/languageContext";
import Dents from "@/components/Dents";
import {
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  useEffect,
  useState,
} from "react";
import axios from "axios";
import { FaTooth } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loadStripe } from "@stripe/stripe-js";
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
import { getToken } from "@/components/Helpers";
import { useAuthContext } from "@/components/AuthContext";

const SelectedItemsPageGETAGE = ({ serviceId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const { user } = useAuthContext();
  const { selectedItemsData, previousStates } = location.state || {
    selectedItemsData: {},
    previousStates: {},
  };

  const lateralPinBrand = location.state?.previousStates?.lateralPinBrand;
  const selectSurgicalKitBrand =
    location.state?.previousStates?.selectSurgicalKitBrand;
  const implantBrandInputs = previousStates?.implantBrandInputs || [];
  const implantBrandValues = previousStates?.implantBrandValues || {};
  const cost = location.state?.selectedItemsData?.cost;
  const immediateLoad = location.state?.selectedItemsData?.immediateLoad;
  const secondSwitch = location.state?.selectedItemsData?.secondSwitch;
  const comment = location.state?.selectedItemsData?.comment;
  const smileDesign = location.state?.selectedItemsData?.smileDesign;
  const foragePilote = location.state?.selectedItemsData?.foragePilote;
  const thirdSwitch = location.state?.selectedItemsData?.thirdSwitch;
  const fourthSwitch = location.state?.selectedItemsData?.fourthSwitch;
  const fullGuide = location.state?.selectedItemsData?.fullGuide;
  const fifthSwitch = location.state?.selectedItemsData?.fifthSwitch;
  const costt = location.state?.selectedItemsData?.cost;
  const lateralPinBrandd = location.state?.selectedItemsData?.lateralPinBrand;
  const selectSurgicalKitBrandd =
    location.state?.selectedItemsData?.selectSurgicalKitBrand;
  const implantBrandValue =
    location.state?.selectedItemsData?.implantBrandValues;

  const [patientData, setPatientData] = useState({
    fullname: "",
    caseNumber: "",
  });
  const [currentOffer, setCurrentOffer] = useState(null);
  const [discountedPrice, setDiscountedPrice] = useState(null);
  const [submit, setSubmit] = useState(false);

  const stripePromise = loadStripe(
    "pk_test_51P7FeV2LDy5HINSgFRIn3T8E8B3HNESuLslHURny1RAImgxfy0VV9nRrTEpmlSImYA55xJWZQEOthTLzabxrVDLl00vc2xFyDt"
  );

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

            console.log("User Response:", userResponse.data);

            if (userResponse.data && userResponse.data.offre) {
              const offerData = userResponse.data.offre;
              const offer = {
                currentPlan: offerData.CurrentPlan,
                discount: getDiscount(offerData.CurrentPlan),
              };
              setCurrentOffer(offer);

              // Calculate discounted price
              const discountAmount = (cost * offer.discount) / 100;
              const newPrice = cost - discountAmount;
              setDiscountedPrice(newPrice);
            } else {
              console.error("Offer data not found in the user response");
              setCurrentOffer(null);
            }
          } catch (error) {
            console.error(
              "Error fetching offer data:",
              error.response ? error.response.data : error.message
            );
            setCurrentOffer(null);
          }
        }
      };

      fetchOfferData();
    }
  }, [navigate, user, cost]);

  const getDiscount = (plan) => {
    const discounts = {
      Essential: 5,
      Privilege: 10,
      Elite: 15,
      Premium: 20,
    };
    return discounts[plan] || 0;
  };

  const handlePayment = async () => {

    const res = await axios.post("http://localhost:1337/api/guide-a-etages", {
      data: {
        service: 1,
        comment,
        patient: patientData.fullname,
        numero_cas: patientData.caseNumber,
        marque_implant_pour_la_dent: { " index": implantBrandValue },
        Marque_de_la_clavette: [
          {
            title: "Marque de la clavette",
            description: lateralPinBrandd,
          },
        ],
        Marque_de_la_trousse: [
          {
            title: "Marque de la trousse",
            description: selectSurgicalKitBrandd,
          },
        ],
        Full_guidee: [
          {
            title: "full guidée",
            active: fullGuide,
          },
        ],
        Forage_pilote: [
          {
            title: "forage pilote",
            active: foragePilote,
          },
        ],
        Options_supplementaires: [
          {
            title: "Mise en charge immédiate",
            active: immediateLoad,
          },
          {
            title: "Impression des 2 étages en résine",
            active: secondSwitch,
          },
          {
            title:
              "Impression du premier étage en métal + deuxième étage en résine",
            active: thirdSwitch,
          },
          {
            title: "Impression des 2 étages en métal",
            active: fourthSwitch,
          },
          {
            title: "Ajout d'aimants pour solidariser les étages",
            active: fifthSwitch,
          },
        ],
        cout: [
          {
            cout: costt,
          },
        ],
        options_generiques: [
          {
            title: "Smile Design",
            active: smileDesign,
          },
        ],
        submit: false,
        archive: true,
        En_attente_approbation: false,
      },
    });
    const requestData = {
      cost: discountedPrice || cost, // Use discounted price if available
      service: 1,
      patient: localStorage.getItem("fullName"),
    };

    try {
      const stripe = await stripePromise;
      const response = await axios.post(
        "http://localhost:1337/api/commandes",
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
  };

  const handleNextClick = async () => {
    const dataToStore = {
      cost: discountedPrice || cost,
      immediateLoad,
      secondSwitch,
      thirdSwitch,
      fourthSwitch,
      fifthSwitch,
      smileDesign,
      foragePilote,
      fullGuide,
      lateralPinBrandd,
      selectSurgicalKitBrandd,
      setSubmit,
    };

    const res = await axios.post("http://localhost:1337/api/guide-a-etages", {
      data: {
        service: 1,
        comment,
        patient: localStorage.getItem("fullName"),
        numero_cas: localStorage.getItem("caseNumber"),
        marque_implant_pour_la_dent: { index: implantBrandValue },
        Marque_de_la_clavette: [
          {
            title: "Marque de la clavette",
            description: lateralPinBrandd,
          },
        ],
        Marque_de_la_trousse: [
          {
            title: "Marque de la trousse",
            description: selectSurgicalKitBrandd,
          },
        ],
        Full_guidee: [
          {
            title: "full guidée",
            active: fullGuide,
          },
        ],
        Forage_pilote: [
          {
            title: "forage pilote",
            active: foragePilote,
          },
        ],
        Options_supplementaires: [
          {
            title: "Mise en charge immédiate",
            active: immediateLoad,
          },
          {
            title: "Impression des 2 étages en résine",
            active: secondSwitch,
          },
          {
            title:
              "Impression du premier étage en métal + deuxième étage en résine",
            active: thirdSwitch,
          },
          {
            title: "Impression des 2 étages en métal",
            active: fourthSwitch,
          },
          {
            title: "Ajout d'aimants pour solidariser les étages",
            active: fifthSwitch,
          },
        ],
        cout: [
          {
            cout: discountedPrice || costt,
          },
        ],
        options_generiques: [
          {
            title: "Smile Design",
            active: smileDesign,
          },
        ],
        submit: true,
        archive: false,
        En_attente_approbation: false,
      },
    });

    if (res.status === 200) {
      navigate("/selectedItemsPage", {
        state: { selectedItemsData: dataToStore },
      });
    } else {
      alert(res.status);
    }
  };

  const handleNextClickArchive = async () => {
    const dataToStore = {
      cost,
      immediateLoad,
      secondSwitch,
      thirdSwitch,
      fourthSwitch,
      fifthSwitch,
      smileDesign,
      foragePilote,
      fullGuide,
      lateralPinBrandd,
      selectSurgicalKitBrandd,
      setsubmit,
    };

    const res = await axios.post("http://localhost:1337/api/guide-a-etages", {
      data: {
        service: 1,
        comment,
        patient: patientData.fullname,
        numero_cas: patientData.caseNumber,
        marque_implant_pour_la_dent: { " index": implantBrandValue },
        Marque_de_la_clavette: [
          {
            title: "Marque de la clavette",
            description: lateralPinBrandd,
          },
        ],
        Marque_de_la_trousse: [
          {
            title: "Marque de la trousse",
            description: selectSurgicalKitBrandd,
          },
        ],
        Full_guidee: [
          {
            title: "full guidée",
            active: fullGuide,
          },
        ],
        Forage_pilote: [
          {
            title: "forage pilote",
            active: foragePilote,
          },
        ],
        Options_supplementaires: [
          {
            title: "Mise en charge immédiate",
            active: immediateLoad,
          },
          {
            title: "Impression des 2 étages en résine",
            active: secondSwitch,
          },
          {
            title:
              "Impression du premier étage en métal + deuxième étage en résine",
            active: thirdSwitch,
          },
          {
            title: "Impression des 2 étages en métal",
            active: fourthSwitch,
          },
          {
            title: "Ajout d'aimants pour solidariser les étages",
            active: fifthSwitch,
          },
        ],
        cout: [
          {
            cout: costt,
          },
        ],
        options_generiques: [
          {
            title: "Smile Design",
            active: smileDesign,
          },
        ],
        submit: false,
        archive: true,
        En_attente_approbation: false,
      },
    });

    if (res.status === 200) {
      navigate("/selectedItemsPage", {
        state: { selectedItemsData: dataToStore },
      });
    } else {
      alert(res.status);
    }
  };
  useEffect(() => {
    if (location.state?.selectedTeeth) {
      // Do something with the selectedTeeth
      console.log(location.state.selectedTeeth);
    }
  }, [location.state]);

  // useEffect(() => {
  //   // This effect might not be necessary if you are already setting the state on initialization
  //   if (previousStates.selectedTeeth) {
  //     setSelectedTeeth(previousStates.selectedTeeth);
  //   }
  // }, [previousStates]);
  return (
    <SideBarContainer>
      <Container>
        <div className="p-2">
          <Card className="h-full p-3 font-SF-Pro-Display">
            <div>
              <ul>
                <div className="flex items-center justify-center">
                  <h1 className="font-lato text-5xl ">
                    {language === "french"
                      ? "Guide à étages"
                      : "Stackable Guide"}
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
                    <p>
                      <span className="font-semibold">
                        {language === "french" ? "Coût: " : "Cost: "}
                      </span>
                      <span className="line-through">{cost} €</span>{" "}
                      <span className="font-bold text-green-600">
                        {discountedPrice
                          ? `${discountedPrice.toFixed(2)} €`
                          : "Calculating..."}
                      </span>
                    </p>
                  </div>
                </div>
                <br />
                <div>
                  <p className="text-lg font-semibold">
                    {language === "french"
                      ? "Selected Teeth:"
                      : "Teeth Selected:"}
                  </p>
                  <div className="flex flex-col items-center justify-center ">
                    <Dents
                      selectAll={false}
                      selectedTeethData={previousStates.selectedTeeth || []}
                      isReadOnly={true}
                    />
                  </div>
                </div>
                <br />
                <li className="text-lg font-semibold">
                  {language === "french"
                    ? "Options sélectionnées"
                    : "Selected Options"}
                </li>
                <div className="flex space-x-2">
                  <p>{selectedItemsData.selectedSwitchLabel}</p>
                  <li>
                    {/* <Switch checked={selectedItemsData.selectedSwitch.checked} /> */}
                  </li>
                </div>
                <p className="font-semibold">
                  {language === "french"
                    ? "Marque de la clavette:"
                    : "Brand of the lateral pin"}
                </p>
                <Input value={lateralPinBrand} readOnly className="w-2/5" />
                <p className="font-semibold">
                  {language === "french"
                    ? "Marque de la trousse de chirugie utilisée:"
                    : "Brand of the surgical kit used:"}
                </p>
                <Input
                  value={selectSurgicalKitBrand}
                  readOnly
                  className="w-2/5"
                />

                <div className="flex-col space-y-1">
                  <h1 className="font-bold">
                    {language === "french"
                      ? "Marque de l'implant pour la dent:"
                      : "Brand of the implant for the tooth:"}
                  </h1>
                  {implantBrandInputs.map(
                    (
                      index:
                        | boolean
                        | ReactElement<any, string | JSXElementConstructor<any>>
                        | Iterable<ReactNode>
                        | Key
                        | null
                        | undefined
                    ) => (
                      <div key={index}>
                        <div className="flex items-center ">
                          <div className="flex space-x-2 items-center mr-2">
                            <FaTooth />
                            <span className=" flex items-center">{index}</span>
                          </div>
                          <Input
                            value={implantBrandValues[index]}
                            readOnly
                            className="w-2/5"
                          />
                          {/* <Input
                        type="text"
                        placeholder="Ex: IDI, Nobel, Straumann ..."
                        className="w-2/5"
                        value=
                        readOnly
                      /> */}
                        </div>
                      </div>
                    )
                  )}
                </div>
                <br />
                <div className="flex space-x-2">
                  <p>
                    {language === "french"
                      ? "Mise en charge immédiate (impression de la prothèse immédiate)"
                      : "Immediate loading (impression of the immediate prosthesis)"}
                  </p>
                  <li>
                    <Switch checked={previousStates.immediateLoad} />
                  </li>
                </div>
                <div className="flex space-x-2">
                  <p>
                    {language === "french"
                      ? "Impression des 2 étages en résine (prothèse immédiate non incluse)"
                      : "Resin impression of both guide parts (immediate prosthesis not included) "}
                  </p>
                  <li>
                    <Switch checked={previousStates.secondSwitch} />
                  </li>
                </div>
                <div className="flex space-x-2">
                  <p>
                    {language === "french"
                      ? "Impression du premier étage en métal + deuxième étage en résine (prothèse immédiate non incluse)"
                      : "Metal impression of first part + Resin impression of second part (immediate prosthesis not included) "}
                  </p>
                  <li>
                    <Switch checked={previousStates.thirdSwitch} />
                  </li>
                </div>
                <div className="flex space-x-2">
                  <p>
                    {language === "french"
                      ? "Impression des 2 étages en métal (prothèse immédiate non incluse)"
                      : "Metal impression of both guide parts (immediate prosthesis not included) "}
                  </p>
                  <li>
                    <Switch checked={previousStates.fourthSwitch} />
                  </li>
                </div>
                <div className="flex space-x-2">
                  <p>
                    {language === "french"
                      ? "Ajout d'aimants pour solidariser les étages"
                      : "Addition of magnets to secure the parts"}
                  </p>
                  <li>
                    <Switch checked={previousStates.fifthSwitch} />
                  </li>
                </div>
                <div className="flex space-x-2">
                  {language === "french" ? "Smile Design" : "Smile Design"}
                  <li>
                    <Switch checked={previousStates.smileDesign} />
                  </li>
                </div>
                <div className="flex-col">
                  <p className="text-lg font-semibold">
                    {" "}
                    {language === "french" ? "commentaire" : "comment"}
                  </p>
                  <Input
                    value={selectedItemsData.comment}
                    readOnly
                    className="w-2/5"
                  />

                  {/* <p> {selectedItemsData.comment}</p> */}
                </div>
              </ul>
            </div>
            <div>
              <div className="mt-5 mb-5">
                <p className="text-lg font-semibold">
                  {language === "french"
                    ? "Ajouter des fichiers:"
                    : "Add files:"}
                </p>
                <Input className="w-2/5" type="file" />
              </div>
              <div className="mt-5 flex justify-between">
                <Button className="w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2 bg-[#fffa1b] text-[#0e0004] hover:bg-[#fffb1bb5] hover:text-[#0e0004] transition-all">
                  {language === "french" ? "Précédent" : "Previous"}
                </Button>

                <div className="flex space-x-3">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        className={`w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2`}
                      >
                        {language === "french" ? "Archiver" : "Archive"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {language === "french"
                            ? "Voulez-vous vraiment archiver ce cas?"
                            : "Are you sure you want to archive this case?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {language === "french"
                            ? " cela archivera le cas."
                            : " this will archive the case."}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          {language === "french" ? "Annuler" : "Cancel"}
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleNextClickArchive}>
                          {language === "french" ? "Continuer" : "Continue"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        className={`w-32 h-auto flex items-center gap-3 rounded-lg px-3 py-2 bg-[#0e0004] text-[#fffa1b] hover:bg-[#211f20] hover:text-[#fffa1b] transition-all`}
                      >
                        {language === "french" ? "Soumettre" : "Submit"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {language === "french"
                            ? "Voulez-vous vraiment soumettre ce cas?"
                            : "Are you sure you want to submit this case?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {language === "french"
                            ? " cela soumettra le cas."
                            : " this will submit the case."}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          {language === "french" ? "Annuler" : "Cancel"}
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleNextClick}>
                          {language === "french" ? "Continuer" : "Continue"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <Button onClick={handlePayment}>Pay</Button>
              </div>
            </div>
          </Card>
        </div>
      </Container>
    </SideBarContainer>
  );
};

export default SelectedItemsPageGETAGE;
function setCurrentOffer(arg0: { currentPlan: any; discount: any }) {
  throw new Error("Function not implemented.");
}
