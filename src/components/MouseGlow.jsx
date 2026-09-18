import { useEffect, useRef } from "react";

export default function MouseGlow() {
  const glowRef = useRef(null);

  const mouse = useRef({
    x: 0,
    y: 0,
  });

  const position = useRef({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const finePointer = window.matchMedia(
      "(pointer: fine)"
    );

    if (!finePointer.matches) return;

    let animationFrame;

    function handleMouseMove(e) {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    }

    function animate() {
      // Lower = smoother / slower
      // Higher = follows cursor faster
      const ease = 0.08;

      position.current.x +=
        (mouse.current.x - position.current.x) * ease;

      position.current.y +=
        (mouse.current.y - position.current.y) * ease;

      if (glowRef.current) {
        glowRef.current.style.transform = `
          translate3d(
            ${position.current.x}px,
            ${position.current.y}px,
            0
          )
          translate(-50%, -50%)
        `;
      }

      animationFrame = requestAnimationFrame(animate);
    }

    window.addEventListener(
      "mousemove",
      handleMouseMove
    );

    animate();

    return () => {
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
   <div
  ref={glowRef}
  className="
    pointer-events-none
    fixed
    top-0
    left-0
    z-0

    w-[600px]
    h-[600px]

    rounded-full
    blur-3xl
    opacity-50
  "
  style={{
    background: `
      radial-gradient(
        circle,
        rgba(255, 220, 185, 0.22) 0%,
        rgba(255, 195, 145, 0.12) 35%,
        rgba(255, 170, 110, 0.05) 55%,
        transparent 75%
      )
    `,
  }}
/>
  );
}