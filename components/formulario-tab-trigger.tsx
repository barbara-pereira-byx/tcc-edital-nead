'use client';

import { TabsTrigger } from '@/components/ui/tabs';

interface FormularioTabTriggerProps {
  session: any;
  isAdmin: boolean;
  jaInscrito: boolean;
}

export function FormularioTabTrigger({ session, isAdmin, jaInscrito }: FormularioTabTriggerProps) {
  return (
    <TabsTrigger 
      value="formulario" 
      className="rounded-md data-[state=active]:bg-slate-100"
    >
      {isAdmin ? "Campos do Formulário" : jaInscrito ? "Minha Inscrição" : "Formulário de Inscrição"}
    </TabsTrigger>
  );
}