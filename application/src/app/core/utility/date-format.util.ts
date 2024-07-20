export function formatDateTime(date: Date): string {
   // extract day / month /year
    let day: number | string = date.getDate();
    let month: number | string = date.getMonth() + 1; // Monate sind nullbasiert
    let year: number | string = date.getFullYear();

    // extract hours / minutes / seconds
    let hours: number | string = date.getHours();
    let minutes: number | string = date.getMinutes();
    let seconds: number | string = date.getSeconds();

    // pad with leading zeros where necessary
    if (day < 10) day = '0' + day;
    if (month < 10) month = '0' + month;
    if (hours < 10) hours = '0' + hours;
    if (minutes < 10) minutes = '0' + minutes;
    if (seconds < 10) seconds = '0' + seconds;

    // combine and return
    return `${day}.${month}.${year} - ${hours}:${minutes}:${seconds}`;
}
