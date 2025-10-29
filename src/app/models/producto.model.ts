// src/app/models/producto.model.ts

/**
 * Define la estructura de un movimiento en el historial de stock.
 */
export interface MovimientoHistorial {
    fecha: Date;
    tipo: 'INGRESO' | 'EGRESO';
    cantidad: number;
    stockFinal: number; // Stock después de la operación
}

/**
 * Define la estructura completa de un Producto.
 */
export interface Producto {
    codigo: string;
    nombre: string;
    categoria: string;
    precio: number;
    cantidad: number; // Stock actual
    historial: MovimientoHistorial[];
}
