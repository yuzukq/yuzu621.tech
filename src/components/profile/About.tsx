import { aboutMe } from "@/data/aboutme"
import AboutIntro from "./AboutIntro"

export default function About() {
  return (
    <section id="about" className="scroll-mt-20 snap-start border-t border-border py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <AboutIntro description={aboutMe.description} />
      </div>
    </section>
  )
}
