import Link from "next/link";

const NavLink = ({ href, children, className = "", onClick, active }) => {
  // Check if this is a mobile nav link or has custom styling
  const hasCustomStyling =
    className.includes("px-") ||
    className.includes("py-") ||
    className.includes("bg-");

  return (
    <Link
      href={href}
      onClick={onClick}
      className={
        hasCustomStyling
          ? className
          : `relative hover:text-[#FF3A3B] transition-colors ${className}`
      }
    >
      {children}
    </Link>
  );
};

export default NavLink;
