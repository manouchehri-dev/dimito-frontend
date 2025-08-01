"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NavLink = ({ href, children, className, onClick }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative hover:text-[#FF3A3B] ${
        isActive
          ? "text-[#FF3A3B] underline decoration-[2px] underline-offset-8"
          : ""
      } ${className}`}
    >
      {children}
    </Link>
  );
};

export default NavLink;
