import { Component, inject, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin-service';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/User/user-service';
import { VikendicaService } from '../../../services/vikendica/vikendica-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-component',
  imports: [FormsModule, CommonModule],
  templateUrl: './admin-component.html',
  styleUrl: './admin-component.css'
})
export class AdminComponent implements OnInit {
  private adminService = inject(AdminService);
  private userService = inject(UserService);
  private vikendicaService = inject(VikendicaService);
  private router = inject(Router)

  allUsers: User[] = [];
  allVikendice: any[] = [];
  message = "";

  ngOnInit(): void {
    this.reloadUsers()
    this.reloadVikendice()
  }

  private reloadUsers() {
    this.userService.getAllUsers().subscribe(data => {
      this.allUsers = data
    })
  }

  activateUser(username: string) {
    this.adminService.activateUser(username, true).subscribe(data => {
      this.message = data.message;
      this.reloadUsers()
    });
  }

  deactivateUser(username: string) {
    this.adminService.activateUser(username, false).subscribe(data => {
      this.message = data.message;
      this.reloadUsers()
    });
  }

  blockUser(username: string) {
    this.adminService.blockUser(username, true).subscribe(data => {
      this.message = data.message;
      this.reloadUsers()
    });
  }

  unblockUser(username: string) {
    this.adminService.blockUser(username, false).subscribe(data => {
      this.message = data.message;
      this.reloadUsers()
    });
  }

  private reloadVikendice() {
    this.vikendicaService.getAll().subscribe(data => {
      this.allVikendice = data || []
    })
  }

  blockVikendica(idVikendice: number) {
    this.vikendicaService.blockVikendica(idVikendice).subscribe({
      next: (data) => {
        this.message = data.message
        this.reloadVikendice()
      },
      error: (err) => {
        this.message = err?.error?.message || 'Greška pri blokiranju vikendice'
      }
    })
  }

  hasLowRatings(v: any): boolean {
    return v.hasLowRatings === true
  }

  isBlocked(v: any): boolean {
    return v.isBlocked === true
  }

  formatDate(date: any): string {
    if(!date) return ''
    const d = new Date(date)
    if(isNaN(d.getTime())) return ''
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${day}.${month}.${year} ${hours}:${minutes}`
  }

  logout(){
    this.router.navigate([''])
  }
}
