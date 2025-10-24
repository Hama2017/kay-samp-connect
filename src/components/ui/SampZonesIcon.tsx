import sampZonesIcon from "@/assets/samp-zones-icon.svg";

interface SampZonesIconProps {
  className?: string;
  size?: number;
}

export function SampZonesIcon({ className = "", size = 24 }: SampZonesIconProps) {
  return (
    <img 
      src={sampZonesIcon} 
      alt="SAMP Zones" 
      className={className}
      style={{ 
        width: size, 
        height: size,
        filter: 'brightness(0) saturate(100%) invert(0.5)',
        opacity: 0.7
      }}
    />
  );
}
