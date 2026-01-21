'use client'

import { TableOfContents, TocItem } from './TableOfContents'

type TocWrapperProps = {
  items: TocItem[]
  isDaily: boolean
}

export function TocWrapper({ items, isDaily }: TocWrapperProps) {
  return <TableOfContents items={items} isDaily={isDaily} />
}
