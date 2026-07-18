import { Provider } from "@/components/ui/provider"

// ポートフォリオはP3まで既存Chakra実装のまま動かす必要があるため、
// root layout から外した Provider(+ Chakraのdarkクラス依存)をここで補う。
export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dark">
      <Provider>{children}</Provider>
    </div>
  )
}
