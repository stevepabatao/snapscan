// Storage service using IndexedDB for film scans

// Define the structure of our scan data
export interface FilmScan {
  id: string
  title: string
  imageData: string // Base64 encoded image
  date: Date
  metadata?: {
    filmType?: "negative" | "positive" | "blackAndWhite"
    brightness?: number
    contrast?: number
    saturation?: number
    isFlipped?: boolean
    aiEnhanced?: boolean // Track if AI enhancement was applied
  }
}

// Database configuration
const DB_NAME = "scanner-box-db"
const DB_VERSION = 1
const STORE_NAME = "film-scans"

// Helper function to optimize image data if needed
function optimizeImageData(imageData: string, maxSizeMB = 5): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // If the image is already small enough, return it as is
      if (!imageData || imageData.length < maxSizeMB * 1024 * 1024) {
        return resolve(imageData)
      }

      // Create a temporary canvas to resize the image
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        console.warn("Could not get canvas context for image optimization")
        return resolve(imageData)
      }

      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        try {
          // Start with original dimensions
          let width = img.width
          let height = img.height

          // Calculate new dimensions (reduce by 25% until size is acceptable)
          const quality = 0.8

          canvas.width = width
          canvas.height = height

          ctx.drawImage(img, 0, 0, width, height)

          // Try to reduce quality first
          let result = canvas.toDataURL("image/jpeg", quality)

          // If still too large, reduce dimensions
          let attempts = 0
          const maxAttempts = 5 // Prevent infinite loops

          while (result.length > maxSizeMB * 1024 * 1024 && width > 300 && attempts < maxAttempts) {
            attempts++
            width = Math.floor(width * 0.75)
            height = Math.floor(height * 0.75)

            canvas.width = width
            canvas.height = height

            ctx.drawImage(img, 0, 0, width, height)
            result = canvas.toDataURL("image/jpeg", quality)
          }

          resolve(result)
        } catch (err) {
          console.error("Error optimizing image:", err)
          resolve(imageData) // Return original if optimization fails
        }
      }

      img.onerror = () => {
        console.error("Failed to load image for optimization")
        resolve(imageData) // Return original if loading fails
      }

      img.src = imageData
    } catch (error) {
      console.error("Error in optimizeImageData:", error)
      resolve(imageData) // Return original if any error occurs
    }
  })
}

// Initialize the database
async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = (event) => {
        console.error("IndexedDB error:", event)
        reject("Error opening database")
      }

      request.onsuccess = (event) => {
        resolve(request.result)
      }

      request.onupgradeneeded = (event) => {
        const db = request.result

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" })
          store.createIndex("date", "date", { unique: false })
        }
      }
    } catch (error) {
      console.error("Error initializing database:", error)
      reject("Failed to initialize database")
    }
  })
}

// Save a film scan to the database
export async function saveFilmScan(scan: FilmScan): Promise<string> {
  try {
    if (!scan || !scan.imageData) {
      throw new Error("Invalid scan data")
    }

    const db = await initDB()

    // Optimize image data if it's too large
    const optimizedImageData = await optimizeImageData(scan.imageData)
    const optimizedScan = {
      ...scan,
      imageData: optimizedImageData,
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction([STORE_NAME], "readwrite")
        const store = transaction.objectStore(STORE_NAME)

        // Generate ID if not provided
        if (!optimizedScan.id) {
          optimizedScan.id = crypto.randomUUID()
        }

        const request = store.put(optimizedScan)

        request.onsuccess = () => {
          resolve(optimizedScan.id)
        }

        request.onerror = (event) => {
          console.error("Error in IndexedDB put operation:", event)
          reject("Error saving scan")
        }
      } catch (error) {
        console.error("Transaction error:", error)
        reject("Failed to create transaction")
      }
    })
  } catch (error) {
    console.error("Storage error:", error)
    throw new Error("Failed to save scan")
  }
}

// Get all film scans from the database
export async function getAllFilmScans(): Promise<FilmScan[]> {
  try {
    const db = await initDB()

    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction([STORE_NAME], "readonly")
        const store = transaction.objectStore(STORE_NAME)
        const dateIndex = store.index("date")

        // Get all scans sorted by date (newest first)
        const request = dateIndex.openCursor(null, "prev")
        const scans: FilmScan[] = []

        request.onsuccess = (event) => {
          const cursor = request.result

          if (cursor) {
            scans.push(cursor.value)
            cursor.continue()
          } else {
            resolve(scans)
          }
        }

        request.onerror = (event) => {
          console.error("Error retrieving scans:", event)
          reject("Error retrieving scans")
        }
      } catch (error) {
        console.error("Transaction error:", error)
        reject("Failed to create transaction")
      }
    })
  } catch (error) {
    console.error("Storage error:", error)
    return []
  }
}

// Get a specific film scan by ID
export async function getFilmScanById(id: string): Promise<FilmScan | null> {
  try {
    if (!id) {
      throw new Error("Invalid ID")
    }

    const db = await initDB()

    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction([STORE_NAME], "readonly")
        const store = transaction.objectStore(STORE_NAME)
        const request = store.get(id)

        request.onsuccess = () => {
          resolve(request.result || null)
        }

        request.onerror = (event) => {
          console.error("Error retrieving scan:", event)
          reject("Error retrieving scan")
        }
      } catch (error) {
        console.error("Transaction error:", error)
        reject("Failed to create transaction")
      }
    })
  } catch (error) {
    console.error("Storage error:", error)
    return null
  }
}

// Delete a film scan by ID
export async function deleteFilmScan(id: string): Promise<boolean> {
  try {
    if (!id) {
      throw new Error("Invalid ID")
    }

    const db = await initDB()

    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction([STORE_NAME], "readwrite")
        const store = transaction.objectStore(STORE_NAME)
        const request = store.delete(id)

        request.onsuccess = () => {
          resolve(true)
        }

        request.onerror = (event) => {
          console.error("Error deleting scan:", event)
          reject("Error deleting scan")
        }
      } catch (error) {
        console.error("Transaction error:", error)
        reject("Failed to create transaction")
      }
    })
  } catch (error) {
    console.error("Storage error:", error)
    return false
  }
}

// Clear all film scans from the database
export async function clearAllFilmScans(): Promise<boolean> {
  try {
    const db = await initDB()

    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction([STORE_NAME], "readwrite")
        const store = transaction.objectStore(STORE_NAME)
        const request = store.clear()

        request.onsuccess = () => {
          resolve(true)
        }

        request.onerror = (event) => {
          console.error("Error clearing scans:", event)
          reject("Error clearing scans")
        }
      } catch (error) {
        console.error("Transaction error:", error)
        reject("Failed to create transaction")
      }
    })
  } catch (error) {
    console.error("Storage error:", error)
    return false
  }
}

