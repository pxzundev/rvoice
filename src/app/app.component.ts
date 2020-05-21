import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as textFieldEdit from 'text-field-edit';
import { BsDropdownConfig } from 'ngx-bootstrap/dropdown';

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
    // const resetButton = document.querySelector('.js-markdown-reset-field');
  }

  insertText() {
    const input = document.querySelector('textarea');
    textFieldEdit.insert(input, '🥳');
  }

  wrapText() {
    const field = document.querySelector('textarea');
    textFieldEdit.wrapSelection(field, '(', '****');
  }

  insertBreak(param: string) {
    const input = document.querySelector('textarea');

    if (param === 'x-weak' || param === 'weak' || param === 'medium' || param === 'strong' || param === 'x-strong') {
      textFieldEdit.insert(input, '<break strength="' + param + '"/>');
    } else {
      textFieldEdit.insert(input, '<break time="' + param + '"/>');
    }

  }

  interpretAs(param: any) {
    const field = document.querySelector('textarea');
    textFieldEdit.wrapSelection(field, '<say-as interpret-as="' + param + '">', '</say-as>')
  }

  emphasis(param: any) {
    const field = document.querySelector('textarea');
    textFieldEdit.wrapSelection(field, '<emphasis level="' + param + '">', '</emphasis>')
  }

  wrapPara(param: any) {
    const field = document.querySelector('textarea');

    if (param === 'p') {
      textFieldEdit.wrapSelection(field, '<p>', '</p>')
    } else {
      textFieldEdit.wrapSelection(field, '<s>', '</s>')

    }
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
        ssml: '<speak>' + this.ttsForm.value.inputText + '</speak>',
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
