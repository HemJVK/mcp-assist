import { Card } from "@/components/ui/card";
import { Layers, Database, Cpu, Shield } from "lucide-react";

const architectureLayers = [
  {
    icon: Cpu,
    title: "LLM Reasoning Engine",
    description: "Advanced language models for complex task decomposition and cognitive decision-making",
    position: "top",
  },
  {
    icon: Layers,
    title: "Model Context Protocol",
    description: "Standardized communication layer with Tools, Resources, and Prompts primitives",
    position: "middle",
  },
  {
    icon: Database,
    title: "Enterprise Systems",
    description: "Seamless integration with existing databases, APIs, and business applications",
    position: "bottom",
  },
];

const Architecture = () => {
  return (
    <section className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20" />
      
      <div className="container relative px-4 md:px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Built on{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Solid Architecture
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three-layer architecture ensuring reliability, security, and scalability
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6 mb-16">
          {architectureLayers.map((layer, index) => (
            <Card
              key={index}
              className="p-8 border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-glow bg-card/80 backdrop-blur-sm group relative overflow-hidden"
            >
              {/* Gradient line connector */}
              {index < architectureLayers.length - 1 && (
                <div className="absolute left-1/2 -bottom-6 w-1 h-6 bg-gradient-to-b from-primary to-accent z-10 transform -translate-x-1/2" />
              )}
              
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-primary via-accent to-secondary shadow-xl group-hover:scale-110 transition-transform duration-300">
                    <layer.icon className="w-10 h-10 text-white" />
                  </div>
                </div>
                
                <div className="flex-grow text-center md:text-left space-y-2">
                  <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                    {layer.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {layer.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Security badge */}
        <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 border-2 border-primary/20 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xl font-bold">Zero Trust Security Model</h4>
              <p className="text-muted-foreground">
                Defense-in-depth strategies protecting against prompt injection, tool poisoning, and semantic threats
              </p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default Architecture;
