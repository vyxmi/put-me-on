"use client";

import { useId } from "react";

interface LightOrbProps {
  size?: number;
  className?: string;
}

/** The song's light — a soft glass-bright sphere with its own highlight and
 * bloom, not a flat dot. The one recurring object the "song traveling
 * between two named people" motif is built from. */
export function LightOrb({ size = 16, className }: LightOrbProps) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" aria-hidden="true" className={className}>
      <g clipPath={`url(#lo-clip-${uid})`}>
        <path
          d="M100 170C138.66 170 170 138.66 170 100C170 61.3401 138.66 30 100 30C61.3401 30 30 61.3401 30 100C30 138.66 61.3401 170 100 170Z"
          fill={`url(#lo-p0-${uid})`}
        />
        <g filter={`url(#lo-f0-${uid})`}>
          <path
            d="M100 170C138.66 170 170 138.66 170 100C170 61.3401 138.66 30 100 30C61.3401 30 30 61.3401 30 100C30 138.66 61.3401 170 100 170Z"
            fill={`url(#lo-p1-${uid})`}
            shapeRendering="crispEdges"
          />
        </g>
        <path
          opacity="0.9"
          d="M78 84C90.1503 84 100 77.732 100 70C100 62.268 90.1503 56 78 56C65.8497 56 56 62.268 56 70C56 77.732 65.8497 84 78 84Z"
          fill={`url(#lo-p2-${uid})`}
        />
      </g>
      <defs>
        <filter id={`lo-f0-${uid}`} x="0" y="0" width="200" height="200" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset />
          <feGaussianBlur stdDeviation="15" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result={`lo-shadow-${uid}`} />
          <feBlend mode="normal" in="SourceGraphic" in2={`lo-shadow-${uid}`} result="shape" />
        </filter>
        <radialGradient id={`lo-p0-${uid}`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(83.2 72) scale(105)">
          <stop stopColor="white" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#EDEEF5" stopOpacity="0.55" />
          <stop offset="0.8" stopColor="#C6CAD9" stopOpacity="0.22" />
          <stop offset="1" stopColor="#9AA0B8" stopOpacity="0.08" />
        </radialGradient>
        <radialGradient id={`lo-p1-${uid}`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(100 100) scale(70)">
          <stop offset="0.72" stopColor="white" stopOpacity="0" />
          <stop offset="0.93" stopColor="white" stopOpacity="0.35" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`lo-p2-${uid}`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(78 70) scale(22 14)">
          <stop stopColor="white" stopOpacity="0.95" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`lo-clip-${uid}`}>
          <rect width="200" height="200" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
