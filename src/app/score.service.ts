import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, query, orderBy, limit, Timestamp, doc, getDoc, setDoc } from '@angular/fire/firestore';
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

  async saveScore(email: string, name: string, newScore: number, time: Date): Promise<void> {
    const userScoreRef = doc(this.firestore, 'scores', email);
    const docSnap = await getDoc(userScoreRef);

    if (docSnap.exists()) {
      const existingData = docSnap.data() as ScoreEntry;

      if (newScore > existingData.score) {
        console.log(`Updating score from ${existingData.score} to ${newScore}`);
        await setDoc(userScoreRef, {
          email,
          name,
          score: newScore,
          time: Timestamp.fromDate(time)
        }, { merge: true });
      } else {
        console.log(`New score ${newScore} is not higher than existing score ${existingData.score}. No update made.`);
      }
    } else {
      console.log('No existing score. Creating new record.');
      await setDoc(userScoreRef, {
        email,
        name,
        score: newScore,
        time: Timestamp.fromDate(time)
      });
    }
  }

  getTopScores(limitCount: number = 10): Observable<ScoreEntry[]> {
    const scoresCollection = collection(this.firestore, 'scores');
    const topQuery = query(scoresCollection, orderBy('score', 'desc'), limit(limitCount));

    return collectionData(topQuery, { idField: 'id' }) as Observable<ScoreEntry[]>;
  }
}
