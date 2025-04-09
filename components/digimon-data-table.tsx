"use client"

import type React from "react"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useDigimon, type DigimonData } from "./digimon-provider"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { ImageGallery } from "./image-gallery"
import { Search, X, ExternalLink, Download, Filter, ChevronDown, ChevronUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import JSZip from "jszip"
import { DownloadIndexDialog } from "./download-index-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface ExtendedDigimonData extends DigimonData {
  format: number
  // Add a unique ID for each item
  _id?: string
}

interface DownloadDialogState {
  isOpen: boolean
  item: ExtendedDigimonData | null
}

export function DigimonDataTable() {
  const { data: rawData, loading, error, formats, vpetFormats, enums } = useDigimon()
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchInputValue, setSearchInputValue] = useState("")
  const [stageFilter, setStageFilter] = useState<string[]>([])
  const [attributeFilter, setAttributeFilter] = useState<string[]>([])
  const [typeFilter, setTypeFilter] = useState<string[]>([])
  const [authorFilter, setAuthorFilter] = useState<string[]>([])
  const [sizeFilter, setSizeFilter] = useState<string[]>([])
  const [styleFilter, setStyleFilter] = useState<string[]>([])
  const [sourceFilter, setSourceFilter] = useState<string[]>([])
  const [selectedDigimon, setSelectedDigimon] = useState<ExtendedDigimonData | null>(null)
  const [downloadingItem, setDownloadingItem] = useState<{ id: string; format: "dmc" | "penc" } | null>(null)
  const [downloadDialog, setDownloadDialog] = useState<DownloadDialogState>({
    isOpen: false,
    item: null,
  })
  const [showFilters, setShowFilters] = useState(false)

  // Add unique IDs to each item in the data
  const data = useMemo(() => {
    return rawData.map((item, index) => ({
      ...item,
      _id: `${item.name}-${index}`,
    }))
  }, [rawData])

  const itemsPerPage = 10

  // Extract unique values for filters
  const stages = useMemo(() => [...new Set(data.map((item) => item.stage))], [data])
  const attributes = useMemo(() => [...new Set(data.map((item) => item.attribute))], [data])
  const types = useMemo(() => [...new Set(data.map((item) => item.type))], [data])
  const authors = useMemo(() => {
    const authorSet = new Set<string>()
    data.forEach((item) => {
      item.author.split(", ").forEach((author) => authorSet.add(author.trim()))
    })
    return [...authorSet]
  }, [data])

  // Add sizes to the extracted unique values
  const sizes = useMemo(() => {
    const sizeSet = new Set<string>()
    data.forEach((item) => {
      if (item.size) {
        sizeSet.add(item.size)
      }
    })
    return [...sizeSet]
  }, [data])

  // Extract unique styles
  const styles = useMemo(() => {
    const styleSet = new Set<string>()
    data.forEach((item) => {
      if (item.style) {
        styleSet.add(item.style)
      }
    })
    return [...styleSet]
  }, [data])

  // Extract unique sources
  const sources = useMemo(() => {
    const sourceSet = new Set<string>()
    data.forEach((item) => {
      if (item.source) {
        sourceSet.add(item.source)
      }
    })
    return [...sourceSet]
  }, [data])

  // Helper function to get display name for stage
  const getStageDisplayName = useCallback(
    (stage: string) => {
      if (enums?.stage && enums.stage[stage]) {
        return enums.stage[stage]
      }
      return stage.charAt(0).toUpperCase() + stage.slice(1)
    },
    [enums],
  )

  // Helper function to get display name for attribute
  const getAttributeDisplayName = useCallback(
    (attribute: string) => {
      if (enums?.attribute && enums.attribute[attribute]) {
        return enums.attribute[attribute]
      }
      return attribute.charAt(0).toUpperCase() + attribute.slice(1)
    },
    [enums],
  )

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInputValue(e.target.value)
  }

  // Handle search submission
  const handleSearchSubmit = useCallback(() => {
    setSearchQuery(searchInputValue.trim())
  }, [searchInputValue])

  // Submit search on Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchSubmit()
    }
  }

  // Clear search
  const clearSearch = () => {
    setSearchInputValue("")
    setSearchQuery("")
  }

  // Toggle filter visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  // Handle multi-select filter changes
  const toggleFilterItem = (filterType: string, value: string) => {
    switch (filterType) {
      case "stage":
        setStageFilter((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
        break
      case "attribute":
        setAttributeFilter((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
        break
      case "type":
        setTypeFilter((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
        break
      case "size":
        setSizeFilter((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
        break
      case "style":
        setStyleFilter((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
        break
      case "source":
        setSourceFilter((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
        break
      case "author":
        setAuthorFilter((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
        break
    }
  }

  // Clear individual filter
  const clearFilter = (filterType: string) => {
    switch (filterType) {
      case "stage":
        setStageFilter([])
        break
      case "attribute":
        setAttributeFilter([])
        break
      case "type":
        setTypeFilter([])
        break
      case "size":
        setSizeFilter([])
        break
      case "style":
        setStyleFilter([])
        break
      case "source":
        setSourceFilter([])
        break
      case "author":
        setAuthorFilter([])
        break
    }
  }

  // Filter and search data
  const filteredData = useMemo(() => {
    return data
      .filter((item) => {
        // Apply filters with multi-select support
        if (stageFilter.length > 0 && !stageFilter.includes(item.stage)) return false
        if (attributeFilter.length > 0 && !attributeFilter.includes(item.attribute)) return false
        if (typeFilter.length > 0 && !typeFilter.includes(item.type)) return false
        if (sizeFilter.length > 0 && (item.size ? !sizeFilter.includes(item.size) : true)) return false
        if (styleFilter.length > 0 && (item.style ? !styleFilter.includes(item.style) : true)) return false
        if (sourceFilter.length > 0 && (item.source ? !sourceFilter.includes(item.source) : true)) return false

        if (authorFilter.length > 0) {
          const itemAuthors = item.author.split(", ").map((a) => a.trim())
          if (!itemAuthors.some((author) => authorFilter.includes(author))) return false
        }

        // Apply search
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          return item.name.toLowerCase().includes(query)
        }

        return true
      })
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }))
  }, [data, searchQuery, stageFilter, attributeFilter, typeFilter, sizeFilter, styleFilter, sourceFilter, authorFilter])

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = useMemo(() => {
    const start = (page - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filteredData.slice(start, end)
  }, [filteredData, page, itemsPerPage])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [searchQuery, stageFilter, attributeFilter, typeFilter, sizeFilter, styleFilter, sourceFilter, authorFilter])

  // Auto-submit search after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearchSubmit()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInputValue, handleSearchSubmit])

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchInputValue("")
    setSearchQuery("")
    setStageFilter([])
    setAttributeFilter([])
    setTypeFilter([])
    setSizeFilter([])
    setStyleFilter([])
    setSourceFilter([])
    setAuthorFilter([])
    setPage(1)
  }

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery ||
    stageFilter.length > 0 ||
    attributeFilter.length > 0 ||
    typeFilter.length > 0 ||
    sizeFilter.length > 0 ||
    styleFilter.length > 0 ||
    sourceFilter.length > 0 ||
    authorFilter.length > 0

  // Render filter popover
  const renderFilterPopover = (
    title: string,
    options: string[],
    selectedValues: string[],
    filterType: string,
    getDisplayName?: (value: string) => string,
  ) => {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">{title}</label>
          {selectedValues.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => clearFilter(filterType)} className="h-6 px-2 text-xs">
              Clear
            </Button>
          )}
        </div>
        <div className="max-h-[200px] overflow-y-auto space-y-1 pr-1">
          {options.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={`${filterType}-${option}`}
                checked={selectedValues.includes(option)}
                onCheckedChange={() => toggleFilterItem(filterType, option)}
              />
              <label htmlFor={`${filterType}-${option}`} className="text-sm cursor-pointer">
                {getDisplayName ? getDisplayName(option) : option}
              </label>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Render author with donation link if available
  const renderAuthor = (item: DigimonData) => {
    if (item.donation_link && item.donation_link.trim() !== "") {
      return (
        <div className="flex items-center gap-1">
          <a
            href={item.donation_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline flex items-center"
          >
            {item.author}
            <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </div>
      )
    }
    return item.author
  }

  const getDownloadUrls = (item: ExtendedDigimonData, formatType: "dmc" | "penc") => {
    if (!formats || !vpetFormats) return []

    // Fix: Declare formatNames outside the if/else blocks
    let formatNames: string[] = []

    console.log(item.format)
    console.log(formatType)

    // Then assign the appropriate value based on the condition
    if (item.format === 2 && formatType === "dmc") {
      // Check if penc_to_dmc exists in vpetFormats
      formatNames = vpetFormats["penc_to_dmc"] || []
    } else if (item.format <= 1 && formatType === "penc") {
      // Check if dmc_to_penc exists in vpetFormats
      formatNames = vpetFormats["dmc_to_penc"] || []
    } else {
      formatNames = vpetFormats[formatType] || []
    }

    const imageFormat = formats[item.format]

    if (!imageFormat) {
      console.warn(`Format index ${item.format} not found in formats array.`)
      return []
    }

    const urls: string[] = []
    formatNames.forEach((formatName) => {
      const index = imageFormat.indexOf(formatName)
      if (index !== -1 && item.images[index]) {
        urls.push(item.images[index])
      }
    })
    return urls
  }

  // Handle download button click
  const handleDownloadClick = (item: ExtendedDigimonData) => {
    setDownloadDialog({
      isOpen: true,
      item,
    })
  }

  // Close download dialog
  const closeDownloadDialog = () => {
    setDownloadDialog({
      isOpen: false,
      item: null,
    })
  }

  // Handle download confirmation with format and start index
  const handleDownloadConfirm = async (formatType: "dmc" | "penc", startIndex: number) => {
    if (!downloadDialog.item) return

    const item = downloadDialog.item

    // Close the dialog
    closeDownloadDialog()

    // Start the download process
    await downloadImages(item, formatType, startIndex)
  }

  const downloadImages = async (item: ExtendedDigimonData, formatType: "dmc" | "penc", startIndex = 0) => {
    if (!formats || !vpetFormats) {
      console.error("Formats or vpetFormats not loaded yet.")
      return
    }

    const itemId = `${item._id}-${formatType}`
    setDownloadingItem({ id: itemId, format: formatType })

    const urls = getDownloadUrls(item, formatType)

    if (urls.length === 0) {
      console.warn(`No images found for ${formatType} format.`)
      setDownloadingItem(null)
      return
    }

    try {
      const zip = new JSZip()

      for (let i = 0; i < urls.length; i++) {
        const url = urls[i]
        try {
          const response = await fetch(url)
          const blob = await response.blob()
          // Use the startIndex to name files
          const filename = `${startIndex + i}.png`
          zip.file(filename, blob)
        } catch (error) {
          console.error("Failed to fetch image:", url, error)
        }
      }

      const content = await zip.generateAsync({ type: "blob" })

      // Create a download link and trigger the download
      const downloadLink = document.createElement("a")
      downloadLink.href = URL.createObjectURL(content)
      downloadLink.download = `${item.name}_${formatType}.zip`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
      URL.revokeObjectURL(downloadLink.href)

      setDownloadingItem(null)
    } catch (error) {
      console.error("Failed to generate or download zip:", error)
      setDownloadingItem(null)
    }
  }

  const isDownloading = (item: ExtendedDigimonData) => {
    return downloadingItem?.id.startsWith(`${item._id}`)
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="space-y-4">
      {/* Search bar and filter button in the same row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={searchInputValue}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            className="pl-8 pr-8"
          />
          {searchInputValue && (
            <button
              onClick={clearSearch}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button variant="outline" onClick={toggleFilters} className="flex items-center gap-1">
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Collapsible filters section */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 py-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                Stage <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 max-h-[300px] overflow-y-auto">
              <div className="p-2">
                {stages.map((stage) => (
                  <div key={stage} className="flex items-center space-x-2 py-1">
                    <Checkbox
                      id={`stage-${stage}`}
                      checked={stageFilter.includes(stage)}
                      onCheckedChange={() => toggleFilterItem("stage", stage)}
                    />
                    <label htmlFor={`stage-${stage}`} className="text-sm cursor-pointer">
                      {getStageDisplayName(stage)}
                    </label>
                  </div>
                ))}
              </div>
              {stageFilter.length > 0 && <DropdownMenuSeparator />}
              {stageFilter.length > 0 && (
                <div className="p-2">
                  <Button variant="ghost" size="sm" onClick={() => clearFilter("stage")} className="w-full text-xs">
                    Clear selection
                  </Button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                Attribute <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 max-h-[300px] overflow-y-auto">
              <div className="p-2">
                {attributes.map((attribute) => (
                  <div key={attribute} className="flex items-center space-x-2 py-1">
                    <Checkbox
                      id={`attribute-${attribute}`}
                      checked={attributeFilter.includes(attribute)}
                      onCheckedChange={() => toggleFilterItem("attribute", attribute)}
                    />
                    <label htmlFor={`attribute-${attribute}`} className="text-sm cursor-pointer">
                      {getAttributeDisplayName(attribute)}
                    </label>
                  </div>
                ))}
              </div>
              {attributeFilter.length > 0 && <DropdownMenuSeparator />}
              {attributeFilter.length > 0 && (
                <div className="p-2">
                  <Button variant="ghost" size="sm" onClick={() => clearFilter("attribute")} className="w-full text-xs">
                    Clear selection
                  </Button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                Type <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 max-h-[300px] overflow-y-auto">
              <div className="p-2">
                {types.map((type) => (
                  <div key={type} className="flex items-center space-x-2 py-1">
                    <Checkbox
                      id={`type-${type}`}
                      checked={typeFilter.includes(type)}
                      onCheckedChange={() => toggleFilterItem("type", type)}
                    />
                    <label htmlFor={`type-${type}`} className="text-sm cursor-pointer">
                      {type
                        .split("_")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ")}
                    </label>
                  </div>
                ))}
              </div>
              {typeFilter.length > 0 && <DropdownMenuSeparator />}
              {typeFilter.length > 0 && (
                <div className="p-2">
                  <Button variant="ghost" size="sm" onClick={() => clearFilter("type")} className="w-full text-xs">
                    Clear selection
                  </Button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {sizes.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  Size <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 max-h-[300px] overflow-y-auto">
                <div className="p-2">
                  {sizes.map((size) => (
                    <div key={size} className="flex items-center space-x-2 py-1">
                      <Checkbox
                        id={`size-${size}`}
                        checked={sizeFilter.includes(size)}
                        onCheckedChange={() => toggleFilterItem("size", size)}
                      />
                      <label htmlFor={`size-${size}`} className="text-sm cursor-pointer">
                        {size}
                      </label>
                    </div>
                  ))}
                </div>
                {sizeFilter.length > 0 && <DropdownMenuSeparator />}
                {sizeFilter.length > 0 && (
                  <div className="p-2">
                    <Button variant="ghost" size="sm" onClick={() => clearFilter("size")} className="w-full text-xs">
                      Clear selection
                    </Button>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {styles.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  Style <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 max-h-[300px] overflow-y-auto">
                <div className="p-2">
                  {styles.map((style) => (
                    <div key={style} className="flex items-center space-x-2 py-1">
                      <Checkbox
                        id={`style-${style}`}
                        checked={styleFilter.includes(style)}
                        onCheckedChange={() => toggleFilterItem("style", style)}
                      />
                      <label htmlFor={`style-${style}`} className="text-sm cursor-pointer">
                        {style}
                      </label>
                    </div>
                  ))}
                </div>
                {styleFilter.length > 0 && <DropdownMenuSeparator />}
                {styleFilter.length > 0 && (
                  <div className="p-2">
                    <Button variant="ghost" size="sm" onClick={() => clearFilter("style")} className="w-full text-xs">
                      Clear selection
                    </Button>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {sources.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  Source <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 max-h-[300px] overflow-y-auto">
                <div className="p-2">
                  {sources.map((source) => (
                    <div key={source} className="flex items-center space-x-2 py-1">
                      <Checkbox
                        id={`source-${source}`}
                        checked={sourceFilter.includes(source)}
                        onCheckedChange={() => toggleFilterItem("source", source)}
                      />
                      <label htmlFor={`source-${source}`} className="text-sm cursor-pointer">
                        {source}
                      </label>
                    </div>
                  ))}
                </div>
                {sourceFilter.length > 0 && <DropdownMenuSeparator />}
                {sourceFilter.length > 0 && (
                  <div className="p-2">
                    <Button variant="ghost" size="sm" onClick={() => clearFilter("source")} className="w-full text-xs">
                      Clear selection
                    </Button>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                Author <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 max-h-[300px] overflow-y-auto">
              <div className="p-2">
                {authors.map((author) => (
                  <div key={author} className="flex items-center space-x-2 py-1">
                    <Checkbox
                      id={`author-${author}`}
                      checked={authorFilter.includes(author)}
                      onCheckedChange={() => toggleFilterItem("author", author)}
                    />
                    <label htmlFor={`author-${author}`} className="text-sm cursor-pointer">
                      {author}
                    </label>
                  </div>
                ))}
              </div>
              {authorFilter.length > 0 && <DropdownMenuSeparator />}
              {authorFilter.length > 0 && (
                <div className="p-2">
                  <Button variant="ghost" size="sm" onClick={() => clearFilter("author")} className="w-full text-xs">
                    Clear selection
                  </Button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 ml-auto">
              Clear all filters
            </Button>
          )}
        </div>
      )}

      {/* Active filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {searchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: {searchQuery}
              <button onClick={clearSearch} className="ml-1 hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {stageFilter.map((stage) => (
            <Badge key={`stage-${stage}`} variant="secondary" className="flex items-center gap-1">
              Stage: {getStageDisplayName(stage)}
              <button onClick={() => toggleFilterItem("stage", stage)} className="ml-1 hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {attributeFilter.map((attribute) => (
            <Badge key={`attribute-${attribute}`} variant="secondary" className="flex items-center gap-1">
              Attribute: {getAttributeDisplayName(attribute)}
              <button onClick={() => toggleFilterItem("attribute", attribute)} className="ml-1 hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {typeFilter.map((type) => (
            <Badge key={`type-${type}`} variant="secondary" className="flex items-center gap-1">
              Type:{" "}
              {type
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
              <button onClick={() => toggleFilterItem("type", type)} className="ml-1 hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {sizeFilter.map((size) => (
            <Badge key={`size-${size}`} variant="secondary" className="flex items-center gap-1">
              Size: {size}
              <button onClick={() => toggleFilterItem("size", size)} className="ml-1 hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {styleFilter.map((style) => (
            <Badge key={`style-${style}`} variant="secondary" className="flex items-center gap-1">
              Style: {style}
              <button onClick={() => toggleFilterItem("style", style)} className="ml-1 hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {sourceFilter.map((source) => (
            <Badge key={`source-${source}`} variant="secondary" className="flex items-center gap-1">
              Source: {source}
              <button onClick={() => toggleFilterItem("source", source)} className="ml-1 hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {authorFilter.map((author) => (
            <Badge key={`author-${author}`} variant="secondary" className="flex items-center gap-1">
              Author: {author}
              <button onClick={() => toggleFilterItem("author", author)} className="ml-1 hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
            Clear all
          </Button>
        </div>
      )}

      {/* Data table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[220px]">Image & Name</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Attribute</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Style</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Download</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {Array.from({ length: 9 }).map((_, cellIndex) => (
                    <TableCell key={`skeleton-cell-${index}-${cellIndex}`}>
                      {cellIndex === 0 ? (
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-12 w-12 rounded-md" />
                          <Skeleton className="h-6 w-24" />
                        </div>
                      ) : (
                        <Skeleton className="h-6 w-full" />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <TableRow key={item._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-12 w-12 rounded-md overflow-hidden bg-white dark:bg-black flex-shrink-0 border dark:border-gray-800 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setSelectedDigimon(item)}
                        title="Click to view all images"
                      >
                        <Image
                          src={item.images[0] || "/placeholder.svg"}
                          alt={`${item.name} thumbnail`}
                          width={48}
                          height={48}
                          className="object-contain w-full h-full"
                          unoptimized // For external URLs
                        />
                      </div>
                      <span>{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStageDisplayName(item.stage)}</TableCell>
                  <TableCell>{getAttributeDisplayName(item.attribute)}</TableCell>
                  <TableCell>
                    {item.type
                      .split("_")
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(" ")}
                  </TableCell>
                  <TableCell>{item.style || "N/A"}</TableCell>
                  <TableCell>{item.source || "N/A"}</TableCell>
                  <TableCell>{item.size || "N/A"}</TableCell>
                  <TableCell>{renderAuthor(item)}</TableCell>
                  <TableCell>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDownloadClick(item)}
                      disabled={isDownloading(item)}
                      className="flex items-center gap-1"
                    >
                      {isDownloading(item) ? (
                        <span>Downloading...</span>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  No results found. Try adjusting your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground order-2">
            Showing {(page - 1) * itemsPerPage + 1}-{Math.min(page * itemsPerPage, filteredData.length)} of{" "}
            {filteredData.length}
          </div>
          <Pagination className="order-1">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                // Show first page, last page, and pages around current page
                if (pageNum === 1 || pageNum === totalPages || (pageNum >= page - 1 && pageNum <= page + 1)) {
                  return (
                    <PaginationItem key={pageNum} className="hidden sm:inline-block">
                      <PaginationLink isActive={pageNum === page} onClick={() => handlePageChange(pageNum)}>
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  )
                }
                // Show ellipsis for gaps
                if (pageNum === 2 || pageNum === totalPages - 1) {
                  return (
                    <PaginationItem key={`ellipsis-${pageNum}`} className="hidden sm:inline-block">
                      <PaginationEllipsis />
                    </PaginationItem>
                  )
                }
                return null
              })}
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                  className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Image gallery modal */}
      {selectedDigimon && <ImageGallery digimon={selectedDigimon} onClose={() => setSelectedDigimon(null)} />}

      {/* Download index dialog */}
      {downloadDialog.isOpen && downloadDialog.item && (
        <DownloadIndexDialog
          isOpen={downloadDialog.isOpen}
          onClose={closeDownloadDialog}
          onConfirm={handleDownloadConfirm}
          digimonName={downloadDialog.item.name}
        />
      )}
    </div>
  )
}
