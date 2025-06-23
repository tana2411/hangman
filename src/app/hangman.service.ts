import { isPlatformBrowser } from '@angular/common';
import { Injectable,Inject,PLATFORM_ID  } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HangmanService {
private wordList = [
    {
        word: "guitar",
        hint: "A musical instrument with strings."
    },
    {
        word: "oxygen",
        hint: "A colorless, odorless gas essential for life."
    },
    {
        word: "mountain",
        hint: "A large natural elevation of the Earth's surface."
    },
    {
        word: "painting",
        hint: "An art form using colors on a surface to create images or expression."
    },
    {
        word: "astronomy",
        hint: "The scientific study of celestial objects and phenomena."
    },
    
];
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  getWords() {
    return this.wordList;
  }

  getRandomWord() {
    const index = Math.floor(Math.random() * this.wordList.length);
    return this.wordList[index];
  }




}
