import { isPlatformBrowser } from '@angular/common';
import { Injectable,Inject,PLATFORM_ID  } from '@angular/core';
import { wordList } from './wordlist';


export interface WordItem {
  word: string;
  hint: string;
}
@Injectable({
  providedIn: 'root'
})


export class HangmanService {


  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

 

getWordList(): WordItem[] {
  return wordList;
}
  getRandomWord() {
    const index = Math.floor(Math.random() * this.getWordList().length);
    return this.getWordList()[index];
  }




}
