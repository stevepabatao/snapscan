"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Cloud, HardDrive, Save } from "lucide-react"

export default function SettingsPage() {
  const [saveLocation, setSaveLocation] = useState("device")
  const [autoEnhance, setAutoEnhance] = useState(true)
  const [highQuality, setHighQuality] = useState(true)
  const [saveOriginal, setSaveOriginal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveSettings = () => {
    setIsSaving(true)
    // Simulate saving settings
    setTimeout(() => {
      setIsSaving(false)
    }, 1000)
  }

  return (
    <div className="container px-4 py-8 md:py-12 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="scanning">Scanning</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure your app preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select defaultValue="system">
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive scan completion notifications</p>
                </div>
                <Switch id="notifications" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scanning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scanning Settings</CardTitle>
              <CardDescription>Configure how your films are scanned and processed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-enhance">Auto Enhance</Label>
                  <p className="text-sm text-muted-foreground">Automatically enhance scanned images</p>
                </div>
                <Switch id="auto-enhance" checked={autoEnhance} onCheckedChange={setAutoEnhance} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="high-quality">High Quality</Label>
                  <p className="text-sm text-muted-foreground">Scan at maximum resolution (slower)</p>
                </div>
                <Switch id="high-quality" checked={highQuality} onCheckedChange={setHighQuality} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="save-original">Save Original</Label>
                  <p className="text-sm text-muted-foreground">Save unprocessed negative image</p>
                </div>
                <Switch id="save-original" checked={saveOriginal} onCheckedChange={setSaveOriginal} />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Default Film Type</Label>
                <RadioGroup defaultValue="color-negative">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="color-negative" id="color-negative" />
                    <Label htmlFor="color-negative">Color Negative (C-41)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="black-white" id="black-white" />
                    <Label htmlFor="black-white">Black & White</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="slide" id="slide" />
                    <Label htmlFor="slide">Slide Film (E-6)</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Storage Settings</CardTitle>
              <CardDescription>Configure where and how your scanned images are saved</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Save Location</Label>
                <RadioGroup value={saveLocation} onValueChange={setSaveLocation}>
                  <div className="flex items-start space-x-3 rounded-md border p-3">
                    <RadioGroupItem value="device" id="device" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="device" className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4" />
                        Device Storage
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">Save images to your device's local storage</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 rounded-md border p-3">
                    <RadioGroupItem value="cloud" id="cloud" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="cloud" className="flex items-center gap-2">
                        <Cloud className="h-4 w-4" />
                        Cloud Storage
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">Automatically backup to cloud storage</p>
                      {saveLocation === "cloud" && (
                        <div className="mt-3 space-y-2">
                          <Label htmlFor="cloud-email">Cloud Account Email</Label>
                          <Input id="cloud-email" placeholder="your@email.com" />
                        </div>
                      )}
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="image-format">Image Format</Label>
                <Select defaultValue="jpg">
                  <SelectTrigger id="image-format">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jpg">JPEG (Smaller size)</SelectItem>
                    <SelectItem value="png">PNG (Better quality)</SelectItem>
                    <SelectItem value="tiff">TIFF (Highest quality)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} className="w-full gap-2" disabled={isSaving}>
                {isSaving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

