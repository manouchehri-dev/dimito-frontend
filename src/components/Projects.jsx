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

  // Helper to determine status type from localized string
  const getStatusType = (status) => {
    const statusLower = String(status).toLowerCase();

    // Check for pending/awaiting status
    const pendingWords = ["pending", "در انتظار", "معلق", "در حال بررسی"];
    if (pendingWords.some((word) => statusLower.includes(word.toLowerCase()))) {
      return "pending";
    }

    // Check for active status
    const activeWords = ["active", "فعال", "فعال است"];
    if (activeWords.some((word) => statusLower.includes(word.toLowerCase()))) {
      return "active";
    }

    // Default to inactive
    return "inactive";
  };

  // Get proper status display text
  const getStatusDisplay = (status) => {
    const statusType = getStatusType(status);

    switch (statusType) {
      case "pending":
        return isRTL ? "در انتظار" : "Pending";
      case "active":
        return isRTL ? "فعال" : "Active";
      case "inactive":
        return isRTL ? "غیر فعال" : "Inactive";
      default:
        return status; // fallback to original status
    }
  };

  // Get proper value/quantity display
  const getValueDisplay = (value, status) => {
    const statusType = getStatusType(status);

    if (statusType === "pending") {
      return isRTL ? "در حال بررسی" : "Under Review";
    }

    return value;
  };

  // Get status styling
  const getStatusStyling = (status) => {
    const statusType = getStatusType(status);

    switch (statusType) {
      case "pending":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "active":
        return "bg-green-100 text-green-800 border border-green-200";
      case "inactive":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
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
            const statusType = getStatusType(project.status);

            return (
              <Card
                key={index}
                className="h-full rounded-2xl p-5 text-center shadow-sm transition-all duration-300 hover:shadow-lg hover:transform hover:scale-[1.02]"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-[clamp(14px,2vw,22px)] font-bold">
                    {project.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Quantity */}
                  <div className="flex items-center justify-between">
                    <span className="text-[clamp(12px,1.8vw,18px)] text-primary/70 font-medium">
                      {t("quantity")}:
                    </span>
                    <span
                      className={`text-[clamp(13px,1.8vw,18px)] font-medium ${
                        statusType === "pending" ? "text-amber-700 italic" : ""
                      }`}
                    >
                      {getValueDisplay(project.quantity, project.status)}
                    </span>
                  </div>

                  {/* Value */}
                  <div className="flex items-center justify-between">
                    <span className="text-[clamp(12px,1.8vw,18px)] text-primary/70 font-medium">
                      {t("value")}:
                    </span>
                    <span
                      className={`text-[clamp(13px,1.8vw,18px)] font-medium ${
                        statusType === "pending" ? "text-amber-700 italic" : ""
                      }`}
                    >
                      {getValueDisplay(project.value, project.status)}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[clamp(12px,1.8vw,18px)] text-primary/70 font-medium">
                      {t("status")}:
                    </span>
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-[clamp(11px,1.6vw,14px)] font-semibold transition-all duration-200 ${getStatusStyling(
                        project.status
                      )}`}
                    >
                      {getStatusDisplay(project.status)}
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
