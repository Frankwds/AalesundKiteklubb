import Link from "next/link"
import Image from "next/image"
import { buttonVariants } from "@/components/ui/button-variants"
import { MessageCircle, Users } from "lucide-react"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "Ålesund Kiteklubb",
  description: "Kiteklubben for Sunnmøre — Kurs, spotter og fellesskap",
}

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[45vh] min-h-[300px] overflow-hidden rounded-t-none md:rounded-t-xl">
        <Image
          src="/images/kite-beach-bg.jpg"
          alt="Kitesurf på strand"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-8 text-balance">
            Velkommen til Ålesund Kiteklubb
          </h1>
          <p className="text-sm md:text-base text-white/90 max-w-md mx-auto text-center">
            Vi vil gjerne samle likesinnede i Sunnmøre.
            <br />
            Vi kiter på snø og på vann.
            <br />
            Bli med, finn spots, eller meld deg på kurs!
          </p>
        </div>
      </section>

      {/* Om klubben */}
      <section className="px-6 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
            Om klubben
          </h2>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-6">
              <p className="text-base text-foreground/80 leading-relaxed">
                Ålesund Kiteklubb er en lokal kiteklubb på Sunnmøre. Vi
                holder kurs for nybegynnere, og har en guide til
                de beste kitespottene i området. Bli med i fellesskapet!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="https://www.facebook.com/groups/219320601753203"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants(),
                    "bg-primary hover:bg-primary/90 text-primary-foreground h-11 btn-lift"
                  )}
                >
                  <Users className="mr-2 h-5 w-5" />
                  Facebook gruppe
                </Link>
                <Link
                  href="https://discord.gg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-11 border-primary text-primary hover:bg-primary-muted"
                  )}
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Bli med i chatten
                </Link>
              </div>
            </div>

            <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-lg">
              <Image
                src="/images/kite-beach-bg.jpg"
                alt="Kitesurfing på Sunnmøre"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="px-6 pb-12 md:pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-6">
            <Link
              href="/spots"
              className="group p-6 bg-white rounded-lg border border-border hover:border-primary/40 card-lift"
            >
              <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                Utforsk spotter
              </h3>
              <p className="text-sm text-muted-foreground">
                Finn de beste stedene for kitesurfing på Sunnmøre med vår
                spottguide.
              </p>
            </Link>

            <Link
              href="/courses"
              className="group p-6 bg-white rounded-lg border border-border hover:border-primary/40 card-lift"
            >
              <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                Bli med på kurs
              </h3>
              <p className="text-sm text-muted-foreground">
                Lær å kitesurfe med våre erfarne instruktører — kurs for alle
                nivåer.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
