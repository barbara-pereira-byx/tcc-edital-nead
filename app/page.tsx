"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  console.log("Renderizando página HOME")
  useEffect(() => {
    if (window.location.pathname !== "/editais") {
      router.push("/editais");
    }
  }, [router]);

  return null;
}
