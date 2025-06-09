'use client';

import { useRouter } from 'next/navigation';
import { TabsTrigger } from '@/components/ui/tabs';

interface FormularioTabTriggerProps {
  session: any;
  isAdmin: boolean;
  jaInscrito: boolean;
}

export function FormularioTabTrigger({ session, isAdmin, jaInscrito }: FormularioTabTriggerProps) {
  const router = useRouter();

  const handleClick = () => {
    if (!session) {
      // Redirecionar para a página de login com callback para a página atual
      const callbackUrl = encodeURIComponent(window.location.href);
      router.push(`/login?callbackUrl=${callbackUrl}`);
    }
  };

  return (
    <TabsTrigger 
      value="formulario" 
      className="rounded-md data-[state=active]:bg-slate-100"
      onClick={handleClick}
    >
      {isAdmin ? "Campos do Formulário" : jaInscrito ? "Minha Inscrição" : "Formulário de Inscrição"}
    </TabsTrigger>
  );
}