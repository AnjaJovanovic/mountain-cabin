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

  user: User = new User()

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

  updateFirstname(){
    this.userService.updateFirstName(this.user.username!, this.newFirstname).subscribe(
      data=>{
        this.messageFirstname = data.message
        console.log("usao sam")
      }
    )
  }

  updateLastname(){
    this.userService.updateLastName(this.user.username!!, this.newLastname).subscribe(
      data=>{
        this.messageLastname = data.message
      }
    )
  }

  updateAddress(){
    this.userService.updateAddress(this.user.username!, this.newAddress).subscribe(
      data=>{
        this.messageAddress = data.message
      }
    )
  }

  updatePhone(){
    this.userService.updatePhone(this.user.username!, this.newPhone).subscribe(
      data=>{
        this.messagePhone = data.message
      }
    )
  }

  updateEmail(){
    this.userService.updateEmail(this.user.username!, this.newEmail).subscribe(
      data=>{
        this.messageEmail = data.message
      }
    )
  }

  updateCreditCard(){
    console.log(this.newCreditCardNumber)
    this.userService.updateCreditCard(this.user.username!, this.newCreditCardNumber).subscribe(
      data=>{
        this.messageCreditCard = data.message
      }
    )
  }
}
