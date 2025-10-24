interface SampZonesIconProps {
  className?: string;
  size?: number;
}

export function SampZonesIcon({ className = "", size = 24 }: SampZonesIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 420 444" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <mask id="mask0_112_13" style={{ maskType: 'luminance' }} maskUnits="userSpaceOnUse" x="0" y="0" width="420" height="444">
        <rect width="420" height="444" fill="currentColor"/>
      </mask>
      <g mask="url(#mask0_112_13)">
        <rect width="420" height="444" fill="currentColor"/>
      </g>
    </svg>
  );
}
