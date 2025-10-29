import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Admin } from '../models/admin.model';
import { Message } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor() { }
  backendUrl = "http://localhost:4000"
  private httpClient = inject(HttpClient)

  login(username: string, password: string){
    const data={
      username: username,
      password: password
    }
    return this.httpClient.post<Admin>(`${this.backendUrl}/admin/loginAdmin`, data)
  }

  activateUser(username: string, isActive: boolean) {
    return this.httpClient.post<Message>(`${this.backendUrl}/admin/activateUser`, {
      username: username,
      isActive: isActive
    });
  }

  blockUser(username: string, isBlocked: boolean) {
    return this.httpClient.post<Message>(`${this.backendUrl}/admin/blockUser`, {
      username: username,
      isBlocked: isBlocked
    });
  }
  
}
