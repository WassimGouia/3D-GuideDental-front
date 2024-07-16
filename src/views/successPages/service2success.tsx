import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Service2Success = () => {
  const location = useLocation();
  const [requestMade, setRequestMade] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const sessionId = queryParams.get('session_id');
    const service = queryParams.get('service');
    const guideId = queryParams.get('guideId');
    const caseNumber = localStorage.getItem("caseNumber");

    if (sessionId && !requestMade) {
      setRequestMade(true);

      fetch(`http://localhost:1337/api/confirm-payment-guide-classique`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, service, caseNumber,guideId}),
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            localStorage.removeItem("caseNumber")
            localStorage.removeItem("fullName")
            setTimeout(function() {
              window.location.href = "/sign/Nouvelle-demande";
          }, 3000);
          } else {
            console.error('Payment confirmation failed', data.error);
          }
        })
        .catch(error => {
          console.error('Error confirming payment', error);
        });
    }
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

export default Service2Success;