import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import SideBarContainer from '@/components/SideBarContainer';

const EmailConfirmationMessage = () => {
  return (
    <SideBarContainer>
      <div className="mx-auto max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-black">Confirm Your Email</h1>
          <p className="text-black">You should confirm your email address by clicking on the link sent to you.</p>
        </div>
        <Card>
          <CardContent className="space-y-4 text-center">
            <p className="text-black">A confirmation link has been sent to your email address. Please check your inbox and click on the link to confirm your email.</p>
          </CardContent>
        </Card>
      </div>
    </SideBarContainer>
  );
};

export default EmailConfirmationMessage;
