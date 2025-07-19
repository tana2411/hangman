import { Injectable } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, User, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { ScoreEntry } from './score.service';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {
  user: User | null = null;

  constructor(private auth: Auth, private firestore: Firestore) {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.user = user;
        this.loadUserProfile(user.uid);
      }
    });
  }

  async signInWithGoogle(): Promise<User | null> {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this.auth, provider);
      this.user = result.user;

      console.log(this.user.uid, this.user.email);

      // Tạo profile nếu chưa có, mặc định điểm là 0
      await this.createProfileUser(this.user.uid, this.user.email, 0);

      return this.user;
    } catch (error) {
      console.error('login failed', error);
      return null;
    }
  }

  get currentUser(): User | null {
    return this.auth.currentUser;
  }

  async createProfileUser(uid: string, email: string | null, score: number) {
    const userRef = doc(this.firestore, 'users', uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      await setDoc(userRef, {
        email: email,
        score: score
      });
      console.log('User profile created with score:', score);
    } else {
      console.log('User profile already exists');
    }
  }

  async loadUserProfile(uid: string) {
    const userRef = doc(this.firestore, 'users', uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const profile = docSnap.data() as ScoreEntry;
      console.log('Email:', profile.email);
      console.log('Score:', profile.score);
    }
  }

  async updateScore(uid: string, newScore: number) {
    const userRef = doc(this.firestore, 'users', uid);
    await setDoc(userRef, { score: newScore }, { merge: true });
    console.log(`Updated score for ${uid} to ${newScore}`);
  }
}
