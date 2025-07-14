import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HangmanService } from '../hangman.service';
import { ScoreEntry, ScoreService } from '../score.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { FormsModule } from '@angular/forms';

type GameStatus = 0 | 1 | 2; 

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent {
  playerName: string = '';
  playerEmail: string = '';
  isGameStarted: boolean = false;

  currentWord = '';
  currentHint = '';
  letters: string[] = [];
  alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  private letter$ = new Subject<string>();
  guessedLetter$ = new BehaviorSubject<string[]>([]);
  wrongLetter$ = new BehaviorSubject<string[]>([]);
  gameStatus$ = new BehaviorSubject<GameStatus>(0);

  resultText = '';
  isVisible = false;
  correct = false;
  score = 0;
  bestScore = 0;
  play = '';
  topScores: ScoreEntry[] = [];

  constructor(
    private wordList: HangmanService,
    private scoreService: ScoreService
  ) {}

  startGame() {
    if (this.playerName && this.playerEmail) {
      this.isGameStarted = true;
      this.loadBestScore();
      this.newWord();
      this.initSubscription();
      this.loadTopScores();
    } else {
      alert('Vui lòng nhập tên và email trước khi bắt đầu!');
    }
  }

  private loadTopScores() {
    this.scoreService.getTopScores().subscribe(scores => {
      this.topScores = scores;
    });
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  private loadBestScore() {
    if (this.isBrowser()) {
      const saveBest = localStorage.getItem('bestScore');
      this.bestScore = saveBest ? Number(saveBest) : 0;
    }
  }

  private newWord() {
    const wordObj = this.wordList.getRandomWord();
    this.currentWord = wordObj.word.toUpperCase();
    this.currentHint = wordObj.hint;
    this.letters = this.currentWord.split('');
    this.guessedLetter$.next([]);
    this.wrongLetter$.next([]);
    this.gameStatus$.next(0);
    this.isVisible = false;
    this.resultText = '';
    console.log(this.currentWord)
  }

  public emitLetter(letter: string) {
    this.letter$.next(letter.toUpperCase());
  }

  private initSubscription() {
    this.letter$.subscribe((letter) => {
      const guessed = this.guessedLetter$.value.includes(letter);
      const wrong = this.wrongLetter$.value.includes(letter);
      if (guessed || wrong) return;

      if (this.letters.includes(letter)) {
        this.guessedLetter$.next([...this.guessedLetter$.value, letter]);
      } else {
        this.wrongLetter$.next([...this.wrongLetter$.value, letter]);
      }

      const hasWon = this.letters.every(l => this.guessedLetter$.value.includes(l));
      if (hasWon) {
        this.gameStatus$.next(2);
      } else if (this.wrongLetter$.value.length >= 6) {
        this.gameStatus$.next(1);
      }
    });

    this.gameStatus$.subscribe((status) => {
      if (status === 2) {
        this.handleWin();
      } else if (status === 1) {
        this.handleLose();
      }
    });
  }

  private handleWin() {
    this.correct = true;
    this.score += 10;

    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem('bestScore', this.bestScore.toString());
    }

    setTimeout(() => {
      this.isVisible = true;
      this.resultText = '🎉 You Win';
      this.play = 'Continute';
    }, 500);
  }

  private handleLose() {
    this.correct = false;

    // Kiểm tra nếu điểm cao hơn người cuối top 10
    if (this.topScores.length < 10 || this.score > this.topScores[this.topScores.length - 1].score) {
      this.savePlayerScore();
    }

    setTimeout(() => {
      this.isVisible = true;
      this.resultText = '💀 Game Over!';
      this.play = 'Play Again';
      this.score = 0;
    }, 1000);
  }

  private savePlayerScore() {
    if (this.playerName && this.playerEmail) {
      this.scoreService.saveScore(this.playerEmail, this.playerName, this.score, new Date())
        .then(() => {
          console.log('Score saved');
          this.loadTopScores();
        })
        .catch(error => console.error('Error saving score:', error));
    }
  }

  get wrongGuessesCount(): number {
    return this.wrongLetter$.value.length;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (!this.isGameStarted) return;

    const key = event.key.toUpperCase();
    if (key.length === 1 && key >= 'A' && key <= 'Z') {
      this.letter$.next(key);
    }
  }

  restart(): void {
    this.newWord();
  }
}
