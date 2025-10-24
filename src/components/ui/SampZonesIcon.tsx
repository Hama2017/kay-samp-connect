import sampZonesIcon from "@/assets/samp-zones-icon.svg";

interface SampZonesIconProps {
  className?: string;
  size?: number;
  isActive?: boolean;
}

export function SampZonesIcon({ className = "", size = 24, isActive = false }: SampZonesIconProps) {
  return (
    <img 
      src={sampZonesIcon} 
      alt="SAMP Zones" 
      className={className}
      style={{ 
        width: size, 
        height: size,
        filter: isActive 
          ? 'brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(130deg) brightness(98%) contrast(101%)'
          : 'brightness(0) saturate(100%) invert(0.5)',
        opacity: isActive ? 1 : 0.7,
        transition: 'all 0.2s ease'
      }}
    />
  );
}
