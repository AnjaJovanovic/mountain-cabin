import { inject, Injectable } from '@angular/core';
import { User } from '../../models/user.model';
import { HttpClient } from '@angular/common/http';
import { Message } from '../../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor() { }
  backendUrl = "http://localhost:4000"
  private httpClient = inject(HttpClient)

  login(username: string, password: string){
    const data={
      username: username,
      password: password
    }
    return this.httpClient.post<User>(`${this.backendUrl}/users/login`, data)
  }

  register(user: User){
    return this.httpClient.post<Message>(`${this.backendUrl}/users/register`, user)
  }
  
  updateFirstName(username: string, firstname: string){
      return this.httpClient.post<Message>(`${this.backendUrl}/users/updateFirstname`,{username: username, firstname: firstname});
  }

  updateLastName(username: string, lastname: string){
      return this.httpClient.post<Message>(`${this.backendUrl}/users/updateLastname`,{username: username, lastname: lastname});
  }

  updateAddress(username: string, address: string){
      return this.httpClient.post<Message>(`${this.backendUrl}/users/updateAddress`,{username: username, address: address});
  }

  updateEmail(username: string, email: string){
      return this.httpClient.post<Message>(`${this.backendUrl}/users/updateEmail`,{username: username, email: email});
  }

  updatePhone(username: string, phone: string){
      return this.httpClient.post<Message>(`${this.backendUrl}/users/updatePhone`,{username: username, phone: phone});
  }

  updateCreditCard(username: string, creditCardNumber: string){
      return this.httpClient.post<Message>(`${this.backendUrl}/users/updateCreditCard`,{username: username, creditCardNumber: creditCardNumber});
  }

  getAllUsers(){
    return this.httpClient.get<User[]>("http://localhost:4000/users/getAllUsers")
  }
}
