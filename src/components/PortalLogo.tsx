import { cn } from "@/lib/utils";

interface PortalLogoProps {
  className?: string;
}

export const PortalLogo = ({ className }: PortalLogoProps) => {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-primary", className)}
    >
      {/* Church building silhouette */}
      <path
        d="M24 4L26 4V8H26L24 6L22 8H22V4L24 4Z"
        fill="currentColor"
      />
      {/* Cross on top */}
      <rect x="23" y="2" width="2" height="8" fill="currentColor" />
      <rect x="21" y="4" width="6" height="2" fill="currentColor" />
      
      {/* Main church body */}
      <path
        d="M24 10L40 22V44H8V22L24 10Z"
        fill="currentColor"
        fillOpacity="0.15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      
      {/* Door */}
      <path
        d="M20 44V32C20 30.8954 20.8954 30 22 30H26C27.1046 30 28 30.8954 28 32V44"
        fill="currentColor"
        fillOpacity="0.3"
        stroke="currentColor"
        strokeWidth="2"
      />
      
      {/* Windows */}
      <circle cx="16" cy="28" r="3" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="32" cy="28" r="3" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1.5" />
      
      {/* Rose window */}
      <circle cx="24" cy="20" r="4" fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="1.5" />
      
      {/* Portal effect - gradient arc */}
      <path
        d="M6 44C6 32 14 24 24 24C34 24 42 32 42 44"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="4 4"
        opacity="0.5"
      />
    </svg>
  );
};
