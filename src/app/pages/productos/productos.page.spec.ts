import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductosPage } from './productos.page';
import { Producto } from '../../models/producto.model';

// ======================================================================
// MOCKS
// ======================================================================
class MockInventarioService {
  productos: Producto[] = [
    { codigo: '001', nombre: 'Producto A', precio: 100, cantidad: 5, categoria: 'General', historial: [] }
  ];

  async cargarDesdeBD() { return true; }

  obtenerProductos() { return this.productos; }

  modificarStock(codigo: string, cantidad: number, esAgregar: boolean) {
    const p = this.productos.find(x => x.codigo === codigo);
    if (!p) return null;

    p.cantidad = esAgregar ? p.cantidad + cantidad : p.cantidad - cantidad;

    return {
      nuevaCantidad: p.cantidad,
      movimiento: {
        fecha: new Date(),
        tipo: esAgregar ? 'INGRESO' : 'EGRESO',
        cantidad,
        stockFinal: p.cantidad
      }
    };
  }

  eliminarProducto(codigo: string) {
    const ix = this.productos.findIndex(x => x.codigo === codigo);
    if (ix === -1) return false;
    this.productos.splice(ix, 1);
    return true;
  }
}

class MockAlertController {
  create = vi.fn().mockResolvedValue({
    present: vi.fn(),
    onDidDismiss: vi.fn(),
    buttons: []
  });
}

// ======================================================================
// TESTS
// ======================================================================
describe('ProductosPage (VITEST)', () => {

  let component: any;
  let inv: any;
  let alertCtrl: any;

  beforeEach(() => {
    inv = new MockInventarioService();
    alertCtrl = new MockAlertController();
    component = new ProductosPage(inv, alertCtrl as any, {} as any);
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar productos del servicio', () => {
    const productos = inv.obtenerProductos();
    expect(productos.length).toBe(1);
    expect(productos[0].nombre).toBe('Producto A');
  });

  it('debería agregar stock', () => {
    const res = inv.modificarStock('001', 3, true);
    expect(res?.nuevaCantidad).toBe(8);
  });

  it('debería quitar stock', () => {
    const res = inv.modificarStock('001', 2, false);
    expect(res?.nuevaCantidad).toBe(3);
  });

  it('debería eliminar producto', () => {
    const eliminado = inv.eliminarProducto('001');
    expect(eliminado).toBe(true);
  });

  it('no debe eliminar producto inexistente', () => {
    const eliminado = inv.eliminarProducto('999');
    expect(eliminado).toBe(false);
  });

  it('debería guardar modificaciones', () => {
    inv.productos[0].nombre = 'Modificado';
    expect(inv.productos[0].nombre).toBe('Modificado');
  });

  it('debería filtrar búsqueda', () => {
    component.productos = inv.productos;
    component.productosFiltrados = inv.productos;
    component.busquedaTermino = 'Producto A';

    component.buscar();
    expect(component.productosFiltrados.length).toBe(1);
  });

  it('debería mostrar todo si búsqueda vacía', () => {
    component.productos = inv.productos;
    component.productosFiltrados = inv.productos;

    component.busquedaTermino = '';
    component.buscar();

    expect(component.productosFiltrados.length).toBe(1);
  });

  it('no debe modificar stock si cantidad inválida', async () => {
    component.productoEnGestion = inv.productos[0];
    component.stockMovimiento = -5;

    await component.modificarStock(true);
    expect(component.stockError).toBe('Cantidad inválida.');
  });

  it('no debe permitir stock negativo', async () => {
    component.productoEnGestion = inv.productos[0];
    component.stockMovimiento = 9999;

    await component.modificarStock(false);
    expect(component.stockError).toContain('Stock insuficiente');
  });

  it('debería preparar modal agregar', () => {
    component.abrirModalAgregar();
    expect(component.productoEnGestion.codigo).toBe('');
  });

  it('debería preparar modal editar', () => {
    const prod = inv.obtenerProductos()[0];
    component.editar(prod);
    expect(component.productoEnGestion.codigo).toBe(prod.codigo);
  });

  it('debería ver historial sin fallar', async () => {
    const prod = inv.obtenerProductos()[0];
    await component.verHistorial(prod);
    expect(alertCtrl.create).toHaveBeenCalled();
  });
});
