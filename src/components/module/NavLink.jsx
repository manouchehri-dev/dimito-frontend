import { Link } from "@/i18n/navigation";

const NavLink = ({ href, children, className = "", onClick, active }) => {
  // Check if this is a mobile nav link or has custom styling
  const hasCustomStyling =
    className.includes("px-") ||
    className.includes("py-") ||
    className.includes("bg-");

  // Ensure the link always takes full width and height of its container
  const baseClasses = hasCustomStyling
    ? `${className}`
    : `relative hover:text-[#FF3A3B] transition-colors ${className}`;

  // Add flex/block display to ensure full clickable area
  const displayClass = className.includes("block")
    ? ""
    : "flex items-center justify-center z-10";

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`${baseClasses} ${displayClass} w-full h-full`}
    >
      {children}
    </Link>
  );
};

export default NavLink;
