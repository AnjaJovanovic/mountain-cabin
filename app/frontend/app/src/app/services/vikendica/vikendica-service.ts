import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Vikendica } from '../../models/vikendica.model';
import { Message } from '../../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class VikendicaService {
    constructor() { }
  
    private httpClient = inject(HttpClient)
  
    getAll(){
      return this.httpClient.get<Vikendica[]>("http://localhost:4000/vikendice/getAll")
    }

  getByOwner(username: string){
    return this.httpClient.get<Vikendica[]>(`http://localhost:4000/vikendice/byOwner/${username}`)
  }

    delete(vikendica: Vikendica){
      return this.httpClient.post<Message>("http://localhost:4000/vikendice/delete",{idVikendice: vikendica.idVikendice});
    }

    update(vikendica: Vikendica){
    return this.httpClient.post<Message>("http://localhost:4000/vikendice/update", vikendica);
    }

  create(vikendica: Vikendica){
    return this.httpClient.post<Message>("http://localhost:4000/vikendice/create", vikendica);
  }

  uploadImages(idVikendice: number, files: File[]){
    const form = new FormData()
    form.append('idVikendice', String(idVikendice))
    files.forEach(f=> form.append('images', f))
    return this.httpClient.post<{message:string, paths:string[]}>("http://localhost:4000/vikendice/uploadImages", form)
  }

}
