import { Injectable, inject } from '@angular/core';
// import {
//   Firestore,
//   collection,
//   collectionData,
//   addDoc,
//   query,
//   orderBy,
//   limit
// } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface ScoreEntry {
  email: string;
  score: number;
  time: Date;
}

@Injectable({ providedIn: 'root' })
export class ScoreService {
  // private readonly firestore = inject(Firestore); // ✅ dùng inject()

  saveScore(email: string, score: number) {
  //   const scoreRef = collection(this.firestore, 'scores');
  //   return addDoc(scoreRef, {
  //     email,
  //     score,
  //     time: new Date()
  //   });
  // }

  // getTopScores(): Observable<ScoreEntry[]> {
  //   const scoresRef = collection(this.firestore, 'scores');
  //   const q = query(scoresRef, orderBy('score', 'desc'), limit(5));
  //   return collectionData(q, { idField: 'id' }) as Observable<ScoreEntry[]>;
  // }
}
}