import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import logo from "@/assets/intelliagent-logo.png";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-accent/10" />
      
      {/* Animated grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)] opacity-30" />
      
      <div className="container relative z-10 px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {/* Logo */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary via-accent to-secondary rounded-full opacity-20 blur-2xl group-hover:opacity-30 transition-opacity duration-500" />
            <img 
              src={logo} 
              alt="IntelliAgent" 
              className="h-32 md:h-40 w-auto relative z-10 drop-shadow-2xl"
            />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Next-Gen Intelligent Automation</span>
          </div>

          {/* Headline */}
          <div className="space-y-4 max-w-4xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Bridge the{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Action Gap
              </span>
              {" "}in AI
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Seamlessly connect Large Language Models to enterprise systems with the Model Context Protocol. 
              Transform powerful AI reasoning into reliable, secure operational outcomes.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
              size="lg" 
              className="gap-2 bg-gradient-to-r from-primary to-accent hover:shadow-glow transition-all duration-300 group"
            >
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 hover:bg-accent/10 hover:border-accent transition-all duration-300"
            >
              Read the Paper
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-12 w-full max-w-2xl">
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                100%
              </div>
              <div className="text-sm text-muted-foreground">Secure</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-accent to-secondary bg-clip-text text-transparent">
                Zero Trust
              </div>
              <div className="text-sm text-muted-foreground">Architecture</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-secondary to-primary bg-clip-text text-transparent">
                Real-time
              </div>
              <div className="text-sm text-muted-foreground">Execution</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
