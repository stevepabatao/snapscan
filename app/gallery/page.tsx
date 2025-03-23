"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, MoreVertical, Trash2, Camera, ImageOff } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { getAllFilmScans, deleteFilmScan, type FilmScan } from "@/lib/storage"

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<FilmScan | null>(null)
  const [viewMode, setViewMode] = useState("grid")
  const [images, setImages] = useState<FilmScan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Load images from storage
  useEffect(() => {
    async function loadImages() {
      try {
        const scans = await getAllFilmScans()
        setImages(scans)
      } catch (error) {
        console.error("Error loading images:", error)
        toast({
          title: "Error loading images",
          description: "There was a problem loading your saved scans",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadImages()
  }, [])

  // Handle image deletion
  const handleDelete = async (id: string) => {
    try {
      await deleteFilmScan(id)
      setImages(images.filter((img) => img.id !== id))

      toast({
        title: "Image deleted",
        description: "The image has been removed from your gallery",
      })
    } catch (error) {
      console.error("Error deleting image:", error)
      toast({
        title: "Delete failed",
        description: "There was an error deleting the image",
        variant: "destructive",
      })
    }
  }

  // Handle image download
  const handleDownload = (image: FilmScan) => {
    try {
      // Create a download link
      const link = document.createElement("a")
      link.href = image.imageData
      link.download = `${image.title || "scanner-box"}-${new Date(image.date).toISOString().slice(0, 10)}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Image downloaded",
        description: "The image has been saved to your device",
      })
    } catch (error) {
      console.error("Error downloading image:", error)
      toast({
        title: "Download failed",
        description: "There was an error downloading the image",
        variant: "destructive",
      })
    }
  }

  // Format date for display
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="container px-4 py-8 md:py-12 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Your Gallery</h1>

        <Tabs value={viewMode} onValueChange={setViewMode} className="w-full max-w-[200px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="grid">Grid</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading your film scans...</p>
        </div>
      ) : (
        <Tabs value={viewMode} className="w-full">
          <TabsContent value="grid">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image) => (
                <Card key={image.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative group">
                      <div className="w-full aspect-[3/2] relative">
                        <Image
                          src={image.imageData || "/placeholder.svg"}
                          alt={image.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="secondary" size="sm" onClick={() => setSelectedImage(image)}>
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>{image.title}</DialogTitle>
                              <DialogDescription>{formatDate(image.date)}</DialogDescription>
                            </DialogHeader>
                            <div className="relative w-full aspect-[3/2]">
                              <Image
                                src={image.imageData || "/placeholder.svg"}
                                alt={image.title}
                                fill
                                className="object-contain"
                              />
                            </div>
                            <DialogFooter className="flex justify-between">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={() => handleDownload(image)}
                              >
                                <Download className="h-4 w-4" />
                                Download
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="gap-1"
                                onClick={() => handleDelete(image.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(image.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-sm">{image.title}</h3>
                        <p className="text-xs text-muted-foreground">{formatDate(image.date)}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDownload(image)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(image.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="list">
            <div className="space-y-4">
              {images.map((image) => (
                <Card key={image.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative w-full sm:w-48 aspect-[3/2]">
                        <Image
                          src={image.imageData || "/placeholder.svg"}
                          alt={image.title}
                          fill
                          className="rounded-md object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h3 className="font-medium">{image.title}</h3>
                          <p className="text-sm text-muted-foreground">{formatDate(image.date)}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedImage(image)}>
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>{image.title}</DialogTitle>
                                <DialogDescription>{formatDate(image.date)}</DialogDescription>
                              </DialogHeader>
                              <div className="relative w-full aspect-[3/2]">
                                <Image
                                  src={image.imageData || "/placeholder.svg"}
                                  alt={image.title}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                              <DialogFooter className="flex justify-between">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1"
                                  onClick={() => handleDownload(image)}
                                >
                                  <Download className="h-4 w-4" />
                                  Download
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="gap-1"
                                  onClick={() => handleDelete(image.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button variant="outline" size="sm" className="gap-1" onClick={() => handleDownload(image)}>
                            <Download className="h-4 w-4" />
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(image.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {!isLoading && images.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <ImageOff className="h-10 w-10 opacity-50" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Your gallery is empty</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Start scanning your 35mm films to build your digital collection
          </p>
          <Link href="/scan">
            <Button className="gap-1">
              <Camera className="h-4 w-4" />
              Scan New Film
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}

