import { ElementType } from "react"
import Link from "next/link"

export interface MenuItemSairProps {
    icone: ElementType
    texto: string
    url: string
}

export default function MenuItemSair({ icone: Icon, texto, url }: MenuItemSairProps) {
    const isLogout = texto.toLowerCase() === "sair";
  
    return (
      <Link
        href={url}
        className={`flex items-center gap-2 px-4 py-2 transition-colors
          ${isLogout ? "text-red-500 hover:bg-red-100 hover:text-red-600" : "hover:bg-zinc-800"}
        `}
      >
        {Icon && <Icon size={24} />}
        <span>{texto}</span>
      </Link>
    );
  }
  