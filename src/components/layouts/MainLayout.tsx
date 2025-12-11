"use client"

import Header from "./Header/Header";
import Footer from "./Footer";

import TopSection from "@/components/sections/TopSection";
import AboutSection from "@/components/sections/AboutSection";
import StorySection from "@/components/sections/StorySection";
import ProductSection from "@/components/sections/ProductSection";
import SkillSection from "@/components/sections/SkillSection";
import { ScrollThemeProvider } from "@/context/ScrollThemeContext";
import { BackgroundLayer } from "@/components/ui/BackgroundLayer";

export default function MainLayout() {
  return (
    <ScrollThemeProvider>
      <BackgroundLayer />
      <div>
        <Header />
        <TopSection />
        <AboutSection />
        <ProductSection />
        <SkillSection />
        <StorySection/>
        <Footer />
      </div>
    </ScrollThemeProvider>
  )
}
