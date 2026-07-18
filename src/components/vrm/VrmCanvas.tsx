"use client"

import { useEffect, useRef, useState } from "react"
import VrmFallback from "./VrmFallback"
import { createVrmScene, type VrmSceneHandle } from "./createVrmScene"

const MODEL_URL = "/models/avatar.vrm"
// 無い/読めない場合は createVrmScene 側でプロシージャル待機に切り替わる
const ANIMATION_URL = "/models/happy-sway.vrma"

type Status = "loading" | "ready" | "failed"

export default function VrmCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [status, setStatus] = useState<Status>("loading")

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    let cancelled = false
    let handle: VrmSceneHandle | undefined

    createVrmScene({ canvas, container, modelUrl: MODEL_URL, animationUrl: ANIMATION_URL })
      .then((sceneHandle) => {
        if (cancelled) {
          sceneHandle.dispose()
          return
        }
        handle = sceneHandle
        setStatus("ready")
      })
      .catch((error: unknown) => {
        // モデル未配置は正常系(ファイルを置けば表示される)のため error にしない
        console.info(
          "[vrm] avatar.vrm を読み込めなかったため、プレースホルダを表示します。",
          error,
        )
        if (!cancelled) setStatus("failed")
      })

    return () => {
      cancelled = true
      handle?.dispose()
    }
  }, [])

  if (status === "failed") {
    return <VrmFallback />
  }

  return (
    <div
      ref={containerRef}
      className="relative mx-auto aspect-square w-full max-w-sm md:mx-0 md:ml-auto"
    >
      {status === "loading" && (
        <div className="absolute inset-0">
          <VrmFallback />
        </div>
      )}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`h-full w-full transition-opacity duration-700 [mask-image:linear-gradient(to_bottom,black_82%,transparent_100%)] ${
          status === "ready" ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  )
}
