import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations, useLocale } from "next-intl";
const Projects = () => {
  const t = useTranslations("projects");
  const isRTL = useLocale() === "fa";
  const projectData = [
    {
      title: t("lithium.title"),
      quantity: t("lithium.quantity"),
      value: t("lithium.value"),
      status: t("lithium.status"),
    },
    {
      title: t("gold_mine_kerman.title"),
      quantity: t("gold_mine_kerman.quantity"),
      value: t("gold_mine_kerman.value"),
      status: t("gold_mine_kerman.status"),
    },
    {
      title: t("gold_mine_kerman.title"),
      quantity: t("gold_mine_kerman.quantity"),
      value: t("gold_mine_kerman.value"),
      status: t("gold_mine_kerman.status"),
    },
  ];
  return (
    <section id="projects" className="mt-20 mb-10">
      <div className="flex flex-col items-center justify-center lg:items-start">
        <h1 className="text-[14px] lg:text-[24px] font-bold border-b-2 lg:border-b-4 border-[#FF5D1B] pb-4 text-center">
          {t("title")}:
        </h1>
        <p
          className={`text-center lg:text-start px-1.5 lg:px-0 ${
            isRTL ? "lg:pl-32" : "lg:pr-32"
          } text-[12px] lg:text-[24px] font-normal mt-3 lg:mt-6 leading-[170%]`}
        >
          {t("description")}
        </p>
      </div>
      <div className="my-10 lg:my-30 flex flex-col lg:flex-row lg:justify-center lg:gap-12">
        {projectData.map((project, index) => (
          <Card
            className="text-center lg:py-12 my-5 max-h-full h-50 lg:w-[434px] lg:h-[277px]"
            key={index}
          >
            <CardHeader>
              <CardTitle className="flex flex-col items-center space-y-5">
                <p className="text-[14px] lg:text-[24px] font-bold">
                  {project.title}
                </p>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[12px] lg:text-[18px] font-normal text-primary">
                  {t("quantity")}:
                </span>
                <span className="text-[14px] lg:text-[18px] pr-1.5">
                  {project.quantity}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[12px] lg:text-[18px] font-normal text-primary">
                  {t("value")}:
                </span>
                <span className="text-[14px] lg:text-[18px] pr-1.5">
                  {project.value}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[12px] lg:text-[18px] font-normal text-primary">
                  {t("status")}:
                </span>
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full text-[12px] lg:text-[18px] font-medium ${
                    project.status
                      ? "bg-[#B8FFD3] text-[#008F37]"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {project.status ? "Active" : "Inactive"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default Projects;
