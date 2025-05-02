import { ElementType } from "react"
import Link from "next/link"

export interface MenuItemProps {
    icone: ElementType
    texto: string
    url: string
}

export default function MenuItem({ icone: Icon, texto, url }: MenuItemProps) {
    return (
      <Link
        href={url}
        className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-800 transition-colors"
      >
        {Icon && <Icon size={24} />} {/* Remove `stroke={1}` */}
        <span>{texto}</span>
      </Link>
    );
}