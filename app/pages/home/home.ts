import {NavController, LoadingController, AlertController, Platform} from 'ionic-angular';
import {Component} from '@angular/core';
import {Http, Headers} from '@angular/http'
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/retry';

import {FormatDatePipe} from '../pipes/pipes';

declare var cordova;
declare var window;

interface Event {
  id: number;
  title: string;
  description: string;
  image: string;
  url: string;
  date: string;
  attending: number;
  host: string;
  status: string;
}

@Component({
  templateUrl: 'build/pages/home/home.html',
  pipes: [FormatDatePipe]
})
export class HomePage {
  events: Array<Event> = null;
  constructor(
    private navCtrl: NavController,
    private http: Http,
    private loadingCtrl: LoadingController,
    private platform: Platform,
    public alertCtrl: AlertController
  ) {
  }

  ionViewWillEnter() {
    this.platform.ready().then( () => {
      this.retrieveEvents(); 
    });
  }

  retrieveEvents(callbackFn: Function=null, errorFn: Function=null) {
    // Clear the badge count
    cordova.plugins.notification.badge.set(0);

    let url='https://www.partmarine.com/urban_diversion/events.json';
    let loading = this.loadingCtrl.create();
    loading.present();
    this.http
        .get(url)
        .retry(1)
        .timeout(5000)
        .map(res => res.json())
        .subscribe( (data) => {
          loading.dismiss();
          this.events = data;
          if (callbackFn)
            callbackFn(data);
        }, (err) => {
          loading.dismiss();
          if (errorFn)
            errorFn(err);
        });
  }

  openEvent(event: Event) {  
    cordova.InAppBrowser.open(event.url, "_system", "location=true");
  }

  shareEvent(event: Event) {
    let options = {
      message: event.title,
      subject: event.title,
      url: event.url
    }
    window.plugins.socialsharing.shareWithOptions(options, () => {}, () => {});
  }

  addToCalendar(event: Event) {
    let startDate = new Date(event.date);
    let d = new Date();
    startDate.setMinutes(startDate.getMinutes() + d.getTimezoneOffset());
    let endDate = new Date(event.date);
    endDate.setMinutes(endDate.getMinutes() + d.getTimezoneOffset());
    endDate.setHours(endDate.getHours()+2); 
    let title = event.title;
    let notes = event.description;
    let location = event.url;

    window.plugins.calendar.createEvent(title, location, notes, startDate, endDate, () => {
      let alert = this.alertCtrl.create({
        title: 'Success',
        message: 'Event added to your calendar!',
        buttons: [{text: 'OK', handler:() => {} }]
      });
      alert.present();
    }, () => {
      let alert = this.alertCtrl.create({
        title: 'Error',
        message: 'Sorry, there has been a problem :(',
        buttons: [{text: 'OK', handler:() => {} }]
      });
      alert.present();
    });
  }

  doRefresh(refresher) {
    this.retrieveEvents(
      () => {
        refresher.complete();
      },
      () => {
        refresher.complete();
    });
  }
}
