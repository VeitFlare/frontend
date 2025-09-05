"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronRight, Loader2 } from "lucide-react"

interface SlideToConfirmProps {
  onConfirm: () => void
  isLoading?: boolean
  disabled?: boolean
  text?: string
  confirmText?: string
}

export function SlideToConfirm({
  onConfirm,
  isLoading = false,
  disabled = false,
  text = "Slide to confirm",
  confirmText = "Processing...",
}: SlideToConfirmProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragPosition, setDragPosition] = useState(0)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled || isLoading) return
    setIsDragging(true)
    e.preventDefault()
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isLoading) return
    setIsDragging(true)
    e.preventDefault()
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current || !buttonRef.current) return

      const container = containerRef.current
      const button = buttonRef.current
      const containerRect = container.getBoundingClientRect()
      const buttonWidth = button.offsetWidth
      const maxPosition = containerRect.width - buttonWidth

      const newPosition = Math.max(0, Math.min(maxPosition, e.clientX - containerRect.left - buttonWidth / 2))
      setDragPosition(newPosition)

      // Check if dragged to the end
      if (newPosition >= maxPosition * 0.9) {
        setIsConfirmed(true)
        setIsDragging(false)
        onConfirm()
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !containerRef.current || !buttonRef.current) return

      const container = containerRef.current
      const button = buttonRef.current
      const containerRect = container.getBoundingClientRect()
      const buttonWidth = button.offsetWidth
      const maxPosition = containerRect.width - buttonWidth

      const touch = e.touches[0]
      const newPosition = Math.max(0, Math.min(maxPosition, touch.clientX - containerRect.left - buttonWidth / 2))
      setDragPosition(newPosition)

      // Check if dragged to the end
      if (newPosition >= maxPosition * 0.9) {
        setIsConfirmed(true)
        setIsDragging(false)
        onConfirm()
      }
    }

    const handleMouseUp = () => {
      if (isDragging && !isConfirmed) {
        setDragPosition(0)
      }
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("touchmove", handleTouchMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.addEventListener("touchend", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("touchend", handleMouseUp)
    }
  }, [isDragging, isConfirmed, onConfirm])

  return (
    <div
      ref={containerRef}
      className={`relative h-14 bg-secondary rounded-full overflow-hidden transition-all duration-300 ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {/* Background track */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-medium text-muted-foreground select-none">{isLoading ? confirmText : text}</span>
      </div>

      {/* Progress fill */}
      <div
        className="absolute left-0 top-0 h-full bg-primary/20 transition-all duration-200"
        style={{ width: `${(dragPosition / (containerRef.current?.offsetWidth || 1)) * 100}%` }}
      />

      {/* Draggable button */}
      <Button
        ref={buttonRef}
        className={`absolute left-1 top-1 h-12 w-12 rounded-full p-0 transition-all duration-200 ${
          isDragging ? "scale-110" : ""
        } ${isConfirmed ? "bg-green-500 hover:bg-green-600" : ""}`}
        style={{ transform: `translateX(${dragPosition}px)` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        disabled={disabled}
      >
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ChevronRight className="h-5 w-5" />}
      </Button>
    </div>
  )
}
