import { Component, inject } from '@angular/core';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/User/user-service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-t-profile-component',
  imports: [FormsModule, CommonModule],
  templateUrl: './t-profile-component.html',
  styleUrl: './t-profile-component.css'
})
export class TProfileComponent {

  private userService = inject(UserService)
  private backendUrl = "http://localhost:4000"

  user: User = new User()
  cacheBuster: number = Date.now()

  ngOnInit() {
    let userString = localStorage.getItem("loggedUser");
    this.user = JSON.parse(userString!)
  }

  newFirstname = ""
  newLastname = ""
  newAddress = ""
  newPhone = ""
  newEmail = ""
  newCreditCardNumber = ""

  messageFirstname = ""
  messageLastname = ""
  messageAddress = ""
  messagePhone = ""
  messageEmail = ""
  messageCreditCard = ""

  selectedFile: File | null = null
  messageImage = ""
  imagePreview: string | null = null

  updateFirstname(){
    this.userService.updateFirstName(this.user.username!, this.newFirstname).subscribe(
      data=>{
        this.messageFirstname = data.message
        this.user.firstname= this.newFirstname
        localStorage.setItem("loggedUser", JSON.stringify(this.user))
      }
    )
  }

  updateLastname(){
    this.userService.updateLastName(this.user.username!!, this.newLastname).subscribe(
      data=>{
        this.messageLastname = data.message
        this.user.lastname = this.newLastname
        localStorage.setItem("loggedUser", JSON.stringify(this.user))
      }
    )
  }

  updateAddress(){
    this.userService.updateAddress(this.user.username!, this.newAddress).subscribe(
      data=>{
        this.messageAddress = data.message
        this.user.address = this.newAddress
        localStorage.setItem("loggedUser", JSON.stringify(this.user))
      }
    )
  }

  updatePhone(){
    this.userService.updatePhone(this.user.username!, this.newPhone).subscribe(
      data=>{
        this.messagePhone = data.message
        this.user.phone = this.newPhone
        localStorage.setItem("loggedUser", JSON.stringify(this.user))
      }
    )
  }

  updateEmail(){
    this.userService.updateEmail(this.user.username!, this.newEmail).subscribe(
      data=>{
        this.messageEmail = data.message
        this.user.email = this.newEmail
        localStorage.setItem("loggedUser", JSON.stringify(this.user))
      }
    )
  }

  updateCreditCard(){
    console.log(this.newCreditCardNumber)
    this.userService.updateCreditCard(this.user.username!, this.newCreditCardNumber).subscribe(
      data=>{
        this.messageCreditCard = data.message
        this.user.creditCardNumber = this.newCreditCardNumber
        localStorage.setItem("loggedUser", JSON.stringify(this.user))
      }
    )
  }

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
        this.messageImage = "Slika je premala (minimalno 100x100 px)."
        this.selectedFile = null
        this.imagePreview = null
        return
      }

      if (w > 300 || h > 300) {
        this.messageImage = "Slika je prevelika (maksimalno 300x300 px)."
        this.selectedFile = null
        this.imagePreview = null
        return
      }

      this.selectedFile = file
      this.imagePreview = img.src
      this.messageImage = "Slika je učitana — kliknite 'Potvrdi izmenu slike'."
    }

    reader.readAsDataURL(file)
  }

  updateProfilePicture() {
    if (!this.selectedFile) {
      this.messageImage = "Niste izabrali sliku."
      return
    }

    this.userService.updateProfilePicture(this.user.username!, this.selectedFile).subscribe(data => {
      this.messageImage = data.message
      if (data.path) {
        this.user.profilePicture = data.path
        console.log(data.path)
        this.cacheBuster = Date.now()
        localStorage.setItem('loggedUser', JSON.stringify(this.user))
        this.selectedFile = null
      }
    })
  }

  get imageUrl(): string {
    const path = this.user?.profilePicture || ''
    const finalPath = path ? path : 'uploads/default.png'
    const normalized = finalPath.startsWith('http') ? finalPath : `${this.backendUrl}/${finalPath.replace(/^\//, '')}`
    return `${normalized}?${this.cacheBuster}`
  }

  onImgError(evt: any) {
    const el: HTMLImageElement = evt?.target
    if (el) {
      if ((el as any).dataset && (el as any).dataset.fallbackApplied === '1') return
      el.onerror = null
      if ((el as any).dataset) (el as any).dataset.fallbackApplied = '1'
      el.src = `${this.backendUrl}/uploads/default.png?${Date.now()}`
    }
  }
}
