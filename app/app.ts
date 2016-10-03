import {Component} from '@angular/core';
import {Platform, ionicBootstrap} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {Http, Headers} from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/retry';
import {TabsPage} from './pages/tabs/tabs';

declare var cordova;
declare var window;

@Component({
  template: '<ion-nav [root]="rootPage"></ion-nav>'
})
export class MyApp {

  private rootPage: any;

  constructor(
    private platform: Platform,
    public http: Http
  ) {
    this.rootPage = TabsPage;

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();

      window.plugins.OneSignal.init("9ec5e219-625f-42a5-a192-50085f4dccdc",
                                    {googleProjectNumber: "   "},
                                    () => {});
      this.http.get('https://www.partmarine.com/urban_diversion/app')
               .subscribe( (data) => {} );

      // Set background fetch
      var Fetch = window.BackgroundFetch;
      Fetch.configure( () => {
        let today = new Date();

        let day = today.getDate().toString();
        let month = today.getMonth().toString();
        let year = today.getFullYear().toString();
        let date = year + '-' + month + '-' + day;
        let lastCheckedDate = window.localStorage.getItem('date');

        if (date == lastCheckedDate) {
          //console.log('Notify only once a day');
          Fetch.finish();
          return;
        }  

        let url='https://www.partmarine.com/urban_diversion/events.json?filter=today';
        this.http
            .get(url)
            .retry(2)
            .timeout(15000)
            .map(res => res.json())
            .subscribe( (events) => {
               window.localStorage.setItem('date', date);
               if (events.length > 0)
                 cordova.plugins.notification.badge.set(events.length);
               Fetch.finish();
             }, (err) => {
               Fetch.finish();
             });
      }, () => {}, {
        stopOnTerminate: false
      });

    });
  }
  post(url: string, params: Object) {
    let creds = '';
    for (var key in params) {
      if (params.hasOwnProperty(key)) {
        creds = creds + key + "=" + params[key] + "&";
      }
    }

    let headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    this.http.post(url, creds, { headers: headers });
  }
}

ionicBootstrap(MyApp);
