import Link from "next/link";
import { 
  IconHome, 
  IconUsers, 
  IconTicket, 
  IconPlane, 
  IconUser, 
  IconHelicopter,
  IconLogout 
} from "@tabler/icons-react";
import MenuItem from "./MenuItem";
import MenuItemSair from "./MenuItemSair";

export default function Menu() {
  return (
    <div>
      <aside className="w-72 bg-zinc-900 h-screen">
        <nav className="flex flex-col gap-1 py-7">
          <MenuItem icone={IconHome} texto="Início" url="/" />
          <MenuItem icone={IconUser} texto="Funcionários" url="/funcionarios" />
          <MenuItem icone={IconUsers} texto="Passageiros" url="/passageiros" />
          <MenuItem icone={IconTicket} texto="Reservas" url="/reservas" />
          <MenuItem icone={IconPlane} texto="Voos" url="/voos" />
          <MenuItem icone={IconHelicopter} texto="Pilotos" url="/pilotos" />
          <MenuItem icone={IconPlane} texto="Aviões" url="/aviao" />
          <MenuItemSair icone={IconLogout} texto="Sair" url="/login" />
        </nav>
      </aside>
    </div>
  );
}