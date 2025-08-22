const AboutHero = () => {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 pt-[100px] lg:pt-[140px]">
      {/* Background image - left */}
      <div className="pointer-events-none absolute top-0 left-0 -z-10 overflow-hidden">
        <img
          src="/hero/left-desktop.png"
          alt="hero-bg"
          className="hidden lg:block w-full h-full object-cover"
        />
        <img
          src="/hero/left.png"
          alt="hero-bg"
          className="block lg:hidden w-full h-full object-cover"
        />
      </div>

      {/* Background image - right */}
      <div className="pointer-events-none absolute top-0 right-0 -z-10 overflow-hidden">
        <img
          src="/hero/right-desktop.png"
          alt="hero-bg"
          className="hidden lg:block w-full h-full object-cover"
        />
        <img
          src="/hero/right.png"
          alt="hero-bg"
          className="block lg:hidden w-full h-full object-cover"
        />
      </div>
      <div className="bg-white rounded-[24px] grid grid-cols-1 p-10 pl-2">
        <div className="flex items-center justify-center gap-3">
          <img src="/logo.png" alt="MID Token" className="w-[71px] h-[32px]" />
          <div className="border-b border-secondary border-1 w-full" />
        </div>
        <p className="text-primary text-[14px] mt-5 leading-[170%]">
          a digital token backed by real mining assets, designed to bring
          transparency, liquidity, and universal access to investment in the
          mining industry. We use blockchain technology to connect the physical
          world of mining to the digital world to provide fairer and more modern
          investment opportunities.
        </p>
      </div>
    </section>
  );
};

export default AboutHero;
