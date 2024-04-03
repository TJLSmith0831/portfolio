import { useEffect, RefObject } from 'react';
import { gsap } from 'gsap';

/**
 * Animates the entrance of an element using GSAP, making it fade in from the right.
 *
 * @param elementRef A React ref object targeting the element to animate. The animation
 * moves the element from 100 pixels right of its start position to its final position
 * while changing its opacity from 0 to 1.
 *
 * Usage: Attach the ref to the desired DOM element and pass it to this hook. The animation
 * executes on component mount.
 */
export const useGsapFadeInRight = (
  elementRef: RefObject<HTMLElement>
): void => {
  useEffect(() => {
    if (elementRef.current) {
      gsap.fromTo(
        elementRef.current,
        { opacity: 0, x: 100 },
        { opacity: 1, x: 0, duration: 1, ease: 'power3.out' }
      );
    }
  }, [elementRef]);
};
