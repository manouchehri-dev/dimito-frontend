"use client";

import { useRouter } from "@/i18n/navigation";
import PurchasesPage from "@/components/dashboard/PurchasesPage";

export default function PurchasesPageWrapper() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/dashboard");
  };

  return <PurchasesPage onBack={handleBack} />;
}
