import { useState, useEffect, RefObject, useRef } from 'react';

const useIntersectionObserver = (element: RefObject<Element>): { onScreen: boolean } => {
  const [onScreen, setOnScreen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const supportsIntersectionObserver = 'IntersectionObserver' in window;

    if (!supportsIntersectionObserver || !element?.current) {
      console.warn('Intersection Observer is not supported in this browser or element is undefined.');
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
          setOnScreen(entry.isIntersecting);
        }, 100);
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px 200px 0px',
      }
    );
    observer.observe(element.current);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      observer.disconnect();
    };
  }, [element, setOnScreen]);

  return {
    onScreen,
  };
};

export default useIntersectionObserver;
