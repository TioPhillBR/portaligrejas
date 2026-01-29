import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import logoPortalIgrejas from "@/assets/logo-portal-igrejas.png";

interface PortalLogoProps {
  className?: string;
  showText?: boolean;
}

export const PortalLogo = forwardRef<HTMLImageElement, PortalLogoProps>(
  ({ className, showText = true }, ref) => {
    return (
      <img
        ref={ref}
        src={logoPortalIgrejas}
        alt="Portal Igrejas"
        className={cn("h-10 w-auto object-contain", className)}
      />
    );
  }
);

PortalLogo.displayName = "PortalLogo";
