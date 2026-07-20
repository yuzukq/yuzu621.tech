"use client"

import { useEffect, useRef, useState } from "react"
import VrmFallback from "./VrmFallback"
import { createVrmScene, type VrmSceneHandle } from "./createVrmScene"

const MODEL_URL = "/models/avatar.vrm"
const ANIMATION_URL = "/models/present-card.vrma"
// 両腕を伸ばして下から持ち上げる演技を画角に収めるため、Heroのバストアップ
// フレーミングより下方向に広げる
const CAMERA_FRAMING = { hipsBottomMargin: 0.55 }

type Status = "loading" | "ready" | "failed"

interface VrmScrubCanvasProps {
  /** 0〜1。TechStackShowcase がスクロール位置から計算し、refで渡す(再レンダー回避) */
  progressRef: React.RefObject<number>
}

export default function VrmScrubCanvas({ progressRef }: VrmScrubCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [status, setStatus] = useState<Status>("loading")

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    let cancelled = false
    let handle: VrmSceneHandle | undefined

    createVrmScene({
      canvas,
      container,
      modelUrl: MODEL_URL,
      cameraFraming: CAMERA_FRAMING,
      motion: {
        mode: "scrub",
        animationUrl: ANIMATION_URL,
        getProgress: () => progressRef.current,
      },
    })
      .then((sceneHandle) => {
        if (cancelled) {
          sceneHandle.dispose()
          return
        }
        handle = sceneHandle
        setStatus("ready")
      })
      .catch((error: unknown) => {
        console.info(
          "[vrm] present-card.vrma を読み込めなかったため、プレースホルダを表示します。",
          error,
        )
        if (!cancelled) setStatus("failed")
      })

    return () => {
      cancelled = true
      handle?.dispose()
    }
  }, [progressRef])

  if (status === "failed") {
    return <VrmFallback />
  }

  return (
    <div ref={containerRef} className="relative h-full w-full">
      {status === "loading" && (
        <div className="absolute inset-0">
          <VrmFallback />
        </div>
      )}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`h-full w-full transition-opacity duration-700 ${
          status === "ready" ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  )
}
