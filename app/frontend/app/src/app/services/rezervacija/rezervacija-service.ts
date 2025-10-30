import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export interface CreateRezervacijaPayload{
  idVikendice: number
  usernameTuriste: string
  pocetak: string // ISO
  kraj: string // ISO
  brojOdraslih: number
  brojDece: number
  cena: number
  napomena?: string
}

@Injectable({ providedIn: 'root' })
export class RezervacijaService{
  private http = inject(HttpClient)
  private base = 'http://localhost:4000/rezervacije'

  create(payload: CreateRezervacijaPayload){
    return this.http.post<{message:string, idRezervacije:number}>(`${this.base}/create`, payload)
  }

  byVikendica(idVikendice: number){
    return this.http.get<any[]>(`${this.base}/byVikendica/${idVikendice}`)
  }

  byUser(username: string){
    return this.http.get<any[]>(`${this.base}/byUser/${username}`)
  }

  byOwner(username: string){
    return this.http.get<any[]>(`${this.base}/byOwner/${username}`)
  }

  processDecision(idRezervacije: number, accepted: boolean, ownerComment: string){
    return this.http.post<{message:string}>(`${this.base}/process`, { idRezervacije, accepted, ownerComment })
  }
}
