import { useEffect } from 'react';
import { useSessionStore } from './session.store';

export const useSessionEvents = () => {
  const forceLogout = useSessionStore((state) => state.forceLogout);

  useEffect(() => {
    const handleForceLogout = () => {
      forceLogout();
    };

    window.addEventListener('force-logout', handleForceLogout);
    return () => window.removeEventListener('force-logout', handleForceLogout);
  }, [forceLogout]);
};
