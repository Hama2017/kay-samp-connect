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
        opacity: isActive ? 1 : 0.7,
        transition: 'all 0.2s ease'
      }}
    />
  );
}
