import type React from "react"
import { cn } from "@/lib/utils"

interface LiquidGlassCardProps {
  children: React.ReactNode
  className?: string
  glowIntensity?: "sm" | "md" | "lg"
  shadowIntensity?: "sm" | "md" | "lg"
  borderRadius?: string
  blurIntensity?: "sm" | "md" | "lg"
  draggable?: boolean
}

export function LiquidGlassCard({
  children,
  className,
  glowIntensity = "md",
  shadowIntensity = "md",
  borderRadius = "12px",
  blurIntensity = "md",
  draggable = false,
}: LiquidGlassCardProps) {
  const glowMap = {
    sm: "0 0 20px rgba(59, 130, 246, 0.3)",
    md: "0 0 40px rgba(59, 130, 246, 0.4)",
    lg: "0 0 60px rgba(59, 130, 246, 0.5)",
  }

  const shadowMap = {
    sm: "0 8px 16px rgba(0, 0, 0, 0.1)",
    md: "0 16px 32px rgba(0, 0, 0, 0.2)",
    lg: "0 24px 48px rgba(0, 0, 0, 0.3)",
  }

  const blurMap = {
    sm: "8px",
    md: "12px",
    lg: "16px",
  }

  return (
    <div
      className={cn("backdrop-blur-md border border-white/20 bg-white/10", draggable && "cursor-move", className)}
      style={{
        borderRadius,
        boxShadow: `${shadowMap[shadowIntensity]}, ${glowMap[glowIntensity]}`,
        backdropFilter: `blur(${blurMap[blurIntensity]})`,
      }}
      draggable={draggable}
    >
      {children}
    </div>
  )
}
