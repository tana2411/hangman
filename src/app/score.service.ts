import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, query, orderBy, limit, Timestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface ScoreEntry {
  email: string;
  name: string;
  score: number;
  time: Timestamp;
}

@Injectable({
  providedIn: 'root'
})
export class ScoreService {
  constructor(private firestore: Firestore) {}

  saveScore(email: string, name: string, score: number, time: Date): Promise<void> {
 const scoresCollection = collection(this.firestore, 'scores');
    const scoreData: ScoreEntry = {
      email: email,
      name: name,
      score: score,
      time: Timestamp.fromDate(time)
    };
    return addDoc(scoresCollection, scoreData).then(() => {});
  }

  getTopScores(limitCount: number = 10): Observable<ScoreEntry[]> {
    const scoresCollection = collection(this.firestore, 'scores');
    const topQuery = query(scoresCollection, orderBy('score', 'desc'), limit(limitCount));

    return collectionData(topQuery, { idField: 'id' }) as Observable<ScoreEntry[]>;
  }
}
