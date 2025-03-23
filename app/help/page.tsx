import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, BookOpen, Film, HelpCircle, Lightbulb, Mail, MessageSquare } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function HelpPage() {
  return (
    <div className="container px-4 py-8 md:py-12 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Help & Support</h1>
          <p className="text-muted-foreground">Find answers to common questions and learn how to use Snapscan</p>
        </div>
      </div>

      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="guide">User Guide</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>What types of film can I scan with Snapscan?</AccordionTrigger>
              <AccordionContent>
                <p>
                  Snapscan is designed to work exclusively with 35mm films. This includes color negative films (C-41
                  process), black and white negative films, and color positive/slide films (E-6 process). The app has
                  specific settings for each film type to ensure optimal results.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>How does the ISO of the film affect scanning results?</AccordionTrigger>
              <AccordionContent>
                <p>The ISO of your film affects the scanning results in several ways:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>
                    <strong>Lower ISO films (100-400)</strong>: Produce more refined grain, darker images, better color
                    accuracy, and improved sharpness. These are ideal for well-lit scenes.
                  </li>
                  <li>
                    <strong>Higher ISO films (800-1600)</strong>: Produce more noticeable grain, brighter images,
                    reduced color accuracy, and less sharpness. These are better for low-light conditions.
                  </li>
                </ul>
                <p className="mt-2">
                  The app's enhancement tools can help compensate for these differences, but understanding your film's
                  ISO will help you achieve better results.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>How do I get the best scanning results?</AccordionTrigger>
              <AccordionContent>
                <p>To get the best scanning results with Snapscan:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Clean your film thoroughly before scanning to remove dust and fingerprints</li>
                  <li>Use in a well-lit environment for more accurate color reproduction</li>
                  <li>Keep your smartphone steady during the scanning process</li>
                  <li>Select the correct film type in the settings (color negative, black & white, or slide)</li>
                  <li>Use the enhancement tools to adjust brightness, contrast, and saturation as needed</li>
                  <li>
                    For higher quality scans, enable the "High Quality" option in settings (though scanning will be
                    slower)
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>Can I scan damaged or very old films?</AccordionTrigger>
              <AccordionContent>
                <p>Yes, you can scan damaged or very old films with Snapscan, but there are some considerations:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>
                    Films with physical damage (tears, holes) can still be scanned, but the damaged areas will appear in
                    the scan
                  </li>
                  <li>
                    Very old films may have color shifts or fading, which can be partially corrected with the
                    enhancement tools
                  </li>
                  <li>Films with severe scratches may show these imperfections in the final scan</li>
                  <li>
                    For extremely valuable or delicate films, professional scanning services might be a better option
                  </li>
                </ul>
                <p className="mt-2">
                  The app's enhancement tools can help improve the appearance of older films, but they cannot fully
                  restore severely damaged or degraded film.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>How do I clean my films before scanning?</AccordionTrigger>
              <AccordionContent>
                <p>Properly cleaning your films before scanning is crucial for good results:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Use a microfiber cloth or lens cleaning cloth to gently wipe the film</li>
                  <li>For stubborn dust, use a soft brush designed for camera lenses or film</li>
                  <li>Avoid using water or liquid cleaners directly on the film</li>
                  <li>
                    If necessary, use a small amount of film cleaning solution on the cloth, not directly on the film
                  </li>
                  <li>Always handle film by the edges to avoid fingerprints</li>
                  <li>Store cleaned film in acid-free sleeves to prevent dust accumulation</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        <TabsContent value="guide" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Getting Started
              </CardTitle>
              <CardDescription>Learn the basics of using Snapscan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold">1. Prepare Your Film</h3>
                  <p className="text-sm text-muted-foreground">
                    Clean your 35mm film and remove it from any protective sleeves. Make sure it's free from dust and
                    fingerprints.
                  </p>
                </div>
                <div className="relative aspect-video rounded-md overflow-hidden border">
                  <Image
                    src="/placeholder.svg?height=200&width=350"
                    alt="Preparing film"
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">2. Position Your Film</h3>
                  <p className="text-sm text-muted-foreground">
                    Place your film in the Snapscan device, making sure it's flat and properly aligned in the frame.
                  </p>
                </div>
                <div className="relative aspect-video rounded-md overflow-hidden border">
                  <Image
                    src="/placeholder.svg?height=200&width=350"
                    alt="Positioning film"
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">3. Align Your Smartphone</h3>
                  <p className="text-sm text-muted-foreground">
                    Position your smartphone camera directly above the film frame, using the alignment guides in the
                    app.
                  </p>
                </div>
                <div className="relative aspect-video rounded-md overflow-hidden border">
                  <Image
                    src="/placeholder.svg?height=200&width=350"
                    alt="Aligning smartphone"
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">4. Scan and Enhance</h3>
                  <p className="text-sm text-muted-foreground">
                    Tap the scan button and wait for the process to complete. Then use the enhancement tools to adjust
                    your image.
                  </p>
                </div>
                <div className="relative aspect-video rounded-md overflow-hidden border">
                  <Image
                    src="/placeholder.svg?height=200&width=350"
                    alt="Scanning and enhancing"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="rounded-md bg-muted p-4 mt-6">
                <div className="flex gap-3">
                  <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium mb-1">Pro Tip</h4>
                    <p className="text-sm text-muted-foreground">
                      For best results, scan in a well-lit environment but avoid direct sunlight which can cause glare.
                      If your scans appear too dark or too light, try adjusting the brightness slider in the edit
                      screen.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Film className="h-5 w-5" />
                Understanding Film Types
              </CardTitle>
              <CardDescription>Learn about different 35mm film types and how to scan them</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="aspect-[3/2] rounded-md overflow-hidden bg-muted relative">
                      <Image
                        src="/placeholder.svg?height=200&width=300"
                        alt="Color negative film"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h3 className="font-semibold">Color Negative (C-41)</h3>
                    <p className="text-xs text-muted-foreground">
                      The most common type of film. Has an orange-brown base and inverted colors. Use the "Negative
                      Film" setting.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="aspect-[3/2] rounded-md overflow-hidden bg-muted relative">
                      <Image
                        src="/placeholder.svg?height=200&width=300"
                        alt="Black and white film"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h3 className="font-semibold">Black & White</h3>
                    <p className="text-xs text-muted-foreground">
                      Has a clear base with black, white, and gray tones. Turn off "Negative Film" and adjust contrast
                      as needed.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="aspect-[3/2] rounded-md overflow-hidden bg-muted relative">
                      <Image
                        src="/placeholder.svg?height=200&width=300"
                        alt="Slide film"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h3 className="font-semibold">Slide/Positive (E-6)</h3>
                    <p className="text-xs text-muted-foreground">
                      Shows true colors when held up to light. Turn off "Negative Film" for accurate color reproduction.
                    </p>
                  </div>
                </div>

                <div className="rounded-md bg-muted p-4 mt-2">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium mb-1">Important Note</h4>
                      <p className="text-sm text-muted-foreground">
                        Always check the film type before scanning. Using the wrong setting (especially mixing up
                        negative and positive films) will result in incorrect colors that may be difficult to fix later.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>Need help with Snapscan? Our support team is here to assist you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Link href="mailto:support@snapscan.com" className="block">
                  <Card className="h-full hover:bg-muted/50 transition-colors">
                    <CardContent className="flex flex-col items-center text-center p-6">
                      <Mail className="h-8 w-8 text-primary mb-4" />
                      <h3 className="font-semibold mb-1">Email Support</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Send us an email and we'll respond within 24 hours
                      </p>
                      <p className="text-primary font-medium">support@snapscan.com</p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="#" className="block">
                  <Card className="h-full hover:bg-muted/50 transition-colors">
                    <CardContent className="flex flex-col items-center text-center p-6">
                      <MessageSquare className="h-8 w-8 text-primary mb-4" />
                      <h3 className="font-semibold mb-1">Live Chat</h3>
                      <p className="text-sm text-muted-foreground mb-2">Chat with our support team in real-time</p>
                      <p className="text-primary font-medium">Available 9am-5pm EST</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>

              <div className="rounded-md bg-muted p-4">
                <div className="flex gap-3">
                  <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium mb-1">Before Contacting Support</h4>
                    <p className="text-sm text-muted-foreground">
                      Please check our FAQ and User Guide sections first, as many common questions are already answered
                      there. If you still need help, please include details about your device model and the specific
                      issue you're experiencing.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

