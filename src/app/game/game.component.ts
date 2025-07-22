  import { Component, HostListener } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { HangmanService } from '../hangman.service';
  import { ScoreEntry, ScoreService } from '../score.service';
  import { BehaviorSubject, from, fromEvent, Subject, Subscription } from 'rxjs';
  import { FormsModule } from '@angular/forms';
  import { AuthServiceService } from '../auth-service.service';

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
    avatarUrl: string = ''; // Default avatar URL
    isGameStarted: boolean = false;

    currentWord = '';
    currentHint = '';
    letters: string[] = [];
    alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    private letter$ = new Subject<string>();
    guessedLetter$ = new BehaviorSubject<string[]>([]);
    wrongLetter$ = new BehaviorSubject<string[]>([]);
    gameStatus$ = new BehaviorSubject<GameStatus>(0);
    menuOpen$=new BehaviorSubject<boolean>(false);
    resultText = '';
    isVisible = false;
    correct = false;
    score = 0;
    bestScore = 0;
    play = '';
    topScores: ScoreEntry[] = [];

    isEditingName = false;
    tempName = '';



    private letterSub?: Subscription;
    private statusSub?: Subscription;

    constructor(
      private wordList: HangmanService,
      private scoreService: ScoreService,
      private authService: AuthServiceService
    ) {        this.loadTopScores();
}

    startGame() {
      if (this.playerName && this.playerEmail) {
        this.isGameStarted = true;
    
        this.newWord();
        this.initSubscription();
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
      this.letterSub =this.letter$.subscribe((letter) => {
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

      this.statusSub = this.gameStatus$.subscribe((status) => {
        if (status === 2) {
          this.handleWin();
        } else if (status === 1) {
          this.handleLose();
        }
      });
    }
    ngOnDestroy() {
      this.letterSub?.unsubscribe();
      this.statusSub?.unsubscribe();
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
  const uid = this.authService.user?.uid ?? this.authService.currentUser?.uid;
  const email = this.playerEmail;
  const name = this.playerName;
  
  if (!uid) {
    console.error('UID is missing, cannot save score.');
    return;
  }

  this.scoreService.saveScore(uid, email, name, this.score, new Date())
    .then(() => {
      console.log('Score saved');
      this.loadTopScores();
    })
    .catch(error => console.error('Error saving score:', error));
}

    get wrongGuessesCount(): number {
      return this.wrongLetter$.value.length;
    }

    @HostListener('window:keydown', ['$event'])
    handleKeyDown(event: KeyboardEvent) {
      if (!this.isGameStarted) return;
      if (this.isEditingName) return;
      const key = event.key.toUpperCase();
      if (key.length === 1 && key >= 'A' && key <= 'Z') {
        this.letter$.next(key);
      }
    }

    restart(): void {
      this.newWord();
    }

async loginGoogle() {
  const user = await this.authService.signInWithGoogle();
  if (user) {
    this.playerEmail = user.email || '';
    this.avatarUrl = user.photoURL ?? '';
    console.log('User logged in:', user);

    const profile = await this.authService.getUserProfile(user.uid);
    if (profile) {
      console.log('Loaded profile from Firestore:', profile);
      this.playerName = profile.name || user.displayName || '';
      this.bestScore = profile.score;
      console.log('bestScore after loading profile:', this.bestScore);
    } else {
      this.playerName = user.displayName || '';
    }

    this.startGame();
  }
}



  openMenu() {
    this.menuOpen$.next(!this.menuOpen$.value);
  }


 changeName() {
  const uid = this.authService.user?.uid ?? this.authService.currentUser?.uid;
  if (!uid) {
    console.error('UID is missing, cannot update name.');
    return;
  }

  const newName = prompt('Enter your name:', this.playerName);
  if (newName) {
    this.playerName = newName;
    console.log('Updating name for UID1:', uid);
    this.authService.updateName(uid, this.playerName)

      .then(() => {
        console.log('Name updated successfully');
        console.log('Updating name for UID2:', uid);
      })
      .catch(error => console.error('Error updating name:', error));
  }
}


enableEdit() {
  this.isEditingName = true;
  this.tempName = this.playerName;
}

cancelEdit() {
  this.isEditingName = false;
}

saveName() {
  const uid = this.authService.user?.uid ?? this.authService.currentUser?.uid;
  if (!uid || !this.tempName.trim()) {
    console.error('UID missing or name empty');
    return;
  }

  this.authService.updateName(uid, this.tempName)
    .then(() => {
      this.playerName = this.tempName;
      this.isEditingName = false;
      console.log('Name updated successfully');
    })
    .catch(error => console.error('Error updating name:', error));
}

  changeAvatar(){

    

    
  }

  logOut() {
   
    this.authService.logout().then(() => {
      console.log('User logged out');
      this.isGameStarted = false;
      this.playerName = '';
      this.playerEmail = '';
      this.avatarUrl = '';
      this.score = 0;
      this.bestScore = 0;
      this.guessedLetter$.next([]);
      this.wrongLetter$.next([]);
      this.gameStatus$.next(0);
    }).catch(error => {
      console.error('Error during logout:', error);
    });
  }
  }
  //eventloop, bat dong bo, devtool(debbugger)