import { supabase } from "@/integrations/supabase/client";

export interface Team {
  id: number;
  name: string;
  logo: string;
  country: string;
}

export interface Player {
  id: number;
  name: string;
  position: string;
  number: number;
  photo: string;
  age: number;
}

export async function searchTeams(query: string): Promise<Team[]> {
  const { data, error } = await supabase.functions.invoke("football-api", {
    body: { endpoint: "teams", params: { search: query } },
  });
  if (error) throw error;
  return (data?.response || []).map((item: any) => ({
    id: item.team.id,
    name: item.team.name,
    logo: item.team.logo,
    country: item.venue?.city || item.team.country || "",
  }));
}

export async function getSquad(teamId: number): Promise<Player[]> {
  const { data, error } = await supabase.functions.invoke("football-api", {
    body: { endpoint: "players/squads", params: { team: teamId } },
  });
  if (error) throw error;
  const squad = data?.response?.[0]?.players || [];
  return squad.map((p: any) => ({
    id: p.id,
    name: p.name,
    position: mapPosition(p.position),
    number: p.number || 0,
    photo: p.photo,
    age: p.age || 0,
  }));
}

function mapPosition(pos: string): string {
  const map: Record<string, string> = {
    Goalkeeper: "GK",
    Defender: "DEF",
    Midfielder: "MID",
    Attacker: "FWD",
  };
  return map[pos] || pos;
}

export interface Prediction {
  matchScore: { home: number; away: number; confidence: number };
  winner: string;
  winConfidence: number;
  stats: Record<string, { home: number; away: number; confidence: number }>;
  homeLineup: {
    formation: string;
    starting: { name: string; position: string; number: number }[];
    substitutes: { name: string; position: string; number: number }[];
  };
  awayLineup: {
    formation: string;
    starting: { name: string; position: string; number: number }[];
    substitutes: { name: string; position: string; number: number }[];
  };
  bestPerformers: {
    home: { name: string; rating: number; reason: string }[];
    away: { name: string; rating: number; reason: string }[];
  };
}

export async function getPrediction(
  homeTeam: Team,
  awayTeam: Team,
  homePlayers: Player[],
  awayPlayers: Player[]
): Promise<Prediction> {
  const { data, error } = await supabase.functions.invoke("predict", {
    body: { homeTeam, awayTeam, homePlayers, awayPlayers },
  });
  if (error) throw error;
  return data;
}
