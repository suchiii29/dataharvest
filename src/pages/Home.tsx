import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import heroImage from "@/assets/farm-hero.jpg";
import {
  Shield,
  Zap,
  Globe,
  CheckCircle,
  QrCode,
  BarChart3,
  Users,
  Leaf,
  ArrowRight,
  PlayCircle,
} from "lucide-react";

const Home = () => {
  const features = [
    {
      icon: QrCode,
      title: "QR Code Traceability",
      description: "Track products from farm to consumer with secure blockchain technology",
    },
    {
      icon: Shield,
      title: "MRL & AMU Monitoring",
      description: "Real-time monitoring of Maximum Residue Limits and Antimicrobial Usage",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "AI-powered insights and predictive alerts for better farm management",
    },
    {
      icon: Globe,
      title: "Global Compliance",
      description: "Meet international food safety standards and regulatory requirements",
    },
  ];

  const benefits = [
    { stakeholder: "Farmers", benefit: "Higher profits via premium markets and early alerts" },
    { stakeholder: "Consumers", benefit: "Safe food with farm-to-fork transparency and trust" },
    { stakeholder: "Government", benefit: "Data-driven policy and regulatory compliance" },
    { stakeholder: "Environment", benefit: "Reduced chemical usage and sustainable practices" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-gradient-primary text-white">
                  Smart India Hackathon 2025 Winner
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-hero bg-clip-text text-transparent">
                    DataHarvest
                  </span>
                  <br />
                  <span className="text-foreground">
                    Farm Management Portal
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Digital platform for monitoring Maximum Residue Limits (MRL) and 
                  Antimicrobial Usage (AMU) in livestock with blockchain-powered traceability
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="bg-gradient-primary shadow-medium hover:shadow-strong transition-smooth">
                  <Link to="/dashboard">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" className="border-primary/20">
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center space-x-8 text-sm text-muted-foreground pt-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Blockchain Secure</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>AI Analytics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Mobile Ready</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-hero opacity-20 rounded-2xl blur-3xl"></div>
              <img
                src={heroImage}
                alt="Modern farm management with digital technology"
                className="relative w-full h-auto rounded-2xl shadow-strong"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Revolutionary Farm-to-Fork Solution
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Combining cloud technology, mobile apps, QR codes, and blockchain to ensure 
              food safety and transparency across the entire supply chain
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="shadow-soft hover:shadow-medium transition-smooth border-0 bg-background/80 backdrop-blur">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <Badge className="bg-destructive/10 text-destructive">The Problem</Badge>
                <h2 className="text-3xl font-bold">Food Safety Challenges</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>• Low farmer awareness with local language barriers</p>
                  <p>• Data accuracy and connectivity issues in rural areas</p>
                  <p>• Lack of enforcement and laboratory integration</p>
                  <p>• No transparent tracking from farm to consumer</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <Badge className="bg-primary/10 text-primary">Our Solution</Badge>
                <h2 className="text-3xl font-bold">Comprehensive Digital Platform</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>• Cloud, mobile, and QR code integration</p>
                  <p>• Blockchain ensures data integrity and trust</p>
                  <p>• AI-powered predictive analytics</p>
                  <p>• Real-time monitoring and compliance reporting</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact & Benefits */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Building a Safer, More Transparent Food System
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our solution benefits every stakeholder in the food supply chain
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="shadow-soft hover:shadow-medium transition-smooth">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <span>{benefit.stakeholder}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{benefit.benefit}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold">Built with Modern Technology</h2>
            <p className="text-xl text-muted-foreground">
              Scalable, secure, and future-ready technology stack
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              "React Native",
              "Node.js + Express",
              "Supabase",
              "Blockchain",
              "AI & ML",
              "QR Codes",
              "Cloud Storage",
              "Mobile Apps",
            ].map((tech, index) => (
              <div key={index} className="text-center p-6 bg-muted/50 rounded-lg">
                <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <p className="font-medium">{tech}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Ready to Transform Your Farm Management?
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Join the digital agriculture revolution and ensure food safety 
              from farm to consumer with DataHarvest
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 shadow-medium">
              <Link to="/dashboard">
                Start Your Journey
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Link to="/traceability">
                Try Traceability
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;