import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-o-layout',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './o-layout.html',
  styleUrl: './o-layout.css'
})
export class OLayout {
  private router = inject(Router)

  logout(){
    this.router.navigate([""])
  }
}
