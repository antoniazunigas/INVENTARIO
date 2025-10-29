import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class RegistroPage {
  usuario = '';
  password = '';

  constructor(private router: Router){}

  registrar() {
    if(this.usuario && this.password){
      alert('Usuario registrado');
      this.router.navigate(['/login']);
    } else {
      alert('Complete todos los campos');
    }
  }
}

