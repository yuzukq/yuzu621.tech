"use client"

import { HStack, Button, Link, IconButton } from "@chakra-ui/react"
import { FaTwitter, FaLink } from "react-icons/fa"
import { usePathname } from "next/navigation"
import { toaster } from "../../../components/ui/toaster"

interface ShareRowProps {
  title: string
  isDaily?: boolean
}

export default function ShareRow({ title, isDaily = false }: ShareRowProps) {
  const pathname = usePathname()

  const getShareUrl = () => {
    if (typeof window === "undefined") return pathname || "/"
    return `${window.location.origin}${pathname || "/"}`
  }

  const handleShareTwitter = () => {
    const url = getShareUrl()
    const intent = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
    window.open(intent, "_blank", "noopener,noreferrer")
  }

  const handleCopyLink = async () => {
    const text = getShareUrl()
    try {
      if (!navigator?.clipboard?.writeText) throw new Error("Clipboard API unsupported")
      await navigator.clipboard.writeText(text)
      toaster.create({
        title: "リンクをコピーしました",
        type: "success",
      })
    } catch (e) {
      toaster.create({
        title: "コピーに失敗しました",
        description: "お手数ですが手動でコピーしてください",
        type: "error",
      })
    }
  }

  const colorPalette = isDaily ? "blue" : "gray"

  return (
    <HStack justify="space-between" w="100%" mt={10}>
      <Link href="/blog">
        <Button variant="subtle" colorPalette={colorPalette} size="lg">一覧に戻る</Button>
      </Link>

      <HStack gap={2}>
        <IconButton aria-label="Share on Twitter" onClick={handleShareTwitter} variant="subtle" colorPalette={colorPalette} size="lg">
          <FaTwitter />
        </IconButton>
        <IconButton aria-label="Copy link" onClick={handleCopyLink} variant="subtle" colorPalette={colorPalette} size="lg">
          <FaLink />
        </IconButton>
      </HStack>
    </HStack>
  )
}
