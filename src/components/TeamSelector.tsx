import { useState, useCallback, useRef } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchTeams, type Team } from "@/lib/api";

interface TeamSelectorProps {
  label: string;
  selectedTeam: Team | null;
  onSelect: (team: Team) => void;
}

export function TeamSelector({ label, selectedTeam, onSelect }: TeamSelectorProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (value.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const teams = await searchTeams(value);
        setResults(teams);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, []);

  const handleSelect = (team: Team) => {
    onSelect(team);
    setQuery("");
    setOpen(false);
    setResults([]);
  };

  if (selectedTeam) {
    return (
      <div className="flex flex-col items-center gap-3">
        <span className="text-xs font-display uppercase tracking-widest text-muted-foreground">{label}</span>
        <button
          onClick={() => onSelect(null as any)}
          className="group flex flex-col items-center gap-2 transition-transform hover:scale-105"
        >
          <img src={selectedTeam.logo} alt={selectedTeam.name} className="h-20 w-20 object-contain drop-shadow-lg" />
          <span className="font-display text-lg font-bold uppercase tracking-wide text-foreground">
            {selectedTeam.name}
          </span>
          <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">Change team</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-xs">
      <span className="text-xs font-display uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search team..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 bg-secondary border-border focus:border-primary focus:ring-primary"
        />
        {open && results.length > 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-xl max-h-60 overflow-y-auto">
            {results.map((team) => (
              <button
                key={team.id}
                onClick={() => handleSelect(team)}
                className="flex w-full items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors"
              >
                <img src={team.logo} alt={team.name} className="h-8 w-8 object-contain" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">{team.name}</p>
                  <p className="text-xs text-muted-foreground">{team.country}</p>
                </div>
              </button>
            ))}
          </div>
        )}
        {loading && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover p-4 text-center text-sm text-muted-foreground">
            Searching...
          </div>
        )}
      </div>
    </div>
  );
}
