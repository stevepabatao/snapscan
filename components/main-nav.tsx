import Link from "next/link"
import { Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/logo"

export function MainNav() {
  return (
    <div className="flex gap-6 md:gap-10 items-center">
      <Link href="/" className="flex items-center space-x-2">
        <Logo className="h-8 w-8" />
        <span className="font-bold text-xl hidden md:inline-block bg-gradient-to-r from-[#D4B483] to-[#8B6B42] bg-clip-text text-transparent">
          Scanner Box
        </span>
      </Link>
      <nav className="hidden md:flex gap-6">
        <Link href="/scan" className="text-sm font-medium transition-colors hover:text-primary">
          Scan
        </Link>
        <Link href="/gallery" className="text-sm font-medium transition-colors hover:text-primary">
          Gallery
        </Link>
        <Link href="/settings" className="text-sm font-medium transition-colors hover:text-primary">
          Settings
        </Link>
        <Link href="/help" className="text-sm font-medium transition-colors hover:text-primary">
          Help
        </Link>
      </nav>
      <div className="ml-auto hidden md:flex items-center gap-2">
        <ThemeToggle />
        <Link href="/scan">
          <Button size="sm" className="gap-1">
            <Camera className="h-4 w-4" />
            Scan
          </Button>
        </Link>
      </div>
    </div>
  )
}

