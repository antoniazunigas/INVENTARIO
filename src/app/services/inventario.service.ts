// src/app/services/inventario.service.ts

import { Injectable } from '@angular/core';
import { Producto, MovimientoHistorial } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  // Lista donde se guardarán todos los productos
  public productos: Producto[] = [];

  constructor() { 
    // Opcional: Cargar datos iniciales o desde Local Storage
    this.cargarDatosIniciales();
  }

  // =================================================================
  // LÓGICA DE GESTIÓN (CRUD)
  // =================================================================

  /**
   * Agrega un nuevo producto a la lista.
   * @param nuevoProducto El producto a agregar.
   * @returns true si se agregó, false si el código ya existe.
   */
  agregarProducto(nuevoProducto: Producto): boolean {
    if (this.productos.some(p => p.codigo === nuevoProducto.codigo)) {
      console.error(`Error: El código ${nuevoProducto.codigo} ya está registrado.`);
      return false;
    }
    
    // Asignar el stock inicial si no viene definido (por defecto 0)
    nuevoProducto.cantidad = nuevoProducto.cantidad || 0;
    nuevoProducto.historial = []; // Asegurar historial vacío al inicio

    this.productos.push(nuevoProducto);
    this.guardarEnStorage();
    return true;
  }

  /**
   * Modifica los datos principales de un producto.
   * @param productoModificado El producto con los datos actualizados.
   */
  modificarProducto(productoModificado: Producto): void {
    const index = this.productos.findIndex(p => p.codigo === productoModificado.codigo);
    
    if (index !== -1) {
      // Mantener el stock y el historial intactos
      productoModificado.cantidad = this.productos[index].cantidad;
      productoModificado.historial = this.productos[index].historial;
      
      this.productos[index] = productoModificado;
      this.guardarEnStorage();
    }
  }

  /**
   * Elimina un producto por su código.
   * @param codigo Código del producto a eliminar.
   */
  eliminarProducto(codigo: string): void {
    this.productos = this.productos.filter(p => p.codigo !== codigo);
    this.guardarEnStorage();
  }

  // =================================================================
  // REQUERIMIENTO: GESTIÓN DE STOCK (con Historial)
  // =================================================================

  /**
   * Modifica la cantidad de stock de un producto y registra el movimiento.
   * @param codigo Código del producto.
   * @param cantidad Cantidad a mover.
   * @param esAgregar Si es true (INGRESO), false (EGRESO).
   * @returns Objeto con el nuevo stock y el movimiento, o null si el producto no existe.
   */
  modificarStock(codigo: string, cantidad: number, esAgregar: boolean): { nuevaCantidad: number, movimiento: MovimientoHistorial } | null {
    const producto = this.productos.find(p => p.codigo === codigo);

    if (!producto) return null;

    const stockActual = producto.cantidad;
    const tipoMovimiento = esAgregar ? 'INGRESO' : 'EGRESO';
    let nuevaCantidad = stockActual;

    if (esAgregar) {
      nuevaCantidad += cantidad;
    } else {
      nuevaCantidad -= cantidad;
      // La validación de stock negativo se realiza en el componente, pero es buena práctica aquí también.
      if (nuevaCantidad < 0) return null; 
    }

    producto.cantidad = nuevaCantidad;

    const movimiento: MovimientoHistorial = {
      fecha: new Date(),
      tipo: tipoMovimiento,
      cantidad: cantidad,
      stockFinal: nuevaCantidad
    };

    producto.historial.unshift(movimiento); // Añadir al inicio para que el más nuevo esté primero
    this.guardarEnStorage();

    return { nuevaCantidad, movimiento };
  }


  // =================================================================
  // UTILIDADES (Persistencia/Datos de Prueba)
  // =================================================================
  
  /** Carga datos de prueba si no hay nada en el Local Storage. */
  private cargarDatosIniciales(): void {
    const datosGuardados = localStorage.getItem('inventario_productos');
    if (datosGuardados) {
      // Nota: Al cargar desde Storage, las fechas se pierden y hay que restaurarlas
      this.productos = JSON.parse(datosGuardados).map((p: Producto) => ({
        ...p,
        historial: p.historial.map(h => ({ ...h, fecha: new Date(h.fecha) }))
      }));
    } else {
      // Datos de prueba
      this.productos = [
        { codigo: 'A01', nombre: 'Teclado Mecánico', categoria: 'Electrónica', precio: 50000, cantidad: 12, historial: [] },
        { codigo: 'R01', nombre: 'Ratón Inalámbrico', categoria: 'Electrónica', precio: 25000, cantidad: 4, historial: [] },
        { codigo: 'M01', nombre: 'Monitor 27 Pulgadas', categoria: 'Hardware', precio: 150000, cantidad: 1, historial: [] },
      ];
      this.productos[0].historial = [{ fecha: new Date(), tipo: 'INGRESO', cantidad: 12, stockFinal: 12 }];
      this.productos[1].historial = [{ fecha: new Date(), tipo: 'INGRESO', cantidad: 4, stockFinal: 4 }];
      this.guardarEnStorage();
    }
  }

  /** Guarda la lista de productos en el Local Storage. */
  private guardarEnStorage(): void {
    localStorage.setItem('inventario_productos', JSON.stringify(this.productos));
  }
}
