import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Projects = () => {
  const projectData = [
    {
      title: "Lithium reserves",
      quantity: 8,
      value: "$1.2M",
      status: true,
    },
    {
      title: "Gold mine in Kerman province",
      quantity: 10,
      value: "$1.2M",
      status: true,
    },
    {
      title: "Gold mine in Kerman province",
      quantity: 10,
      value: "$1.2M",
      status: false,
    },
  ];
  return (
    <section id="projects" className="my-20">
      <div className="flex flex-col items-center justify-center lg:items-start">
        <h1 className="text-[14px] lg:text-[24px] font-bold border-b-2 lg:border-b-4 border-[#FF5D1B] pb-4 text-center">
          Assets backing the token:
        </h1>
        <p className="text-center lg:text-start px-1.5 lg:px-0 lg:pr-32 text-[12px] lg:text-[24px] font-normal mt-3 lg:mt-6 leading-[170%]">
          A list of mining projects, reserves, or contracts that are presented
          as the real backing for the token.
        </p>
      </div>
      <div className="my-10 lg:my-30 flex flex-col lg:flex-row lg:justify-center lg:gap-12">
        {projectData.map((project) => (
          <Card className="text-center lg:py-12 my-5 max-h-full h-50 lg:w-[434px] lg:h-[277px]">
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
                  Quantity:
                </span>
                <span className="text-[14px] lg:text-[18px] pr-1.5">
                  {project.quantity}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[12px] lg:text-[18px] font-normal text-primary">
                  Value:
                </span>
                <span className="text-[14px] lg:text-[18px] pr-1.5">
                  {project.value}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[12px] lg:text-[18px] font-normal text-primary">
                  Status:
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
