import { Card } from "@/components/ui/card";
import { Shield, Globe, User } from "lucide-react";

const Privacy = () => {
  const proofs = [
    {
      title: "Age Proof",
      description: "Verify your age without revealing your exact birth date",
      icon: Shield,
    },
    {
      title: "Country Proof",
      description: "Prove your residency while maintaining location privacy",
      icon: Globe,
    },
    {
      title: "Proof of Personhood",
      description: "Verify your identity while protecting personal information",
      icon: User,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4 text-foreground">Privacy Settings</h1>
      <p className="text-muted-foreground mb-8">Manage your privacy settings and data preferences here.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {proofs.map((proof) => (
          <Card key={proof.title} className="p-6 bg-card hover:bg-accent/50 transition-colors">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 rounded-full bg-primary/10">
                <proof.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">{proof.title}</h3>
              <p className="text-muted-foreground">{proof.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Privacy;