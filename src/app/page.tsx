import Pagina from "./components/template/Pagina";
import ProtegeRota from "../components/ProtegeRota";

export default function Home() {
  return (
    <ProtegeRota>
      <Pagina>
        <div className="flex flex-col items-center justify-center h-full text-white text-center">
          <h1 className="text-5xl font-extrabold mb-4">Bem-vindo ao AirPass</h1>
          <p className="text-lg text-zinc-400 max-w-2xl">
            O sistema completo para gerenciamento de passagens aéreas. Organize funcionários, passageiros, voos e reservas com eficiência e praticidade.
          </p>
          <div className="mt-10 flex gap-4">
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-lg font-semibold shadow-lg transition">
              Comece Agora
            </button>
            <button className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-lg font-semibold shadow-lg transition">
              Saiba Mais
            </button>
          </div>
        </div>
      </Pagina>
    </ProtegeRota>
  );
}