import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HangmanService } from '../hangman.service';

@Component({
  selector: 'app-game',
  standalone: true, // Add standalone configuration
  imports: [CommonModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent implements OnInit {
  currentWord: string = '';
  currentHint: string = '';
  letters: string[] = [];
  guessedLetters: string[] = []; // Fixed naming
  wrongLetters: string[] = [];
  maxWrong: number = 6;
  alphabet: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  over: number = 0;
   isVisible = false;
   resultText: string = '';
correct: boolean = false;


  constructor(private wordList: HangmanService) {}

  ngOnInit(): void {
const wordObj =this.wordList.getRandomWord();
this.currentWord= wordObj.word.toUpperCase();
this.currentHint = wordObj.hint;
this.letters = this.currentWord.split('');
console.log(this.currentHint, 'Hint:', this.currentWord);
  }

  get WrongGuessesCount():number{
    return this.wrongLetters.length
  }




  handleGuess(letter: string): void {
 

  if (this.letters.includes(letter)) {
    this.guessedLetters.push(letter);
  } else {
    this.wrongLetters.push(letter);
  }
 
 
 
  const hasWon = this.letters.every(l => this.guessedLetters.includes(l));
  if (hasWon) {
    
    this.correct = true;
  setTimeout(() => {  
    this.isVisible = true;
    console.log('===> WIN GAME');
    this.over =2;
    this.resultText = 'Congratulations! You guessed the word!';


console.log(this.over);
  }, 500); // Delay to show the win message
 
  }

  // Kiểm tra thua
  if (this.wrongLetters.length >= this.maxWrong) {
  
  this.correct = false;
  
    setTimeout(() => {
     this.isVisible = true;
    
    console.log('===> LOSE GAME');
        this.over = 1;

 

    this.resultText = `Game Over! `;
   }, 1000); // Delay to show the lose message
   
   
  
  }






}




restart(): void{
  this.isVisible = false;
  this.over = 0;
  this.wrongLetters = [];
  this.guessedLetters = [];
  const wordObj = this.wordList.getRandomWord();
  this.currentWord = wordObj.word.toUpperCase();
  this.currentHint = wordObj.hint;
  this.letters = this.currentWord.split('');
  console.log(this.currentHint, 'Hint:', this.currentWord);
  


}


}
