// src/app/pages/productos/productos.page.ts (Código COMPLETO y CORREGIDO)

import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
// Importamos Router para la función logout()
import { Router } from '@angular/router'; 
// Importamos los componentes de Ionic necesarios
import { IonicModule, AlertController, IonModal } from '@ionic/angular'; 
import { InventarioService } from '../../services/inventario.service';
import { Producto } from '../../models/producto.model';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ProductosPage {
  // Referencia al modal para cerrarlo programáticamente
  @ViewChild('openModalManagement') modal!: IonModal;

  // LISTAS DE PRODUCTOS
  productos: Producto[] = []; 
  productosFiltrados: Producto[] = []; // Se usa para la lista visible

  // GESTIÓN DE FORMULARIO
  productoEnGestion: Producto = {codigo:'', nombre:'', categoria:'', precio:0, cantidad:0, historial:[]};
  isEditing: boolean = false;
  stockMovimiento: number = 0;
  stockError: string = '';
  busquedaTermino: string = '';

  // 1. Inyectar Router en el constructor
  constructor(private inv: InventarioService, private alertCtrl: AlertController, private router: Router){
    // Inicializar las listas al cargar
    this.productos = inv.productos;
    this.productosFiltrados = inv.productos;
  }

  // =================================================================
  // LÓGICA DE CIERRE DE SESIÓN
  // =================================================================
  // 2. Método logout()
  logout() {
    this.router.navigateByUrl('/login');
  }
  
  // =================================================================
  // LÓGICA DE VALIDACIÓN Y GESTIÓN DE FORMULARIO
  // =================================================================

  abrirModalAgregar() {
    this.isEditing = false;
    this.stockMovimiento = 0;
    this.stockError = '';
    this.productoEnGestion = {codigo:'', nombre:'', categoria:'', precio:0, cantidad:0, historial:[]};
  }

  // 3. Método editar(producto)
  editar(producto: Producto) {
    this.isEditing = true;
    this.stockMovimiento = 0;
    this.stockError = '';
    this.productoEnGestion = JSON.parse(JSON.stringify(producto));
    // Usamos el ID del trigger para abrir el modal
    document.getElementById('open-modal-management')?.click(); 
  }

  // 4. Método closeModal()
  closeModal() {
    // Busca y cierra el modal activo (o usa la referencia @ViewChild si es posible)
    const modalElement = document.querySelector('ion-modal');
    if (modalElement) {
        modalElement.dismiss();
    }
  }

  // =================================================================
  // REQUERIMIENTO: AGREGAR PRODUCTO (con validaciones)
  // =================================================================
  // 5. Método agregar()
  agregar() {
    this.stockError = '';

    if (!this.productoEnGestion.categoria) {
      this.presentAlert('Error de Validación', 'La categoría del producto es obligatoria.');
      return;
    }
    
    if (!Number.isInteger(this.productoEnGestion.precio) || this.productoEnGestion.precio < 0) {
      this.presentAlert('Error de Validación', 'El precio debe ser un número entero positivo.');
      return;
    }

    const codigoValido = this.validarCodigo(this.productoEnGestion.codigo, this.productoEnGestion.nombre);
    if (codigoValido !== true) {
      this.presentAlert('Error de Código', codigoValido);
      return;
    }

    if(this.productoEnGestion.codigo && this.productoEnGestion.nombre){
      this.inv.agregarProducto({...this.productoEnGestion, historial: []});
      this.productoEnGestion = {codigo:'', nombre:'', categoria:'', precio:0, cantidad:0, historial:[]};
      this.productosFiltrados = this.inv.productos; 
      this.closeModal();
      this.presentAlert('Éxito', 'Producto agregado correctamente.');
    } else {
      this.presentAlert('Error', 'Debe completar el Código y el Nombre.');
    }
  }
  
  // Método auxiliar validarCodigo
  validarCodigo(codigo: string, nombre: string): true | string {
    if (codigo.length !== 3) {
      return 'El código debe tener exactamente 3 dígitos.';
    }
    if (!nombre) {
      return 'Debe ingresar un nombre para validar la inicial.';
    }
    const inicial = nombre.charAt(0).toUpperCase();
    if (codigo.charAt(0) !== inicial) {
      return `El código debe comenzar con la inicial del producto: ${inicial}.`;
    }
    const correlativo = codigo.substring(1);
    if (isNaN(Number(correlativo))) {
      return 'Los últimos dos dígitos deben ser un número correlativo.';
    }
    return true;
  }
  
  // =================================================================
  // REQUERIMIENTO: MODIFICAR PRODUCTO
  // =================================================================
  // 6. Método guardarModificaciones()
  guardarModificaciones() {
    if (!this.productoEnGestion.nombre || !this.productoEnGestion.categoria) {
        this.presentAlert('Error', 'Nombre y Categoría son obligatorios.');
        return;
    }
    
    if (!Number.isInteger(this.productoEnGestion.precio) || this.productoEnGestion.precio < 0) {
      this.presentAlert('Error de Validación', 'El precio debe ser un número entero positivo.');
      return;
    }

    this.inv.modificarProducto(this.productoEnGestion);
    this.productosFiltrados = this.inv.productos;
    this.closeModal();
    this.presentAlert('Éxito', 'Producto modificado correctamente.');
  }

  // =================================================================
  // REQUERIMIENTO: AGREGAR/ELIMINAR STOCK (y generar Historial)
  // =================================================================
  // 7. Método modificarStock(esAgregar)
  modificarStock(esAgregar: boolean) {
    this.stockError = '';
    const movimiento = Number(this.stockMovimiento);
    
    if (!movimiento || movimiento <= 0 || !Number.isInteger(movimiento)) {
      this.stockError = 'La cantidad de stock debe ser un número entero positivo.';
      return;
    }

    if (!esAgregar) {
      if (this.productoEnGestion.cantidad - movimiento < 0) {
        this.stockError = `No puedes eliminar ${movimiento} unidades. Stock actual: ${this.productoEnGestion.cantidad}.`;
        return;
      }
    }

    const resultado = this.inv.modificarStock(this.productoEnGestion.codigo, movimiento, esAgregar);
    
    if (resultado) {
        this.productoEnGestion.cantidad = resultado.nuevaCantidad; 
        this.productosFiltrados = this.inv.productos; 
        this.stockMovimiento = 0; 
        this.presentToast(`Stock ${esAgregar ? 'añadido' : 'eliminado'} correctamente.`);
    }
  }

  // =================================================================
  // REQUERIMIENTO: ELIMINAR PRODUCTO
  // =================================================================
  // 8. Método eliminar(codigo)
  async eliminar(codigo: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Eliminación',
      message: '¿Está seguro que desea eliminar este producto del inventario?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: () => {
            this.inv.eliminarProducto(codigo);
            this.productosFiltrados = this.inv.productos;
            this.presentToast('Producto eliminado.');
          }
        }
      ]
    });
    await alert.present();
  }

  // =================================================================
  // REQUERIMIENTO: BUSCAR PRODUCTO
  // =================================================================
  // 9. Método buscar()
  buscar() {
    const termino = this.busquedaTermino.toLowerCase();
    if (!termino) {
      this.productosFiltrados = this.inv.productos;
      return;
    }
    
    this.productosFiltrados = this.inv.productos.filter(p => 
      p.nombre.toLowerCase().includes(termino) || 
      p.codigo.toLowerCase().includes(termino)
    );
  }

  // =================================================================
  // REQUERIMIENTO: GENERAR HISTORIAL
  // =================================================================
  // 10. Método verHistorial(producto)
  async verHistorial(producto: Producto) {
    const historialText = producto.historial.map(h => 
      `${h.fecha.toLocaleDateString()} - ${h.tipo}: ${h.cantidad} unidades. (Stock: ${h.stockFinal})`
    ).join('<br>');

    const alert = await this.alertCtrl.create({
      header: `Historial de ${producto.nombre}`,
      message: historialText || 'No hay movimientos registrados.',
      buttons: ['OK']
    });
    await alert.present();
  }

  // =================================================================
  // UTILIDADES
  // =================================================================
  // 11. Método presentAlert(header, message)
  async presentAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
  
  // 12. Método presentToast(message)
  async presentToast(message: string) {
    // Implementación simple de un Toast (necesita importarse ToastController)
    this.presentAlert('Info', message);
  }
}

