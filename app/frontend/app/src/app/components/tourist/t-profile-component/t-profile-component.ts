import { Component, inject } from '@angular/core';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/User/user-service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-t-profile-component',
  imports: [FormsModule],
  templateUrl: './t-profile-component.html',
  styleUrl: './t-profile-component.css'
})
export class TProfileComponent {

  private userService = inject(UserService)

  user: User = new User

  currentUsername: string | null = null
  currentFirstname: string | null = null
  currentLastname: string | null = null
  currentAddress: string | null = null
  currentEmail: string | null = null
  currentPhone: string | null = null
  currentCardNumber: string | null = null

  ngOnInit() {
    this.currentUsername = localStorage.getItem("loggedUserUsername")
    this.currentFirstname = localStorage.getItem("loggedUserFirstname")
    this.currentLastname = localStorage.getItem("loggedUserLastname")
    this.currentAddress = localStorage.getItem("loggedUserAddress")
    this.currentEmail = localStorage.getItem("loggedUserEmail")
    this.currentPhone = localStorage.getItem("loggedUserPhone")
    this.currentCardNumber = localStorage.getItem("loggedUserCardNumber")
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

  updateFirstname(){
    this.currentUsername = localStorage.getItem("loggedUserUsername")
    this.userService.updateFirstName(this.currentUsername!, this.newFirstname).subscribe(
      data=>{
        this.messageFirstname = data.message
        console.log("usao sam")
      }
    )
  }

  updateLastname(){
    this.currentUsername = localStorage.getItem("loggedUserUsername")
    this.userService.updateLastName(this.currentUsername!, this.newLastname).subscribe(
      data=>{
        this.messageLastname = data.message
      }
    )
  }

  updateAddress(){
    this.currentUsername = localStorage.getItem("loggedUserUsername")
    this.userService.updateAddress(this.currentUsername!, this.newAddress).subscribe(
      data=>{
        this.messageAddress = data.message
      }
    )
  }

  updatePhone(){
    this.currentUsername = localStorage.getItem("loggedUserUsername")
    this.userService.updatePhone(this.currentUsername!, this.newPhone).subscribe(
      data=>{
        this.messagePhone = data.message
      }
    )
  }

  updateEmail(){
    this.currentUsername = localStorage.getItem("loggedUserUsername")
    this.userService.updateEmail(this.currentUsername!, this.newEmail).subscribe(
      data=>{
        this.messageEmail = data.message
      }
    )
  }

  updateCreditCard(){
    this.currentUsername = localStorage.getItem("loggedUserUsername")
    console.log(this.newCreditCardNumber)
    this.userService.updateCreditCard(this.currentUsername!, this.newCreditCardNumber).subscribe(
      data=>{
        this.messageCreditCard = data.message
      }
    )
  }
}
