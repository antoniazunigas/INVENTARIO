import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login.page';
import { RegistroPage } from './pages/registro/registro.page';
import { ProductosPage } from './pages/productos/productos.page';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPage },
  { path: 'registro', component: RegistroPage },
  { path: 'productos', component: ProductosPage }
];

