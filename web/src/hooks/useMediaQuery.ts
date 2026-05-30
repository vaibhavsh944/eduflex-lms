import { useState, useEffect } from 'react';

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

export function useMobile() {
  return useMediaQuery('(max-width: 640px)');
}

export function useTablet() {
  return useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
}

export function useDesktop() {
  return useMediaQuery('(min-width: 1025px)');
}

export function useSmallMobile() {
  return useMediaQuery('(max-width: 480px)');
}