import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HangmanService } from '../hangman.service';
import e from 'express';

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
score: number = 0;
bestScore: number = 0;


  constructor(private wordList: HangmanService) {

  

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

    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem('bestScore', this.bestScore.toString());
    }

    setTimeout(() => {
      this.isVisible = true;
      this.over = 2;
      this.resultText = 'Congratulations! You guessed the word!';
    }, 500);
  }

  if (this.wrongLetters.length >= this.maxWrong) {
    this.correct = false;
    setTimeout(() => {
      this.isVisible = true;
      this.over = 1;
      this.resultText = 'Game Over!';
    }, 1000);
  }
}



restart(): void {
  this.isVisible = false;        // Ẩn ảnh thắng/thua
  this.over = 0;                 // Trạng thái game chưa kết thúc
  this.wrongLetters = [];        // Xóa các phím sai
  this.guessedLetters = [];      // Xóa các phím đã đoán
  this.resultText = '';          // Xóa thông báo kết quả (nếu có)
  

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

  // Nếu đã đoán rồi thì không làm gì nữa
  if (this.guessedLetters.includes(key) || this.wrongLetters.includes(key)) {
    console.log(`Phím "${key}" đã được đoán rồi!`);
    return;
  }

  // ✅ Giao toàn bộ cho handleGuess
  this.handleGuess(key);
}

}
