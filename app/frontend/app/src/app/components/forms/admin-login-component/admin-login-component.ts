import { Component, inject } from '@angular/core';
import { AdminService } from '../../../services/admin-service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-login-component',
  imports: [FormsModule],
  templateUrl: './admin-login-component.html',
  styleUrl: './admin-login-component.css'
})
export class AdminLoginComponent {
  private adminService = inject(AdminService)
  private router = inject(Router)

  username = ""
  password = ""
  message = ""

  login(){
    this.adminService.login(this.username, this.password).subscribe(data=>{
      console.log("PODACI KOJE DOBIJAM IZ LOGIN BACKENDA:", data)
      if(data){
        localStorage.setItem("loggedUser", JSON.stringify(data));
        this.message = "ulogovan korisnik" + this.username
      
        this.router.navigate(['admin'])
        
        console.log("PODACI KOJE DOBIJAM IZ LOGIN BACKENDA:", data)
      }
      else{
        this.message = "Error"
      }
    })
  }

  back() {
    this.router.navigate([''])
  }
}
