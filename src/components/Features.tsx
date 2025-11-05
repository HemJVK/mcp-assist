import { Card } from "@/components/ui/card";
import { Shield, Zap, Network, Lock, Brain, GitBranch } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "LLM-MCP Synergy",
    description: "Bridge the action gap with standardized communication between LLMs and external systems.",
    gradient: "from-primary to-accent",
  },
  {
    icon: Shield,
    title: "Protocol-Native Security",
    description: "Comprehensive governance framework with Zero Trust principles and defense-in-depth strategies.",
    gradient: "from-accent to-secondary",
  },
  {
    icon: Zap,
    title: "Real-Time Execution",
    description: "Transform AI reasoning into verifiable operational outcomes with instant action capabilities.",
    gradient: "from-secondary to-primary",
  },
  {
    icon: Network,
    title: "Enterprise Integration",
    description: "Seamlessly connect to existing enterprise systems with standardized MCP primitives.",
    gradient: "from-primary to-secondary",
  },
  {
    icon: Lock,
    title: "Threat Mitigation",
    description: "Advanced protection against prompt injection, tool poisoning, and semantic-based attacks.",
    gradient: "from-accent to-primary",
  },
  {
    icon: GitBranch,
    title: "Tool-Integrated Reasoning",
    description: "Sophisticated TIR frameworks for complex task decomposition and autonomous execution.",
    gradient: "from-secondary to-accent",
  },
];

const Features = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="text-center space-y-4 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Why{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              IntelliAgent
            </span>
            ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The comprehensive solution for trustworthy, scalable intelligent automation in the enterprise
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group relative p-6 hover:shadow-glow transition-all duration-300 border-2 hover:border-primary/50 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-8"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="space-y-4">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
              
              {/* Hover effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
