import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Vikendica } from '../../../models/vikendica.model';
import { VikendicaService } from '../../../services/vikendica/vikendica-service';

@Component({
  selector: 'app-o-reservation-vikendice',
  imports: [FormsModule, CommonModule],
  templateUrl: './o-reservation-vikendice.html',
  styleUrl: './o-reservation-vikendice.css'
})
export class OReservationVikendice {
  private vikendicaService = inject(VikendicaService)

  vikendice: Vikendica[] = []
  form: Vikendica = new Vikendica()
  message: string = ''
  jsonError: string = ''
  selectedImagesPreview: string[] = []
  selectedFiles: File[] = []
  editMode: boolean = false
  editingId: number | null = null

  ngOnInit(){
    this.load()
  }

  load(){
    const uStr = localStorage.getItem('loggedUser')
    const username = uStr ? JSON.parse(uStr).username : ''
    if(username){
      this.vikendicaService.getByOwner(username).subscribe(data=>{ this.vikendice = data })
    }else{
      this.vikendicaService.getAll().subscribe(data=>{ this.vikendice = data })
    }
  }

  onJsonSelected(event: any){
    const file = event.target.files?.[0]; if(!file) return
    this.jsonError = ''
    const reader = new FileReader()
    reader.onload = () => {
      try{
        const obj = JSON.parse(String(reader.result||'{}'))
        // Prefill allowed fields
        this.form.naziv = obj.naziv || ''
        this.form.mesto = obj.mesto || ''
        this.form.usluge = obj.usluge || ''
        this.form.telefon = obj.telefon || ''
        this.form.cenaNocenjaLetnja = Number(obj.cenaNocenjaLetnja||0)
        this.form.cenaNocenjaZimska = Number(obj.cenaNocenjaZimska||0)
        this.form.lat = (obj.lat!==undefined)? Number(obj.lat) : undefined
        this.form.lng = (obj.lng!==undefined)? Number(obj.lng) : undefined
      }catch(e:any){
        this.jsonError = 'Nevažeći JSON fajl.'
      }
    }
    reader.readAsText(file)
  }

  onImagesSelected(event: any){
    const files: FileList = event.target.files
    this.selectedImagesPreview = []
    this.selectedFiles = []
    if(!files || files.length===0) return
    Array.from(files).forEach(f=>{
      this.selectedFiles.push(f)
      const r = new FileReader()
      r.onload = ()=>{ if(typeof r.result === 'string'){ this.selectedImagesPreview.push(r.result) } }
      r.readAsDataURL(f)
    })
  }

  validate(): string | null{
    if(!this.form.naziv?.trim()) return 'Unesite naziv.'
    if(!this.form.mesto?.trim()) return 'Unesite mesto.'
    if(!this.form.telefon?.trim()) return 'Unesite telefon.'
    if(!this.form.usluge?.trim()) return 'Unesite usluge.'
    if(!this.form.cenaNocenjaLetnja || this.form.cenaNocenjaLetnja<=0) return 'Unesite letnju cenu.'
    if(!this.form.cenaNocenjaZimska || this.form.cenaNocenjaZimska<=0) return 'Unesite zimsku cenu.'
    return null
  }

  create(){
    const err = this.validate(); if(err){ this.message = err; return }
    if(this.editMode && this.editingId){
      // update postojeće vikendice
      const payload: Vikendica = { ...this.form, idVikendice: this.editingId }
      this.vikendicaService.update(payload).subscribe((resp:any)=>{
        this.message = resp?.message || 'Ažurirano.'
        const idForImages = this.editingId as number
        if(this.selectedFiles.length>0){
          this.vikendicaService.uploadImages(idForImages, this.selectedFiles).subscribe(()=>{
            this.resetForm()
            this.load()
          })
        } else {
          this.resetForm()
          this.load()
        }
      })
    } else {
      // prvo kreiramo vikendicu bez slika
      const uStr = localStorage.getItem('loggedUser')
      const username = uStr ? JSON.parse(uStr).username : ''
      const payload: Vikendica = { ...this.form, ownerUsername: username } as any
      this.vikendicaService.create(payload).subscribe((resp:any)=>{
        this.message = resp?.message || 'Kreirano.'
        const newId = resp?.idVikendice
        if(newId && this.selectedFiles.length>0){
          this.vikendicaService.uploadImages(newId, this.selectedFiles).subscribe(()=>{
            this.resetForm()
            this.load()
          })
        } else {
          this.resetForm()
          this.load()
        }
      })
    }
  }

  edit(v: Vikendica){
    this.editMode = true
    this.editingId = v.idVikendice
    this.form = {
      idVikendice: v.idVikendice,
      naziv: v.naziv,
      mesto: v.mesto,
      telefon: v.telefon,
      cenaNocenjaLetnja: v.cenaNocenjaLetnja,
      cenaNocenjaZimska: v.cenaNocenjaZimska,
      galerijaSlika: [...(v.galerijaSlika || [])],
      zauzeta: v.zauzeta,
      usluge: v.usluge,
      prosecnaOcena: v.prosecnaOcena,
      ownerUsername: v.ownerUsername,
      lat: v.lat,
      lng: v.lng
    }
    this.message = ''
    this.selectedFiles = []
    this.selectedImagesPreview = []
  }

  cancelEdit(){
    this.resetForm()
  }

  resetForm(){
    this.form = new Vikendica()
    this.selectedFiles = []
    this.selectedImagesPreview = []
    this.editMode = false
    this.editingId = null
  }

  remove(v: Vikendica){
    if(!confirm(`Obrisati vikendicu "${v.naziv}"?`)) return
    this.vikendicaService.delete(v).subscribe((resp:any)=>{
      this.message = resp?.message || 'Obrisano.'
      this.load()
      if(this.editMode && this.editingId === v.idVikendice){
        this.resetForm()
      }
    })
  }
}
