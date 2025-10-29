import { Component, inject } from '@angular/core';
import { AdminService } from '../../../services/admin-service';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/User/user-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-component',
  imports: [FormsModule, CommonModule],
  templateUrl: './admin-component.html',
  styleUrl: './admin-component.css'
})
export class AdminComponent {
  private adminService = inject(AdminService);
  private userService = inject(UserService);

  allUsers: User[] = [];
  message = "";

  ngOnInit(): void {
    this.reloadUsers()
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
}
