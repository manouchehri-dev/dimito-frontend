import { Menu } from "lucide-react"
import Link from "next/link"

const Header = () => {
  return (
    <header className="flex sticky top-1 z-50 justify-between items-center p-4 lg:p-6 bg-white text-primary rounded-[8px] lg:rounded-[24px] mt-[13px] mx-[14px] lg:mx-[71px] lg:mt-[45px]">
        <div className="flex items-center gap-2 lg:gap-5">
            <img src="/logo.png" alt="logo" className="w-[45px] h-[24px] lg:w-[60px] lg:h-[32px]"/>
            <h1 className="text-[14px] lg:text-[30px]">IMD Token</h1>
        </div>
        <nav className="hidden lg:flex">
            <ul className="flex items-center gap-2 text-[18px]">
                <li><Link href="/">Home</Link></li>
                <li><Link href="/tokenomics">Tokenomics</Link></li>
                <li><Link href="/whitepaper">White paper</Link></li>
              
            </ul>
        </nav>
        <nav className="lg:hidden">
            <button>
                <Menu color="#FF4135" size={30}/>
                
            </button>
        </nav>
        <div className="hidden lg:flex">
            <button>Login</button>
        </div>
    </header>
  )
}

export default Header