
export interface Device {
  id: string,
  name: string,
  ip: string,
  location: string,
  status: 'Active' | 'Inactive'
}
