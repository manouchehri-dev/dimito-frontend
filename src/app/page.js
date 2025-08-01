import Hero from "@/components/Hero";
import Roadmap from "@/components/Roadmap";
import About from "@/components/About";
import Projects from "@/components/Projects";

import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <div className="min-h-full text-primary px-[28px] lg:px-[72px] relative">
      <Hero />
      <Separator className="border-[#FFB30F] border-1 my-10 lg:my-30" />
      <About />
      <Projects />
      <Roadmap />
    </div>
  );
}
