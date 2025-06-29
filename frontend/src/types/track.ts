export interface Track {
  id: number;
  name: string;
  users?: User[];
  configuredCriteria?: ConfiguredCriterion[];
  userHistory?: UserTrack[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  position?: Position;
  unit?: Unit;
}

export interface Position {
  id: number;
  name: string;
}

export interface Unit {
  id: number;
  name: string;
}

export interface ConfiguredCriterion {
  id: number;
  criterionId: number;
  trackId: number;
  unitId: number;
  positionId: number;
  mandatory: boolean;
  criterion: Criterion;
  unit: Unit;
  position: Position;
}

export interface Criterion {
  id: number;
  name: string;
  generalDescription: string;
  active: boolean;
}

export interface UserTrack {
  id: number;
  userId: number;
  trackId: number;
  start: string;
  end?: string;
  user: User;
  track: Track;
}

export interface CreateTrackDto {
  name: string;
}

export interface UpdateTrackDto {
  name?: string;
} 