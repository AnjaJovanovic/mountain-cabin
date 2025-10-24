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

    delete(vikendica: Vikendica){
      return this.httpClient.post<Message>("http://localhost:4000/vikendice/delete",{idVikendice: vikendica.idVikendice});
    }

    update(vikendica: Vikendica){
      return this.httpClient.post<Message>("http://localhost:4000/vikendice/update",{idVikendice: vikendica.idVikendice});
    }

}
