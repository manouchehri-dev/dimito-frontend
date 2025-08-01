import Hero from "@/components/Hero";
import Roadmap from "@/components/Roadmap";
import About from "@/components/About";

export default function Home() {
  return (
    <div className="min-h-full text-primary px-[28px] lg:px-[72px] relative">
      <Hero />
      <About />
      <Roadmap />
    </div>
  );
}
