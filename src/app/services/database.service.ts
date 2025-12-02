// src/app/services/database.service.ts


import { Injectable } from '@angular/core';
import initSqlJs from 'sql.js';
import sqlWasm from 'sql.js/dist/sql-wasm.wasm?url';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  private db: any; // 👈 Tipo corregido

  // ======================================================
  //   INICIALIZAR BASE DE DATOS
  // ======================================================
  async initDB(): Promise<void> {
    const SQL = await initSqlJs({
      locateFile: () => sqlWasm,
    });

    this.db = new SQL.Database();

    this.db.run(`
      CREATE TABLE IF NOT EXISTS productos (
        codigo TEXT PRIMARY KEY,
        nombre TEXT,
        categoria TEXT,
        precio INTEGER,
        cantidad INTEGER
      );
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS historial (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo TEXT,
        fecha TEXT,
        tipo TEXT,
        cantidad INTEGER,
        stockFinal INTEGER
      );
    `);
  }

  // ======================================================
  //   CONTAR PRODUCTOS
  // ======================================================
  async contarProductos(): Promise<number> {
    const res = this.db.exec("SELECT COUNT(*) as total FROM productos");
    return res[0]?.values?.[0]?.[0] ?? 0;
  }

  // ======================================================
  //   OBTENER PRODUCTOS
  // ======================================================
  async obtenerProductos(): Promise<any[]> {
    const res = this.db.exec("SELECT * FROM productos");
    if (!res.length) return [];

    return res[0].values.map((row: any[]) => ({
      codigo: row[0],
      nombre: row[1],
      categoria: row[2],
      precio: row[3],
      cantidad: row[4],
    }));
  }

  // ======================================================
  //   INSERTAR PRODUCTO
  // ======================================================
  async insertarProducto(p: any) {
    this.db.run(
      "INSERT INTO productos VALUES (?, ?, ?, ?, ?)",
      [p.codigo, p.nombre, p.categoria, p.precio, p.cantidad]
    );
  }

  // ======================================================
  //   ACTUALIZAR PRODUCTO
  // ======================================================
  async actualizarProducto(p: any) {
    this.db.run(
      "UPDATE productos SET nombre=?, categoria=?, precio=?, cantidad=? WHERE codigo=?",
      [p.nombre, p.categoria, p.precio, p.cantidad, p.codigo]
    );
  }

  // ======================================================
  //   ELIMINAR PRODUCTO
  // ======================================================
  async eliminarProducto(codigo: string) {
    this.db.run("DELETE FROM productos WHERE codigo=?", [codigo]);
    this.db.run("DELETE FROM historial WHERE codigo=?", [codigo]);
  }

  // ======================================================
  //   GUARDAR MOVIMIENTO
  // ======================================================
  async guardarMovimiento(m: any) {
    this.db.run(
      `INSERT INTO historial (codigo, fecha, tipo, cantidad, stockFinal)
       VALUES (?, ?, ?, ?, ?)`,
      [m.codigo, m.fecha, m.tipo, m.cantidad, m.stockFinal]
    );
  }

  // ======================================================
  //   OBTENER HISTORIAL
  // ======================================================
  async obtenerHistorial(codigo: string): Promise<any[]> {
    const res = this.db.exec(
      "SELECT * FROM historial WHERE codigo=? ORDER BY id DESC",
      [codigo]
    );

    if (!res.length) return [];

    return res[0].values.map((row: any[]) => ({
      fecha: row[2],
      tipo: row[3],
      cantidad: row[4],
      stockFinal: row[5],
    }));
  }
}
