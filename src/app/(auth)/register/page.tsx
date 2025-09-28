'use client';

import { RegisterForm } from '@/features/auth/ui/register-form';
import { useUser } from '@/entities/session/model/session.store';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
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
          <h1 className="text-3xl font-bold">Create your account</h1>
          <p className="text-muted-foreground mt-2">Enter your details to get started</p>
        </div>

        <RegisterForm />

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
