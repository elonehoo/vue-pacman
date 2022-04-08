export interface GlobalEnv {
  COLOR: string[],
  COS: number[],
  SIN: number[],
  SCORE: number,
  LIFE: number,
  NPC_COUNT: number
}

export interface Coord {
  x: number,
  y: number,
  offset: number
}

export interface Vector {
  x: number,
  y: number,
  change?: number
}
