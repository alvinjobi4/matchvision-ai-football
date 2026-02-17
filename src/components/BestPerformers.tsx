import type { Prediction, Team } from "@/lib/api";
import { Star } from "lucide-react";

interface BestPerformersProps {
  prediction: Prediction;
  homeTeam: Team;
  awayTeam: Team;
}

export function BestPerformers({ prediction, homeTeam, awayTeam }: BestPerformersProps) {
  return (
    <div className="bg-gradient-card rounded-2xl border border-border p-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
      <div className="flex items-center justify-center gap-2 mb-6">
        <Star className="h-5 w-5 text-gold" />
        <h2 className="font-display text-xl uppercase tracking-wider text-foreground">
          Predicted Best Performers
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PerformerList team={homeTeam} performers={prediction.bestPerformers.home} />
        <PerformerList team={awayTeam} performers={prediction.bestPerformers.away} />
      </div>
    </div>
  );
}

function PerformerList({
  team,
  performers,
}: {
  team: Team;
  performers: { name: string; rating: number; reason: string }[];
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <img src={team.logo} alt={team.name} className="h-6 w-6 object-contain" />
        <span className="font-display text-sm uppercase tracking-wider text-muted-foreground">{team.name}</span>
      </div>
      <div className="space-y-2">
        {performers.map((player, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl bg-secondary/50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 glow-gold">
              <span className="font-display text-lg font-bold text-gold">{i + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground text-sm">{player.name}</span>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-gold fill-gold" />
                  <span className="text-sm font-bold text-gold">{player.rating.toFixed(1)}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground truncate">{player.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
