import Link from 'next/link'
import { Wind, MapPin, GraduationCap, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col items-center gap-12 py-12 sm:py-16">
      {/* Hero */}
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-sky-100 shadow-sm">
          <Wind className="size-8 text-sky-600" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
          Ålesund{' '}
          <span className="bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
            Kiteklubb
          </span>
        </h1>
        <p className="max-w-lg text-lg leading-relaxed text-muted-foreground sm:text-xl">
          Velkommen til Ålesund Kiteklubb — din lokale kitesurfing-klubb på
          Sunnmøre. Her finner du kurs, spotter og et fellesskap av
          kiteglade folk.
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/courses"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-sky-600 px-6 text-sm font-medium text-white shadow-sm transition-all hover:bg-sky-700 hover:shadow-md active:scale-[0.98]"
          >
            Se kurs
          </Link>
          <Link
            href="/spots"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-200 bg-white px-6 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md active:scale-[0.98]"
          >
            Utforsk spotter
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-3">
        <FeatureCard
          icon={<MapPin className="size-5 text-sky-600" />}
          title="Spotter"
          description="Finn de beste kitespottene på Sunnmøre med vindretning og nivå."
        />
        <FeatureCard
          icon={<GraduationCap className="size-5 text-sky-600" />}
          title="Kurs"
          description="Lær å kitesurfe med erfarne instruktører i trygge omgivelser."
        />
        <FeatureCard
          icon={<Users className="size-5 text-sky-600" />}
          title="Fellesskap"
          description="Bli med i et aktivt fellesskap av kitesurfere i Ålesund."
        />
      </div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white/70 p-6 text-center shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
      <div className="flex size-10 items-center justify-center rounded-xl bg-sky-50">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  )
}
