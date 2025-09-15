export interface HouseTotals {
  Gryff: number;
  Slyth: number;
  Raven: number;
  Huff: number;
}

export interface LeaderboardData {
  '5min': HouseTotals;
  '1hour': HouseTotals;
  'all': HouseTotals;
}

export type TimeWindow = '5min' | '1hour' | 'all';

export interface HouseEntry {
  name: string;
  points: number;
  color: string;
  emoji: string;
}
