import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";

const TokenPriceDashboard = () => {
  const t = useTranslations("tokenDashboard");
  return (
    <div className="w-full max-w-md mx-auto p-4">
      <Card className="bg-white/95 backdrop-blur border-2 rounded-2xl shadow-lg">
        <CardContent className="space-y-6">
          {/* Tabs */}
          <Tabs defaultValue="price" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-xl p-1">
              <TabsTrigger
                value="statistics"
                className="rounded-lg text-gray-600 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
              >
                {t("statistics")}
              </TabsTrigger>
              <TabsTrigger
                value="operation"
                className="rounded-lg text-gray-600 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
              >
                {t("operation")}
              </TabsTrigger>
              <TabsTrigger
                value="price"
                className="rounded-lg text-gray-600 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
              >
                {t("price")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="price" className="mt-6 space-y-6">
              {/* Live Price Section */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600 text-sm">
                    {t("livePrice")}
                  </span>
                </div>

                <div className="text-4xl font-bold text-red-500">$0.00047</div>

                <div className="text-green-500 font-semibold">+21.2%</div>
              </div>

              {/* Statistics Cards */}
              <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4">
                <Card className="bg-[#F6F6F6] border-0">
                  <CardContent className="flex lg:flex-col justify-between items-center">
                    <span className="text-gray-700 font-medium">
                      {t("marketCap")}
                    </span>
                    <span className="font-bold text-lg">$0.00047</span>
                  </CardContent>
                </Card>

                <Card className="bg-[#F6F6F6] border-0">
                  <CardContent className="flex lg:flex-col justify-between items-center">
                    <span className="text-gray-700 font-medium">
                      {t("livePrice")}
                    </span>
                    <span className="font-bold text-lg">$0.00047</span>
                  </CardContent>
                </Card>

                <Card className="bg-[#F6F6F6] border-0">
                  <CardContent className="flex lg:flex-col justify-between items-center">
                    <span className="text-gray-700 font-medium">
                      {t("holders")}
                    </span>
                    <span className="font-bold text-lg">$0.00047</span>
                  </CardContent>
                </Card>

                <Card className="bg-[#F6F6F6] border-0">
                  <CardContent className="flex lg:flex-col justify-between items-center">
                    <span className="text-gray-700 font-medium">
                      {t("apy")}
                    </span>
                    <span className="font-bold text-lg">$0.00047</span>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="statistics" className="mt-6">
              <div className="text-center text-gray-500">
                Statistics content goes here
              </div>
            </TabsContent>

            <TabsContent value="operation" className="mt-6">
              <div className="text-center text-gray-500">
                Operation content goes here
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenPriceDashboard;
