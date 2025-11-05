import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Package, DollarSign, FileText, ArrowRight } from "lucide-react";

const useCases = [
  {
    icon: Package,
    title: "Supply Chain Optimization",
    description: "Autonomous inventory management, demand forecasting, and logistics optimization powered by real-time LLM analysis and MCP-driven execution.",
    metrics: ["30% reduction in costs", "Real-time adaptation", "Predictive analytics"],
    color: "primary",
  },
  {
    icon: DollarSign,
    title: "Financial Risk Management",
    description: "Intelligent transaction monitoring, fraud detection, and compliance automation with secure, auditable AI-driven decision making.",
    metrics: ["99.9% accuracy", "Instant alerts", "Regulatory compliance"],
    color: "accent",
  },
  {
    icon: FileText,
    title: "Document Processing",
    description: "Cognitive document understanding, automated extraction, and intelligent workflow routing across enterprise systems.",
    metrics: ["90% time saved", "Multi-format support", "Smart categorization"],
    color: "secondary",
  },
];

const UseCases = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background" />
      
      <div className="container relative px-4 md:px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Transforming{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Industries
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-world applications delivering measurable business value
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {useCases.map((useCase, index) => (
            <Card
              key={index}
              className="group p-8 hover:shadow-glow-secondary transition-all duration-500 border-2 hover:border-accent/50 bg-card/80 backdrop-blur-sm relative overflow-hidden"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br from-${useCase.color}/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative space-y-6">
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br from-${useCase.color} to-${useCase.color}/70 shadow-xl`}>
                  <useCase.icon className="w-8 h-8 text-white" />
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                    {useCase.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {useCase.description}
                  </p>
                </div>

                <div className="space-y-2 pt-4 border-t border-border/50">
                  {useCase.metrics.map((metric, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-accent" />
                      <span className="text-sm font-medium">{metric}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  variant="ghost" 
                  className="w-full group/btn hover:bg-accent/10 hover:text-accent transition-all"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
