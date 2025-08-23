import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations, useLocale } from "next-intl";

const Projects = () => {
  const t = useTranslations("projects");
  const isRTL = useLocale() === "fa";

  const projectData = [
    {
      title: t("gold_mine_kerman.title"),
      quantity: t("gold_mine_kerman.quantity"),
      value: t("gold_mine_kerman.value"),
      status: t("gold_mine_kerman.status"),
    },
    {
      title: t("cooper.title"),
      quantity: t("cooper.quantity"),
      value: t("cooper.value"),
      status: t("cooper.status"),
    },
    {
      title: t("lithium.title"),
      quantity: t("lithium.quantity"),
      value: t("lithium.value"),
      status: t("lithium.status"),
    },
  ];

  // Helper to style status from localized string
  const isActiveStatus = (status) => {
    const activeWords = [t.optional?.("active") ?? "active", "فعال", "Active"]; // falls back if key missing
    return activeWords.some((w) =>
      status.toLowerCase().includes(w.toLowerCase())
    );
  };

  return (
    <section id="projects" dir={isRTL ? "rtl" : "ltr"} className="mt-16 mb-10">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center justify-center lg:items-start">
          <h1 className="border-b-2 border-[#FF5D1B] pb-3 text-center text-[clamp(14px,2.5vw,24px)] font-bold lg:border-b-4 lg:pb-4">
            {t("title")}:
          </h1>
          <p
            className={[
              "mt-3 lg:mt-6 px-1.5 lg:px-0 text-center lg:text-start leading-[170%] text-[clamp(12px,2.2vw,20px)]",
              isRTL ? "lg:pl-32" : "lg:pr-32",
            ].join(" ")}
          >
            {t("description")}
          </p>
        </div>

        {/* Cards grid */}
        <div className="my-8 lg:my-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {projectData.map((project, index) => {
            const active = isActiveStatus(String(project.status));
            return (
              <Card
                key={index}
                className="h-full rounded-2xl p-5 text-center shadow-sm transition-all hover:shadow-md"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-[clamp(14px,2vw,22px)] font-bold">
                    {project.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[clamp(12px,1.8vw,18px)] text-primary/80">
                      {t("quantity")}:
                    </span>
                    <span className="text-[clamp(13px,1.8vw,18px)] font-medium">
                      {project.quantity}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[clamp(12px,1.8vw,18px)] text-primary/80">
                      {t("value")}:
                    </span>
                    <span className="text-[clamp(13px,1.8vw,18px)] font-medium">
                      {project.value}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[clamp(12px,1.8vw,18px)] text-primary/80">
                      {t("status")}:
                    </span>
                    <span
                      className={`inline-flex items-center px-4 py-2 rounded-full text-[12px] lg:text-[18px] font-medium ${
                        project.status === "true"
                          ? "bg-[#B8FFD3] text-[#008F37]"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {project.status === "true" ? "Active" : "Inactive"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Projects;
