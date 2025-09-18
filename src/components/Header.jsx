"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import NavLink from "./module/NavLink";
import CustomConnectButton from "./module/CustomConnectButton";
import LanguageSwitcher from "./LanguageSwitcher";
import { usePathname, useRouter } from "@/i18n/navigation";

const Header = () => {
  const t = useTranslations("Navbar");
  const pathname = usePathname();
  const router = useRouter();
  const pathWithoutLocale = pathname.replace(/^\/(en|fa)/, "") || "/";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navItems = [
    {
      href: "/",
      label: t("home"),
      active: pathWithoutLocale === "/",
    },
    {
      href: "/presales",
      label: t("presales"),
      active: pathWithoutLocale === "/presales",
      highlight: true, // Special highlight for revenue-generating page
    },
    {
      href: "/transparency",
      label: t("transparency"),
      active: pathWithoutLocale === "/transparency",
    },
    {
      href: "/listing",
      label: t("tokenizationRequest"),
      active: pathWithoutLocale === "/listing",
    },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm text-primary rounded-[8px] lg:rounded-[24px] mt-[8px] sm:mt-[13px] mx-[8px] sm:mx-[14px] lg:mx-[71px] shadow-lg border border-gray-100">
        <div className="grid grid-cols-2 lg:grid-cols-3 justify-between items-center p-4 sm:p-5 lg:p-6">
          {/* Logo Section */}
          <div className="flex">
            <div
              className="flex items-center gap-2 lg:gap-4 cursor-pointer"
              onClick={() => router.push("/")}
            >
              <img
                src="/logo-header.png"
                alt="logo"
                className="w-[80px] lg:w-[160px] "
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex justify-center">
            <ul className="flex items-center gap-1 lg:gap-1 xl:gap-2">
              {navItems.map((item, index) => (
                <li key={index} className="relative group">
                  {item.dropdown ? (
                    // Dropdown menu item
                    <div className="relative">
                      <button
                        onClick={() => setDropdownOpen(dropdownOpen === index ? null : index)}
                        className={`relative px-3 lg:px-4 xl:px-6 py-2 lg:py-2.5 xl:py-3 text-xs lg:text-sm xl:text-base font-medium rounded-lg transition-all duration-300 ease-out group flex items-center gap-1 ${item.dropdown.some(subItem => subItem.active)
                          ? "text-[#FF4135] font-semibold"
                          : "text-gray-700 hover:text-[#FF4135]"
                          }`}
                      >
                        {item.label}
                        <svg className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        {/* Active underline */}
                        <span
                          className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-[3px] bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] rounded-full transition-all duration-300 ease-out ${item.dropdown.some(subItem => subItem.active) ? "w-full opacity-100" : "w-0 opacity-0"
                            }`}
                        />
                        {/* Hover background effect */}
                        <span className="absolute inset-0 bg-gradient-to-r from-[#FF5D1B]/5 to-[#FF363E]/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out -z-10" />
                      </button>


                      {/* Dropdown menu */}
                      {dropdownOpen === index && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                          {item.dropdown.map((subItem, subIndex) => (
                            <NavLink
                              key={subIndex}
                              href={subItem.href}
                              onClick={() => setDropdownOpen(null)}
                              className={`block px-4 py-2 text-sm transition-colors duration-200 ${subItem.active
                                ? "text-[#FF4135] font-semibold bg-[#FF5D1B]/5"
                                : "text-gray-700 hover:text-[#FF4135] hover:bg-gray-50"
                                }`}
                            >
                              {subItem.label}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Regular menu item
                    <NavLink
                      href={item.href}
                      className={`relative px-3 lg:px-4 xl:px-5 py-2 lg:py-2.5 xl:py-3 text-sm lg:text-base xl:text-base font-medium rounded-lg transition-all duration-300 ease-out group whitespace-nowrap ${item.active
                        ? "text-[#FF4135] font-semibold"
                        : item.highlight
                          ? "text-[#FF4135] font-semibold hover:text-[#FF2A2A] animate-pulse"
                          : "text-gray-700 hover:text-[#FF4135]"
                        }`}
                    >
                      {item.label}
                      {/* Active underline */}
                      <span
                        className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-[3px] bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] rounded-full transition-all duration-300 ease-out ${item.active ? "w-full opacity-100" : "w-0 opacity-0"
                          }`}
                      />
                      {/* Hover background effect */}
                      <span className="absolute inset-0 bg-gradient-to-r from-[#FF5D1B]/5 to-[#FF363E]/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out -z-10" />
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center justify-end gap-3">
            <LanguageSwitcher />
            <button
              onClick={toggleMobileMenu}
              className="p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200 active:scale-95"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X color="#FF4135" size={24} />
              ) : (
                <Menu color="#FF4135" size={24} />
              )}
            </button>
          </div>

          {/* Desktop Right Section */}
          <div className="hidden lg:flex justify-end items-center">
            <div className="flex items-center bg-gray-50/80 backdrop-blur-sm rounded-full p-0.5 lg:p-1 gap-0.5 lg:gap-1 border border-gray-200/50">
              <CustomConnectButton
                className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200 ease-in-out rounded-full px-3 lg:px-4 xl:px-6 py-1.5 lg:py-2 xl:py-2.5 text-xs lg:text-xs xl:text-sm font-medium text-white border-0 h-auto min-h-0"
                label={t("connect_wallet")}
              />
              <div className="px-1 lg:px-1.5 xl:px-2">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-sm"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Mobile Menu Sliding Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[320px] bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full bg-transparent">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="logo" className="w-[40px] h-[20px]" />
              <h2 className="text-[16px] font-bold text-primary">DMT Token</h2>
            </div>
            <button
              onClick={toggleMobileMenu}
              className="p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200 active:scale-95"
              aria-label="Close menu"
            >
              <X color="#FF4135" size={24} />
            </button>
          </div>

          {/* Mobile Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-4 py-6">
            <ul className="space-y-2">
              {navItems.map((item, index) => (
                <li key={item.href} className="w-full">
                  <NavLink
                    href={item.href}
                    active={item.active}
                    className={`relative block w-full px-6 py-4 text-[16px] font-medium transition-all duration-300 ease-out rounded-xl min-h-[56px] group ${item.active
                      ? "text-[#FF4135] bg-gradient-to-r from-[#FF5D1B]/10 to-[#FF363E]/10 border-l-4 border-[#FF4135] font-semibold"
                      : "text-gray-700 hover:text-[#FF4135] hover:bg-gray-50 hover:border-l-4 hover:border-[#FF4135]/30 active:scale-[0.98]"
                      }`}
                  >
                    <div className="flex items-center gap-3 w-full h-full">
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 transition-all duration-300 ${item.active
                          ? "bg-[#FF4135] scale-125"
                          : "bg-gray-300 group-hover:bg-[#FF4135] group-hover:scale-110"
                          }`}
                      />
                      <span className="flex-1">{item.label}</span>
                      {/* Mobile active indicator */}
                      {item.active && (
                        <div className="w-1 h-6 bg-gradient-to-b from-[#FF5D1B] to-[#FF363E] rounded-full" />
                      )}
                    </div>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile Menu Footer */}
          <div className="border-t border-gray-100 p-6 space-y-4 bg-gradient-to-r from-gray-50 to-white">
            <CustomConnectButton
              className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200 ease-in-out rounded-xl"
              isMobile={true}
            />
            <div className="flex justify-center relative">
              <div className="mobile-language-switcher">
                <LanguageSwitcher isMobile={true} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
