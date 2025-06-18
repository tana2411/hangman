import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./header/header.component";
import { GameComponent } from "./game/game.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, GameComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Hangman-angular';
}
