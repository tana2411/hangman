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

      console.log('uid',this.user.uid,'email', this.user.email);

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

  async loadUserProfile(uid: string): Promise<ScoreEntry | null> {
    const userRef = doc(this.firestore, 'users', uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const profile = docSnap.data() as ScoreEntry;
      console.log('Email:', profile.email);
      console.log('Score:', profile.score);
      return profile;
    }

    return null;
  }

  async updateScore(uid: string, newScore: number) {
    const userRef = doc(this.firestore, 'users', uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const existingData = docSnap.data() as { score: number };
      if (newScore > existingData.score) {
        await setDoc(userRef, { score: newScore }, { merge: true });
        console.log(`Updated score for ${uid} in users to ${newScore}`);
      } else {
        console.log(`Score in users is already higher or equal. No update.`);
      }
    }
  }

  async getUserProfile(uid: string): Promise<{ email: string, score: number } | null> {
    const userRef = doc(this.firestore, 'users', uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      return docSnap.data() as { email: string, score: number };
    }
    return null;
  }
}
