import { Component } from '@angular/core';

@Component({
  selector: 'app-redirect',
  standalone: false,
  templateUrl: './redirect.component.html',
  styleUrl: './redirect.component.scss'
})
export class RedirectComponent {
  constructor() {
    window.location.href = 'https://web-ai.studio';
  }
}
