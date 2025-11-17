'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import Toaster from '@/components/Toaster';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      {children}
      <Toaster />
    </SessionProvider>
  );
}
