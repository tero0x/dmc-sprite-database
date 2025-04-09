"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface DownloadIndexDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (formatType: "dmc" | "penc", startIndex: number) => void
  digimonName: string
}

export function DownloadIndexDialog({ isOpen, onClose, onConfirm, digimonName }: DownloadIndexDialogProps) {
  const [startIndex, setStartIndex] = useState<string>("0")
  const [formatType, setFormatType] = useState<"dmc" | "penc">("dmc")
  const [error, setError] = useState<string>("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow integers
    if (/^\d*$/.test(value)) {
      setStartIndex(value)
      setError("")
    }
  }

  const handleConfirm = () => {
    const index = Number.parseInt(startIndex, 10)

    if (isNaN(index)) {
      setError("Please enter a valid number")
      return
    }

    onConfirm(formatType, index)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Download Sprites</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p>
            You are about to download sprites for <strong>{digimonName}</strong>.
          </p>

          <div className="space-y-2">
            <Label>Format</Label>
            <RadioGroup
              value={formatType}
              onValueChange={(value) => setFormatType(value as "dmc" | "penc")}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dmc" id="dmc" />
                <Label htmlFor="dmc" className="font-normal">
                  DMC Format
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="penc" id="penc" />
                <Label htmlFor="penc" className="font-normal">
                  PENC Format
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startIndex">Starting Index</Label>
            <Input
              id="startIndex"
              type="text"
              value={startIndex}
              onChange={handleInputChange}
              placeholder="Enter starting index (e.g., 0)"
              className="col-span-3"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <p className="text-sm text-muted-foreground">
              Sprites will be named in ascending order starting from this index (e.g., {startIndex}.png,{" "}
              {Number.parseInt(startIndex) + 1}.png, etc.)
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Download</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
