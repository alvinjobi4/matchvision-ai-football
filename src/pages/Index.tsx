import { useState } from "react";
import { Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamSelector } from "@/components/TeamSelector";
import { ScorePrediction, StatsDisplay } from "@/components/PredictionDisplay";
import { LineupDisplay } from "@/components/LineupDisplay";
import { BestPerformers } from "@/components/BestPerformers";
import { ChatBot } from "@/components/ChatBot";
import { getSquad, getPrediction, type Team, type Prediction } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [homeTeam, setHomeTeam] = useState<Team | null>(null);
  const [awayTeam, setAwayTeam] = useState<Team | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePredict = async () => {
    if (!homeTeam || !awayTeam) return;
    setLoading(true);
    setPrediction(null);
    try {
      const [homePlayers, awayPlayers] = await Promise.all([
        getSquad(homeTeam.id),
        getSquad(awayTeam.id),
      ]);

      if (!homePlayers.length || !awayPlayers.length) {
        toast({ title: "Error", description: "Could not fetch squad data for one or both teams.", variant: "destructive" });
        setLoading(false);
        return;
      }

      const result = await getPrediction(homeTeam, awayTeam, homePlayers, awayPlayers);
      setPrediction(result);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Prediction Failed", description: e?.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-gradient-pitch">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-3">
            <Zap className="h-8 w-8 text-primary" />
            <h1 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-wider text-gradient-primary">
              MatchVision AI
            </h1>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-1">
            AI-Powered Football Match Predictions
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Team Selection */}
        <section className="mb-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <TeamSelector label="Home Team" selectedTeam={homeTeam} onSelect={setHomeTeam} />
            <div className="font-display text-2xl font-bold text-muted-foreground">VS</div>
            <TeamSelector label="Away Team" selectedTeam={awayTeam} onSelect={setAwayTeam} />
          </div>

          {homeTeam && awayTeam && (
            <div className="flex justify-center mt-8">
              <Button
                size="lg"
                onClick={handlePredict}
                disabled={loading}
                className="font-display uppercase tracking-wider text-lg px-8 glow-primary"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing Match...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5" />
                    Predict Match
                  </>
                )}
              </Button>
            </div>
          )}
        </section>

        {/* Results */}
        {prediction && homeTeam && awayTeam && (
          <div className="space-y-6">
            <ScorePrediction prediction={prediction} homeTeam={homeTeam} awayTeam={awayTeam} />
            <StatsDisplay prediction={prediction} homeTeam={homeTeam} awayTeam={awayTeam} />
            <BestPerformers prediction={prediction} homeTeam={homeTeam} awayTeam={awayTeam} />
            <LineupDisplay prediction={prediction} homeTeam={homeTeam} awayTeam={awayTeam} />
          </div>
        )}

        {!homeTeam && !awayTeam && !prediction && (
          <div className="text-center py-20 animate-fade-in">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6 animate-pulse-glow">
              <Zap className="h-10 w-10 text-primary" />
            </div>
            <h2 className="font-display text-2xl uppercase tracking-wider text-foreground mb-2">
              Select Two Teams
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Search and select a home team and an away team to get AI-powered match predictions with lineups, stats, and best performers.
            </p>
          </div>
        )}
      </main>

      <ChatBot />
    </div>
  );
};

export default Index;
