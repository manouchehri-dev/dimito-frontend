"use client";

import { useRouter } from "@/i18n/navigation";
import PresalesPage from "@/components/dashboard/PresalesPage";

export default function PresalesPageWrapper() {
  const router = useRouter();
  
  const handleBack = () => {
    router.push("/dashboard");
  };

  return <PresalesPage onBack={handleBack} />;
}
