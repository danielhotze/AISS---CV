export const environment = {
  production: false,
  name: 'dev',
  api: {
    base_url: 'http://localhost:3000/api',
    get devices_url() { return `${this.base_url}/devices`},
    device_connect_url(deviceId: string) {return `${this.devices_url}/connect/${deviceId}`},
    get incidents_url() { return `${this.base_url}/incidents`},
    get incident_images_url() { return `${this.base_url}/incidentImages`},
    images_by_incident_url(incidentId: string) {return `${this.incident_images_url}/${incidentId}`}
  },
  images: {
    base_url: '/PPE-Detection_uploads',
    image_url(imageName: string) {return `${this.base_url}/${imageName}`}
  }
}
