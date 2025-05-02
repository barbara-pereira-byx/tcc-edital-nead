"use client";

import { useState } from "react";
import type React from "react";
import { signOut, signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function ClientMenu({ isAdmin }: { isAdmin: boolean }) {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    cpf: "",
    senha: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/editais");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        cpf: formData.cpf,
        senha: formData.senha,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "Erro ao fazer login",
          description: "CPF ou senha inválidos",
          variant: "destructive",
        });
        setIsLoading(false);
      } else {
        const userResponse = await fetch("/api/auth/session");
        const session = await userResponse.json();

        if (session?.user?.tipo === 1) {
          router.push("/admin/editais");
        } else {
          router.push("/editais");
        }
      }
    } catch (error) {
      toast({
        title: "Erro ao fazer login",
        description: "Ocorreu um erro ao tentar fazer login",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // Exibe carregamento enquanto status da sessão está sendo verificado
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-40">
        <span className="text-gray-600">Carregando...</span>
      </div>
    );
  }

  // Modal de login, caso não autenticado
  if (!session) {
    return (
      <div className="space-y-4 bg-white shadow-sm rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="font-semibold mb-4">Login</h2>
          <div className="space-y-2">
            <Label htmlFor="cpf">Digite seu CPF</Label>
            <Input
              id="cpf"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              placeholder="00000000000"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="senha">Digite sua senha</Label>
            <Input
              id="senha"
              name="senha"
              type="password"
              value={formData.senha}
              onChange={handleChange}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    );
  }

  // Modal de menu, caso autenticado
  return (
    <div className="bg-white p-6 shadow-sm rounded-lg">
      <h2 className="text-lg font-bold mb-4">Menu</h2>
      <ul className="space-y-2">
        {isAdmin ? (
          <>
            <li>
              <a
                href="/gerenciar"
                className="block w-full text-blue-600 hover:bg-blue-50 hover:text-blue-700 px-4 py-2 rounded-md transition"
              >
                Gerenciar Editais
              </a>
            </li>
            <li>
              <a
                href="/admin/usuarios"
                className="block w-full text-blue-600 hover:bg-blue-50 hover:text-blue-700 px-4 py-2 rounded-md transition"
              >
                Gerenciar Usuários
              </a>
            </li>
          </>
        ) : (
          <>
            <li>
              <a
                href="/inscricoes"
                className="block w-full text-blue-600 hover:bg-blue-50 hover:text-blue-700 px-4 py-2 rounded-md transition"
              >
                Minhas Inscrições
              </a>
            </li>
          </>
        )}
        <li>
          <button
            onClick={handleLogout}
            className="block w-full text-red-600 hover:bg-red-50 hover:text-red-700 px-4 py-2 rounded-md transition"
          >
            Sair
          </button>
        </li>
      </ul>
    </div>
  );
}
