import Link from "next/link";
import { IconAlertCircle } from "@tabler/icons-react";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-zinc-900 text-white text-center px-4">
            <IconAlertCircle size={80} className="text-red-500 animate-bounce" />
            <h1 className="text-6xl font-bold mt-6">404</h1>
            <h2 className="text-2xl mt-2 font-semibold">Página não encontrada</h2>
            <p className="mt-4 text-lg text-zinc-400 max-w-md">
                Opa! Parece que você tentou acessar uma página que não existe. Verifique a URL ou volte para a página inicial.
            </p>
            <Link href="/" className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-lg transition-all shadow-md">
                Voltar para a Home
            </Link>
        </div>
    );
}