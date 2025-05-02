"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
  
    const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setErro("");
  
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password: senha,
      });
  
      if (res?.ok) {
        router.push("/");
      } else {
        setErro("Credenciais inválidas. Tente novamente.");
      }
    };

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-900 to-indigo-600">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-center text-gray-800">Bem-vindo ao AirPass </h1>
        <p className="text-center text-gray-500">Acesse sua conta com suas credenciais</p>

        {erro && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm text-center">
            {erro}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 bg-gray-50 text-gray-800"
              placeholder="Digite seu email"
              required
            />
          </div>
          <div>
            <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-2 border border-gray-400 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 bg-gray-50 text-gray-800"
              placeholder="Digite sua senha"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Entrar
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-2">
          Esqueceu sua senha?{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Clique aqui
          </a>
        </p>
      </div>
    </div>
  );
}