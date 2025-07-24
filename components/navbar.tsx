"use client"

import * as Popover from "@radix-ui/react-popover"
import Image from "next/image"

const proyectos = [
  { nombre: "CENTRAL DE OPERACIONES COSTA", logo: "/img/COC.jpeg", url: null }, // Actual
  { nombre: "BARRANQUILLA", logo: "/img/BARRANQUILLA.jpeg", url: "https://op-central-barranquilla.vercel.app" },
  { nombre: "CARTAGENA", logo: "/img/CARTAGENA.jpeg", url: "https://op-central-ctg.vercel.app" },
  { nombre: "GRUPO ARGOS", logo: "/img/GA.jpeg", url: "https://crm-coa.vercel.app" },
  { nombre: "CEMENTOS", logo: "/img/CEMENTO.jpeg", url: "https://crm-coa.vercel.app" },
]

export function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-500">COC</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">CENTRAL DE OPERACIONES COSTA</span>
          </div>

          {/* Selector de Proyecto */}
          <Popover.Root>
            <Popover.Trigger asChild>
              <button className="rounded-full p-2 hover:bg-gray-100 transition flex items-center">
                <Image
                  src={proyectos[0].logo}
                  alt={proyectos[0].nombre}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                />
                <span className="ml-2 text-gray-700 font-medium hidden sm:block">{proyectos[0].nombre}</span>
                <svg className="ml-2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                sideOffset={8}
                className="bg-white rounded-lg shadow-lg border p-2 min-w-[220px] z-50"
              >
                <div className="flex flex-col gap-2">
                  {/* Actual, no link */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded bg-gray-100 cursor-default">
                    <Image
                      src={proyectos[0].logo}
                      alt={proyectos[0].nombre}
                      width={28}
                      height={28}
                      className="w-7 h-7 rounded-full"
                    />
                    <span className="text-gray-800 font-semibold">{proyectos[0].nombre}</span>
                  </div>
                  {/* Las demás sí son links */}
                  {proyectos.slice(1).map((proy) => (
                    <a
                      key={proy.nombre}
                      href={proy.url!}
                      className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 transition text-left"
                    >
                      <Image
                        src={proy.logo}
                        alt={proy.nombre}
                        width={28}
                        height={28}
                        className="w-7 h-7 rounded-full"
                      />
                      <span className="text-gray-800">{proy.nombre}</span>
                    </a>
                  ))}
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      </div>
    </nav>
  )
}