import { Link } from "react-router-dom";

const PaymentCancel = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-gray-800">Payment Cancelled</h1>
          <p className="mt-2 text-gray-600">Your payment was cancelled.</p>
          <p className="mt-4 text-sm text-gray-500">If you have any questions, please contact support.</p>
          <div className="mt-6">
            <Link to="/" className="text-blue-500 hover:underline">Go to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
