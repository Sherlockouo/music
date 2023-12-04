import { useState, useEffect, RefObject } from 'react';

const useIntersectionObserver = (element: RefObject<Element>): { onScreen: boolean } => {
  const [onScreen, setOnScreen] = useState(false);

  useEffect(() => {
    const supportsIntersectionObserver = 'IntersectionObserver' in window;

    if (!supportsIntersectionObserver || !element?.current) {
      console.warn('Intersection Observer is not supported in this browser or element is undefined.');
      return;
    }
    
    const observer = new IntersectionObserver(([entry]) => {
    setOnScreen(entry.isIntersecting)
  },{threshold:0});
    observer.observe(element.current);

    return () => {
      observer.disconnect();
    };
  }, [element, setOnScreen]);

  return {
    onScreen,
  };
};

export default useIntersectionObserver;
