// requestIdleCallback が無いブラウザ(Safari)で代わりに待つ時間
const IDLE_FALLBACK_DELAY_MS = 200
// メインスレッドが空かないままでも、いつかは 3D の初期化を始めるための上限
const IDLE_TIMEOUT_MS = 3000

// load イベントの後、さらにブラウザがアイドルになってから callback を呼ぶ。
// 戻り値の関数を呼ぶと、まだ呼ばれていない callback を取り消す
export function runWhenIdleAfterLoad(callback: () => void): () => void {
  let idleHandle: number | undefined
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined

  function scheduleIdle() {
    if (typeof window.requestIdleCallback === "function") {
      idleHandle = window.requestIdleCallback(callback, { timeout: IDLE_TIMEOUT_MS })
    } else {
      timeoutHandle = setTimeout(callback, IDLE_FALLBACK_DELAY_MS)
    }
  }

  // SPA 遷移で /profile に来た場合は load が発火済みなので、イベントを待つと永遠に呼ばれない
  if (document.readyState === "complete") {
    scheduleIdle()
  } else {
    window.addEventListener("load", scheduleIdle, { once: true })
  }

  return () => {
    window.removeEventListener("load", scheduleIdle)
    if (idleHandle !== undefined) window.cancelIdleCallback(idleHandle)
    if (timeoutHandle !== undefined) clearTimeout(timeoutHandle)
  }
}
