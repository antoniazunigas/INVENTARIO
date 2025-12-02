export class MockDatabaseService {

  productos = [
    {
      codigo: '001',
      nombre: 'Producto A',
      categoria: 'General',
      precio: 100,
      cantidad: 5,
      historial: []
    }
  ];

  async initDB() { return; }
  async contarProductos() { return this.productos.length; }
  async obtenerProductos() { return this.productos; }

  async insertarProducto(p: any) {
    this.productos.push(p);
  }

  async actualizarProducto(p: any) {
    const i = this.productos.findIndex(x => x.codigo === p.codigo);
    if (i >= 0) this.productos[i] = p;
  }

  async eliminarProducto(codigo: string) {
    this.productos = this.productos.filter(p => p.codigo !== codigo);
  }

  async guardarMovimiento() { return; }
  async obtenerHistorial() { return []; }
}
