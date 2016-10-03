import {Pipe} from '@angular/core';

@Pipe({
  name: 'formatDate'
})
export class FormatDatePipe {
  transform(dateStr: string): string {
    let d = new Date();
    let date = new Date(dateStr);
    date.setMinutes(date.getMinutes() + d.getTimezoneOffset());

    let monthNames = [
      "Jan", "Feb", "Mar",
      "Apr", "May", "Jun", "Jul",
      "Aug", "Sep", "Oct",
      "Nov", "Dec"
    ];

    let suffix: string = "AM";
    let hours = date.getHours();

    if (hours >= 12) 
      suffix = "PM";
    if (hours > 12) 
      hours = hours-12;

    let minutes = date.getMinutes();

    let minutesStr = minutes.toString()
    if (minutes < 10) {
      minutesStr = '0' + minutes.toString();
    }

    let day = date.getDate();
    let monthIndex = date.getMonth();
    let year = date.getFullYear();

    let returnValue =  monthNames[monthIndex] + ' ' + day + ', ' + hours + ':' + minutesStr + ' ' + suffix;
    return returnValue;
  }
}
