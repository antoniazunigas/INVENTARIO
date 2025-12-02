// src/app/pages/productos/productos.page.ts

import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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

  @ViewChild('openModalManagement') modal!: IonModal;

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];

  productoEnGestion: Producto = { codigo:'', nombre:'', categoria:'', precio:0, cantidad:0, historial:[] };
  isEditing: boolean = false;
  stockMovimiento: number = 0;
  stockError: string = '';
  busquedaTermino: string = '';

  constructor(
    private inv: InventarioService,
    private alertCtrl: AlertController,
    private router: Router
  ) {}

  // ======================================================
  // CARGA INICIAL DESDE SQLITE (CORREGIDO)
  // ======================================================
  async ionViewWillEnter() {
    await this.inv.cargarDesdeBD();
    this.productos = this.inv.productos;
    this.productosFiltrados = this.inv.productos;
  }

  // ======================================================
  // CIERRE DE SESIÓN
  // ======================================================
  logout() {
    this.router.navigateByUrl('/login');
  }

  // ======================================================
  // FORMULARIO
  // ======================================================
  abrirModalAgregar() {
    this.isEditing = false;
    this.stockMovimiento = 0;
    this.stockError = '';
    this.productoEnGestion = { codigo:'', nombre:'', categoria:'', precio:0, cantidad:0, historial:[] };
  }

  editar(producto: Producto) {
    this.isEditing = true;
    this.stockMovimiento = 0;
    this.stockError = '';
    this.productoEnGestion = JSON.parse(JSON.stringify(producto));
    document.getElementById('open-modal-management')?.click();
  }

  closeModal() {
    const modalElement = document.querySelector('ion-modal');
    if (modalElement) modalElement.dismiss();
  }

  // ======================================================
  // AGREGAR PRODUCTO
  // ======================================================
  async agregar() {
    this.stockError = '';

    if (!this.productoEnGestion.categoria) {
      this.presentAlert('Error', 'La categoría es obligatoria.');
      return;
    }

    if (!Number.isInteger(this.productoEnGestion.precio) || this.productoEnGestion.precio < 0) {
      this.presentAlert('Error', 'El precio debe ser entero positivo.');
      return;
    }

    const codigoValido = this.validarCodigo(this.productoEnGestion.codigo, this.productoEnGestion.nombre);
    if (codigoValido !== true) {
      this.presentAlert('Error', codigoValido);
      return;
    }

    if (this.productoEnGestion.codigo && this.productoEnGestion.nombre) {
      await this.inv.agregarProducto({ ...this.productoEnGestion, historial: [] });
      this.productosFiltrados = this.inv.productos;
      this.closeModal();
      this.presentAlert('Éxito', 'Producto agregado correctamente.');
    } else {
      this.presentAlert('Error', 'Debe completar Código y Nombre.');
    }
  }

  validarCodigo(codigo: string, nombre: string): true | string {
    if (codigo.length !== 3) return 'El código debe tener 3 dígitos.';
    if (!nombre) return 'Debe ingresar nombre para validar la inicial.';

    const inicial = nombre.charAt(0).toUpperCase();
    if (codigo.charAt(0) !== inicial)
      return `El código debe comenzar con la inicial del producto: ${inicial}.`;

    const correlativo = codigo.substring(1);
    if (isNaN(Number(correlativo))) return 'Los últimos 2 dígitos deben ser numéricos.';
    return true;
  }

  // ======================================================
  // MODIFICAR PRODUCTO
  // ======================================================
  async guardarModificaciones() {
    if (!this.productoEnGestion.nombre || !this.productoEnGestion.categoria) {
      this.presentAlert('Error', 'Nombre y categoría obligatorios.');
      return;
    }

    if (!Number.isInteger(this.productoEnGestion.precio) || this.productoEnGestion.precio < 0) {
      this.presentAlert('Error', 'Precio inválido.');
      return;
    }

    await this.inv.modificarProducto(this.productoEnGestion);
    this.productosFiltrados = this.inv.productos;
    this.closeModal();
    this.presentAlert('Éxito', 'Producto modificado.');
  }

  // ======================================================
  // MODIFICAR STOCK
  // ======================================================
  async modificarStock(esAgregar: boolean) {
    this.stockError = '';
    const movimiento = Number(this.stockMovimiento);

    if (!movimiento || movimiento <= 0 || !Number.isInteger(movimiento)) {
      this.stockError = 'Cantidad inválida.';
      return;
    }

    if (!esAgregar && this.productoEnGestion.cantidad - movimiento < 0) {
      this.stockError = `Stock insuficiente. Actual: ${this.productoEnGestion.cantidad}.`;
      return;
    }

    const resultado = await this.inv.modificarStock(
      this.productoEnGestion.codigo,
      movimiento,
      esAgregar
    );

    if (resultado) {
      this.productoEnGestion.cantidad = resultado.nuevaCantidad;
      this.productosFiltrados = this.inv.productos;
      this.stockMovimiento = 0;
      this.presentAlert('Info', `Stock ${esAgregar ? 'añadido' : 'eliminado'}.`);
    }
  }

  // ======================================================
  // ELIMINAR PRODUCTO
  // ======================================================
  async eliminar(codigo: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Eliminación',
      message: '¿Eliminar este producto?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: async () => {
            await this.inv.eliminarProducto(codigo);
            this.productosFiltrados = this.inv.productos;
            this.presentAlert('Info', 'Producto eliminado.');
          }
        }
      ]
    });
    await alert.present();
  }

  // ======================================================
  // BUSCAR PRODUCTO
  // ======================================================
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

  // ======================================================
  // HISTORIAL
  // ======================================================
  async verHistorial(producto: Producto) {
    const historialText = producto.historial.map(h =>
      `${h.fecha.toLocaleDateString()} - ${h.tipo}: ${h.cantidad} (Stock: ${h.stockFinal})`
    ).join('<br>');

    const alert = await this.alertCtrl.create({
      header: `Historial de ${producto.nombre}`,
      message: historialText || 'Sin movimientos.',
      buttons: ['OK']
    });

    await alert.present();
  }

  // ======================================================
  // UTILIDADES
  // ======================================================
  async presentAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
