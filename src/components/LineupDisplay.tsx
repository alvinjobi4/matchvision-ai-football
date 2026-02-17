import type { Prediction, Team } from "@/lib/api";
import { Users, ArrowRightLeft } from "lucide-react";

interface LineupDisplayProps {
  prediction: Prediction;
  homeTeam: Team;
  awayTeam: Team;
}

export function LineupDisplay({ prediction, homeTeam, awayTeam }: LineupDisplayProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
      <TeamLineup
        team={homeTeam}
        lineup={prediction.homeLineup}
        label="Home"
      />
      <TeamLineup
        team={awayTeam}
        lineup={prediction.awayLineup}
        label="Away"
      />
    </div>
  );
}

function TeamLineup({
  team,
  lineup,
  label,
}: {
  team: Team;
  lineup: Prediction["homeLineup"];
  label: string;
}) {
  return (
    <div className="bg-gradient-card rounded-2xl border border-border p-5">
      <div className="flex items-center gap-3 mb-4">
        <img src={team.logo} alt={team.name} className="h-8 w-8 object-contain" />
        <div>
          <h3 className="font-display text-lg uppercase tracking-wider text-foreground">{team.name}</h3>
          <span className="text-xs text-primary font-semibold">{lineup.formation} • {label}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-xs font-display uppercase tracking-wider text-muted-foreground">Starting XI</span>
        </div>
        <div className="grid grid-cols-1 gap-1">
          {lineup.starting.map((player, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="text-primary font-mono text-xs w-6 text-center">{player.number}</span>
                <span className="text-foreground font-medium">{player.name}</span>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${getPositionColor(player.position)}`}>
                {player.position}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-display uppercase tracking-wider text-muted-foreground">Substitutes</span>
        </div>
        <div className="grid grid-cols-1 gap-1">
          {lineup.substitutes.map((player, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-1.5 text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-mono text-xs w-6 text-center">{player.number}</span>
                <span className="text-muted-foreground">{player.name}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded opacity-70 ${getPositionColor(player.position)}`}>
                {player.position}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getPositionColor(pos: string): string {
  switch (pos) {
    case "GK": return "bg-stat-orange/20 text-stat-orange";
    case "DEF": return "bg-stat-blue/20 text-stat-blue";
    case "MID": return "bg-primary/20 text-primary";
    case "FWD": return "bg-destructive/20 text-destructive";
    default: return "bg-muted text-muted-foreground";
  }
}
