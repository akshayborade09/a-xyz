"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { MenuBar } from "@/components/ui/glow-menu"
import { categoryItems } from "@/lib/navigation-data"

export function CategoryNav() {
  const pathname = usePathname()
  const [activeItem, setActiveItem] = useState<string>("")

  useEffect(() => {
    // Extract the first segment of the path
    const segment = pathname.split("/")[1]

    // Find the matching category
    const matchedCategory = categoryItems.find((item) => item.href === `/${segment}`)

    if (matchedCategory) {
      setActiveItem(matchedCategory.label)
    }
  }, [pathname])

  const handleItemClick = (label: string) => {
    setActiveItem(label)
    // Navigation will happen through the Link component
  }

  return (
    <div className="w-full flex justify-center py-2">
      <MenuBar
        items={categoryItems.map((item) => ({
          ...item,
          icon: item.icon,
        }))}
        activeItem={activeItem}
        onItemClick={handleItemClick}
        className="mx-auto"
      />
    </div>
  )
}
