import { Component, inject, OnInit } from '@angular/core';
import { Vikendica } from '../../../models/vikendica.model';
import { VikendicaService } from '../../../services/vikendica/vikendica-service';

@Component({
  selector: 'app-t-vikendica-component',
  imports: [],
  templateUrl: './t-vikendica-component.html',
  styleUrl: './t-vikendica-component.css'
})
export class TVikendicaComponent implements OnInit{

  vikendica: Vikendica = new Vikendica()
  allVikendice: Vikendica[] = []

  private vikendicaService = inject(VikendicaService)

  ngOnInit(): void {
      this.vikendicaService.getAll().subscribe(data=>{
        this.allVikendice = data
    })
  }

}