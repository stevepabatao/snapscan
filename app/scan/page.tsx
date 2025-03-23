"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Camera,
  Film,
  FlipHorizontal,
  Lightbulb,
  Maximize,
  RotateCcw,
  Save,
  Zap,
  CameraOff,
  RotateCw,
  ImageOff,
  Crop,
  Check,
  X,
} from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { saveFilmScan } from "@/lib/storage"
import type { FilmScan } from "@/lib/storage"
import { loadAIModel, enhanceImageWithAI, canRunAIEnhancement } from "@/lib/ai-enhancement"
import { Sparkles } from "lucide-react"

export default function ScanPage() {
  const router = useRouter()
  const [scanMode, setScanMode] = useState("preview")
  const [isScanning, setIsScanning] = useState(false)
  const [hasScannedImage, setHasScannedImage] = useState(false)
  const [brightness, setBrightness] = useState([50])
  const [contrast, setContrast] = useState([50])
  const [saturation, setSaturation] = useState([50])
  const [negativeMode, setNegativeMode] = useState(true)
  const [flashMode, setFlashMode] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isRotated, setIsRotated] = useState(false)
  const [scanTitle, setScanTitle] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isAIEnhancing, setIsAIEnhancing] = useState(false)
  const [processingAction, setProcessingAction] = useState<string | null>(null)
  const [aiModelLoaded, setAIModelLoaded] = useState(false)
  const [canUseAI, setCanUseAI] = useState(false)

  const [isCropping, setIsCropping] = useState(false)
  const [cropStart, setCropStart] = useState({ x: 0, y: 0 })
  const [cropEnd, setCropEnd] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragCorner, setDragCorner] = useState<string | null>(null)
  const cropAreaRef = useRef<HTMLDivElement>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const editCanvasRef = useRef<HTMLCanvasElement>(null)
  const fullscreenRef = useRef<HTMLDivElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const { toast } = useToast()

  // Add this state near the other state declarations
  const [filmType, setFilmType] = useState<"color-negative" | "black-white" | "slide">("color-negative")

  // Add these new state variables for color correction
  const [redBalance, setRedBalance] = useState([50])
  const [greenBalance, setGreenBalance] = useState([50])
  const [blueBalance, setBlueBalance] = useState([50])
  const [removeGreenCast, setRemoveGreenCast] = useState(true)

  // Initialize AI model
  useEffect(() => {
    const initAI = async () => {
      const canRun = canRunAIEnhancement()
      setCanUseAI(canRun)

      if (canRun) {
        try {
          const loaded = await loadAIModel()
          setAIModelLoaded(loaded)
        } catch (error) {
          console.error("Error loading AI model:", error)
          setAIModelLoaded(false)
        }
      }
    }

    initAI()
  }, [])

  // Initialize camera when component mounts
  const initCamera = useCallback(async () => {
    try {
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }

      // Get camera stream with preferred settings
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      })

      streamRef.current = stream

      // Connect stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true)
          setCameraError(null)
        }
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setCameraError("Could not access camera. Please ensure camera permissions are granted.")
      setCameraReady(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true // Add a flag to track component mount status

    if (scanMode === "preview") {
      initCamera()
    }

    return () => {
      isMounted = false // Set the flag to false when the component unmounts
      // Clean up camera stream when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [scanMode, initCamera])

  // Toggle device flashlight if available
  const toggleFlash = async () => {
    if (!streamRef.current) return

    try {
      const track = streamRef.current.getVideoTracks()[0]
      const capabilities = track.getCapabilities()

      // Check if torch is supported
      if (capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: !flashMode }],
        })
        setFlashMode(!flashMode)
        toast({
          title: flashMode ? "Flash turned off" : "Flash turned on",
          duration: 1500,
        })
      } else {
        toast({
          title: "Flash not available",
          description: "Your device doesn't support controlling the flash",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error toggling flash:", error)
      toast({
        title: "Could not toggle flash",
        description: "There was an error controlling your device's flash",
        variant: "destructive",
      })
    }
  }

  // Capture image from camera
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current || !cameraReady) return

    setIsScanning(true)

    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (!context) {
        setIsScanning(false)
        toast({
          title: "Capture failed",
          description: "Could not initialize canvas context",
          variant: "destructive",
        })
        return
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Save original image before processing
      const originalDataUrl = canvas.toDataURL("image/jpeg", 0.95)
      setOriginalImage(originalDataUrl)

      // Process for preview if in negative mode
      if (negativeMode) {
        try {
          // Get image data for processing
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
          invertNegative(imageData.data)
          context.putImageData(imageData, 0, 0)
        } catch (err) {
          console.error("Error inverting negative:", err)
          // Continue even if inversion fails
        }
      }

      // Convert canvas to data URL for preview
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95)
      setCapturedImage(dataUrl)

      // Generate a default title based on date
      const now = new Date()
      setScanTitle(`Film Scan ${now.toLocaleDateString()}`)

      // Switch to edit mode
      setTimeout(() => {
        setIsScanning(false)
        setHasScannedImage(true)
        setScanMode("edit")

        // Stop camera stream after capturing
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
        }
      }, 1000)
    } catch (error) {
      console.error("Error capturing image:", error)
      setIsScanning(false)
      toast({
        title: "Capture failed",
        description: "There was an error capturing the image",
        variant: "destructive",
      })
    }
  }

  // Improved negative conversion algorithm
  const invertNegative = useCallback(
    (data: Uint8ClampedArray): void => {
      try {
        if (filmType === "slide") {
          // For slide/positive film, no inversion needed
          return
        }

        if (filmType === "black-white") {
          // For B&W, simple inversion works well
          for (let i = 0; i < data.length; i += 4) {
            const gray = 255 - (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114)
            data[i] = gray // R
            data[i + 1] = gray // G
            data[i + 2] = gray // B
          }
          return
        }

        // For color negative films

        // Step 1: Calculate average color to determine film base color
        let totalR = 0,
          totalG = 0,
          totalB = 0
        const pixelCount = data.length / 4

        for (let i = 0; i < data.length; i += 4) {
          totalR += data[i]
          totalG += data[i + 1]
          totalB += data[i + 2]
        }

        const avgR = totalR / pixelCount
        const avgG = totalG / pixelCount
        const avgB = totalB / pixelCount

        // Step 2: Determine film base color (orange mask)
        // Typical color negative has an orange-brown base
        // We'll use the detected average as a guide but adjust with known values
        const baseR = Math.min(255, avgR * 1.2) // Orange has high red
        const baseG = Math.min(255, avgG * 0.9) // Medium green
        const baseB = Math.min(255, avgB * 0.7) // Low blue

        // Step 3: Invert and remove base color
        for (let i = 0; i < data.length; i += 4) {
          // Invert with base color compensation
          data[i] = 255 - data[i] + (255 - baseR) * 0.1 // R
          data[i + 1] = 255 - data[i + 1] + (255 - baseG) * 0.1 // G
          data[i + 2] = 255 - data[i + 2] + (255 - baseB) * 0.1 // B

          // Remove green cast if enabled
          if (removeGreenCast) {
            // Reduce green channel and boost red slightly for more natural skin tones
            data[i] = Math.min(255, data[i] * 1.05) // Boost red slightly
            data[i + 1] = Math.max(0, data[i + 1] * 0.9) // Reduce green

            // Adjust magenta-green balance
            const magentaCorrection = (data[i] - data[i + 1]) * 0.1
            data[i] = Math.min(255, data[i] + magentaCorrection)
            data[i + 1] = Math.max(0, data[i + 1] - magentaCorrection)
          }

          // Ensure values are in valid range
          data[i] = Math.max(0, Math.min(255, data[i]))
          data[i + 1] = Math.max(0, Math.min(255, data[i + 1]))
          data[i + 2] = Math.max(0, Math.min(255, data[i + 2]))
        }

        // Step 4: Auto white balance
        // Find the brightest pixel as a white reference
        let maxVal = 0
        let maxR = 0,
          maxG = 0,
          maxB = 0

        for (let i = 0; i < data.length; i += 4) {
          const brightness = data[i] + data[i + 1] + data[i + 2]
          if (brightness > maxVal) {
            maxVal = brightness
            maxR = data[i]
            maxG = data[i + 1]
            maxB = data[i + 2]
          }
        }

        // Calculate white balance factors
        const maxChannel = Math.max(maxR, maxG, maxB)
        const balanceR = maxChannel / Math.max(1, maxR)
        const balanceG = maxChannel / Math.max(1, maxG)
        const balanceB = maxChannel / Math.max(1, maxB)

        // Apply white balance
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, data[i] * balanceR)
          data[i + 1] = Math.min(255, data[i + 1] * balanceG)
          data[i + 2] = Math.min(255, data[i + 2] * balanceB)
        }

        // Step 5: Auto-adjust levels to improve contrast
        let minR = 255,
          minG = 255,
          minB = 255
        let maxR2 = 0
        let maxG2 = 0
        let maxB2 = 0

        // Find min and max values for each channel
        for (let i = 0; i < data.length; i += 4) {
          minR = Math.min(minR, data[i])
          minG = Math.min(minG, data[i + 1])
          minB = Math.min(minB, data[i + 2])

          maxR2 = Math.max(maxR2, data[i])
          maxG2 = Math.max(maxG2, data[i + 1])
          maxB2 = Math.max(maxB2, data[i + 2])
        }

        // Apply auto-levels to stretch the histogram
        for (let i = 0; i < data.length; i += 4) {
          // Normalize each channel
          if (maxR2 > minR) data[i] = ((data[i] - minR) * 255) / (maxR2 - minR)
          if (maxG2 > minG) data[i + 1] = ((data[i + 1] - minG) * 255) / (maxG2 - minG)
          if (maxB2 > minB) data[i + 2] = ((data[i + 2] - minB) * 255) / (maxB2 - minB)

          // Ensure values are in valid range
          data[i] = Math.max(0, Math.min(255, data[i]))
          data[i + 1] = Math.max(0, Math.min(255, data[i + 1]))
          data[i + 2] = Math.max(0, Math.min(255, data[i + 2]))
        }
      } catch (error) {
        console.error("Error in invertNegative:", error)
        // Continue even if there's an error
      }
    },
    [filmType, removeGreenCast],
  )

  // Apply image adjustments with improved color correction
  const applyAdjustments = useCallback(() => {
    if (!originalImage) {
      console.error("No original image to edit")
      return
    }

    setIsProcessing(true)
    setProcessingAction("Applying adjustments...")

    try {
      // Create a new image element to load the original image
      const img = new window.Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        try {
          // Create a canvas for processing
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")

          if (!ctx) {
            throw new Error("Could not get canvas context")
          }

          // Set canvas dimensions
          canvas.width = img.width
          canvas.height = img.height

          // Draw the image with CSS filters
          ctx.filter = `brightness(${brightness[0] / 50}) contrast(${contrast[0] / 50}) saturate(${saturation[0] / 50})`

          // Apply transformations
          ctx.save()

          // Handle rotation
          if (isRotated) {
            canvas.width = img.height
            canvas.height = img.width
            ctx.translate(canvas.width / 2, canvas.height / 2)
            ctx.rotate(Math.PI / 2)
            ctx.translate(-img.height / 2, -img.width / 2)
          }

          // Handle flip
          if (isFlipped) {
            ctx.translate(isRotated ? 0 : canvas.width, isRotated ? canvas.height : 0)
            ctx.scale(isRotated ? 1 : -1, isRotated ? -1 : 1)
          }

          // Draw the image
          ctx.drawImage(img, 0, 0)
          ctx.restore()

          // Apply negative inversion if needed
          if (negativeMode) {
            try {
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
              const data = imageData.data

              // For color negative films
              if (filmType === "color-negative") {
                // Step 1: Calculate average color to determine film base color
                let totalR = 0,
                  totalG = 0,
                  totalB = 0
                const pixelCount = data.length / 4

                for (let i = 0; i < data.length; i += 4) {
                  totalR += data[i]
                  totalG += data[i + 1]
                  totalB += data[i + 2]
                }

                const avgR = totalR / pixelCount
                const avgG = totalG / pixelCount
                const avgB = totalB / pixelCount

                // Step 2: Determine film base color (orange mask)
                // Typical color negative has an orange-brown base
                const baseR = Math.min(255, avgR * 1.2) // Orange has high red
                const baseG = Math.min(255, avgG * 0.9) // Medium green
                const baseB = Math.min(255, avgB * 0.7) // Low blue

                // Step 3: Invert and remove base color
                for (let i = 0; i < data.length; i += 4) {
                  // Invert with base color compensation
                  data[i] = 255 - data[i] + (255 - baseR) * 0.1 // R
                  data[i + 1] = 255 - data[i + 1] + (255 - baseG) * 0.1 // G
                  data[i + 2] = 255 - data[i + 2] + (255 - baseB) * 0.1 // B

                  // Apply custom color balance
                  data[i] = data[i] * (redBalance[0] / 50)
                  data[i + 1] = data[i + 1] * (greenBalance[0] / 50)
                  data[i + 2] = data[i + 2] * (blueBalance[0] / 50)

                  // Remove green cast if enabled
                  if (removeGreenCast) {
                    // Reduce green channel and boost red slightly for more natural skin tones
                    data[i] = Math.min(255, data[i] * 1.1) // Boost red
                    data[i + 1] = Math.max(0, data[i + 1] * 0.85) // Reduce green

                    // Adjust magenta-green balance
                    const magentaCorrection = (data[i] - data[i + 1]) * 0.15
                    data[i] = Math.min(255, data[i] + magentaCorrection)
                    data[i + 1] = Math.max(0, data[i + 1] - magentaCorrection)
                  }

                  // Ensure values are in valid range
                  data[i] = Math.max(0, Math.min(255, data[i]))
                  data[i + 1] = Math.max(0, Math.min(255, data[i + 1]))
                  data[i + 2] = Math.max(0, Math.min(255, data[i + 2]))
                }

                // Step 4: Auto white balance
                // Find the brightest pixel as a white reference
                let maxVal = 0
                let maxR = 0,
                  maxG = 0,
                  maxB = 0

                for (let i = 0; i < data.length; i += 4) {
                  const brightness = data[i] + data[i + 1] + data[i + 2]
                  if (brightness > maxVal) {
                    maxVal = brightness
                    maxR = data[i]
                    maxG = data[i + 1]
                    maxB = data[i + 2]
                  }
                }

                // Calculate white balance factors
                const maxChannel = Math.max(maxR, maxG, maxB)
                const balanceR = maxChannel / Math.max(1, maxR)
                const balanceG = maxChannel / Math.max(1, maxG)
                const balanceB = maxChannel / Math.max(1, maxB)

                // Apply white balance
                for (let i = 0; i < data.length; i += 4) {
                  data[i] = Math.min(255, data[i] * balanceR)
                  data[i + 1] = Math.min(255, data[i + 1] * balanceG)
                  data[i + 2] = Math.min(255, data[i + 2] * balanceB)
                }

                // Step 5: Auto-adjust levels to improve contrast
                let minR = 255,
                  minG = 255,
                  minB = 255
                let maxR2 = 0,
                  maxG2 = 0,
                  maxB2 = 0

                // Find min and max values for each channel
                for (let i = 0; i < data.length; i += 4) {
                  minR = Math.min(minR, data[i])
                  minG = Math.min(minG, data[i + 1])
                  minB = Math.min(minB, data[i + 2])

                  maxR2 = Math.max(maxR2, data[i])
                  maxG2 = Math.max(maxG2, data[i + 1])
                  maxB2 = Math.max(maxB2, data[i + 2])
                }

                // Apply auto-levels to stretch the histogram
                for (let i = 0; i < data.length; i += 4) {
                  // Normalize each channel
                  if (maxR2 > minR) data[i] = ((data[i] - minR) * 255) / (maxR2 - minR)
                  if (maxG2 > minG) data[i + 1] = ((data[i + 1] - minG) * 255) / (maxG2 - minG)
                  if (maxB2 > minB) data[i + 2] = ((data[i + 2] - minB) * 255) / (maxB2 - minB)

                  // Ensure values are in valid range
                  data[i] = Math.max(0, Math.min(255, data[i]))
                  data[i + 1] = Math.max(0, Math.min(255, data[i + 1]))
                  data[i + 2] = Math.max(0, Math.min(255, data[i + 2]))
                }
              } else if (filmType === "black-white") {
                // For B&W, simple inversion works well
                for (let i = 0; i < data.length; i += 4) {
                  const gray = 255 - (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114)
                  data[i] = gray // R
                  data[i + 1] = gray // G
                  data[i + 2] = gray // B
                }
              }

              ctx.putImageData(imageData, 0, 0)
            } catch (err) {
              console.error("Error applying negative mode:", err)
            }
          }

          // Get the processed image
          const processedImage = canvas.toDataURL("image/jpeg", 0.9)
          setCapturedImage(processedImage)
        } catch (error) {
          console.error("Error processing image:", error)
          // Fallback to original image if processing fails
          setCapturedImage(originalImage)
        } finally {
          setIsProcessing(false)
          setProcessingAction(null)
        }
      }

      img.onerror = () => {
        console.error("Error loading image for editing")
        setIsProcessing(false)
        setCapturedImage(originalImage) // Fallback to original
      }

      img.src = originalImage
    } catch (error) {
      console.error("Error in applyAdjustments:", error)
      setIsProcessing(false)
      setCapturedImage(originalImage) // Fallback to original
    }
  }, [
    brightness,
    contrast,
    saturation,
    isFlipped,
    isRotated,
    negativeMode,
    originalImage,
    filmType,
    redBalance,
    greenBalance,
    blueBalance,
    removeGreenCast,
  ])

  // Apply AI enhancement to make the image look more natural
  const applyAIEnhancement = async () => {
    if (!capturedImage || isProcessing || isAIEnhancing) return

    setIsAIEnhancing(true)
    setProcessingAction("AI enhancing image...")

    toast({
      title: "AI Enhancement Started",
      description: "Applying AI to make your image look more natural...",
      duration: 3000,
    })

    try {
      const enhancedImage = await enhanceImageWithAI(capturedImage)
      setCapturedImage(enhancedImage)

      toast({
        title: "AI Enhancement Complete",
        description: "Your image has been enhanced for a more natural look",
        duration: 3000,
      })
    } catch (error) {
      console.error("AI enhancement error:", error)
      toast({
        title: "Enhancement Failed",
        description: "There was an error enhancing your image",
        variant: "destructive",
      })
    } finally {
      setIsAIEnhancing(false)
      setProcessingAction(null)
    }
  }

  // Apply adjustments when parameters change
  useEffect(() => {
    if (scanMode === "edit" && hasScannedImage && originalImage && !isCropping) {
      // Use a debounce to avoid too many rapid updates
      const timer = setTimeout(() => {
        applyAdjustments()
      }, 500) // Increased debounce time to reduce processing frequency

      return () => clearTimeout(timer)
    }
  }, [
    scanMode,
    hasScannedImage,
    originalImage,
    brightness,
    contrast,
    saturation,
    isFlipped,
    isRotated,
    negativeMode,
    isCropping,
    applyAdjustments,
    redBalance,
    greenBalance,
    blueBalance,
    removeGreenCast,
    filmType,
  ])

  // Reset adjustments
  const resetAdjustments = () => {
    setBrightness([50])
    setContrast([50])
    setSaturation([50])
    setRedBalance([50])
    setGreenBalance([50])
    setBlueBalance([50])
    setIsFlipped(false)
    setIsRotated(false)
  }

  // Toggle horizontal flip
  const toggleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  // Toggle rotation
  const toggleRotation = () => {
    setIsRotated(!isRotated)
  }

  // Toggle fullscreen preview
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)

    // If entering fullscreen, apply a class to the body to prevent scrolling
    if (!isFullscreen) {
      document.body.classList.add("overflow-hidden")
    } else {
      document.body.classList.remove("overflow-hidden")
    }
  }

  // Toggle crop mode
  const toggleCropMode = () => {
    if (!capturedImage || isProcessing) return

    if (!isCropping) {
      // Enter crop mode
      setIsCropping(true)

      // Initialize crop area to 80% of the image
      setTimeout(() => {
        if (imageContainerRef.current) {
          const rect = imageContainerRef.current.getBoundingClientRect()
          const padding = rect.width * 0.1 // 10% padding on each side
          setCropStart({ x: padding, y: padding })
          setCropEnd({
            x: rect.width - padding,
            y: rect.height - padding,
          })
        }
      }, 100)
    } else {
      // Exit crop mode without applying
      setIsCropping(false)
    }
  }

  // Handle mouse down on crop area
  const handleCropMouseDown = (e) => {
    if (!e) return

    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    setDragCorner(null)

    // If not dragging a corner, move the entire crop box
    if (cropAreaRef.current) {
      const rect = cropAreaRef.current.getBoundingClientRect()
      const offsetX = e.clientX - rect.left
      const offsetY = e.clientY - rect.top

      const handleMouseMove = (moveEvent) => {
        moveEvent.preventDefault()
        if (imageContainerRef.current) {
          const containerRect = imageContainerRef.current.getBoundingClientRect()
          const containerX = containerRect.left
          const containerY = containerRect.top

          // Calculate new position
          const newLeft = moveEvent.clientX - containerX - offsetX
          const newTop = moveEvent.clientY - containerY - offsetY

          // Calculate new crop coordinates
          const width = cropEnd.x - cropStart.x
          const height = cropEnd.y - cropStart.y

          // Constrain to container bounds
          const constrainedLeft = Math.max(0, Math.min(containerRect.width - width, newLeft))
          const constrainedTop = Math.max(0, Math.min(containerRect.height - height, newTop))

          setCropStart({
            x: constrainedLeft,
            y: constrainedTop,
          })

          setCropEnd({
            x: constrainedLeft + width,
            y: constrainedTop + height,
          })
        }
      }

      const handleMouseUp = () => {
        setIsDragging(false)
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }
  }

  // Handle mouse down on crop corner
  const handleCornerMouseDown = (e, corner) => {
    if (!e) return

    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    setDragCorner(corner)

    const handleMouseMove = (moveEvent) => {
      moveEvent.preventDefault()
      if (imageContainerRef.current) {
        const containerRect = imageContainerRef.current.getBoundingClientRect()
        const containerX = containerRect.left
        const containerY = containerRect.top

        // Calculate new position relative to container
        const newX = Math.max(0, Math.min(containerRect.width, moveEvent.clientX - containerX))
        const newY = Math.max(0, Math.min(containerRect.height, moveEvent.clientY - containerY))

        // Update the appropriate corner
        if (corner === "topLeft") {
          setCropStart({ x: Math.min(newX, cropEnd.x - 20), y: Math.min(newY, cropEnd.y - 20) })
        } else if (corner === "topRight") {
          setCropStart({ x: cropStart.x, y: Math.min(newY, cropEnd.y - 20) })
          setCropEnd({ x: Math.max(newX, cropStart.x + 20), y: cropEnd.y })
        } else if (corner === "bottomLeft") {
          setCropStart({ x: Math.min(newX, cropEnd.x - 20), y: cropStart.y })
          setCropEnd({ x: cropEnd.x, y: Math.max(newY, cropStart.y + 20) })
        } else if (corner === "bottomRight") {
          setCropEnd({
            x: Math.max(newX, cropStart.x + 20),
            y: Math.max(newY, cropStart.y + 20),
          })
        }
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setDragCorner(null)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  // Handle touch events for crop area
  const handleCropTouchStart = (e) => {
    if (!e || !e.touches || e.touches.length === 0) return

    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    setDragCorner(null)

    if (cropAreaRef.current) {
      const rect = cropAreaRef.current.getBoundingClientRect()
      const touch = e.touches[0]
      const offsetX = touch.clientX - rect.left
      const offsetY = touch.clientY - rect.top

      const handleTouchMove = (moveEvent) => {
        if (!moveEvent.touches || moveEvent.touches.length === 0) return
        moveEvent.preventDefault()

        if (imageContainerRef.current) {
          const containerRect = imageContainerRef.current.getBoundingClientRect()
          const containerX = containerRect.left
          const containerY = containerRect.top
          const touchMove = moveEvent.touches[0]

          // Calculate new position
          const newLeft = touchMove.clientX - containerX - offsetX
          const newTop = touchMove.clientY - containerY - offsetY

          // Calculate new crop coordinates
          const width = cropEnd.x - cropStart.x
          const height = cropEnd.y - cropStart.y

          // Constrain to container bounds
          const constrainedLeft = Math.max(0, Math.min(containerRect.width - width, newLeft))
          const constrainedTop = Math.max(0, Math.min(containerRect.height - height, newTop))

          setCropStart({
            x: constrainedLeft,
            y: constrainedTop,
          })

          setCropEnd({
            x: constrainedLeft + width,
            y: constrainedTop + height,
          })
        }
      }

      const handleTouchEnd = () => {
        setIsDragging(false)
        document.removeEventListener("touchmove", handleTouchMove)
        document.removeEventListener("touchend", handleTouchEnd)
      }

      document.addEventListener("touchmove", handleTouchMove, { passive: false })
      document.addEventListener("touchend", handleTouchEnd)
    }
  }

  // Handle touch events for crop corners
  const handleCornerTouchStart = (e, corner) => {
    if (!e || !e.touches || e.touches.length === 0) return

    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    setDragCorner(corner)

    const handleTouchMove = (moveEvent) => {
      if (!moveEvent.touches || moveEvent.touches.length === 0) return
      moveEvent.preventDefault()

      if (imageContainerRef.current) {
        const containerRect = imageContainerRef.current.getBoundingClientRect()
        const containerX = containerRect.left
        const containerY = containerRect.top
        const touch = moveEvent.touches[0]

        // Calculate new position relative to container
        const newX = Math.max(0, Math.min(containerRect.width, touch.clientX - containerX))
        const newY = Math.max(0, Math.min(containerRect.height, touch.clientY - containerY))

        // Update the appropriate corner
        if (corner === "topLeft") {
          setCropStart({ x: Math.min(newX, cropEnd.x - 20), y: Math.min(newY, cropEnd.y - 20) })
        } else if (corner === "topRight") {
          setCropStart({ x: cropStart.x, y: Math.min(newY, cropEnd.y - 20) })
          setCropEnd({ x: Math.max(newX, cropStart.x + 20), y: cropEnd.y })
        } else if (corner === "bottomLeft") {
          setCropStart({ x: Math.min(newX, cropEnd.x - 20), y: cropStart.y })
          setCropEnd({ x: cropEnd.x, y: Math.max(newY, cropStart.y + 20) })
        } else if (corner === "bottomRight") {
          setCropEnd({
            x: Math.max(newX, cropStart.x + 20),
            y: Math.max(newY, cropStart.y + 20),
          })
        }
      }
    }

    const handleTouchEnd = () => {
      setIsDragging(false)
      setDragCorner(null)
      document.removeEventListener("touchmove", handleTouchMove, { passive: false })
      document.removeEventListener("touchend", handleTouchEnd)
    }

    document.addEventListener("touchmove", handleTouchMove, { passive: false })
    document.addEventListener("touchend", handleTouchEnd)
  }

  // Apply crop to the image
  const applyCrop = () => {
    if (!originalImage || !imageContainerRef.current) {
      setIsCropping(false)
      return
    }

    setIsProcessing(true)
    setProcessingAction("Applying crop...")

    try {
      // Create a new image element to load the original image
      const img = new window.Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        try {
          // Get container dimensions
          const containerRect = imageContainerRef.current.getBoundingClientRect()

          // Calculate scale factors between displayed image and actual image
          const scaleX = img.width / containerRect.width
          const scaleY = img.height / containerRect.height

          // Calculate crop dimensions in the original image scale
          const cropX = Math.max(0, cropStart.x * scaleX)
          const cropY = Math.max(0, cropStart.y * scaleY)
          const cropWidth = Math.min(img.width - cropX, (cropEnd.x - cropStart.x) * scaleX)
          const cropHeight = Math.min(img.height - cropY, (cropEnd.y - cropStart.y) * scaleY)

          // Create a canvas for cropping
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")

          if (!ctx) {
            throw new Error("Could not get canvas context")
          }

          // Set canvas size to the crop size
          canvas.width = cropWidth
          canvas.height = cropHeight

          // Draw the cropped portion to the canvas
          ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight)

          // Get the cropped image data
          const croppedImageData = canvas.toDataURL("image/jpeg", 0.95)

          // Update the original image with the cropped version
          setOriginalImage(croppedImageData)

          // Exit crop mode
          setIsCropping(false)

          // Apply adjustments to the new cropped image
          setTimeout(() => {
            applyAdjustments()
          }, 100)
        } catch (error) {
          console.error("Error applying crop:", error)
          toast({
            title: "Crop failed",
            description: "There was an error applying the crop",
            variant: "destructive",
          })
          setIsCropping(false)
        } finally {
          setIsProcessing(false)
          setProcessingAction(null)
        }
      }

      img.onerror = () => {
        console.error("Error loading image for cropping")
        toast({
          title: "Crop failed",
          description: "There was an error loading the image",
          variant: "destructive",
        })
        setIsProcessing(false)
        setIsCropping(false)
      }

      img.src = originalImage
    } catch (error) {
      console.error("Error in applyCrop:", error)
      toast({
        title: "Crop failed",
        description: "There was an error applying the crop",
        variant: "destructive",
      })
      setIsProcessing(false)
      setIsCropping(false)
    }
  }

  // Auto enhance image
  const autoEnhance = () => {
    setIsProcessing(true)
    setProcessingAction("Auto enhancing...")

    // Apply a more sophisticated auto enhancement
    setBrightness([60])
    setContrast([65])
    setSaturation([60])

    // Set optimal color balance for film negatives
    setRedBalance([55]) // Slightly boost red for warmer tones
    setGreenBalance([45]) // Reduce green to remove green cast
    setBlueBalance([50]) // Keep blue neutral

    // Enable green cast removal
    setRemoveGreenCast(true)

    // Add a slight delay to show processing
    setTimeout(() => {
      setIsProcessing(false)
      setProcessingAction(null)

      toast({
        title: "Auto enhance applied",
        description: "Colors and contrast have been optimized",
        duration: 1500,
      })
    }, 800)
  }

  // Save image to IndexedDB
  const handleSave = async () => {
    if (!capturedImage) {
      toast({
        title: "No image to save",
        description: "Please capture an image first",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      // Create film scan object
      const filmScan: FilmScan = {
        id: crypto.randomUUID(),
        title: scanTitle || `Film Scan ${new Date().toLocaleDateString()}`,
        imageData: capturedImage,
        date: new Date(),
        metadata: {
          filmType: negativeMode ? "negative" : "positive",
          brightness: brightness[0],
          contrast: contrast[0],
          saturation: saturation[0],
          isFlipped: isFlipped,
        },
      }

      // Save to IndexedDB
      await saveFilmScan(filmScan)

      toast({
        title: "Scan saved successfully",
        description: "Your film scan has been saved to your gallery",
      })

      // Navigate to gallery
      setTimeout(() => {
        router.push("/gallery")
      }, 1500)
    } catch (error) {
      console.error("Error saving scan:", error)
      toast({
        title: "Save failed",
        description: "There was an error saving your scan",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Download image to device
  const handleDownload = () => {
    if (!capturedImage) {
      toast({
        title: "No image to download",
        description: "Please capture an image first",
        variant: "destructive",
      })
      return
    }

    try {
      // Create a download link
      const link = document.createElement("a")
      link.href = capturedImage
      link.download = `${scanTitle || "scanner-box"}-${new Date().toISOString().slice(0, 10)}.jpg`
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

  // Restart scanning process
  const handleRescan = () => {
    setCapturedImage(null)
    setOriginalImage(null)
    setHasScannedImage(false)
    setScanMode("preview")
    resetAdjustments()
    setScanTitle("")
  }

  // Clean up fullscreen state when component unmounts
  useEffect(() => {
    return () => {
      document.body.classList.remove("overflow-hidden")
    }
  }, [])

  return (
    <div className="container px-4 py-8 md:py-12 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Scan Film</h1>

      <Tabs value={scanMode} onValueChange={setScanMode} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="preview" disabled={isScanning}>
            Preview & Scan
          </TabsTrigger>
          <TabsTrigger value="edit" disabled={!hasScannedImage || isScanning}>
            Edit & Save
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-6">
                <div className="relative w-full max-w-md aspect-[3/2] bg-black rounded-lg overflow-hidden">
                  {cameraError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                      <CameraOff className="h-16 w-16 mb-4 text-red-500" />
                      <p className="text-center">{cameraError}</p>
                      <Button
                        variant="outline"
                        className="mt-4 text-white border-white hover:bg-white/20"
                        onClick={initCamera}
                      >
                        Try Again
                      </Button>
                    </div>
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={cn("absolute inset-0 w-full h-full object-cover", !cameraReady && "hidden")}
                      />

                      {!cameraReady && !isScanning && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                          <Film className="h-16 w-16 mb-4 opacity-30" />
                          <p className="text-center opacity-70 max-w-xs">Initializing camera...</p>
                        </div>
                      )}

                      {isScanning && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}

                      {/* Film frame guides */}
                      <div className="absolute inset-0 pointer-events-none">
                        {/* Center crop guide */}
                        <div className="absolute inset-[15%] border-2 border-dashed border-white/50"></div>

                        {/* Film perforations */}
                        <div className="absolute top-0 left-0 bottom-0 w-[10%] flex flex-col justify-between py-[15%]">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="w-4 h-4 border-2 border-white/70 rounded-sm ml-2"></div>
                          ))}
                        </div>
                        <div className="absolute top-0 right-0 bottom-0 w-[10%] flex flex-col justify-between py-[15%]">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="w-4 h-4 border-2 border-white/70 rounded-sm mr-2 ml-auto"></div>
                          ))}
                        </div>

                        {/* Corner markers */}
                        <div className="absolute top-[15%] left-[15%] w-4 h-4 border-t-2 border-l-2 border-white/70"></div>
                        <div className="absolute top-[15%] right-[15%] w-4 h-4 border-t-2 border-r-2 border-white/70"></div>
                        <div className="absolute bottom-[15%] left-[15%] w-4 h-4 border-b-2 border-l-2 border-white/70"></div>
                        <div className="absolute bottom-[15%] right-[15%] w-4 h-4 border-b-2 border-r-2 border-white/70"></div>
                      </div>
                    </>
                  )}

                  {/* Hidden canvas for image processing */}
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="negative-mode">Negative Film</Label>
                      <Switch id="negative-mode" checked={negativeMode} onCheckedChange={setNegativeMode} />
                    </div>
                    <p className="text-xs text-muted-foreground">Turn on for color negative film (most common)</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="flash">Flash</Label>
                      <Switch id="flash" checked={flashMode} onCheckedChange={toggleFlash} disabled={!cameraReady} />
                    </div>
                    <p className="text-xs text-muted-foreground">Use in low light conditions</p>
                  </div>
                </div>

                {/* Film Type Selection */}
                <div className="space-y-2 mt-4 w-full max-w-md">
                  <Label>Film Type</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={filmType === "color-negative" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setFilmType("color-negative")
                        setNegativeMode(true)
                      }}
                      className="w-full"
                    >
                      Color Negative
                    </Button>
                    <Button
                      variant={filmType === "black-white" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setFilmType("black-white")
                        setNegativeMode(true)
                      }}
                      className="w-full"
                    >
                      B&W Negative
                    </Button>
                    <Button
                      variant={filmType === "slide" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setFilmType("slide")
                        setNegativeMode(false)
                      }}
                      className="w-full"
                    >
                      Slide/Positive
                    </Button>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full max-w-md gap-2"
                  onClick={captureImage}
                  disabled={isScanning || !cameraReady}
                >
                  {isScanning ? (
                    <>Scanning...</>
                  ) : (
                    <>
                      <Camera className="h-5 w-5" />
                      Scan Film
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-xl font-bold">Scanning Tips</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>Position your film within the frame guides for best results</span>
              </li>
              <li className="flex items-start gap-2">
                <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>Use in a well-lit environment or enable flash in low light</span>
              </li>
              <li className="flex items-start gap-2">
                <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>Keep your phone steady and parallel to the film</span>
              </li>
              <li className="flex items-start gap-2">
                <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>Make sure the film is clean and free from dust</span>
              </li>
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="edit" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-6">
                <div
                  ref={fullscreenRef}
                  className={cn(
                    "relative bg-black rounded-lg overflow-hidden",
                    isFullscreen
                      ? "fixed inset-0 z-50 flex items-center justify-center"
                      : "w-full max-w-md aspect-[3/2]",
                  )}
                >
                  {capturedImage ? (
                    <>
                      <div ref={imageContainerRef} className="relative w-full h-full">
                        <Image
                          src={capturedImage || "/placeholder.svg"}
                          alt="Scanned film"
                          fill
                          className={cn("object-contain", isFullscreen && "p-4")}
                        />
                        {/* Crop overlay */}
                        {isCropping && (
                          <>
                            {/* Darkened areas outside crop */}
                            <div className="absolute inset-0 bg-black/50" />

                            {/* Crop area */}
                            <div
                              ref={cropAreaRef}
                              className="absolute border-2 border-white cursor-move"
                              style={{
                                left: `${cropStart.x}px`,
                                top: `${cropStart.y}px`,
                                width: `${cropEnd.x - cropStart.x}px`,
                                height: `${cropEnd.y - cropStart.y}px`,
                                backgroundColor: "transparent",
                              }}
                              onMouseDown={handleCropMouseDown}
                              onTouchStart={handleCropTouchStart}
                            >
                              {/* Crop handles */}
                              <div
                                className="absolute w-4 h-4 bg-white border border-black rounded-full -left-2 -top-2 cursor-nwse-resize"
                                onMouseDown={(e) => handleCornerMouseDown(e, "topLeft")}
                                onTouchStart={(e) => handleCornerTouchStart(e, "topLeft")}
                              />
                              <div
                                className="absolute w-4 h-4 bg-white border border-black rounded-full -right-2 -top-2 cursor-nesw-resize"
                                onMouseDown={(e) => handleCornerMouseDown(e, "topRight")}
                                onTouchStart={(e) => handleCornerTouchStart(e, "topRight")}
                              />
                              <div
                                className="absolute w-4 h-4 bg-white border border-black rounded-full -left-2 -bottom-2 cursor-nesw-resize"
                                onMouseDown={(e) => handleCornerMouseDown(e, "bottomLeft")}
                                onTouchStart={(e) => handleCornerTouchStart(e, "bottomLeft")}
                              />
                              <div
                                className="absolute w-4 h-4 bg-white border border-black rounded-full -right-2 -bottom-2 cursor-nwse-resize"
                                onMouseDown={(e) => handleCornerMouseDown(e, "bottomRight")}
                                onTouchStart={(e) => handleCornerTouchStart(e, "bottomRight")}
                              />
                            </div>

                            {/* Crop action buttons */}
                            <div className="absolute bottom-4 right-4 flex gap-2">
                              <Button
                                size="sm"
                                variant="destructive"
                                className="rounded-full w-10 h-10 p-0"
                                onClick={() => setIsCropping(false)}
                              >
                                <X className="h-5 w-5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                className="rounded-full w-10 h-10 p-0 bg-green-600 hover:bg-green-700"
                                onClick={applyCrop}
                              >
                                <Check className="h-5 w-5" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>

                      {(isProcessing || isAIEnhancing) && (
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                          <div className="bg-background/90 p-4 rounded-lg flex flex-col items-center space-y-3">
                            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm font-medium">{processingAction || "Processing..."}</p>
                          </div>
                        </div>
                      )}

                      {isFullscreen && (
                        <Button
                          className="absolute top-4 right-4 z-10"
                          variant="secondary"
                          size="sm"
                          onClick={toggleFullscreen}
                        >
                          Close
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <ImageOff className="h-12 w-12 mr-2 opacity-50" />
                      <p>No image captured</p>
                    </div>
                  )}
                </div>

                {/* Hidden canvas for image editing */}
                <canvas ref={editCanvasRef} className="hidden" />

                <div className="w-full max-w-md space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="scan-title">Scan Title</Label>
                      <Input
                        id="scan-title"
                        value={scanTitle}
                        onChange={(e) => setScanTitle(e.target.value)}
                        placeholder="Enter a title for this scan"
                      />
                    </div>

                    {/* Green Cast Removal Option */}
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="remove-green">Remove Green Cast</Label>
                        <p className="text-xs text-muted-foreground">Fixes common green tint in negative scans</p>
                      </div>
                      <Switch id="remove-green" checked={removeGreenCast} onCheckedChange={setRemoveGreenCast} />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="brightness" className="w-24">
                        Brightness
                      </Label>
                      <Slider
                        id="brightness"
                        value={brightness}
                        onValueChange={setBrightness}
                        max={100}
                        step={1}
                        className="flex-1"
                        disabled={isProcessing}
                      />
                      <span className="w-8 text-right text-sm">{brightness[0]}%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="contrast" className="w-24">
                        Contrast
                      </Label>
                      <Slider
                        id="contrast"
                        value={contrast}
                        onValueChange={setContrast}
                        max={100}
                        step={1}
                        className="flex-1"
                        disabled={isProcessing}
                      />
                      <span className="w-8 text-right text-sm">{contrast[0]}%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="saturation" className="w-24">
                        Saturation
                      </Label>
                      <Slider
                        id="saturation"
                        value={saturation}
                        onValueChange={setSaturation}
                        max={100}
                        step={1}
                        className="flex-1"
                        disabled={isProcessing}
                      />
                      <span className="w-8 text-right text-sm">{saturation[0]}%</span>
                    </div>

                    {/* Color Balance Controls */}
                    <div className="pt-2 border-t">
                      <h3 className="font-medium mb-2">Color Balance</h3>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="red-balance" className="w-24">
                          Red
                        </Label>
                        <Slider
                          id="red-balance"
                          value={redBalance}
                          onValueChange={setRedBalance}
                          max={100}
                          step={1}
                          className="flex-1"
                          disabled={isProcessing}
                        />
                        <span className="w-8 text-right text-sm">{redBalance[0]}%</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="green-balance" className="w-24">
                          Green
                        </Label>
                        <Slider
                          id="green-balance"
                          value={greenBalance}
                          onValueChange={setGreenBalance}
                          max={100}
                          step={1}
                          className="flex-1"
                          disabled={isProcessing}
                        />
                        <span className="w-8 text-right text-sm">{greenBalance[0]}%</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="blue-balance" className="w-24">
                          Blue
                        </Label>
                        <Slider
                          id="blue-balance"
                          value={blueBalance}
                          onValueChange={setBlueBalance}
                          max={100}
                          step={1}
                          className="flex-1"
                          disabled={isProcessing}
                        />
                        <span className="w-8 text-right text-sm">{blueBalance[0]}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      title="Reset adjustments"
                      onClick={resetAdjustments}
                      disabled={isProcessing}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      title="Flip horizontally"
                      onClick={toggleFlip}
                      className={isFlipped ? "bg-secondary" : ""}
                      disabled={isProcessing}
                    >
                      <FlipHorizontal className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      title="Rotate 90°"
                      onClick={toggleRotation}
                      className={isRotated ? "bg-secondary" : ""}
                      disabled={isProcessing}
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      title="Crop image"
                      onClick={toggleCropMode}
                      className={isCropping ? "bg-secondary" : ""}
                      disabled={isProcessing}
                    >
                      <Crop className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      title="Full screen"
                      onClick={toggleFullscreen}
                      disabled={isProcessing}
                    >
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </div>

                  {(isProcessing || isAIEnhancing) && (
                    <div className="text-center text-sm text-muted-foreground mt-2 bg-muted p-2 rounded-md">
                      <p>Please wait while {processingAction?.toLowerCase() || "processing completes"}...</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full gap-2"
                      onClick={autoEnhance}
                      disabled={isProcessing || isAIEnhancing}
                    >
                      {isProcessing && processingAction === "Auto enhancing..." ? (
                        <>
                          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></div>
                          Enhancing...
                        </>
                      ) : (
                        <>
                          <Zap className="h-5 w-5" />
                          Auto Enhance
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full gap-2"
                      onClick={applyAIEnhancement}
                      disabled={isProcessing || isAIEnhancing || !canUseAI || !aiModelLoaded}
                    >
                      {isAIEnhancing ? (
                        <>
                          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></div>
                          AI Processing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5" />
                          AI Natural Look
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full gap-2"
                      onClick={handleRescan}
                      disabled={isProcessing}
                    >
                      <Camera className="h-5 w-5" />
                      Rescan
                    </Button>

                    <Button size="lg" className="w-full gap-2" onClick={handleSave} disabled={isSaving || isProcessing}>
                      {isSaving ? (
                        <span>Saving...</span>
                      ) : (
                        <>
                          <Save className="h-5 w-5" />
                          Save to Gallery
                        </>
                      )}
                    </Button>
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

