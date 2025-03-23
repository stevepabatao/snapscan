import type React from "react"
export function Logo({ className = "", ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="filmGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#D4B483" }} />
          <stop offset="100%" style={{ stopColor: "#8B6B42" }} />
        </linearGradient>
      </defs>
      <path d="M40 80 L100 40 L160 80 L160 120 L100 160 L40 120 Z" fill="url(#filmGradient)" stroke="none" />
      <circle cx="100" cy="100" r="25" fill="none" stroke="url(#filmGradient)" strokeWidth="8" />
      <path d="M100 85 L100 115 M85 100 L115 100" stroke="url(#filmGradient)" strokeWidth="4" />
    </svg>
  )
}

