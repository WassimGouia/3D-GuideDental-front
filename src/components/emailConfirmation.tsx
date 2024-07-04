import { useState} from 'react';
import axios from 'axios';
import { Card} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SideBarContainer from '@/components/SideBarContainer';
import { useNavigate, useParams } from 'react-router-dom';

const EmailConfirmation = () => {
  const [message, setMessage] = useState('');

  const {code} = useParams();
  const navigate = useNavigate();

  const handleConfirm = async () => {
    if (!code) {
      setMessage('No confirmation token found.');
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:1337/api/auth/email-confirmation?confirmation=${code}`
      );

      if (response.status === 200) {
        setMessage('Email confirmed successfully!');
        setTimeout(() => {
          navigate("/login")
        }, 5000);
      } else {
        setMessage('Failed to confirm email. Invalid or expired token.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <SideBarContainer>
      <div className="mx-auto max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-black">Confirm Email</h1>
          <p className="text-black">Click the button below to confirm your email.</p>
        </div>
        <Card>
          <Button type="button" onClick={handleConfirm} className="w-full bg-yellow-500 text-white">
            Confirm Email
          </Button>
        </Card>
        {message && (
          <p className="text-center text-sm text-black">{message}</p>
        )}
      </div>
    </SideBarContainer>
  );
};

export default EmailConfirmation;
