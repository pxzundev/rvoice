import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { FormBuilder, FormGroup } from '@angular/forms';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'RVoicesAngular8';
  req: ApiReq;
  res: any;
  apiKey: any;
  processing = false;
  ttsForm: FormGroup;


  constructor(private fb: FormBuilder, private http: HttpClient, private sanitizer: DomSanitizer) {
    this.ttsForm = this.fb.group({
      apiKey: localStorage.getItem('apiKey'),
      inputText: '',
      langCode: ['en-US'],
      voiceName: ['Wavenet-D'],
      speed: ['1'],
      pitch: ['1']
    });

    // this.apiKey = localStorage.getItem('apiKey')
    // console.log(this.apiKey);
  }

  onSubmit() {
    this.processing = true;
    this.req = {
      audioConfig: {
        audioEncoding: 'LINEAR16',
        pitch: this.ttsForm.value.pitch,
        speakingRate: this.ttsForm.value.speed

      },
      input: {
        text: this.ttsForm.value.inputText
      },
      voice: {
        languageCode: this.ttsForm.value.langCode,
        name: this.ttsForm.value.langCode + '-' + this.ttsForm.value.voiceName
      }
    };
    // console.log(this.req);
    localStorage.setItem('apiKey', this.ttsForm.value.apiKey);
    this.res = undefined;
    this.http.post('https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=' + this.ttsForm.controls.apiKey.value, this.req, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .subscribe(data => {

      this.res = this.sanitizer.bypassSecurityTrustResourceUrl('data:audio/mp3;base64,' + data['audioContent']);
      this.processing = false;

    });
  }

  clearStorage() {
    localStorage.clear();
    this.ttsForm.controls.apiKey.reset();
  }
}

export interface ApiReq {

  audioConfig: {
    audioEncoding: string,
    pitch: string
    speakingRate: string

  };
  input: {
    text: string
  };
  voice: {
    languageCode: string,
    name: string
  };

}
