import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RezervacijaService } from '../../../services/rezervacija/rezervacija-service';
import { VikendicaService } from '../../../services/vikendica/vikendica-service';

@Component({
  selector: 'app-t-reservations-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './t-reservations-component.html',
  styleUrl: './t-reservations-component.css'
})
export class TReservationsComponent implements OnInit {
  private rezervacijaService = inject(RezervacijaService)
  private vikendicaService = inject(VikendicaService)

  allReservations: any[] = []
  currentReservations: any[] = []
  archiveReservations: any[] = []
  vikendiceMap: {[id: number]: {naziv: string, mesto: string}} = {}
  
  selectedRezForReview: any | null = null
  reviewComment: string = ''
  reviewRating: number = 0
  showReviewForm: boolean = false
  message: string = ''

  ngOnInit() {
    this.loadVikendice()
    this.loadReservations()
  }

  loadVikendice() {
    this.vikendicaService.getAll().subscribe(data => {
      this.vikendiceMap = {}
      data.forEach(v => {
        this.vikendiceMap[v.idVikendice] = {
          naziv: v.naziv,
          mesto: v.mesto
        }
      })
    })
  }

  loadReservations() {
    const uStr = localStorage.getItem('loggedUser')
    const username = uStr ? JSON.parse(uStr).username : ''
    
    if(!username) return
    
    this.rezervacijaService.byUser(username).subscribe(list => {
      this.allReservations = list || []
      const now = new Date()
      
      // Trenutne rezervacije - prihvaćene i koje još nisu završile
      this.currentReservations = this.allReservations
        .filter(r => {
          const kraj = new Date(r.kraj)
          return r.accepted === true && r.obradjena === true && kraj > now
        })
        .sort((a, b) => {
          const dateA = new Date(a.pocetak).getTime()
          const dateB = new Date(b.pocetak).getTime()
          return dateA - dateB
        })
      
      // Arhiva - završene rezervacije (sortirano od najskorijih do najdavnijih)
      this.archiveReservations = this.allReservations
        .filter(r => {
          const kraj = new Date(r.kraj)
          return kraj <= now
        })
        .sort((a, b) => {
          const dateA = new Date(a.kraj).getTime()
          const dateB = new Date(b.kraj).getTime()
          return dateB - dateA // Najskorije prvo
        })
    })
  }

  getVikendicaName(idVikendice: number): string {
    return this.vikendiceMap[idVikendice]?.naziv || `Vikendica #${idVikendice}`
  }

  getVikendicaMesto(idVikendice: number): string {
    return this.vikendiceMap[idVikendice]?.mesto || '-'
  }

  canCancel(rez: any): boolean {
    const pocetak = new Date(rez.pocetak)
    const now = new Date()
    // Razlika u danima
    const diffTime = pocetak.getTime() - now.getTime()
    const diffDays = diffTime / (1000 * 60 * 60 * 24)
    // Može otkazati ako je više od 1 dana do početka
    return diffDays > 1 && rez.accepted === true && rez.obradjena === true
  }

  cancelReservation(rez: any) {
    if(!confirm(`Da li ste sigurni da želite da otkažete rezervaciju za ${this.getVikendicaName(rez.idVikendice)}?`)) {
      return
    }

    this.rezervacijaService.cancelReservation(rez.idRezervacije).subscribe({
      next: () => {
        this.message = 'Rezervacija je uspešno otkazana'
        this.loadReservations()
      },
      error: (err) => {
        this.message = err?.error?.message || 'Greška pri otkazivanju rezervacije'
      }
    })
  }

  canLeaveReview(rez: any): boolean {
    const kraj = new Date(rez.kraj)
    const now = new Date()
    return kraj <= now && (!rez.touristComment || !rez.touristRating)
  }

  openReviewForm(rez: any) {
    this.selectedRezForReview = rez
    this.reviewComment = rez.touristComment || ''
    this.reviewRating = rez.touristRating || 0
    this.showReviewForm = true
    this.message = ''
  }

  closeReviewForm() {
    this.showReviewForm = false
    this.selectedRezForReview = null
    this.reviewComment = ''
    this.reviewRating = 0
    this.message = ''
  }

  setRating(rating: number) {
    this.reviewRating = rating
  }

  submitReview() {
    if(!this.selectedRezForReview) return
    
    if(this.reviewRating < 1 || this.reviewRating > 5) {
      this.message = 'Molimo izaberite ocenu (1-5 zvezdica)'
      return
    }

    this.rezervacijaService.addTouristReview({
      idRezervacije: this.selectedRezForReview.idRezervacije,
      touristComment: this.reviewComment,
      touristRating: this.reviewRating
    }).subscribe({
      next: () => {
        this.message = 'Ocena i komentar su uspešno sačuvani'
        this.closeReviewForm()
        this.loadReservations() // Reload da se prikaže nova ocena
      },
      error: (err) => {
        this.message = err?.error?.message || 'Greška pri čuvanju ocene i komentara'
      }
    })
  }

  getStars(rating?: number): boolean[] {
    const r = rating || 0
    return [1, 2, 3, 4, 5].map(i => i <= r)
  }

  formatDate(date: any): string {
    if(!date) return ''
    const d = new Date(date)
    return d.toLocaleDateString('sr-RS', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }
}
