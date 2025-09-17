"use client";

import CreateDMTForm from "@/components/CreateDMTForm";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DMTAccessGuard from "@/components/auth/DMTAccessGuard";

export default function CreateDMTPage() {
  return (
    <ProtectedRoute redirectTo="create-dmt">
      <DMTAccessGuard>
        <CreateDMTForm />
      </DMTAccessGuard>
    </ProtectedRoute>
  );
}