export type StatusFlagsShownSuggestedField = FlagsShownSuggestedField & {
  status: 'playing' | 'win' | 'lost';
};

export type FlagsShownSuggestedField = ShownSuggestedField & {
  flags: Set<Point>;
};

export type ShownSuggestedField = SuggestedField & {
  shown: Set<Point>;
};

export type SuggestedField = Field & {
  suggestions: Map<Point, number>;
};

export type Field = Size & { mines: Set<Mine> };

export type Size = { width: number; height: number };

export type Mine = Point;
export type Point = string;
