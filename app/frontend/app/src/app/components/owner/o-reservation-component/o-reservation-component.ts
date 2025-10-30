import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RezervacijaService } from '../../../services/rezervacija/rezervacija-service';

@Component({
  selector: 'app-o-reservation-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './o-reservation-component.html',
  styleUrl: './o-reservation-component.css'
})
export class OReservationComponent {
  private rezervacijaService = inject(RezervacijaService)

  unprocessed: any[] = []
  allReservations: any[] = []
  ownerComment: {[id: number]: string} = {}
  message: string = ''

  ngOnInit(){
    const uStr = localStorage.getItem('loggedUser')
    const username = uStr ? JSON.parse(uStr).username : ''
    if(username){
      this.rezervacijaService.byOwner(username).subscribe(list=>{
        // all
        this.allReservations = list
        // unprocessed sorted newest->oldest
        this.unprocessed = list.filter(r=> !r.obradjena).sort((a,b)=> new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        this.renderCalendar()
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
        const choice = win.prompt(`Rez #${id} | Turista: ${rez.usernameTuriste}\nPotvrdite sa YES ili odbijte sa komentarom:`, 'YES')
        if(choice === null) return
        if(choice.trim().toUpperCase() === 'YES'){
          this.rezervacijaService.processDecision(id, true, '').subscribe(()=> this.ngOnInit())
        } else {
          if(choice.trim().length === 0){ win.alert('Komentar je obavezan kod odbijanja.'); return }
          this.rezervacijaService.processDecision(id, false, choice.trim()).subscribe(()=> this.ngOnInit())
        }
      }
    })
    cal.render()
    ;(el as any)._calendar = cal
  }
}
