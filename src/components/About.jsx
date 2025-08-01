import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";

const About = () => {
  const cardData = [
    {
      title: "Global access",
      description:
        "Investment in the mining industry for everyone around the world without restrictions",
      icon: "/icons/globe.png",
      bgColor: "bg-gradient-to-r from-[#FF5D1B] to-[#FF363E]",
    },
    {
      title: "Full transparency",
      description:
        "All transactions and assets are traceable on the blockchain.",
      icon: "/icons/overview.png",
      bgColor: "bg-gradient-to-r from-[#A463FF] to-[#8036FF]",
    },
    {
      title: "Real support",
      description: "Each token is backed by real mining assets.",
      icon: "/icons/sack-dollar.png",
      bgColor: "bg-gradient-to-r from-[#FAD43B] to-[#FFAB36]",
    },
  ];
  return (
    <section id="about">
      <div className="flex flex-col items-center justify-center lg:items-start">
        <h1 className="text-[14px] lg:text-[24px] font-bold border-b-2 lg:border-b-4 border-[#FF5D1B] pb-4 text-center">
          What Is IMD Token?
        </h1>
        <p className="text-center lg:text-start px-1.5 lg:px-0 lg:pr-32 text-[12px] lg:text-[24px] font-normal mt-3 lg:mt-6 leading-[170%]">
          MineToken is a blockchain-based digital asset backed by real-world
          mineral reserves. We bridge the gap between traditional mining and
          decentralized finance — making resource investing easy, secure, and
          accessible to everyone.
        </p>
      </div>
      <div className="my-10 lg:my-30 flex flex-col lg:flex-row-reverse lg:justify-center lg:gap-12">
        {cardData.map((card) => (
          <Card className="text-center px-8 lg:py-12 my-5 max-h-full h-60 lg:w-[434px] lg:h-[364px]">
            <CardHeader>
              <CardTitle className="flex flex-col items-center space-y-5">
                <div
                  className={`p-3 rounded-[8px] ${card.bgColor} flex items-center justify-center`}
                >
                  <img
                    src={card.icon}
                    alt={card.title}
                    className="w-[30px] h-[30px] lg:w-[54px] lg:h-[54px]"
                  />
                </div>
                <p className="lg:text-[24px] font-bold">{card.title}</p>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[12px] lg:text-[24px] font-normal leading-[170%]">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default About;
