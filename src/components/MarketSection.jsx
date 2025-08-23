import { Button } from "./ui/button";

const MarketSection = () => {
  return (
    <section id="market" className="px-2">
      <div className="flex flex-col items-center justify-center lg:items-start">
        <h1 className="text-[14px] lg:text-[24px] font-bold border-b-2 lg:border-b-4 border-[#FF5D1B] pb-4 text-center">
          بازار ثانویه و نقدینگی
        </h1>
        <p
          className={`text-start 
          text-[12px] lg:text-[18px] font-normal mt-3 lg:mt-6 leading-[170%]`}
        >
          توکن پروژه قابلیت معامله در بازار ثانویه و به صورت P2P (کاربر به
          کاربر) رو داره.
          <br /> همچنین از طریق بازارسازها (Market Makers) نقدینگی همیشه در
          دسترسه تا خرید و فروش راحت و بدون مشکل انجام بشه.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 my-5 space-y-2">
        <div className="text-[12px] lg:text-[18px]">
          <span>ویژگی ها</span>
          <ul className="list-disc mr-2 my-2 space-y-1">
            <li>معاملات سریع و امن</li>
            <li>نقدینگی پایدار برای کاهش نوسان قیمت</li>
            <li>دسترسی به صرافی های داخلی و DEX</li>
          </ul>
        </div>
        <div className="flex justify-end items-end">
          <Button
            className={
              "bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] w-full md:w-1/2 py-6 lg:py-8 lg:text-[20px] cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200 ease-in-out rounded-[16px]"
            }
          >
            <a href="#roadmap">ورود به بازار</a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default MarketSection;
