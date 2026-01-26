import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const Logo = ({ className, showText = true, size = "md" }: LogoProps) => {
  const sizes = {
    sm: { icon: 32, text: "text-lg" },
    md: { icon: 40, text: "text-xl" },
    lg: { icon: 56, text: "text-2xl" },
  };

  const { icon, text } = sizes[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Logo SVG - Pomba estilizada com cruz */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Círculo dourado de fundo */}
        <circle
          cx="32"
          cy="32"
          r="30"
          className="fill-gold/20 stroke-gold"
          strokeWidth="2"
        />
        
        {/* Cruz central */}
        <path
          d="M32 14V50M24 26H40"
          className="stroke-primary"
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        {/* Pomba estilizada */}
        <path
          d="M22 22C26 20 30 21 32 24C34 21 38 20 42 22C44 24 43 28 40 30C38 32 34 32 32 30C30 32 26 32 24 30C21 28 20 24 22 22Z"
          className="fill-gold"
        />
        
        {/* Asa esquerda */}
        <path
          d="M18 26C16 24 15 20 18 18C20 17 23 18 24 20"
          className="stroke-primary"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Asa direita */}
        <path
          d="M46 26C48 24 49 20 46 18C44 17 41 18 40 20"
          className="stroke-primary"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className={cn("font-display font-bold leading-tight text-foreground", text)}>
            Igreja Luz
          </span>
          <span className="text-xs text-gold font-medium tracking-widest uppercase">
            do Evangelho
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
