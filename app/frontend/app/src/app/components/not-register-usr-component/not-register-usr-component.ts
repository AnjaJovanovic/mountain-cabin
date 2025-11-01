import { Component, inject } from '@angular/core';
import { Vikendica } from '../../models/vikendica.model';
import { VikendicaService } from '../../services/vikendica/vikendica-service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { User } from '../../models/user.model';
import { UserService } from '../../services/User/user-service';
import { RezervacijaService } from '../../services/rezervacija/rezervacija-service';

@Component({
  selector: 'app-not-register-usr-component',
  imports: [FormsModule, RouterLink],
  templateUrl: './not-register-usr-component.html',
  styleUrl: './not-register-usr-component.css'
})
export class NotRegisterUsrComponent {
  vikendica: Vikendica = new Vikendica()
  allVikendice: Vikendica[] = []
  filteredVikendice: Vikendica[] = []
  allUsers: User[] = []

  numVikendice = 0
  numOwners = 0
  numTourists = 0
  reservations24h = 0
  reservations7days = 0
  reservations30days = 0

  private vikendicaService = inject(VikendicaService)
  private userService = inject(UserService)
  private rezervacijaService = inject(RezervacijaService)


  ngOnInit(): void {
      this.vikendicaService.getAll().subscribe(data=>{
        this.allVikendice = data
        this.filteredVikendice = data
        this.numVikendice = this.allVikendice.length
    })
    this.userService.getAllUsers().subscribe(data => {
      this.allUsers = data
      // filtriramo samo one koji imaju userType === 'vlasnik'
      this.numOwners = this.allUsers.filter(user => user.userType === 'owner').length
      this.numTourists = this.allUsers.filter(user => user.userType === 'tourist').length
    })
    
    this.rezervacijaService.getStatistics().subscribe(data => {
      this.reservations24h = data.last24h
      this.reservations7days = data.last7days
      this.reservations30days = data.last30days
    })
  }

sortColumn: string = ''
sortDirection: 'asc' | 'desc' = 'asc'

sort(column: keyof Vikendica) {
  if (this.sortColumn === column) {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
  } else {
    this.sortColumn = column
    this.sortDirection = 'asc'
  }

  // Primenimo filtriranje prvo, pa onda sortiranje na filtrirane rezultate
  this.applyFilter()
}

searchNaziv: string = ''
searchMesto: string = ''

applyFilter(){
  const naziv = this.searchNaziv.trim().toLowerCase()
  const mesto = this.searchMesto.trim().toLowerCase()

  // Prvo filtriraj
  this.filteredVikendice = this.allVikendice.filter(v => {
    const okNaziv = naziv ? v.naziv.toLowerCase().includes(naziv) : true
    const okMesto = mesto ? v.mesto.toLowerCase().includes(mesto) : true
    return okNaziv && okMesto
  })

  // Zatim primeni sortiranje ako je aktivno
  if (this.sortColumn) {
    this.filteredVikendice.sort((a, b) => {
      const valueA = a[this.sortColumn as keyof Vikendica]?.toString().toLowerCase() || ''
      const valueB = b[this.sortColumn as keyof Vikendica]?.toString().toLowerCase() || ''

      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }
}

clearFilter(){
  this.searchNaziv = ''
  this.searchMesto = ''
  this.sortColumn = ''
  this.sortDirection = 'asc'
  this.filteredVikendice = [...this.allVikendice]
}


}
