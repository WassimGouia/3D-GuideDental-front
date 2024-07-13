import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SideBarContainer from "@/components/SideBarContainer";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (!validatePassword(password)) {
      setMessage(
        "Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, and one number."
      );
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:1337/api/auth/reset-password",
        {
          code: token, // Ensure to use 'code' instead of 'token'
          password,
          passwordConfirmation: confirmPassword, // Ensure to use 'passwordConfirmation'
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setMessage("Password updated successfully.");
        setTimeout(() => navigate('/login'), 5000); // Redirect to login page after 5 seconds
      } else {
        setMessage("Failed to update password.");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <SideBarContainer>
      <div className="mx-auto max-w-md space-y-6 py-12">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Reset Password</h1>
          <p className="text-muted-foreground">
            Enter a new password for your account.
          </p>
        </div>
        <Card>
          <CardContent className="space-y-4">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <CardFooter>
                <Button type="submit" className="w-full">
                  Update Password
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
        {message && (
          <p className="text-center text-sm text-muted-foreground">{message}</p>
        )}
      </div>
    </SideBarContainer>
  );
};

export default ResetPassword;
