"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import NavLink from "./module/NavLink";
import CustomConnectButton from "./module/CustomConnectButton";
import LanguageSwitcher from "./LanguageSwitcher";
import { usePathname } from "next/navigation";
const Header = () => {
  const t = useTranslations("Navbar");
  const pathname = usePathname();
  const pathWithoutLocale = pathname.replace(/^\/(en|fa)/, "") || "/";

  return (
    <header className="grid grid-cols-2 lg:grid-cols-3 fixed top-0 left-0 right-0 z-50 justify-between items-center p-4 lg:p-6 bg-white text-primary rounded-[8px] lg:rounded-[24px] mt-[13px] mx-[14px] lg:mx-[71px] ">
      <div className="flex items-center gap-2 lg:gap-5">
        <img
          src="/logo.png"
          alt="logo"
          className="w-[45px] h-[24px] lg:w-[60px] lg:h-[32px]"
        />
        <h1 className="text-[14px] lg:text-[30px]">IMD Token</h1>
      </div>
      <nav className="hidden lg:flex justify-center">
        <ul className="flex items-center gap-10 text-[18px]">
          <li>
            <NavLink href="/" active={pathWithoutLocale === "/"}>
              {t("home")}
            </NavLink>
          </li>
          <li>
            <NavLink
              href="/tokenomics"
              active={pathWithoutLocale === "/tokenomics"}
            >
              {t("tokenomics")}
            </NavLink>
          </li>
          <li>
            <NavLink
              href="/whitepaper"
              active={pathWithoutLocale === "/whitepaper"}
            >
              {t("whitepaper")}
            </NavLink>
          </li>
          <li>
            <NavLink href="/about" active={pathWithoutLocale === "/about"}>
              {t("about")}
            </NavLink>
          </li>
        </ul>
      </nav>
      <nav className="lg:hidden flex items-center justify-end gap-2">
        <LanguageSwitcher />
        <button>
          <Menu color="#FF4135" size={30} />
        </button>
      </nav>
      <div className="hidden lg:flex justify-end items-center gap-4">
        <CustomConnectButton
          className={
            "bg-gradient-to-r from-[#FF5D1B] to-[#FF363E]  cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200 ease-in-out rounded-md"
          }
          label={t("connect_wallet")}
        />
        <LanguageSwitcher />
      </div>
    </header>
  );
};

export default Header;
