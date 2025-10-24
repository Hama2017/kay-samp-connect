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
      style={{ width: size, height: size }}
    />
  );
}
