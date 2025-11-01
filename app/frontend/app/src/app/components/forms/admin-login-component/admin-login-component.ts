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
    this.adminService.login(this.username, this.password).subscribe({
      next: (data) => {
        if(data){
          localStorage.setItem("loggedUser", JSON.stringify(data));
          this.message = "ulogovan korisnik" + this.username
      
          this.router.navigate(['admin'])
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
