"use client";

import { useRouter } from "@/i18n/navigation";
import ParticipatedPresalesPage from "@/components/dashboard/ParticipatedPresalesPage";

export default function ParticipatedPresalesPageWrapper() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/dashboard");
  };

  return <ParticipatedPresalesPage onBack={handleBack} />;
}
