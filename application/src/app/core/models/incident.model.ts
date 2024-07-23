
export interface Incident {
  id: string,
  timestamp_start: Date,
  timestamp_end: Date,
  deviceID: string,
  incidentType: IncidentType[]
}

export type IncidentType = 'person_with_full_safety' | 'person_only_with_jacket' | 'person_only_with_helmet' | 'person_without_safety';
