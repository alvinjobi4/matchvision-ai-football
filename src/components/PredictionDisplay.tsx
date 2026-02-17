import type { Prediction, Team } from "@/lib/api";
import { Trophy, Target, Footprints, CornerDownRight, AlertTriangle } from "lucide-react";

interface ScorePredictionProps {
  prediction: Prediction;
  homeTeam: Team;
  awayTeam: Team;
}

export function ScorePrediction({ prediction, homeTeam, awayTeam }: ScorePredictionProps) {
  const { matchScore, winner, winConfidence } = prediction;

  return (
    <div className="bg-gradient-card rounded-2xl border border-border p-6 glow-primary animate-slide-up">
      <div className="flex items-center justify-center gap-2 mb-6">
        <Trophy className="h-5 w-5 text-gold" />
        <h2 className="font-display text-xl uppercase tracking-wider text-foreground">Predicted Score</h2>
      </div>

      <div className="flex items-center justify-center gap-6 md:gap-12 mb-6">
        <div className="flex flex-col items-center gap-2">
          <img src={homeTeam.logo} alt={homeTeam.name} className="h-16 w-16 object-contain" />
          <span className="font-display text-sm uppercase text-muted-foreground">{homeTeam.name}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-display text-5xl font-bold text-foreground">{matchScore.home}</span>
          <span className="font-display text-2xl text-muted-foreground">-</span>
          <span className="font-display text-5xl font-bold text-foreground">{matchScore.away}</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <img src={awayTeam.logo} alt={awayTeam.name} className="h-16 w-16 object-contain" />
          <span className="font-display text-sm uppercase text-muted-foreground">{awayTeam.name}</span>
        </div>
      </div>

      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
          <Target className="h-4 w-4" />
          {winner === "Draw" ? "Predicted Draw" : `${winner} to Win`} — {winConfidence}% Confidence
        </span>
      </div>
    </div>
  );
}

interface StatsDisplayProps {
  prediction: Prediction;
  homeTeam: Team;
  awayTeam: Team;
}

export function StatsDisplay({ prediction, homeTeam, awayTeam }: StatsDisplayProps) {
  const statLabels: Record<string, { label: string; icon: any }> = {
    possession: { label: "Possession %", icon: Footprints },
    passes: { label: "Passes", icon: Footprints },
    shots: { label: "Shots", icon: Target },
    shotsOnTarget: { label: "Shots on Target", icon: Target },
    corners: { label: "Corners", icon: CornerDownRight },
    fouls: { label: "Fouls", icon: AlertTriangle },
  };

  return (
    <div className="bg-gradient-card rounded-2xl border border-border p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
      <h2 className="font-display text-xl uppercase tracking-wider text-foreground text-center mb-6">
        Predicted Stats
      </h2>

      <div className="space-y-5">
        {Object.entries(prediction.stats).map(([key, stat]) => {
          const info = statLabels[key];
          if (!info) return null;
          const total = key === "possession" ? 100 : stat.home + stat.away;
          const homePercent = total > 0 ? (stat.home / total) * 100 : 50;

          return (
            <div key={key}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="font-semibold text-foreground">{stat.home}</span>
                <span className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1">
                  {info.label}
                  <span className="text-primary/60 text-[10px]">({stat.confidence}%)</span>
                </span>
                <span className="font-semibold text-foreground">{stat.away}</span>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                <div
                  className="stat-bar bg-primary"
                  style={{ width: `${homePercent}%` }}
                />
                <div
                  className="stat-bar bg-stat-blue"
                  style={{ width: `${100 - homePercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
