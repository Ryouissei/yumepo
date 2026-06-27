import React from "react";

interface LogoIconProps {
  className?: string;
  size?: number;
}

export const LogoIcon: React.FC<LogoIconProps> = ({ className = "", size = 44 }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`select-none ${className}`}
      style={{ minWidth: size, minHeight: size }}
    >
      {/* Soft white rounded background */}
      <rect x="0" y="0" width="100" height="100" rx="22" fill="#ffffff" />
      
      {/* Soft mailbox shadow */}
      <ellipse cx="50" cy="80" rx="24" ry="6" fill="rgba(165, 166, 246, 0.15)" />
      
      {/* Lavender Mailbox Post/Arch */}
      <path
        d="M 28 80 L 28 45 A 22 22 0 0 1 72 45 L 72 80 Z"
        fill="#b0b1f9"
      />
      
      {/* Inner shadow/highlight on mailbox */}
      <path
        d="M 32 80 L 32 46 A 18 18 0 0 1 68 46 L 68 80 Z"
        fill="#9ea0f5"
        opacity="0.3"
      />

      {/* Mailbox feet */}
      <path d="M 28 80 L 35 80 L 35 74 L 28 74 Z" fill="#b0b1f9" />
      <path d="M 65 80 L 72 80 L 72 74 L 65 74 Z" fill="#b0b1f9" />
      
      {/* Crescent Moon on Mailbox */}
      <path
        d="M 52 24 A 7 7 0 1 0 58 36 A 7 7 0 1 1 52 24 Z"
        fill="#fef08a"
      />
      
      {/* Mailbox slot (white horizontal rounded bar) */}
      <rect x="35" y="46" width="30" height="5" rx="2.5" fill="#f8fafc" />
      <path d="M 36 51 L 64 51 L 64 57 L 36 57 Z" fill="#475569" opacity="0.15" />
      
      {/* Letter sticking out / inside the slot */}
      <g transform="rotate(-6 50 63)">
        <rect x="38" y="53" width="24" height="16" rx="2" fill="#fffbeb" stroke="#fef3c7" strokeWidth="0.5" />
        {/* Envelope flap folds */}
        <path d="M 38 53 L 50 61 L 62 53" fill="none" stroke="#fde68a" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Small stars around */}
      {/* Top left star */}
      <path d="M 28 20 L 29 22 L 31 22 L 29 23 L 30 25 L 28 24 L 26 25 L 27 23 L 25 22 L 27 22 Z" fill="#cbd5e1" />
      {/* Top right star */}
      <path d="M 75 22 L 76 24 L 78 24 L 76 25 L 77 27 L 75 26 L 73 27 L 74 25 L 72 24 L 74 24 Z" fill="#fde68a" />
      {/* Mid right star */}
      <path d="M 78 55 L 79.5 57 L 82 57 L 80 58.5 L 81 61 L 78 59.5 L 75 61 L 76 58.5 L 74 57 L 76.5 57 Z" fill="#fde68a" opacity="0.8" />
      {/* Left star */}
      <path d="M 21 44 L 22 46 L 24 46 L 22 47.5 L 23 50 L 21 48.5 L 19 50 L 20 47.5 L 18 46 L 20 46 Z" fill="#fde68a" opacity="0.8" />

      {/* Green leafy stem on bottom left */}
      <g transform="translate(16, 53) scale(0.8)">
        {/* Stem curve */}
        <path d="M 12 35 C 10 25 15 15 20 5" fill="none" stroke="#87a987" strokeWidth="1.5" strokeLinecap="round" />
        {/* Leaves */}
        <path d="M 17 9 C 13 9 13 14 17 14 C 21 14 21 9 17 9 Z" fill="#87a987" />
        <path d="M 19 18 C 15 19 16 24 20 23 C 24 22 23 17 19 18 Z" fill="#87a987" />
        <path d="M 14 24 C 10 23 9 28 13 29 C 17 30 18 25 14 24 Z" fill="#87a987" />
        <path d="M 13 15 C 9 14 8 19 12 20 C 16 21 17 16 13 15 Z" fill="#87a987" />
      </g>
    </svg>
  );
};
