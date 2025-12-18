import React, { useRef, useState, useEffect } from 'react';

const WidgetScrollScale = ({ children }) => {
  const ref = useRef(null);
  const [style, setStyle] = useState({ transform: 'scale(0.95)', opacity: 1 });

  useEffect(() => {
    let ticking = false;
    let scrollParent = null;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const center = windowHeight / 2;
            
            // Calculate distance from center of the VIEWPORT (screen)
            // This works even inside the modal because getBoundingClientRect is relative to the screen
            const elementCenter = rect.top + rect.height / 2;
            const distanceFromCenter = Math.abs(center - elementCenter);
            const range = 600; 
            
            let factor = 1 - (distanceFromCenter / range);
            if (factor < 0) factor = 0;

            // Interpolate Values
            // Scale: 0.9 (Smallest) -> 1.05 (Largest)
            const scale = 0.9 + (factor * 0.17); 
            // Opacity: 0.4 (Dim) -> 1.0 (Bright)
            const opacity = 0.4 + (factor * 0.8); 
            
            setStyle({
              transform: `scale(${scale})`,
              opacity: opacity, 
              transition: 'none', 
              willChange: 'transform'
            });
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    // 1. Find the Scroll Container (The Modal)
    if (ref.current) {
      // This searches up the tree for the specific div that has the scrollbar
      scrollParent = ref.current.closest('.overflow-y-auto');
    }

    // 2. Attach Listener to that container OR window (fallback)
    const target = scrollParent || window;
    
    target.addEventListener('scroll', handleScroll, { passive: true });
    // Also listen to resize, just in case
    window.addEventListener('resize', handleScroll);
    
    // Initial check
    handleScroll(); 

    return () => {
      target.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <div ref={ref} style={style} className="w-full">
      {children}
    </div>
  );
};

export default WidgetScrollScale;