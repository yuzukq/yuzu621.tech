"use client"

// VRMヒーロー本体(DESIGN.md §7)。next/dynamic(ssr: false)経由でのみ
// 読み込まれるクライアントアイランド。three.js のセットアップ自体は
// createVrmScene.ts に閉じ、ここではDOM(canvas)のマウント/アンマウントと
// 状態(読み込み中・表示中・失敗)の切替だけを担当する。
//
// モデル未配置・読み込み失敗時は静かに VrmFallback へ切り替える
// (console.error は出さない。info レベルのログのみ)。
import { useEffect, useRef, useState } from "react"
import VrmFallback from "./VrmFallback"
import { createVrmScene, type VrmSceneHandle } from "./createVrmScene"

const MODEL_URL = "/models/avatar.vrm"

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

    createVrmScene({ canvas, container, modelUrl: MODEL_URL })
      .then((sceneHandle) => {
        if (cancelled) {
          sceneHandle.dispose()
          return
        }
        handle = sceneHandle
        setStatus("ready")
      })
      .catch((error: unknown) => {
        // ユーザーが後日 public/models/avatar.vrm を置くまでは404が期待される
        // 状態のため、console.error ではなく info レベルに留める。
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
