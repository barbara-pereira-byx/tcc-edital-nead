"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session && pathname !== "/login") {
      router.push("/login");
    }
  }, [session, pathname, router]);

  useEffect(() => {
    if (status === "loading") {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 9000);
      return () => clearTimeout(timer); 
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-900 text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full border-t-4 border-blue-600 border-8 w-16 h-16 mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-300">Carregando...</h2>
          <p className="text-sm text-gray-500">Estamos quase lá, por favor, aguarde.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}