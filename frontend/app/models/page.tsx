"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Search, Grid, List } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ModelCard } from "@/components/ModelCard"
import { ModelModal } from "@/components/ModelModal"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import type { ModelManifest, ModelType } from "@/types/model"

// Extended mock data for models browser
const allModels: ModelManifest[] = [
  {
    id: "1",
    name: "GPT-4 Turbo",
    about: "Advanced language model for complex reasoning and creative tasks with enhanced capabilities",
    type: "text",
    tags: ["language", "reasoning", "creative", "chat"],
    thumbnailUrl: "/ai-brain-neural-network.jpg",
    pricing: { mode: "hourly", pricePerHour: 0.05 },
    framework: "PyTorch",
    author: "OpenAI Labs",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "DALL-E 3",
    about: "State-of-the-art image generation from text descriptions with photorealistic quality",
    type: "image",
    tags: ["image-generation", "creative", "art", "photorealistic"],
    thumbnailUrl: "/ai-generated-art-colorful.jpg",
    pricing: { mode: "hourly", pricePerHour: 0.08 },
    framework: "TensorFlow",
    author: "OpenAI Labs",
    createdAt: "2024-01-10",
  },
  {
    id: "3",
    name: "Whisper Large",
    about: "Robust speech recognition and transcription model supporting 99+ languages",
    type: "audio",
    tags: ["speech", "transcription", "multilingual", "voice"],
    thumbnailUrl: "/audio-waveform-visualization.png",
    pricing: { mode: "hourly", pricePerHour: 0.03 },
    framework: "PyTorch",
    author: "OpenAI Labs",
    createdAt: "2024-01-08",
  },
  {
    id: "4",
    name: "CLIP Vision",
    about: "Multi-modal model connecting text and images for advanced understanding",
    type: "multimodal",
    tags: ["vision", "text", "embedding", "classification"],
    thumbnailUrl: "/computer-vision-eye-technology.jpg",
    pricing: { mode: "hourly", pricePerHour: 0.04 },
    framework: "PyTorch",
    author: "OpenAI Labs",
    createdAt: "2024-01-05",
  },
  {
    id: "5",
    name: "CodeLlama",
    about: "Specialized model for code generation and programming assistance across multiple languages",
    type: "text",
    tags: ["code", "programming", "development", "debugging"],
    thumbnailUrl: "/code-programming-terminal.jpg",
    pricing: { mode: "hourly", pricePerHour: 0.06 },
    framework: "PyTorch",
    author: "Meta AI",
    createdAt: "2024-01-03",
  },
  {
    id: "6",
    name: "MusicGen",
    about: "Generate high-quality music from text descriptions with various genres and styles",
    type: "audio",
    tags: ["music", "generation", "creative", "composition"],
    thumbnailUrl: "/music-notes-sound-waves.jpg",
    pricing: { mode: "hourly", pricePerHour: 0.07 },
    framework: "PyTorch",
    author: "Meta AI",
    createdAt: "2024-01-01",
  },
  {
    id: "7",
    name: "Stable Diffusion XL",
    about: "High-resolution image generation with exceptional detail and artistic control",
    type: "image",
    tags: ["image-generation", "high-res", "artistic", "stable"],
    thumbnailUrl: "/ai-generated-art-colorful.jpg",
    pricing: { mode: "hourly", pricePerHour: 0.09 },
    framework: "PyTorch",
    author: "Stability AI",
    createdAt: "2023-12-28",
  },
  {
    id: "8",
    name: "LLaMA 2 Chat",
    about: "Open-source conversational AI model optimized for dialogue and assistance",
    type: "text",
    tags: ["chat", "conversation", "open-source", "assistant"],
    thumbnailUrl: "/ai-brain-neural-network.jpg",
    pricing: { mode: "free" },
    framework: "PyTorch",
    author: "Meta AI",
    createdAt: "2023-12-25",
  },
  {
    id: "9",
    name: "Embeddings Ada",
    about: "High-quality text embeddings for semantic search and similarity tasks",
    type: "embedding",
    tags: ["embeddings", "search", "similarity", "semantic"],
    thumbnailUrl: "/computer-vision-eye-technology.jpg",
    pricing: { mode: "hourly", pricePerHour: 0.02 },
    framework: "TensorFlow",
    author: "OpenAI Labs",
    createdAt: "2023-12-20",
  },
  {
    id: "10",
    name: "AudioCraft",
    about: "Advanced audio generation including music, sound effects, and speech synthesis",
    type: "audio",
    tags: ["audio", "synthesis", "effects", "generation"],
    thumbnailUrl: "/audio-waveform-visualization.png",
    pricing: { mode: "hourly", pricePerHour: 0.05 },
    framework: "PyTorch",
    author: "Meta AI",
    createdAt: "2023-12-18",
  },
  {
    id: "11",
    name: "Vision Transformer",
    about: "State-of-the-art image classification and analysis using transformer architecture",
    type: "image",
    tags: ["classification", "analysis", "transformer", "vision"],
    thumbnailUrl: "/computer-vision-eye-technology.jpg",
    pricing: { mode: "hourly", pricePerHour: 0.04 },
    framework: "PyTorch",
    author: "Google Research",
    createdAt: "2023-12-15",
  },
  {
    id: "12",
    name: "T5 Text-to-Text",
    about: "Versatile text-to-text transfer transformer for various NLP tasks",
    type: "text",
    tags: ["nlp", "transfer", "versatile", "text-to-text"],
    thumbnailUrl: "/ai-brain-neural-network.jpg",
    pricing: { mode: "hourly", pricePerHour: 0.03 },
    framework: "TensorFlow",
    author: "Google Research",
    createdAt: "2023-12-12",
  },
]

