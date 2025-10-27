import { Component, inject } from '@angular/core';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/User/user-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register-component',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './register-component.html',
  styleUrl: './register-component.css'
})
export class RegisterComponent {
  private userService = inject(UserService)
  private router = inject(Router)

  user: User = new User()
  message = ""

  register(){
    this.userService.register(this.user).subscribe(data=>{
      this.message = data.message
    })
    this.router.navigate(['touristProfile'])

  }

  cardNumber = '';
  cardType = '';

  checkCardType() {
    const num = this.user.creditCardNumber.replace(/\D/g, '');

    if (/^(300|301|302|303|36|38)/.test(num)) {
      this.cardType = 'diners';
    } else if (/^5[1-5]/.test(num)) {
      this.cardType = 'mastercard';
    } else if (/^(4539|4556|4916|4532|4929|4485|4716)/.test(num)) {
      this.cardType = 'visa';
    } else {
      this.cardType = '';
    }
  }
}
