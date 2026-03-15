import Link from "next/link"
import Image from "next/image"
import { buttonVariants } from "@/components/ui/button-variants"
import { MessageCircle, Users } from "lucide-react"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "Ålesund Kiteklubb",
  description: "Kiteklubben for Sunnmøre — Kurs, Spot guide og fellesskap",
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
          <div className="grid md:grid-cols-2 md:grid-rows-[auto_auto] gap-8 md:gap-x-16 md:gap-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Om klubben
            </h2>

            <div className="relative rounded-lg overflow-hidden shadow-lg min-h-[220px] md:min-h-0 md:row-span-2">
              <Image
                src="/images/kite-beach-bg.jpg"
                alt="Kitesurfing på Sunnmøre"
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-6 min-w-0 relative z-10">
              <p className="text-base text-foreground/80 leading-relaxed">
                Ålesund Kiteklubb er en lokal kiteklubb på Sunnmøre. Vi
                holder kurs for nybegynnere, og har en guide til
                de beste kitespottene i området. Bli med i fellesskapet!
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-4 min-w-0">
                <Link
                  href="https://www.facebook.com/groups/219320601753203"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ size: "xl" }),
                    "min-w-0 shrink btn-lift"
                  )}
                >
                  <Users className="mr-2 h-5 w-5 shrink-0" />
                  Facebook gruppe
                </Link>
                <Link
                  href="https://discord.gg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "outlinePrimary", size: "xl" }),
                    "min-w-0 shrink btn-lift"
                  )}
                >
                  <MessageCircle className="mr-2 h-5 w-5 shrink-0" />
                  Bli med i chatten
                </Link>
              </div>
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
              className="group p-6 bg-card rounded-lg border border-border hover:border-primary/40 card-lift"
            >
              <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                Utforsk Spot guide
              </h3>
              <p className="text-sm text-muted-foreground">
                Finn de beste stedene for kitesurfing på Sunnmøre med vår
                spottguide.
              </p>
            </Link>

            <Link
              href="/courses"
              className="group p-6 bg-card rounded-lg border border-border hover:border-primary/40 card-lift"
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
