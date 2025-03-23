"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Camera, Menu } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/logo"

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex md:hidden items-center gap-2">
      <ThemeToggle />
      <Link href="/scan">
        <Button size="sm" variant="outline" className="gap-1">
          <Camera className="h-4 w-4" />
          <span className="sr-only">Scan</span>
        </Button>
      </Link>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right">
          <div className="flex flex-col gap-6 mt-6">
            <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
              <Logo className="h-8 w-8" />
              <span className="font-bold text-xl bg-gradient-to-r from-[#D4B483] to-[#8B6B42] bg-clip-text text-transparent">
                Scanner Box
              </span>
            </Link>
            <nav className="flex flex-col gap-4">
              <Link
                href="/scan"
                className="text-base font-medium transition-colors hover:text-primary"
                onClick={() => setOpen(false)}
              >
                Scan
              </Link>
              <Link
                href="/gallery"
                className="text-base font-medium transition-colors hover:text-primary"
                onClick={() => setOpen(false)}
              >
                Gallery
              </Link>
              <Link
                href="/settings"
                className="text-base font-medium transition-colors hover:text-primary"
                onClick={() => setOpen(false)}
              >
                Settings
              </Link>
              <Link
                href="/help"
                className="text-base font-medium transition-colors hover:text-primary"
                onClick={() => setOpen(false)}
              >
                Help
              </Link>
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

