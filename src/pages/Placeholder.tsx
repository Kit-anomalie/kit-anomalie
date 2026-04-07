interface PlaceholderProps {
  titre: string
  icon: string
  description: string
  brique: string
}

export function Placeholder({ titre, icon, description, brique }: PlaceholderProps) {
  return (
    <div className="px-4 py-12 text-center">
      <span className="text-5xl">{icon}</span>
      <h1 className="text-xl font-bold text-sncf-dark mt-4">{titre}</h1>
      <p className="text-sm text-gray-500 mt-2 max-w-[280px] mx-auto">{description}</p>
      <span className="inline-block mt-4 text-xs bg-sncf-blue/10 text-sncf-blue px-3 py-1.5 rounded-full font-medium">
        {brique} — À venir
      </span>
    </div>
  )
}
