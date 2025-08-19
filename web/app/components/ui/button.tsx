export function Button({ 
  children, 
  onClick, 
  className = "", 
  variant = "default", 
  size = "default" 
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}) {
  const variantClasses = {
    default: "bg-blue-500 text-white",
    outline: "border border-gray-300 bg-white text-gray-700",
    ghost: "bg-transparent text-gray-700"
  };
  
  const sizeClasses = {
    default: "px-4 py-2",
    sm: "px-2 py-1 text-sm",
    lg: "px-6 py-3 text-lg"
  };
  
  return (
    <button 
      onClick={onClick} 
      className={`rounded ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
}
