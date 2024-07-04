import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import SideBarContainer from "@/components/SideBarContainer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Component() {
  return (
    <SideBarContainer>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Verify Your Identity
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
              Please enter the 6-digit code sent to your phone.
            </p>
            <div className="flex items-center justify-center mb-8">
              <InputOTP maxLength={6} pattern="^[0-9]+$">
                <InputOTPGroup>
                  <InputOTPSlot
                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ease-in-out rounded-md px-4 py-3 text-2xl font-bold text-center w-12 h-12 mr-2 bg-gray-100 dark:bg-gray-700 dark:text-gray-100"
                    index={0}
                  />
                  <InputOTPSlot
                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ease-in-out rounded-md px-4 py-3 text-2xl font-bold text-center w-12 h-12 mr-2 bg-gray-100 dark:bg-gray-700 dark:text-gray-100"
                    index={1}
                  />
                  <InputOTPSlot
                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ease-in-out rounded-md px-4 py-3 text-2xl font-bold text-center w-12 h-12 mr-2 bg-gray-100 dark:bg-gray-700 dark:text-gray-100"
                    index={2}
                  />
                  <InputOTPSlot
                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ease-in-out rounded-md px-4 py-3 text-2xl font-bold text-center w-12 h-12 mr-2 bg-gray-100 dark:bg-gray-700 dark:text-gray-100"
                    index={3}
                  />
                  <InputOTPSlot
                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ease-in-out rounded-md px-4 py-3 text-2xl font-bold text-center w-12 h-12 mr-2 bg-gray-100 dark:bg-gray-700 dark:text-gray-100"
                    index={4}
                  />
                  <InputOTPSlot
                    className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 ease-in-out rounded-md px-4 py-3 text-2xl font-bold text-center w-12 h-12 mr-2 bg-gray-100 dark:bg-gray-700 dark:text-gray-100"
                    index={5}
                  />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <div className="flex justify-between items-center w-full">
              <Link className="text-gray-400 hover:underline" to="/Cabinet">
                <Button
                  className="flex-1 mr-2 text-white font-bold w-44 py-3 px-6 rounded-md transition-colors duration-300"
                  type="submit"
                >
                  Verify
                </Button>
              </Link>
              <Link className="text-slate-600 hover:underline" to="/"> Send again?</Link>
            </div>
          </div>
        </div>
      </div>
    </SideBarContainer>
  );
}
