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
  // req: ApiReq;
  req: any;
  res: any;
  apiKey: any;
  processing = false;
  errorProcessing = false;
  ttsForm: FormGroup;


  constructor(private fb: FormBuilder, private http: HttpClient, private sanitizer: DomSanitizer) {
    this.ttsForm = this.fb.group({
      apiKey: localStorage.getItem('apiKey'),
      inputText: localStorage.getItem('textContent'),
      langCode: ['en-US'],
      voiceName: ['Wavenet-D'],
      speed: ['1'],
      pitch: ['1'],
      gender: ['NEUTRAL'],
    });

    // this.apiKey = localStorage.getItem('apiKey')
    // console.log(this.apiKey);
  }

  onSubmit() {
    console.log(this.ttsForm.value.langCode + '-' + this.ttsForm.value.voiceName);
    this.processing = true;
    this.req = {
      audioConfig: {
        audioEncoding: 'LINEAR16',
        pitch: this.ttsForm.value.pitch,
        speakingRate: this.ttsForm.value.speed

      },
      input: {
        // text: this.ttsForm.value.inputText,
        ssml: this.ttsForm.value.inputText,
        // ssml: '<speak>hello</speak>',
      },
      voice: {
        languageCode: this.ttsForm.value.langCode,
        name: this.ttsForm.value.langCode + '-' + this.ttsForm.value.voiceName,
        ssmlGender: this.ttsForm.value.gender
      }
    };
    // console.log(this.req);
    localStorage.setItem('apiKey', this.ttsForm.value.apiKey);
    localStorage.setItem('textContent', this.ttsForm.value.inputText);
    this.res = undefined;
    this.http.post('https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=' + this.ttsForm.controls.apiKey.value, this.req, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .subscribe(data => {
      this.res = this.sanitizer.bypassSecurityTrustResourceUrl('data:audio/mp3;base64,' + data['audioContent']);
      this.processing = false;
    },
    error => {
      // console.log(error.error.error.status);
      this.errorProcessing = true;
    },
    );
  }

  clearStorage() {
    localStorage.clear();
    this.ttsForm.controls.apiKey.reset();
  }

  closeAlert() {
    this.errorProcessing = false;
    this.processing = false;
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
