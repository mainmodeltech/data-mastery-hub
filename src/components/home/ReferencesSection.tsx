const references = [
  { name: "SGBS", sector: "Banque" },
  { name: "BOA", sector: "Banque" },
  { name: "CBAO", sector: "Banque" },
  { name: "AXA", sector: "Assurance" },
  { name: "ESMT", sector: "École" },
  { name: "CESAG", sector: "École" },
  { name: "ISM", sector: "École" },
  { name: "Microsoft", sector: "Partenaire" },
];

export function ReferencesSection() {
  return (
    <section className="py-16 bg-secondary border-y border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-muted-foreground font-medium uppercase tracking-wider text-sm">
            Ils nous font confiance
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16">
          {references.map((ref) => (
            <div
              key={ref.name}
              className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity duration-300"
            >
              <div className="h-12 w-24 bg-muted rounded-lg flex items-center justify-center">
                <span className="font-heading font-bold text-foreground text-sm">{ref.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">{ref.sector}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
