"use client";

import { useRef, useEffect, memo } from "react";
import type { BackgroundConfig } from "@/types";

interface Props {
  config: BackgroundConfig;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

function ParticleBackgroundInner({ config }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  const type = config.type; // particles-float | particles-constellation | particles-aura
  const density = Math.min(2, config.density ?? 1);
  const speed = Math.min(2, config.speed ?? 1);
  const pSize = Math.min(5, config.particleSize ?? 2);
  const opacity = config.opacity ?? 0.6;
  const position = config.position;

  // Map position to focal ratios (0-1)
  const focalX = position === "left" || position === "top-left" || position === "bottom-left" ? 0.25
    : position === "right" || position === "top-right" || position === "bottom-right" ? 0.75
    : 0.5;
  const focalY = position === "top" || position === "top-left" || position === "top-right" ? 0.25
    : position === "bottom" || position === "bottom-left" || position === "bottom-right" ? 0.75
    : 0.5;

  // Resolve color — strip var() to get fallback hex for canvas
  const resolveColor = (c?: string): string => {
    if (!c) return "#6366F1";
    if (c.startsWith("var(")) {
      const match = c.match(/,\s*(#[0-9a-fA-F]+)/);
      return match ? match[1] : "#6366F1";
    }
    return c;
  };

  const primaryHex = resolveColor(config.primaryColor);
  const secondaryHex = resolveColor(config.secondaryColor) || primaryHex;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let running = true;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    const resizeObs = new ResizeObserver(resize);
    if (canvas.parentElement) resizeObs.observe(canvas.parentElement);

    // Init particles
    const baseCount = type === "particles-constellation" ? 40 : type === "particles-aura" ? 50 : 30;
    const count = Math.round(baseCount * density);
    const w = () => canvas.width / (Math.min(window.devicePixelRatio || 1, 2));
    const h = () => canvas.height / (Math.min(window.devicePixelRatio || 1, 2));

    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * (w() || 800),
      y: Math.random() * (h() || 600),
      vx: (Math.random() - 0.5) * 0.4 * speed,
      vy: (Math.random() - 0.5) * 0.4 * speed,
      size: pSize * (0.5 + Math.random()),
      alpha: 0.3 + Math.random() * 0.7,
    }));

    // Hex to RGB
    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    };

    const rgb1 = hexToRgb(primaryHex);
    const rgb2 = hexToRgb(secondaryHex);

    const draw = () => {
      if (!running) return;
      const W = w();
      const H = h();
      ctx.clearRect(0, 0, W, H);

      const particles = particlesRef.current;

      // Update positions
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
      }

      if (type === "particles-float") {
        // Simple floating particles
        for (const p of particles) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb1.r}, ${rgb1.g}, ${rgb1.b}, ${p.alpha * opacity})`;
          ctx.fill();
        }
      } else if (type === "particles-constellation") {
        // Particles + connecting lines
        const maxDist = 120;
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          // Draw particle
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb1.r}, ${rgb1.g}, ${rgb1.b}, ${p.alpha * opacity})`;
          ctx.fill();

          // Draw lines to nearby particles
          for (let j = i + 1; j < particles.length; j++) {
            const q = particles[j];
            const dx = p.x - q.x;
            const dy = p.y - q.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < maxDist) {
              const lineAlpha = (1 - dist / maxDist) * 0.3 * opacity;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(q.x, q.y);
              ctx.strokeStyle = `rgba(${rgb2.r}, ${rgb2.g}, ${rgb2.b}, ${lineAlpha})`;
              ctx.lineWidth = 0.6;
              ctx.stroke();
            }
          }
        }
      } else if (type === "particles-aura") {
        // Particles orbiting glow zones — focal point from config
        const cx = W * focalX;
        const cy = H * focalY;
        const time = Date.now() * 0.0005 * speed;

        // Draw central glow at focal point
        const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.35);
        glowGrad.addColorStop(0, `rgba(${rgb1.r}, ${rgb1.g}, ${rgb1.b}, ${0.12 * opacity})`);
        glowGrad.addColorStop(1, "transparent");
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, W, H);

        // Second glow offset from focal
        const cx2 = cx - W * 0.15 + Math.sin(time * 0.3) * W * 0.05;
        const cy2 = cy + H * 0.15 + Math.cos(time * 0.4) * H * 0.05;
        const glowGrad2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, Math.min(W, H) * 0.25);
        glowGrad2.addColorStop(0, `rgba(${rgb2.r}, ${rgb2.g}, ${rgb2.b}, ${0.08 * opacity})`);
        glowGrad2.addColorStop(1, "transparent");
        ctx.fillStyle = glowGrad2;
        ctx.fillRect(0, 0, W, H);

        // Draw orbiting particles
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          // Add orbital drift toward center
          const dx = cx - p.x;
          const dy = cy - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) + Math.PI * 0.5; // perpendicular drift
          p.vx += Math.cos(angle) * 0.01 * speed;
          p.vy += Math.sin(angle) * 0.01 * speed;
          // Dampen
          p.vx *= 0.995;
          p.vy *= 0.995;

          // Attract gently toward center if too far
          if (dist > Math.min(W, H) * 0.4) {
            p.vx += dx * 0.0001;
            p.vy += dy * 0.0001;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.2, 0, Math.PI * 2);
          const a = p.alpha * opacity * (0.5 + 0.5 * Math.sin(time + i));
          ctx.fillStyle = `rgba(${rgb1.r}, ${rgb1.g}, ${rgb1.b}, ${a})`;
          ctx.fill();
        }
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    // Respect reduced motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      // Draw once, no animation
      draw();
    } else {
      draw();
    }

    return () => {
      running = false;
      cancelAnimationFrame(frameRef.current);
      resizeObs.disconnect();
    };
  }, [type, density, speed, pSize, opacity, primaryHex, secondaryHex]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ width: "100%", height: "100%" }}
    />
  );
}

export default memo(ParticleBackgroundInner);
