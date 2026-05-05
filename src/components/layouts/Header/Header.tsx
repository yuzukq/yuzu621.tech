"use client"

import { 
  Box, 
  useBreakpointValue
} from "@chakra-ui/react"
import HeaderDesktop from "./HeaderDesktop"
import HeaderMobile from "./HeaderMobile"


export default function Header() {

  const isMobile = useBreakpointValue({ base: true, md: false });
  
  const menuItems = [
    { href: "#top", label: "Top" },
    { href: "#about", label: "About" },
    { href: "#products", label: "Products" },
    { href: "#skills", label: "Skills" },
    // { href: "#studies", label: "Studies" },
    { href: "#story", label: "Story" },
    { href: "/", label: "Blog" }
  ]

  return (
    <Box 
      as="header" 
      position="fixed" 
      top={0} 
      h={16}
      w="100%" 
      bg="rgba(0, 0, 0, 0.5)"
      backdropFilter="blur(10px)"
      zIndex={1000}
      transition="all 0.3s ease"
      _hover={{
        boxShadow: "lg"
      }}
    >
      {isMobile ? <HeaderMobile items={menuItems}/> : <HeaderDesktop items={menuItems}/>}
      {/* <HeaderDesktop items={menuItems}/> */}
    </Box>
  )
}