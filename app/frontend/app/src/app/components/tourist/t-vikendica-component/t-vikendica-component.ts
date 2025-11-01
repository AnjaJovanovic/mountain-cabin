import { Component, inject, OnInit, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Vikendica } from '../../../models/vikendica.model';
import { VikendicaService } from '../../../services/vikendica/vikendica-service';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { RezervacijaService } from '../../../services/rezervacija/rezervacija-service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-t-vikendica-component',
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './t-vikendica-component.html',
  styleUrl: './t-vikendica-component.css'
})
export class TVikendicaComponent implements OnInit, AfterViewChecked{

  vikendica: Vikendica = new Vikendica()
  allVikendice: Vikendica[] = []
  filteredVikendice: Vikendica[] = []
  selectedVikendica: Vikendica | null = null
  showDetail: boolean = false
  private map: any

  private vikendicaService = inject(VikendicaService)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private rezervacijaService = inject(RezervacijaService)
  private mapInitialized = false

  searchNaziv: string = ''
  searchMesto: string = ''

  // Rezervacija state (Step 1 -> Step 2)
  step: number = 1
  startISO: string = '' // datetime-local value
  endISO: string = ''
  adults: number = 1
  children: number = 0
  note: string = ''
  cardNumber: string = ''
  calculatedPrice: number = 0
  reservationMessage: string = ''
  reviews: any[] = []
  selectedImage: string | null = null
  showImageModal: boolean = false

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')
    if(id){
      this.showDetail = true
      const numId = parseInt(id, 10)
      this.vikendicaService.getAll().subscribe(data=>{
        this.allVikendice = data
        this.selectedVikendica = data.find(v => v.idVikendice === numId) || null
        this.mapInitialized = false // Reset flag when new vikendica is selected
        // Map will be initialized in ngAfterViewChecked when DOM is ready
        // preload card from logged user
        const uStr = localStorage.getItem('loggedUser')
        if(uStr){
          const u: User = JSON.parse(uStr)
          this.cardNumber = u?.creditCardNumber || ''
        }
        // Učitaj komentare i ocene za ovu vikendicu
        if(this.selectedVikendica){
          this.loadReviews(this.selectedVikendica.idVikendice)
        }
      })
    } else {
      this.showDetail = false
      this.vikendicaService.getAll().subscribe(data=>{
        this.allVikendice = data
        this.filteredVikendice = data
      })
    }
  }

  applyFilter(){
    const naziv = this.searchNaziv.trim().toLowerCase()
    const mesto = this.searchMesto.trim().toLowerCase()

    this.filteredVikendice = this.allVikendice.filter(v => {
      const okNaziv = naziv ? v.naziv.toLowerCase().includes(naziv) : true
      const okMesto = mesto ? v.mesto.toLowerCase().includes(mesto) : true
      return okNaziv && okMesto
    })
  }

  clearFilter(){
    this.searchNaziv = ''
    this.searchMesto = ''
    this.filteredVikendice = [...this.allVikendice]
  }

  getStars(rating?: number): number[] {
    const r = rating || 0
    // Vraćamo niz gde je 1 = puna zvezda, 0.5 = pola zvezde, 0 = prazna zvezda
    return Array.from({length: 5}, (_, i) => {
      if(i < Math.floor(r)) return 1 // Puna zvezda
      if(i === Math.floor(r) && r % 1 >= 0.5) return 0.5 // Pola zvezde ako je decimala >= 0.5
      return 0 // Prazna zvezda
    })
  }

  formatRating(rating: number): string {
    return rating.toFixed(1)
  }

  loadReviews(idVikendice: number) {
    this.rezervacijaService.byVikendica(idVikendice).subscribe({
      next: (data) => {
        // Dodatno filtriranje na frontend-u za sigurnost - samo popunjeni komentari i ocene
        this.reviews = (data || []).filter((review: any) => {
          const hasRating = review.touristRating !== null && review.touristRating !== undefined && review.touristRating >= 1 && review.touristRating <= 5
          const hasComment = review.touristComment && String(review.touristComment).trim().length > 0
          return hasRating || hasComment
        })
      },
      error: (err) => {
        console.error('Greška pri učitavanju komentara:', err)
        this.reviews = []
      }
    })
  }

  formatDate(date: any): string {
    if(!date) return ''
    const d = new Date(date)
    if(isNaN(d.getTime())) return ''
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}.${month}.${year}`
  }

  openDetail(id: number){
    this.router.navigate(['touristVikendica', id])
  }

  private getNightsAndPrice(): { nights: number, price: number }{
    if(!this.selectedVikendica) return { nights: 0, price: 0 }
    const s = this.startISO ? new Date(this.startISO) : null
    const e = this.endISO ? new Date(this.endISO) : null
    if(!s || !e || isNaN(s.getTime()) || isNaN(e.getTime()) || s >= e) return { nights: 0, price: 0 }
    // calculate per-night price across months
    let nights = 0
    let price = 0
    const cur = new Date(s)
    while(cur < e){
      const next = new Date(cur)
      next.setDate(cur.getDate()+1)
      nights += 1
      const m = cur.getMonth() // 0-based
      const inSummer = [4,5,6,7].includes(m)
      price += inSummer ? (this.selectedVikendica.cenaNocenjaLetnja||0) : (this.selectedVikendica.cenaNocenjaZimska||0)
      cur.setDate(cur.getDate()+1)
    }
    return { nights, price }
  }

  proceedToPayment(){
    this.reservationMessage = ''
    if(!this.startISO || !this.endISO){ this.reservationMessage = 'Unesite početak i kraj.'; return }
    const s = new Date(this.startISO)
    const e = new Date(this.endISO)
    if(s >= e){ this.reservationMessage = 'Početak mora biti pre kraja.'; return }
    if(s.getHours() < 14){ this.reservationMessage = 'Ulazak moguć od 14:00.'; return }
    if(e.getHours() > 10 || (e.getHours()===10 && (e.getMinutes()||0) > 0)){ this.reservationMessage = 'Izlazak do 10:00.'; return }
    if(this.adults < 1){ this.reservationMessage = 'Unesite broj odraslih (min 1).'; return }
    if(this.note && this.note.length > 500){ this.reservationMessage = 'Napomena do 500 karaktera.'; return }
    const { price } = this.getNightsAndPrice()
    this.calculatedPrice = price
    this.step = 2
  }

  backToStep1(){
    this.step = 1
  }

  confirmReservation(){
    if(!this.selectedVikendica) return
    if(!this.cardNumber || this.cardNumber.replace(/\s+/g,'').length < 12){ this.reservationMessage = 'Unesite ispravan broj kartice.'; return }
    const payload = {
      idVikendice: this.selectedVikendica.idVikendice,
      usernameTuriste: JSON.parse(localStorage.getItem('loggedUser')||'{}')?.username || 'guest',
      pocetak: new Date(this.startISO).toISOString(),
      kraj: new Date(this.endISO).toISOString(),
      brojOdraslih: this.adults,
      brojDece: this.children,
      cena: this.calculatedPrice,
      napomena: this.note || ''
    }
    this.rezervacijaService.create(payload).subscribe({
      next: (resp)=>{
        this.reservationMessage = 'Rezervacija uspešno poslata'
        // prikaži kratku poruku, zatim vrati na listu
        alert('Rezervacija uspešno poslata')
        this.router.navigate(['touristVikendica'])
      },
      error: (err)=>{
        const errorMessage = err?.error?.message || 'Greška pri rezervaciji.'
        this.reservationMessage = errorMessage
        // Prikaži alert za greške kako bi korisnik sigurno video poruku
        if(err?.status === 409){
          alert(`❌ ${errorMessage}`)
        } else {
          alert(`Greška: ${errorMessage}`)
        }
        console.error('Greška pri rezervaciji:', err)
      }
    })
  }

  formatDateTime(iso: string): string{
    if(!iso) return ''
    const d = new Date(iso)
    if(isNaN(d.getTime())) return ''
    return new Intl.DateTimeFormat('sr-RS', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    }).format(d)
  }

  formatEur(amount: number): string{
    try{
      return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'EUR' }).format(amount || 0)
    }catch{
      return `${(amount||0).toFixed(2)} €`
    }
  }

  ngAfterViewChecked(): void {
    // Initialize map when view is checked and conditions are met
    if(!this.mapInitialized && this.showDetail && this.selectedVikendica){
      const lat = this.selectedVikendica.lat
      const lng = this.selectedVikendica.lng
      if(lat !== undefined && lng !== undefined){
        // Check if element exists in DOM
        const mapElement = document.getElementById('vik-map')
        if(mapElement && !this.map){
          this.initMap()
        }
      }
    }
  }

  private initMap(){
    if(!this.showDetail || !this.selectedVikendica) return
    const lat = this.selectedVikendica.lat
    const lng = this.selectedVikendica.lng
    if(lat === undefined || lng === undefined) return
    
    const mapElement = document.getElementById('vik-map')
    if(!mapElement) return
    
    // @ts-ignore - Leaflet provided by CDN
    const Lref = (window as any).L
    if(!Lref) return
    
    try {
      if(this.map){
        this.map.remove()
        this.map = null
      }
      
      // Serbia bounding box
      const serbiaBounds = Lref.latLngBounds([41.85, 18.8], [46.2, 23.0])
      this.map = Lref.map('vik-map', {
        zoomControl: true,
        maxBounds: serbiaBounds,
        maxBoundsViscosity: 0.8,
        worldCopyJump: false
      }).setView([lat, lng], 10)
      
      // OpenStreetMap tile layer
      Lref.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map)
      
      Lref.marker([lat, lng]).addTo(this.map)
      this.mapInitialized = true
    } catch(error){
      // Silent fail
    }
  }

  openImageModal(imagePath: string) {
    this.selectedImage = 'http://localhost:4000/' + imagePath
    this.showImageModal = true
  }

  closeImageModal() {
    this.showImageModal = false
    this.selectedImage = null
  }
}