const modelTypes: { value: ModelType | "all"; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "text", label: "Text" },
  { value: "image", label: "Image" },
  { value: "audio", label: "Audio" },
  { value: "multimodal", label: "Multimodal" },
  { value: "embedding", label: "Embedding" },
]

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "name", label: "Name A-Z" },
]

export default function ModelsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<ModelType | "all">("all")
  const [selectedTag, setSelectedTag] = useState<string | "all">("all")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedModel, setSelectedModel] = useState<ModelManifest | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const modelsPerPage = 9

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    allModels.forEach((model) => model.tags.forEach((tag) => tags.add(tag)))
    return Array.from(tags).sort()
  }, [])

  // Filter and sort models
  const filteredModels = useMemo(() => {
    const filtered = allModels.filter((model) => {
      const matchesSearch =
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.about.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesType = selectedType === "all" || model.type === selectedType
      const matchesTag = selectedTag === "all" || model.tags.includes(selectedTag)

      return matchesSearch && matchesType && matchesTag
    })

    // Sort models
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime()
        case "oldest":
          return new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime()
        case "price-low":
          const priceA = a.pricing?.mode === "hourly" ? a.pricing.pricePerHour || 0 : 0
          const priceB = b.pricing?.mode === "hourly" ? b.pricing.pricePerHour || 0 : 0
          return priceA - priceB
        case "price-high":
          const priceA2 = a.pricing?.mode === "hourly" ? a.pricing.pricePerHour || 0 : 0
          const priceB2 = b.pricing?.mode === "hourly" ? b.pricing.pricePerHour || 0 : 0
          return priceB2 - priceA2
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    return filtered
  }, [searchQuery, selectedType, selectedTag, sortBy])

  // Pagination
  const totalPages = Math.ceil(filteredModels.length / modelsPerPage)
  const paginatedModels = filteredModels.slice((currentPage - 1) * modelsPerPage, currentPage * modelsPerPage)

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedType("all")
    setSelectedTag("all")
    setSortBy("newest")
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">AI Models</h1>
          <p className="text-xl text-muted-foreground text-pretty">
            Discover and deploy cutting-edge AI models from the community
          </p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search models..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Type Filter */}
            <Select value={selectedType} onValueChange={(value) => setSelectedType(value as ModelType | "all")}>
              <SelectTrigger>
                <SelectValue placeholder="Model Type" />
              </SelectTrigger>
              <SelectContent>
                {modelTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Tag Filter */}
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger>
                <SelectValue placeholder="Tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">{filteredModels.length} models found</span>
              {(searchQuery || selectedType !== "all" || selectedTag !== "all") && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("grid")}>
                <Grid className="w-4 h-4" />
              </Button>
              <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")}>
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Models Grid/List */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
          {paginatedModels.length > 0 ? (
            <div
              className={
                viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8" : "space-y-4 mb-8"
              }
            >
              {paginatedModels.map((model, index) => (
                <motion.div
                  key={model.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  onClick={() => setSelectedModel(model)}
                  className="cursor-pointer"
                >
                  <ModelCard model={model} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No models found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search criteria</p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center items-center space-x-2"
          >
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1
              if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className="w-10"
                  >
                    {page}
                  </Button>
                )
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <span key={page} className="text-muted-foreground">
                    ...
                  </span>
                )
              }
              return null
            })}

            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </motion.div>
        )}
      </main>

      <Footer />

      {/* Model Modal */}
      {selectedModel && (
        <ModelModal model={selectedModel} isOpen={!!selectedModel} onClose={() => setSelectedModel(null)} />
      )}
    </div>
  )
}
