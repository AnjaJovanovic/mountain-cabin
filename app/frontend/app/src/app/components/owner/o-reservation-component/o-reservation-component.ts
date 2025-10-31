import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RezervacijaService } from '../../../services/rezervacija/rezervacija-service';

@Component({
  selector: 'app-o-reservation-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './o-reservation-component.html',
  styleUrl: './o-reservation-component.css'
})
export class OReservationComponent implements OnInit {
  private rezervacijaService = inject(RezervacijaService)

  unprocessed: any[] = []
  allReservations: any[] = []
  ownerComment: {[id: number]: string} = {}
  message: string = ''
  selectedRezForDialog: any | null = null
  showDialog: boolean = false
  dialogComment: string = ''

  ngOnInit(){
    const uStr = localStorage.getItem('loggedUser')
    const username = uStr ? JSON.parse(uStr).username : ''
    if(username){
      this.rezervacijaService.byOwner(username).subscribe(list=>{
        this.allReservations = list || []
        
        const filtered = (list || []).filter(r=> r.obradjena === false)
        
        this.unprocessed = filtered.sort((a,b)=> {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return dateB - dateA
        })
        this.renderCalendar()
      }, error => {
        this.message = 'Greška pri učitavanju rezervacija.'
      })
    }
  }

  confirm(r: any){
    this.message = ''
    this.rezervacijaService.processDecision(r.idRezervacije, true, this.ownerComment[r.idRezervacije]||'').subscribe(()=>{
      this.ngOnInit()
    })
  }

  decline(r: any){
    const c = (this.ownerComment[r.idRezervacije]||'').trim()
    if(c.length === 0){ this.message = 'Komentar je obavezan kod odbijanja.'; return }
    this.rezervacijaService.processDecision(r.idRezervacije, false, c).subscribe(()=>{
      this.ngOnInit()
    })
  }

  closeDialog(){
    this.showDialog = false
    this.selectedRezForDialog = null
    this.dialogComment = ''
  }

  confirmFromDialog(){
    if(!this.selectedRezForDialog) return
    this.rezervacijaService.processDecision(this.selectedRezForDialog.idRezervacije, true, '').subscribe(()=>{
      this.closeDialog()
      this.ngOnInit()
    })
  }

  declineFromDialog(){
    if(!this.selectedRezForDialog) return
    const c = this.dialogComment.trim()
    if(c.length === 0){ 
      this.message = 'Komentar je obavezan kod odbijanja.'
      return 
    }
    this.rezervacijaService.processDecision(this.selectedRezForDialog.idRezervacije, false, c).subscribe(()=>{
      this.closeDialog()
      this.ngOnInit()
    })
  }

  private renderCalendar(){
    // FullCalendar via CDN
    const win: any = window as any
    const Calendar = win.FullCalendar?.Calendar
    const el = document.getElementById('owner-calendar')
    if(!Calendar || !el) return
    // destroy previous
    if((el as any)._calendar){
      (el as any)._calendar.destroy()
      ;(el as any)._calendar = null
    }
    const events = this.allReservations.map(r=>({
      id: String(r.idRezervacije),
      title: `Rez #${r.idRezervacije} - ${r.usernameTuriste}`,
      start: r.pocetak,
      end: r.kraj,
      color: !r.obradjena ? '#f1c40f' : (r.accepted ? '#2ecc71' : '#e74c3c')
    }))
    const cal = new Calendar(el, {
      initialView: 'dayGridMonth',
      height: 'auto',
      events,
      eventClick: (info: any)=>{
        const id = Number(info.event.id)
        const rez = this.allReservations.find(x=> x.idRezervacije === id)
        if(!rez) return
        // Otvori modalni dijalog
        this.selectedRezForDialog = rez
        this.dialogComment = ''
        this.showDialog = true
      }
    })
    cal.render()
    ;(el as any)._calendar = cal
  }
}
