"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, Play, Zap, AlertCircle } from "lucide-react"
import { LiquidGlassCard } from "@/components/ui/liquid-glass"
import { Button } from "@/components/ui/button"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"

export default function Home() {
  const [activeTab, setActiveTab] = useState("shots")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [threshold, setThreshold] = useState(0.6)
  const [method, setMethod] = useState("MOG2")
  const containerRef = useRef<HTMLDivElement>(null)
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
      setResult(null)
    }
  }

  const handleProcessShotDetection = async () => {
    if (!file) {
      setError("Please select a video file")
      return
    }

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("threshold", threshold.toString())

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60s timeout

      const response = await fetch(`${BACKEND_URL}/detect_shots`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setResult({
        type: "shots",
        ...data,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to process video"
      console.log("[v0] Shot detection error:", errorMessage)
      setError(`Error: ${errorMessage}. Backend URL: ${BACKEND_URL}`)
    } finally {
      setLoading(false)
    }
  }

  const handleProcessBackgroundSubtraction = async () => {
    if (!file) {
      setError("Please select a video file")
      return
    }

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("method", method)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 300000) // 5 min timeout for video processing

      const response = await fetch(`${BACKEND_URL}/background_subtraction`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`)
      }

      const contentDisposition = response.headers.get("content-disposition")
      const filename = contentDisposition ? contentDisposition.split("filename=")[1].replace(/"/g, "") : "output.mp4"

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = downloadUrl
      a.download = filename
      a.click()
      window.URL.revokeObjectURL(downloadUrl)

      setResult({
        type: "bgsub",
        message: "Background subtraction completed and downloaded",
        filename,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to process video"
      console.log("[v0] Background subtraction error:", errorMessage)
      setError(`Error: ${errorMessage}. Backend URL: ${BACKEND_URL}`)
    } finally {
      setLoading(false)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setRipples((prev) => [...prev, { id: Date.now() + Math.random(), x, y }])

    setTimeout(() => {
      setRipples((prev) => prev.slice(1))
    }, 600)
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 relative"
      style={{
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)",
      }}
    >
      <div ref={containerRef} onMouseMove={handleMouseMove} className="relative w-full max-w-2xl">
        <div className="absolute inset-0 pointer-events-none">
          {ripples.map((ripple) => (
            <div
              key={ripple.id}
              className="absolute rounded-full border border-blue-400/60 animate-ripple-pulse"
              style={{
                left: `${ripple.x}px`,
                top: `${ripple.y}px`,
                width: "40px",
                height: "40px",
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </div>

        <LiquidGlassCard
          glowIntensity="md"
          shadowIntensity="lg"
          borderRadius="16px"
          blurIntensity="md"
          className="w-full p-8 relative z-10"
        >
          <div className="space-y-8 relative z-30">
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-white text-balance">Computer Vision TA Group 2</h1>
              <p className="text-gray-200 text-lg">Advanced video processing and analysis tools</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/20">
              <button
                onClick={() => {
                  setActiveTab("shots")
                  setResult(null)
                  setError(null)
                }}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === "shots" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-300 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Shot Boundary Detection
                </div>
              </button>
              <button
                onClick={() => {
                  setActiveTab("bgsub")
                  setResult(null)
                  setError(null)
                }}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === "bgsub" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-300 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Background Subtraction
                </div>
              </button>
            </div>

            {/* File Upload */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-200">Upload Video File</label>
              <div className="relative border-2 border-dashed border-white/30 rounded-lg p-6 hover:border-white/50 transition-colors cursor-pointer bg-white/5">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  <Upload className="w-8 h-8 text-blue-400" />
                  <div className="text-center">
                    <p className="text-white font-medium">{file ? file.name : "Click or drag to upload"}</p>
                    <p className="text-gray-400 text-sm">MP4, AVI, MOV, etc.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings */}
            {activeTab === "shots" && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-200">
                  Detection Threshold: {threshold.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={threshold}
                  onChange={(e) => setThreshold(Number.parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-400">Lower values = more sensitive to scene changes</p>
              </div>
            )}

            {activeTab === "bgsub" && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-200">Algorithm</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setMethod("MOG2")}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      method === "MOG2" ? "bg-blue-500 text-white" : "bg-white/10 text-gray-200 hover:bg-white/20"
                    }`}
                  >
                    MOG2
                  </button>
                  <button
                    onClick={() => setMethod("KNN")}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      method === "KNN" ? "bg-blue-500 text-white" : "bg-white/10 text-gray-200 hover:bg-white/20"
                    }`}
                  >
                    KNN
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 space-y-2">
                <div className="flex gap-2 items-start">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 space-y-2">
                {result.type === "shots" && (
                  <>
                    <p className="text-green-200 font-medium">Shot boundaries detected: {result.count}</p>
                    <div className="bg-black/30 rounded p-3 max-h-32 overflow-y-auto">
                      <p className="text-gray-300 text-sm font-mono">Frames: {result.shot_boundaries.join(", ")}</p>
                    </div>
                  </>
                )}
                {result.type === "bgsub" && <p className="text-green-200 font-medium">{result.message}</p>}
              </div>
            )}

            {/* Process Button */}
            <Button
              onClick={activeTab === "shots" ? handleProcessShotDetection : handleProcessBackgroundSubtraction}
              disabled={!file || loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Process Video"}
            </Button>
          </div>
        </LiquidGlassCard>
      </div>
    </div>
  )
}
