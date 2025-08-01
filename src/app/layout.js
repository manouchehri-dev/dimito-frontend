import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Provider from "@/providers/WagmiProvider";
const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata = {
  title: "MID Token",
  description: "MID Token",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`antialiased font-iransans`}>
        <Provider>
          <main className="flex-1">
            <Header />
            {children}
            <Footer />
          </main>
        </Provider>
      </body>
    </html>
  );
}
