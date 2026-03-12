import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-bold">Siden finnes ikke</h1>
      <p className="text-muted-foreground">
        Vi fant ikke siden du leter etter.
      </p>
      <Link href="/" className={buttonVariants()}>
        Tilbake til forsiden
      </Link>
    </div>
  )
}
