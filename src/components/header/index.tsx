import Link from "next/link"
export function Header() {
    return (
        <header className="flex px-2 py-4 bg-zinc-900 text-white">
            <div className="flex items-center justify-between w-full mx-auto maz-w-7xl">
                <div>
                    Airpass - Gerenciador de Passagens Aéreas
                </div>

                <nav>
                    <ul className="flex items-center justify-center gap-2">
                        <li>
                            <Link href='/'>
                                Home |
                            </Link>
                        </li>
                        <li>
                            <Link href='avioes/'>
                                Aviões |
                            </Link>
                        </li>
                        <li>
                            <Link href='funcionarios/'>
                                Funcionários |
                            </Link>
                        </li>
                        <li>
                            <Link href='passageiros/'>
                                Passageiros |
                            </Link>
                        </li>
                        <li>
                            <Link href='pilotos/'>
                                Pilotos |
                            </Link>
                        </li>
                        <li>
                            <Link href='reservas/'>
                                Reservas |
                            </Link>
                        </li>
                        <li>
                            <Link href='voos/'>
                                Voos
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    )
}