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
      // Debug: proveri podatke
      console.log('=== DEBUG RESERVATIONS ===')
      if (list && list.length > 0) {
        list.forEach((r: any, idx: number) => {
          console.log(`Rez ${idx}: id=${r.idRezervacije}, obradjena=${r.obradjena} (type: ${typeof r.obradjena}), accepted=${r.accepted} (type: ${typeof r.accepted})`)
          console.log(`  - isProcessed: ${this.isProcessed(r)}`)
          console.log(`  - isDeclined: ${this.isDeclined(r)}`)
          console.log(`  - isAccepted: ${this.isAccepted(r)}`)
          console.log(`  - Status: ${this.getReservationStatus(r)}`)
        })
      }
      console.log('=== END DEBUG ===')
      
      this.allReservations = list || []
      const now = new Date()
      
      // Trenutne rezervacije - sve koje još nisu završile (i obrađene i neobrađene)
      this.currentReservations = this.allReservations
        .filter(r => {
          const kraj = new Date(r.kraj)
          return kraj > now
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
    // Može otkazati ako je više od 1 dana do početka i rezervacija je prihvaćena
    return diffDays > 1 && rez.accepted === true && rez.obradjena === true
  }

  getReservationStatus(rez: any): string {
    // Proveravamo eksplicitno: obradjena može biti true, false, null, undefined
    // Neobrađena: obradjena nije eksplicitno true (može biti false, null, undefined)
    // OVO JE KLJUČNO: ako je obradjena === false, ONA NIJE ODBIJENA, već NEOBRAĐENA
    
    // Proveri da li je obradjena STRICTLY true (ne samo truthy)
    const obradjenaIsTrue = rez.obradjena === true
    
    // PRVO: Ako nije obrađena (obradjena !== true, što uključuje false, null, undefined), vrati "Neobrađena"
    // Bez obzira na accepted vrednost
    if (obradjenaIsTrue !== true) {
      return 'Neobrađena'
    }
    
    // DRUGO: Ako je obrađena (obradjena === true), proveri accepted
    const acceptedIsTrue = rez.accepted === true
    
    // Odbijena: obradjena = true I accepted = false (ili nije true)
    if (obradjenaIsTrue === true && acceptedIsTrue !== true) {
      return 'Odbijena'
    }
    
    // Prihvaćena: obradjena = true I accepted = true
    if (obradjenaIsTrue === true && acceptedIsTrue === true) {
      return 'Prihvaćena'
    }
    
    // Fallback (ne bi trebalo da se desi)
    return 'Neobrađena'
  }

  isProcessed(rez: any): boolean {
    // Eksplicitno proveravamo da li je obrađena (true)
    return rez.obradjena === true || rez.obradjena === 'true' || rez.obradjena === 1
  }

  isDeclined(rez: any): boolean {
    // Odbijena je samo ako je obradjena = true I accepted = false
    // PRVO proveravamo da li je obrađena (STRICTLY true)
    const obradjena = rez.obradjena === true
    
    // Ako NIJE obrađena (false, null, undefined), ONA NIJE ODBIJENA
    if (obradjena !== true) {
      return false
    }
    
    // Tek ako JE obrađena, proveravamo accepted
    const accepted = rez.accepted === true
    
    // Odbijena je SAMO ako je obradjena=true I accepted=false
    return accepted === false
  }

  isAccepted(rez: any): boolean {
    // Prihvaćena je ako je obradjena = true I accepted = true
    // Koristimo istu logiku kao u isDeclined - samo strict === true
    const obradjena = rez.obradjena === true
    const accepted = rez.accepted === true
    return obradjena === true && accepted === true
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
    // Proverava da li je rezervacija završena, prihvaćena i da turista JOŠ NIJE ostavio ocenu
    const kraj = new Date(rez.kraj)
    const now = new Date()
    
    // 1. Rezervacija mora biti završena (kraj <= sada)
    if(kraj > now) {
      return false
    }
    
    // 2. Rezervacija mora biti prihvaćena od strane vlasnika
    const isAccepted = rez.accepted === true && rez.obradjena === true
    if(!isAccepted) {
      return false
    }
    
    // 3. Proverava da li turista već ima ocenu (validan broj između 1 i 5)
    const rating = rez.touristRating
    const hasRating = rating !== null && 
                      rating !== undefined && 
                      rating !== '' &&
                      typeof rating === 'number' && 
                      !isNaN(rating) && 
                      rating >= 1 && 
                      rating <= 5
    
    // Dugme se prikazuje SAMO ako rezervacija je završena, prihvaćena i NEMA ocene
    return !hasRating
  }

  openReviewForm(rez: any) {
    // Otvori formu samo ako može da ostavi ocenu i komentar
    if(!this.canLeaveReview(rez)) {
      return
    }
    this.selectedRezForReview = rez
    this.reviewComment = ''
    this.reviewRating = 0
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
