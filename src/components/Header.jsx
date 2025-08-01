import { Menu } from "lucide-react";
import NavLink from "./module/NavLink";
import CustomConnectButton from "./module/CustomConnectButton";

const Header = () => {
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
            <NavLink href="/">Home</NavLink>
          </li>
          <li>
            <NavLink href="/tokenomics">Tokenomics</NavLink>
          </li>
          <li>
            <NavLink href="/whitepaper">White paper</NavLink>
          </li>
        </ul>
      </nav>
      <nav className="lg:hidden text-right">
        <button>
          <Menu color="#FF4135" size={30} />
        </button>
      </nav>
      <div className="hidden lg:flex justify-end">
        <CustomConnectButton
          className={
            "bg-gradient-to-r from-[#FF5D1B] to-[#FF363E]  cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200 ease-in-out rounded-md"
          }
        />
      </div>
    </header>
  );
};

export default Header;
