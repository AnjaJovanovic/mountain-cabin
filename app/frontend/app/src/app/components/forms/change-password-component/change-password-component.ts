import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../services/User/user-service';

@Component({
  selector: 'app-change-password-component',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './change-password-component.html',
  styleUrl: './change-password-component.css'
})
export class ChangePasswordComponent {
  private userService = inject(UserService)
  private router = inject(Router)

  username = ''
  oldPassword = ''
  newPassword = ''
  confirmNewPassword = ''
  message = ''

  ngOnInit(){
    const stored = localStorage.getItem('loggedUser')
    if(stored){
      try{
        const u = JSON.parse(stored)
        if(u?.username){ this.username = u.username }
      }catch{}
    }
  }

  submit(){
    if(this.newPassword !== this.confirmNewPassword){
      this.message = 'Nova lozinka i potvrda se ne poklapaju'
      return
    }
    if(this.oldPassword === this.newPassword){
      this.message = 'Stara i nova lozinka ne smeju biti iste'
      return
    }

    this.userService.changePassword(this.username, this.oldPassword, this.newPassword, this.confirmNewPassword)
      .subscribe(data => {
        this.message = data.message
        if(data.message === 'Lozinka uspešno promenjena'){
          this.router.navigate(['login'])
        }
      })
  }

  back(){
    const stored = localStorage.getItem('loggedUser')
    if(stored){
      try{
        const u = JSON.parse(stored)
        if(u?.userType === 'tourist'){
          this.router.navigate(['touristProfile'])
          return
        }
        if(u?.userType === 'owner'){
          this.router.navigate(['ownerProfile'])
          return
        }
      }catch{}
    }
    this.router.navigate([''])
  }
}
