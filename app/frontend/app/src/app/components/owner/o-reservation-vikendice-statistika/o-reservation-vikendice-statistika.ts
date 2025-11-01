import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RezervacijaService } from '../../../services/rezervacija/rezervacija-service';
import { VikendicaService } from '../../../services/vikendica/vikendica-service';

@Component({
  selector: 'app-o-reservation-vikendice-statistika',
  imports: [CommonModule],
  templateUrl: './o-reservation-vikendice-statistika.html',
  styleUrl: './o-reservation-vikendice-statistika.css'
})
export class OReservationVikendiceStatistika {
  private rezervacijaService = inject(RezervacijaService)
  private vikendicaService = inject(VikendicaService)

  reservations: any[] = []
  vikendice: { idVikendice: number, naziv: string }[] = []
  charts: any[] = []

  ngOnInit(){
    const uStr = localStorage.getItem('loggedUser')
    const username = uStr ? JSON.parse(uStr).username : ''
    if(!username) return
    this.vikendicaService.getByOwner(username).subscribe(vlist=>{
      this.vikendice = vlist.map(v=>({ idVikendice: v.idVikendice, naziv: v.naziv }))
    })
    this.rezervacijaService.byOwner(username).subscribe(list=>{
      // Filtriramo samo prihvaćene rezervacije (obradjena: true, accepted: true)
      this.reservations = list.filter(r => r.obradjena === true && r.accepted === true)
      setTimeout(()=> this.renderCharts(), 0)
    })
  }

  private renderCharts(){
    this.destroyCharts()
    this.renderMonthlyBar()
    this.renderPies()
  }

  private destroyCharts(){
    this.charts.forEach(c=> c?.destroy && c.destroy())
    this.charts = []
  }

  private renderMonthlyBar(){
    const win:any = window as any
    const Chart = win.Chart
    const el = document.getElementById('stats-monthly') as HTMLCanvasElement | null
    if(!Chart || !el) return
    const labels = ['01','02','03','04','05','06','07','08','09','10','11','12']
    // group by cottage then months counting accepted reservations
    // this.reservations već sadrži samo prihvaćene rezervacije
    const byCottage: Record<string, number[]> = {}
    this.vikendice.forEach(v=> byCottage[v.naziv] = Array(12).fill(0))
    this.reservations.forEach(r=>{
      const start = new Date(r.pocetak)
      const m = start.getMonth()
      const vik = this.vikendice.find(v=> v.idVikendice === r.idVikendice)
      const name = vik ? vik.naziv : String(r.idVikendice)
      if(!byCottage[name]) byCottage[name] = Array(12).fill(0)
      byCottage[name][m] += 1
    })
    const palette = ['#4e79a7','#f28e2b','#e15759','#76b7b2','#59a14f','#edc948','#b07aa1','#ff9da7','#9c755f','#bab0ab']
    const datasets = Object.keys(byCottage).map((name, idx)=>({
      label: name,
      data: byCottage[name],
      backgroundColor: palette[idx % palette.length]
    }))
    const chart = new Chart(el, {
      type: 'bar',
      data: { labels, datasets },
      options: { responsive: true, plugins: { legend: { position: 'top' } }, scales: { x: { stacked:false }, y: { beginAtZero: true } } }
    })
    this.charts.push(chart)
  }

  private renderPies(){
    const win:any = window as any
    const Chart = win.Chart
    if(!Chart) return
    const container = document.getElementById('stats-pies')
    if(!container) return
    container.innerHTML = ''
    this.vikendice.forEach((v, idx)=>{
      const canvas = document.createElement('canvas')
      canvas.id = `pie-${v.idVikendice}`
      canvas.style.maxWidth = '320px'
      canvas.style.margin = '12px'
      const wrap = document.createElement('div')
      const title = document.createElement('div')
      title.textContent = v.naziv
      title.style.margin = '8px 0'
      wrap.appendChild(title)
      wrap.appendChild(canvas)
      container.appendChild(wrap)
      // this.reservations već sadrži samo prihvaćene rezervacije
      const list = this.reservations.filter(r=> r.idVikendice === v.idVikendice)
      let weekend = 0, weekday = 0
      
      list.forEach(r=>{
        const pocetak = new Date(r.pocetak)
        const kraj = new Date(r.kraj)
        
        // Prolazimo kroz sve dane tokom rezervacije
        const current = new Date(pocetak)
        while(current < kraj){
          const dayOfWeek = current.getDay() // 0 = nedelja, 6 = subota
          // Subota (6) ili nedelja (0) = vikend
          if(dayOfWeek === 0 || dayOfWeek === 6){
            weekend += 1
          } else {
            weekday += 1
          }
          // Prelazimo na sledeći dan
          current.setDate(current.getDate() + 1)
        }
      })
      
      const chart = new Chart(canvas.getContext('2d')!, {
        type: 'pie',
        data: {
          labels: ['Vikend', 'Radni dan'],
          datasets: [{ data: [weekend, weekday], backgroundColor: ['#f1c40f', '#2ecc71'] }]
        },
        options: { plugins: { legend: { position: 'bottom' } } }
      })
      this.charts.push(chart)
    })
  }
}
