import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/User/user-service';

@Component({
  selector: 'app-o-profile-component',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './o-profile-component.html',
  styleUrl: './o-profile-component.css'
})
export class OProfileComponent {
  private userService = inject(UserService)

  user: User = new User()
  newFirstname = ""; newLastname = ""; newAddress = ""; newPhone = ""; newEmail = ""; newCreditCardNumber = "";

  messageFirstname = ""; messageLastname = ""; messageAddress = ""; messagePhone = ""; messageEmail = ""; messageCreditCard = "";

  selectedFile: File | null = null
  messageImage = ""
  imagePreview: string | null = null

  ngOnInit() {
    const s = localStorage.getItem('loggedUser')
    if (s) this.user = JSON.parse(s)
  }

  updateFirstname(){ this.userService.updateFirstName(this.user.username!, this.newFirstname).subscribe(d=>{ this.messageFirstname=d.message; this.user.firstname=this.newFirstname; localStorage.setItem('loggedUser', JSON.stringify(this.user)) }) }
  updateLastname(){ this.userService.updateLastName(this.user.username!, this.newLastname).subscribe(d=>{ this.messageLastname=d.message; this.user.lastname=this.newLastname; localStorage.setItem('loggedUser', JSON.stringify(this.user)) }) }
  updateAddress(){ this.userService.updateAddress(this.user.username!, this.newAddress).subscribe(d=>{ this.messageAddress=d.message; this.user.address=this.newAddress; localStorage.setItem('loggedUser', JSON.stringify(this.user)) }) }
  updatePhone(){ this.userService.updatePhone(this.user.username!, this.newPhone).subscribe(d=>{ this.messagePhone=d.message; this.user.phone=this.newPhone; localStorage.setItem('loggedUser', JSON.stringify(this.user)) }) }
  updateEmail(){ this.userService.updateEmail(this.user.username!, this.newEmail).subscribe(d=>{ this.messageEmail=d.message; this.user.email=this.newEmail; localStorage.setItem('loggedUser', JSON.stringify(this.user)) }) }
  updateCreditCard(){ this.userService.updateCreditCard(this.user.username!, this.newCreditCardNumber).subscribe(d=>{ this.messageCreditCard=d.message; this.user.creditCardNumber=this.newCreditCardNumber; localStorage.setItem('loggedUser', JSON.stringify(this.user)) }) }

  onFileSelected(ev: any) {
    const file = ev.target.files?.[0]; if (!file) return
    const reader = new FileReader(); const img = new Image()
    reader.onload = (e: any) => { img.src = e.target.result }
    img.onload = () => {
      const w = img.width, h = img.height
      if (w < 100 || h < 100) { this.messageImage = "Slika je premala (min 100x100)"; this.selectedFile=null; this.imagePreview=null; return }
      if (w > 300 || h > 300) { this.messageImage = "Slika je prevelika (max 300x300)"; this.selectedFile=null; this.imagePreview=null; return }
      this.selectedFile = file; this.imagePreview = img.src; this.messageImage = "Slika učitana — kliknite 'Potvrdi izmenu slike'."
    }
    reader.readAsDataURL(file)
  }

  backendUrl = "http://localhost:4000"
  cacheBuster: number = Date.now()
  get imageUrl(): string {
    const p = this.user?.profilePicture || 'uploads/default.png'
    const norm = p.startsWith('http') ? p : `${this.backendUrl}/${p.replace(/^\//,'')}`
    return `${norm}?${this.cacheBuster}`
  }
  onImgError(evt:any){ const el: HTMLImageElement = evt?.target; if (!el) return; if ((el as any).dataset?.fallbackApplied==='1') return; el.onerror=null; (el as any).dataset.fallbackApplied='1'; el.src=`${this.backendUrl}/uploads/default.png?${Date.now()}` }

  updateProfilePicture(){
    if(!this.selectedFile){ this.messageImage = "Niste izabrali sliku."; return }
    this.userService.updateProfilePicture(this.user.username!, this.selectedFile).subscribe(d=>{
      this.messageImage = d.message
      if(d.path){ this.user.profilePicture=d.path; this.cacheBuster=Date.now(); localStorage.setItem('loggedUser', JSON.stringify(this.user)); this.selectedFile=null }
    })
  }
}