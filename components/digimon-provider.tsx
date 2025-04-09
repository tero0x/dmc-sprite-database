"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

export interface DigimonImage {
  url: string
  name: string
}

export interface DigimonData {
  name: string
  stage: string
  attribute: string
  format: number
  donation_link: string
  type: string
  author: string
  images: string[]
}

// Update the DigimonContextType interface to include enums
interface DigimonContextType {
  data: DigimonData[]
  loading: boolean
  error: string | null
  formats: string[][] | null
  vpetFormats: { dmc: string[]; penc: string[] } | null
  enums: {
    stage: Record<string, string>
    attribute: Record<string, string>
  } | null
}

// Update the default context value to include enums
const DigimonContext = createContext<DigimonContextType>({
  data: [],
  loading: true,
  error: null,
  formats: null,
  vpetFormats: null,
  enums: null,
})

export const useDigimon = () => useContext(DigimonContext)

// Add enums state in the DigimonProvider component
export function DigimonProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DigimonData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formats, setFormats] = useState<string[][] | null>(null)
  const [vpetFormats, setVpetFormats] = useState<{ dmc: string[]; penc: string[] } | null>(null)
  const [enums, setEnums] = useState<{
    stages: Record<string, string>
    attributes: Record<string, string>
  } | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch("https://tero0x.github.io/dmc-sprites/sprites.json")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const result = await response.json()

        if (Array.isArray(result.sprites)) {
          setData(result.sprites)
        } else {
          setError("Invalid data format. Expected an array of sprites.")
        }

        setFormats(result.formats)
        setVpetFormats(result.vpet_formats)

        // Set enums if they exist in the API response
        if (result.enums) {
          setEnums({
            stage: result.enums.stage || {},
            attribute: result.enums.attribute || {},
          })
        }

        setLoading(false)
      } catch (err: any) {
        console.error("Failed to load data:", err)
        setError("Failed to load data from the API. Please try again later.")
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <DigimonContext.Provider value={{ data, loading, error, formats, vpetFormats, enums }}>
      {children}
    </DigimonContext.Provider>
  )
}
