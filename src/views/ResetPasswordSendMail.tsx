import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SideBarContainer from "@/components/SideBarContainer";
import Container from "@/components/Container";
import axios from "axios";

const ResetPasswordSendMail = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission behavior
    try {
      const response = await axios.post(
        "http://localhost:1337/api/auth/forgot-password",
        {
          email,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setMessage("Reset password link sent to your email.");
      } else {
        setMessage("Failed to send reset password link.");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <SideBarContainer>
      <Container>
        <div className="mx-auto max-w-md space-y-6 py-12">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Reset Password</h1>
            <p className="text-muted-foreground">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Reset Password
            </Button>
          </form>
          {message && (
            <p className="text-center text-sm text-muted-foreground">
              {message}
            </p>
          )}
          <div className="text-center text-sm text-muted-foreground">
            <Link to="/" className="underline underline-offset-4">
              Return to login
            </Link>
          </div>
        </div>
      </Container>
    </SideBarContainer>
  );
};

export default ResetPasswordSendMail;
