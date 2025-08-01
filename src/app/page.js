import { Hero } from "@/components/Hero";
import Roadmap from "@/components/module/Roadmap";

export default function Home() {
  return (
    <div className="min-h-full text-primary px-[28px] lg:px-[72px] relative">
      <Hero />
      <Roadmap />
    </div>
  );
}
