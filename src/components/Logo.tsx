import { useQuery } from '@tanstack/react-query';
import { getBusinessConfig } from '@/lib/api/setup';
import logoWhite from "@/assets/demo-logo-white.png";
import logoBlack from "@/assets/demo-logo-black.png";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "light" | "dark";
}

const sizeClasses = {
  sm: "h-12 w-auto",
  md: "h-16 w-auto",
  lg: "h-24 w-auto",
  xl: "h-40 w-auto md:h-48"
};

const Logo = ({ size = "md", className = "", variant = "light" }: LogoProps) => {
  const { data: config } = useQuery({
    queryKey: ['business-config'],
    queryFn: getBusinessConfig,
    staleTime: 5 * 60 * 1000,
  });

  const defaultLogo = variant === "dark" ? logoBlack : logoWhite;
  const logoSrc = (config as any)?.logo_url || defaultLogo;
  const altText = (config as any)?.business_name || "Demo Barbershop";

  return (
    <img
      src={logoSrc}
      alt={altText}
      className={`${sizeClasses[size]} ${className}`}
    />
  );
};

export default Logo;
