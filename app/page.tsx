import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, Film, ImageIcon, Settings, Zap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Convert Film to Digital <span className="text-primary">Effortlessly</span>
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Snapscan is an accessible and affordable solution for converting old 35mm films into digital images
                  using your smartphone.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/scan">
                  <Button size="lg" className="gap-1">
                    <Camera className="h-5 w-5" />
                    Start Scanning
                  </Button>
                </Link>
                <Link href="/gallery">
                  <Button size="lg" variant="outline" className="gap-1">
                    <ImageIcon className="h-5 w-5" />
                    View Gallery
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-[300px] h-[400px] sm:w-[350px] sm:h-[450px] lg:w-[400px] lg:h-[500px]">
                <Image
                  src="/placeholder.svg?height=500&width=400"
                  alt="Snapscan device with smartphone"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Key Features</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Discover why Snapscan is the perfect solution for your film digitization needs
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
            <Card>
              <CardContent className="flex flex-col items-center space-y-4 p-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Film className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2 text-center">
                  <h3 className="font-bold">35mm Film Compatible</h3>
                  <p className="text-sm text-muted-foreground">
                    Works with all types of 35mm films, from ISO 100 to 1600
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center space-y-4 p-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2 text-center">
                  <h3 className="font-bold">Quick & Easy</h3>
                  <p className="text-sm text-muted-foreground">
                    Portable and compact design for fast scanning on the go
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center space-y-4 p-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Settings className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2 text-center">
                  <h3 className="font-bold">Advanced Adjustments</h3>
                  <p className="text-sm text-muted-foreground">
                    Fine-tune colors, contrast, and more to your preference
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ISO Information Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Understanding Film ISO</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Different ISO films produce different results when scanned
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 mt-12">
            <div className="flex flex-col space-y-4">
              <div className="overflow-hidden rounded-lg">
                <Image
                  src="/placeholder.svg?height=300&width=500"
                  alt="Low ISO film example (100-400)"
                  width={500}
                  height={300}
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold">Low ISO (100-400)</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• More refined noise pattern</li>
                <li>• Darker overall image</li>
                <li>• Better color accuracy</li>
                <li>• Improved sharpness</li>
                <li>• Ideal for well-lit scenes</li>
              </ul>
            </div>
            <div className="flex flex-col space-y-4">
              <div className="overflow-hidden rounded-lg">
                <Image
                  src="/placeholder.svg?height=300&width=500"
                  alt="High ISO film example (800-1600)"
                  width={500}
                  height={300}
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold">High ISO (800-1600)</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• More noticeable grain</li>
                <li>• Brighter overall image</li>
                <li>• Reduced color accuracy</li>
                <li>• Less sharpness</li>
                <li>• Better for low-light conditions</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Digitize Your Memories?
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Start scanning your 35mm films today and preserve them forever
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/scan">
                <Button size="lg" className="gap-1">
                  <Camera className="h-5 w-5" />
                  Start Scanning
                </Button>
              </Link>
              <Link href="/help">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

