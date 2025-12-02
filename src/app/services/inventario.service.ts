// ==========================================================
//  INVENTARIO SERVICE COMPLETO PARA SQL.js + PRODUCTOS INICIALES
// ==========================================================

import { Injectable } from '@angular/core';
import { Producto, MovimientoHistorial } from '../models/producto.model';
import { DatabaseService } from './database.service';

// ==========================================================
// PRODUCTOS INICIALES (solo se insertan una vez)
// ==========================================================
export const PRODUCTOS_INICIALES: Producto[] = [
  { codigo: 'L01', nombre: 'Laptop Lenovo IdeaPad', categoria: 'Computadores', precio: 450000, cantidad: 5, historial: [] },
  { codigo: 'L02', nombre: 'Laptop HP Pavilion', categoria: 'Computadores', precio: 520000, cantidad: 3, historial: [] },
  { codigo: 'M01', nombre: 'Mouse Logitech M90', categoria: 'Periféricos', precio: 8000, cantidad: 20, historial: [] },
  { codigo: 'M02', nombre: 'Mouse Gamer Redragon Cobra', categoria: 'Periféricos', precio: 18000, cantidad: 12, historial: [] },
  { codigo: 'T01', nombre: 'Teclado Mecánico HyperX Alloy', categoria: 'Periféricos', precio: 45000, cantidad: 8, historial: [] },
  { codigo: 'T02', nombre: 'Teclado Logitech K120', categoria: 'Periféricos', precio: 12000, cantidad: 15, historial: [] },
  { codigo: 'A01', nombre: 'Audífonos Sony WH-CH510', categoria: 'Audio', precio: 35000, cantidad: 6, historial: [] },
  { codigo: 'A02', nombre: 'Audífonos In Ear Xiaomi', categoria: 'Audio', precio: 7000, cantidad: 25, historial: [] },
  { codigo: 'D01', nombre: 'Disco SSD Kingston 480GB', categoria: 'Almacenamiento', precio: 28000, cantidad: 14, historial: [] },
  { codigo: 'D02', nombre: 'Disco HDD Seagate 1TB', categoria: 'Almacenamiento', precio: 35000, cantidad: 10, historial: [] },
  { codigo: 'M03', nombre: 'Monitor LG 24"', categoria: 'Monitores', precio: 110000, cantidad: 4, historial: [] },
  { codigo: 'M04', nombre: 'Monitor Samsung Curvo 27"', categoria: 'Monitores', precio: 190000, cantidad: 2, historial: [] }
];

@Injectable({
  providedIn: 'root'
})
export class InventarioService {

  public productos: Producto[] = [];

  constructor(private db: DatabaseService) {}

  // ==========================================================
  // Insertar productos iniciales solo al inicio
  // ==========================================================
  async insertarProductosIniciales(): Promise<void> {
    const total = await this.db.contarProductos();

    if (total > 0) {
      console.log("La BD ya tiene productos, no se insertan iniciales.");
      return;
    }

    console.log("Insertando productos iniciales...");

    for (const p of PRODUCTOS_INICIALES) {
      await this.db.insertarProducto(p);
    }

    console.log("Productos iniciales insertados.");
  }

  // ==========================================================
  // Cargar datos desde la BD
  // ==========================================================
  async cargarDesdeBD(): Promise<void> {
    await this.db.initDB();            // Inicializa SQL.js o BD persistente
    await this.insertarProductosIniciales(); // Carga inicial si está vacía

    // Obtener productos
    const lista = await this.db.obtenerProductos();

    this.productos = lista.map((p: any) => ({
      codigo: p.codigo,
      nombre: p.nombre,
      categoria: p.categoria,
      precio: p.precio,
      cantidad: p.cantidad,
      historial: []
    }));

    // Obtener historial por producto
    for (const prod of this.productos) {
      const histo = await this.db.obtenerHistorial(prod.codigo);

      prod.historial = histo.map((h: any) => ({
        fecha: new Date(h[2] ?? h.fecha), // soporte SQL.js
        tipo: h[3] ?? h.tipo,
        cantidad: h[4] ?? h.cantidad,
        stockFinal: h[5] ?? h.stockFinal
      }));
    }

    console.log("Inventario cargado desde BD.");
  }

  // ==========================================================
  // AGREGAR
  // ==========================================================
  async agregarProducto(nuevo: Producto): Promise<boolean> {
    if (this.productos.some(p => p.codigo === nuevo.codigo)) {
      return false;
    }

    await this.db.insertarProducto(nuevo);
    this.productos.push({ ...nuevo, historial: [] });

    return true;
  }

  // ==========================================================
  // MODIFICAR
  // ==========================================================
  async modificarProducto(producto: Producto): Promise<void> {
    await this.db.actualizarProducto(producto);

    const i = this.productos.findIndex(p => p.codigo === producto.codigo);
    if (i >= 0) {
      this.productos[i] = {
        ...this.productos[i],
        nombre: producto.nombre,
        categoria: producto.categoria,
        precio: producto.precio
      };
    }
  }

  // ==========================================================
  // ELIMINAR
  // ==========================================================
  async eliminarProducto(codigo: string): Promise<void> {
    await this.db.eliminarProducto(codigo);
    this.productos = this.productos.filter(p => p.codigo !== codigo);
  }

  // ==========================================================
  // MODIFICAR STOCK + HISTORIAL
  // ==========================================================
  async modificarStock(
    codigo: string,
    cantidad: number,
    esAgregar: boolean
  ): Promise<{ nuevaCantidad: number, movimiento: MovimientoHistorial } | null> {

    const producto = this.productos.find(p => p.codigo === codigo);
    if (!producto) return null;

    let nuevaCantidad = producto.cantidad;

    if (esAgregar) nuevaCantidad += cantidad;
    else nuevaCantidad -= cantidad;

    if (nuevaCantidad < 0) return null;

    // Actualizar BD
    await this.db.actualizarProducto({
      ...producto,
      cantidad: nuevaCantidad
    });

    // Movimiento historial
    const mov: MovimientoHistorial = {
      fecha: new Date(),
      tipo: esAgregar ? 'INGRESO' : 'EGRESO',
      cantidad,
      stockFinal: nuevaCantidad
    };

    await this.db.guardarMovimiento({
      codigo,
      fecha: mov.fecha.toISOString(),
      tipo: mov.tipo,
      cantidad: mov.cantidad,
      stockFinal: mov.stockFinal
    });

    // Actualizar memoria
    producto.cantidad = nuevaCantidad;
    producto.historial.unshift(mov);

    return { nuevaCantidad, movimiento: mov };
  }
}
