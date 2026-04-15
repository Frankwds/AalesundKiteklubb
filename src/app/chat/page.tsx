import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, MessageCircle } from "lucide-react"

export const metadata: Metadata = {
    title: "Chat",
    description: "Vi har dessverre ikke chat ennå.",
}

export default function ChatPage() {
    return (
        <div className="px-6 py-16 flex flex-col items-center text-center gap-6">
            <MessageCircle className="h-12 w-12 text-muted-foreground" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Vi har ikke chat ennå
            </h1>
            <p className="text-base text-muted-foreground max-w-sm">
                Beklager! Inntil videre kan du spørre i Facebook-gruppen vår om
                å bli inkludert i Messenger-chatten vår.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
                <Link
                    href="https://www.facebook.com/groups/219320601753203"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    Gå til Facebook-gruppen
                </Link>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-primary/40 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Tilbake til forsiden
                </Link>
            </div>
        </div>
    )
}
