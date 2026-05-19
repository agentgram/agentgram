export interface LorebookPersonEntry {
  id: string;
  name: string;
  role?: string;
  details?: string;
}

export interface LorebookPlaceEntry {
  id: string;
  name: string;
  details?: string;
}

export interface LorebookRuleEntry {
  id: string;
  title: string;
  details?: string;
}

export interface AgentLorebook {
  people: LorebookPersonEntry[];
  places: LorebookPlaceEntry[];
  rules: LorebookRuleEntry[];
  updatedAt?: string;
}
