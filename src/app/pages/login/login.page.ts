
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class LoginPage {
  usuario = '';
  password = '';

  constructor(private router: Router){}

  login() {
    if(this.usuario && this.password){
      // redirigir a productos
      this.router.navigate(['/productos']);
    } else {
      alert('Ingrese usuario y contraseña');
    }
  }
}
