interface CapybaraProps {
  className?: string;
  size?: number;
}

export function Capybara({ className = "", size = 200 }: CapybaraProps) {
  const scale = size / 500;

  return (
    <svg
      width={size}
      height={size * 0.8}
      viewBox="0 0 500 400"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="500" height="250" fill="#87CEEB" />
      <rect y="250" width="500" height="150" fill="#32B44B" />
      <ellipse cx="225" cy="185" rx="125" ry="65" fill="#8B4513" />
      <ellipse cx="130" cy="150" rx="60" ry="50" fill="#8B4513" />
      <ellipse cx="105" cy="95" rx="15" ry="15" fill="#8B4513" />
      <ellipse cx="155" cy="95" rx="15" ry="15" fill="#8B4513" />
      <circle cx="110" cy="135" r="5" fill="black" />
      <circle cx="150" cy="135" r="5" fill="black" />
      <ellipse cx="127" cy="155" rx="7" ry="5" fill="black" />
      <path d="M127 165 Q110 150 145 165" stroke="black" fill="none" strokeWidth="2" />
      <rect x="140" y="220" width="20" height="40" fill="#783C0F" rx="3" />
      <rect x="200" y="220" width="20" height="40" fill="#783C0F" rx="3" />
      <rect x="270" y="220" width="20" height="40" fill="#783C0F" rx="3" />
      <rect x="330" y="220" width="20" height="40" fill="#783C0F" rx="3" />
      <ellipse cx="350" cy="170" rx="10" ry="10" fill="#8B4513" />
    </svg>
  );
}
