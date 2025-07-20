import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, query, orderBy, limit, Timestamp, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AuthServiceService } from './auth-service.service';

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
  constructor(private firestore: Firestore, private authService: AuthServiceService) {}

  async saveScore(uid: string, email: string, name: string, newScore: number, time: Date): Promise<void> {
  const userScoreRef = doc(this.firestore, 'scores', uid);
  const docSnap = await getDoc(userScoreRef);

  if (docSnap.exists()) {
    const existingData = docSnap.data() as ScoreEntry;
    if (newScore > existingData.score) {
      console.log(`Updating score from ${existingData.score} to ${newScore}`);
      await this.updateScoreData(uid, email, name, newScore, time);
    } else {
      console.log(`New score ${newScore} is not higher than existing score ${existingData.score}. No update made.`);
    }
  } 
  
  else {
    console.log('No existing score. Creating new record.');
    await this.updateScoreData(uid, email, name, newScore, time);
  }
}

private async updateScoreData(uid: string, email: string, name: string, score: number, time: Date): Promise<void> {
  const scoreRef = doc(this.firestore, 'scores', uid);
  await setDoc(scoreRef, {
    email,
    name,
    score,
    time: Timestamp.fromDate(time)
  }, { merge: true });

  const userRef = doc(this.firestore, 'users', uid);
  await setDoc(userRef, {
    email,
    score
  }, { merge: true });

  console.log(`Updated both 'scores' and 'users' collections for ${email}`);
}




  

  getTopScores(limitCount: number = 10): Observable<ScoreEntry[]> {
    const scoresCollection = collection(this.firestore, 'scores');
    const topQuery = query(scoresCollection, orderBy('score', 'desc'), limit(limitCount));

    return collectionData(topQuery, { idField: 'id' }) as Observable<ScoreEntry[]>;
  }
}
