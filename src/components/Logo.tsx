import logoWhite from "@/assets/big-apple-logo-white.png";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-12 w-auto",
  md: "h-16 w-auto",
  lg: "h-24 w-auto",
  xl: "h-40 w-auto md:h-48"
};

const Logo = ({ size = "md", className = "" }: LogoProps) => {
  return (
    <img
      src={logoWhite}
      alt="Big Apple Barbers - East Village"
      className={`${sizeClasses[size]} ${className}`}
    />
  );
};

export default Logo;
