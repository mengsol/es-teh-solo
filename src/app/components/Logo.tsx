export default function Logo({ size = 120 }: { size?: number }) {
  return (
    <svg viewBox="0 0 200 220" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      {/* Left tree */}
      <g transform="translate(30, 10)">
        <polygon points="35,0 5,35 20,30 0,60 15,55 -5,85 75,85 55,55 70,60 50,30 65,35" fill="#1B8C3D"/>
        <path d="M30,25 Q35,45 30,85 M40,25 Q35,45 40,85" stroke="white" strokeWidth="3" fill="none" opacity="0.5"/>
      </g>
      {/* Center tree */}
      <g transform="translate(65, 0)">
        <polygon points="35,0 5,35 20,30 0,60 15,55 -5,85 75,85 55,55 70,60 50,30 65,35" fill="#22A948"/>
        <path d="M30,25 Q35,45 30,85 M40,25 Q35,45 40,85" stroke="white" strokeWidth="3" fill="none" opacity="0.5"/>
      </g>
      {/* Right tree */}
      <g transform="translate(100, 10)">
        <polygon points="35,0 5,35 20,30 0,60 15,55 -5,85 75,85 55,55 70,60 50,30 65,35" fill="#1B8C3D"/>
        <path d="M30,25 Q35,45 30,85 M40,25 Q35,45 40,85" stroke="white" strokeWidth="3" fill="none" opacity="0.5"/>
      </g>
      {/* Trunks */}
      <rect x="55" y="95" width="10" height="15" fill="#8B6914" rx="2"/>
      <rect x="95" y="85" width="10" height="15" fill="#8B6914" rx="2"/>
      <rect x="125" y="95" width="10" height="15" fill="#8B6914" rx="2"/>
      {/* Text */}
      <text x="100" y="140" textAnchor="middle" fontFamily="Georgia, serif" fontSize="36" fontWeight="bold" fill="#1B2A4A">Es Teh</text>
      <text x="100" y="162" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="16" letterSpacing="6" fill="#1B2A4A">S.O.L.O</text>
    </svg>
  );
}
