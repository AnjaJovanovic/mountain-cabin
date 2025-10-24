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
    this.userService.login(this.username, this.password).subscribe(data=>{
      if(data){
        localStorage.setItem("loggedUserUsername", data.username)
        localStorage.setItem("loggedUserFirstname", data.firstname)
        localStorage.setItem("loggedUserLastname", data.lastname)
        localStorage.setItem("loggedUserAddress", data.address)
        localStorage.setItem("loggedUserEmail", data.email)
        localStorage.setItem("loggedUserPhone", data.phone)
        localStorage.setItem("loggedUserCardNumber", data.creditCardNumber)
        this.message = "ulogovan korisnik" + this.username

        if(data.userType == "tourist"){
          this.router.navigate(['touristProfile'])
          console.log("Turista sam")
        }
        else if(data.userType == "owner")
          this.router.navigate(['ownerProfile'])
        
        console.log("PODACI KOJE DOBIJAM IZ LOGIN BACKENDA:", data)
      }
      else{
        this.message = "Error"
      }
    })
  }
}
