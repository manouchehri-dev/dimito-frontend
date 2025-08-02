import Link from "next/link";

const NavLink = ({ href, children, className, onClick, active }) => {
  console.log(active);
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative hover:text-[#FF3A3B] ${
        active
          ? "text-[#FF3A3B] underline decoration-[2px] underline-offset-8"
          : ""
      } ${className}`}
    >
      {children}
    </Link>
  );
};

export default NavLink;
