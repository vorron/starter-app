'use client';

import { useEffect } from 'react';
import { isApiError } from '@/shared/lib/errors';
import { Button } from '@/shared/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  const getErrorMessage = (error: Error): string => {
    if (isApiError(error)) {
      return error.userMessage;
    }

    if (error.message.includes('NEXT_NOT_FOUND')) {
      return 'The requested page was not found';
    }

    return 'An unexpected error occurred. Please try again.';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-4 p-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-destructive">Something went wrong</h1>
          <p className="text-muted-foreground">{getErrorMessage(error)}</p>
        </div>
        <Button onClick={reset} variant="outline">
          Try Again
        </Button>
      </div>
    </div>
  );
}
