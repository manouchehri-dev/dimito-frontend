import { useTranslations } from "next-intl";
import { Search, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  const t = useTranslations("tokenDetails");

  return (
    <div className="min-h-screen pt-[100px] lg:pt-[140px] flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Search className="w-10 h-10 text-gray-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Token Not Found
        </h1>
        
        <p className="text-gray-600 mb-8">
          The token you're looking for doesn't exist or may have been removed.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/presales"
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200"
          >
            <Search className="w-4 h-4" />
            Browse Presales
          </Link>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:border-[#FF5D1B] hover:text-[#FF5D1B] transition-all duration-200"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
