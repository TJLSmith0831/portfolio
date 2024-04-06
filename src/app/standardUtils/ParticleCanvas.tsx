'use client';
import React, { useEffect, useRef } from 'react';

// Assuming you have the randomNormal function defined elsewhere
function randomNormal({ mean = 0, dev = 1 }) {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  num = num * dev + mean; // Adjust for mean and deviation
  return num;
}

const ParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef([]);
  let animationFrameId: number;

  // Define the function to create a particle
  const createParticle = (canvas: HTMLCanvasElement) => {
    const colour = {
      r: 35,
      g: randomNormal({ mean: 125, dev: 20 }),
      b: 50,
      a: Math.random(),
    };
    return {
      x: -2,
      y: -2,
      diameter: Math.max(0, randomNormal({ mean: 0.5, dev: 0.25 })),
      duration: randomNormal({ mean: 20000, dev: 2000 }),
      amplitude: randomNormal({ mean: 16, dev: 2 }),
      offsetY: randomNormal({ mean: 0, dev: 10 }),
      arc: Math.PI * 2,
      startTime: performance.now() - Math.random() * 20000,
      colour: `rgba(${colour.r},${colour.g},${colour.b},${colour.a})`,
    };
  };

  // Define the function to move a particle
  const moveParticle = (particle, canvas, time) => {
    const progress =
      ((time - particle.startTime) % particle.duration) / particle.duration;
    return {
      ...particle,
      x: progress,
      y:
        Math.sin(progress * particle.arc) * particle.amplitude +
        particle.offsetY,
    };
  };

  // Define the function to draw a particle
  const drawParticle = (particle, canvas, ctx) => {
    const vh = canvas.height / 100;
    ctx.fillStyle = particle.colour;
    ctx.beginPath();
    ctx.ellipse(
      particle.x * canvas.width,
      particle.y * vh + canvas.height / 2,
      particle.diameter * vh,
      particle.diameter * vh,
      0,
      0,
      2 * Math.PI
    );
    ctx.fill();
  };

  // Animation function
  const animate = (time) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!canvas || !ctx) return;

    // Your animation code here
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Move and draw particles
    // Assuming particles is a state or ref variable holding your particles
    particlesRef.current.forEach((particle, index) => {
      particlesRef.current[index] = moveParticle(particle, canvas, time);
      drawParticle(particlesRef.current[index], canvas, ctx);
    });

    // Request next frame
    animationFrameId = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Initialize particles
    particlesRef.current = Array.from({ length: 600 }, () =>
      createParticle(canvas)
    );

    // Resize listener
    const handleResize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    };

    window.addEventListener('resize', handleResize);

    // Start animation
    animate(performance.now());

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} id="particle-canvas" />;
};

export default ParticleCanvas;
