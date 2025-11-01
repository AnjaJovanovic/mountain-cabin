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

  selectedFile: File | null = null
  messageImage = ""
  imagePreview: string | null = null

  onFileSelected(event: any) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    const img = new Image()

    reader.onload = (e: any) => {
      img.src = e.target.result
    }

    img.onload = () => {
      const w = img.width
      const h = img.height

      if (w < 100 || h < 100) {
        this.messageImage = "Slika je premala. Minimalno 100×100 px."
        this.selectedFile = null
        this.imagePreview = null
        return
      }

      if (w > 300 || h > 300) {
        this.messageImage = "Slika je prevelika. Maksimalno 300×300 px."
        this.selectedFile = null
        this.imagePreview = null
        return
      }

      this.selectedFile = file
      this.imagePreview = img.src
      this.messageImage = "Slika je odgovarajuće veličine."
    }

    reader.readAsDataURL(file)
  }

register() {
  const formData = new FormData()

  formData.append('username', this.user.username)
  formData.append('password', this.user.password)
  formData.append('email', this.user.email)
  formData.append('userType', this.user.userType)
  formData.append('firstname', this.user.firstname)
  formData.append('lastname', this.user.lastname)
  formData.append('gender', this.user.gender)
  formData.append('address', this.user.address)
  formData.append('phone', this.user.phone)
  formData.append('creditCardNumber', this.user.creditCardNumber)

  if (this.selectedFile) {
    formData.append('profilePicture', this.selectedFile)
  }

  this.userService.register(formData).subscribe({
    next: (data) => {
      this.message = data.message
      if (data.message === 'ok') {
        this.router.navigate(['login'])
      }
    },
    error: (err) => {
      this.message = 'Greška pri registraciji. Pokušajte ponovo.'
    }
  })
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

  back() {
    this.router.navigate([''])
  }
}
