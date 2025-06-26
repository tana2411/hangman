import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';



const firebaseConfig = {
  apiKey: "AIzaSyBTK_rx0r0v2gbr3roT1OTuX-vZSs-Wy3s",
  authDomain: "hangman-baa74.firebaseapp.com",
  projectId: "hangman-baa74",
  storageBucket: "hangman-baa74.appspot.com", 
  messagingSenderId: "734965808084",
  appId: "1:734965808084:web:936f05ae9535791500f441",
  measurementId: "G-PSNW01QN3P"
};
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
  
  ]
};
