import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HangmanService } from '../hangman.service';
import { AuthServiceService } from '../auth-service.service'; // Import the AuthService
import { ScoreEntry, ScoreService } from '../score.service'; // Import the ScoreService
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
  guessedLetters: string[] = []; 
  wrongLetters: string[] = [];
  maxWrong: number = 6;
  alphabet: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  over: number = 0; 
   isVisible = false;
   resultText: string = '';
correct: boolean = false;
score: number = 0;
bestScore: number = 0;
play:string ='';
topScores: ScoreEntry[] = []; // Array to hold top scores
  constructor(
     public authService: AuthServiceService, 
    private wordList: HangmanService,
    private scoreService: ScoreService // Inject the ScoreService
  ) {

  

  }

  ngOnInit(): void {
const wordObj =this.wordList.getRandomWord();
this.currentWord= wordObj.word.toUpperCase();
this.currentHint = wordObj.hint;
this.letters = this.currentWord.split('');
console.log(this.currentHint, 'Hint:', this.currentWord);

 if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const saveBest = localStorage.getItem('bestScore');
    this.bestScore = saveBest ? Number(saveBest) : 0;
  }


  // this.scoreService.getTopScores().subscribe((scores: ScoreEntry[]) => {
  //   this.topScores = scores;
  // })
  } 

  get WrongGuessesCount():number{
    return this.wrongLetters.length
  }




  handleGuess(letter: string): void {
  if (this.letters.includes(letter)) {
    this.guessedLetters.push(letter);
    console.log(`Phím "${letter}" nằm trong từ cần đoán!`);
  } else {
    this.wrongLetters.push(letter);
    console.log(`Phím "${letter}" không nằm trong từ.`);
  }

  const hasWon = this.letters.every(l => this.guessedLetters.includes(l));
  if (hasWon) {
    this.correct = true;
    this.score += 10;

  //  const email =this.authService.getUserEmail();
  //  if(email){
  //   this.scoreService.saveScore(email, this.score)
  //  }
   if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem('bestScore', this.bestScore.toString());
    }
    setTimeout(() => {

    
      this.isVisible = true;
      this.over = 2;
            this.play = 'continue';

      this.resultText = 'Congratulations! You guessed the word!';
    }, 500);
  }

  if (this.wrongLetters.length >= this.maxWrong) {
    this.correct = false;
    setTimeout(() => {
      this.isVisible = true;
      this.over = 1;
            this.play = 'Play Again';

      this.resultText = 'Game Over!';
      this.score = 0; 
    }, 1000);
  }
}



restart(): void {
  this.isVisible = false;      
  this.over = 0;                 
  this.wrongLetters = [];        
  this.guessedLetters = [];
  this.resultText = '';         
  

  const wordObj = this.wordList.getRandomWord();
  this.currentWord = wordObj.word.toUpperCase();
  this.currentHint = wordObj.hint;
  this.letters = this.currentWord.split('');

  console.log(this.currentHint, 'Hint:', this.currentWord);
}

@HostListener('window:keydown', ['$event'])
handleKeyDown(event: KeyboardEvent) {
  const key = event.key.toUpperCase();

  if (key.length !== 1 || key < 'A' || key > 'Z') return;


  if (this.guessedLetters.includes(key) || this.wrongLetters.includes(key)) {
    console.log(`Phím "${key}" đã được đoán rồi!`);
    return;
  }


  this.handleGuess(key);
}

}
