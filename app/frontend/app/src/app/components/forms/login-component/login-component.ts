import { Component, inject } from '@angular/core';
import { UserService } from '../../../services/User/user-service';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-component',
  imports: [FormsModule, RouterLink],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css'
})
export class LoginComponent {
  private userService = inject(UserService)
  private router = inject(Router)

  username = ""
  password = ""
  message = ""

  login(){
    this.userService.login(this.username, this.password).subscribe({
      next: (data) => {
        if(data && (data as any).message){
          const msg = (data as any).message
          // Proveri tačnu poruku i mapiraj na prikladnu poruku za korisnika
          if(msg === 'Blokiran'){
            this.message = 'Korisnički nalog je blokiran'
          } else if(msg === 'Nalog nije aktiviran'){
            this.message = 'Korisnički nalog nije aktiviran'
          } else {
            this.message = msg
          }
          return
        }
        if(data){
          localStorage.setItem("loggedUser", JSON.stringify(data));
          this.message = "ulogovan korisnik" + this.username
          if(data.userType == "tourist"){
            this.router.navigate(['touristProfile'])
          }
          else if(data.userType == "owner")
            this.router.navigate(['/owner/profile'])
        }
        else{
          this.message = "Pogrešno korisničko ime ili lozinka"
        }
      },
      error: (err) => {
        this.message = "Pogrešno korisničko ime ili lozinka"
      }
    })
  }

  back() {
    this.router.navigate([''])
  }
}
