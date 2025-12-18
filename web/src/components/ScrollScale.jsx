// src/components/ScrollScale.jsx
import React, { useRef, useState, useEffect } from 'react';

const ScrollScale = ({ children }) => {
  const ref = useRef(null);
  const [style, setStyle] = useState({ transform: 'scale(0.85)', opacity: 0.5 });

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const center = windowHeight / 2;
            
            // Calculate center point of the element
            const elementCenter = rect.top + rect.height / 2;
            
            // Distance from center (0 means dead center)
            const distanceFromCenter = Math.abs(center - elementCenter);
            
            // "Active Zone" Range: The effect happens within 400px of the center
            const range = 400; 
            
            // Calculate factor: 1.0 (Center) -> 0.0 (Edge of range)
            let factor = 1 - (distanceFromCenter / range);
            
            // Clamp value between 0 and 1
            if (factor < 0) factor = 0;

            // Interpolate Values
            // Scale: 0.9 (Smallest) -> 1.05 (Largest)
            const scale = 0.9 + (factor * 0.15); 
            // Opacity: 0.4 (Dim) -> 1.0 (Bright)
            const opacity = 0.4 + (factor * 0.6);

            setStyle({
              transform: `scale(${scale})`,
              opacity: opacity,
              // CRITICAL: No transition here allows instant, smooth syncing with scroll
              transition: 'none', 
              willChange: 'transform, opacity'
            });
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Run once on mount to set initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={ref} style={style} className="w-full">
      {children}
    </div>
  );
};

export default ScrollScale;