import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout-component',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './layout-component.html',
  styleUrl: './layout-component.css'
})
export class LayoutComponent {

  private ruter = inject(Router)
  
  logout(){
    this.ruter.navigate([""])
  }

}
