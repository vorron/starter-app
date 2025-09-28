'use client';

import { LoginForm } from '@/features/auth/ui/login-form';
import { useUser } from '@/entities/session/model/session.store';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const user = useUser();

  useEffect(() => {
    if (user) {
      redirect('/dashboard');
    }
  }, [user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sign in to your account</h1>
          <p className="text-muted-foreground mt-2">
            Enter your credentials to access your account
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
