import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Vikendica } from '../../../models/vikendica.model';
import { VikendicaService } from '../../../services/vikendica/vikendica-service';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-t-vikendica-component',
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './t-vikendica-component.html',
  styleUrl: './t-vikendica-component.css'
})
export class TVikendicaComponent implements OnInit{

  vikendica: Vikendica = new Vikendica()
  allVikendice: Vikendica[] = []
  filteredVikendice: Vikendica[] = []
  selectedVikendica: Vikendica | null = null
  showDetail: boolean = false

  private vikendicaService = inject(VikendicaService)
  private router = inject(Router)
  private route = inject(ActivatedRoute)

  searchNaziv: string = ''
  searchMesto: string = ''

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')
    if(id){
      this.showDetail = true
      const numId = parseInt(id, 10)
      this.vikendicaService.getAll().subscribe(data=>{
        this.allVikendice = data
        this.selectedVikendica = data.find(v => v.idVikendice === numId) || null
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
    const r = Math.round((rating || 0))
    return Array.from({length: 5}, (_, i) => i < r ? 1 : 0)
  }

  openDetail(id: number){
    this.router.navigate(['touristVikendica', id])
  }
}