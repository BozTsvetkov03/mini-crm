import { useEffect, useRef, useState } from "react";

/**
 * Wraps content that should fade/slide up into view the first time it scrolls
 * onto screen. Uses IntersectionObserver and reveals only once. An optional
 * `delay` (seconds) staggers sibling reveals. Reduced-motion safe via index.css.
 */
function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${visible ? "anim-reveal" : "opacity-0"} ${className}`}
      style={visible ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}

export default Reveal;
