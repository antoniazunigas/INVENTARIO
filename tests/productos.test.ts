import { describe, it, expect, beforeEach } from 'vitest';

// -----------------------------------------------
// Mock del servicio Inventario para Vitest
// -----------------------------------------------
class MockInventarioService {
  productos = [
    {
      codigo: '001',
      nombre: 'Producto A',
      precio: 100,
      cantidad: 5,
      categoria: 'General',
      historial: []
    }
  ];

  obtenerProductos() {
    return this.productos;
  }

  modificarStock(codigo, cantidad, esAgregar) {
    const producto = this.productos.find(p => p.codigo === codigo);
    if (!producto) return null;

    const nuevaCantidad = esAgregar
      ? producto.cantidad + cantidad
      : producto.cantidad - cantidad;

    if (nuevaCantidad < 0) return null;

    producto.cantidad = nuevaCantidad;

    const mov = {
      fecha: new Date(),
      tipo: esAgregar ? 'INGRESO' : 'EGRESO',
      cantidad,
      stockFinal: nuevaCantidad,
    };

    producto.historial.unshift(mov);

    return { nuevaCantidad, movimiento: mov };
  }

  eliminarProducto(codigo) {
    const i = this.productos.findIndex(p => p.codigo === codigo);
    if (i >= 0) {
      this.productos.splice(i, 1);
      return true;
    }
    return false;
  }
}

// -----------------------------------------------
// VARIABLES
// -----------------------------------------------
let service;

// -----------------------------------------------
// PRUEBAS
// -----------------------------------------------
describe("Inventario - Productos", () => {

  beforeEach(() => {
    service = new MockInventarioService();
  });

  // 1
  it("debería cargar productos correctamente", () => {
    const productos = service.obtenerProductos();
    expect(productos.length).toBe(1);
  });

  // 2
  it("primer producto debería ser Producto A", () => {
    const p = service.obtenerProductos()[0];
    expect(p.nombre).toBe("Producto A");
  });

  // 3
  it("debería agregar stock correctamente", () => {
    const res = service.modificarStock('001', 3, true);
    expect(res.nuevaCantidad).toBe(8);
  });

  // 4
  it("debería registrar historial al agregar", () => {
    service.modificarStock('001', 2, true);
    expect(service.productos[0].historial.length).toBe(1);
  });

  // 5
  it("debería quitar stock correctamente", () => {
    const res = service.modificarStock('001', 2, false);
    expect(res.nuevaCantidad).toBe(3);
  });

  // 6
  it("no debería permitir stock negativo", () => {
    const res = service.modificarStock('001', 99, false);
    expect(res).toBeNull();
  });

  // 7
  it("debería eliminar un producto existente", () => {
    const eliminado = service.eliminarProducto("001");
    expect(eliminado).toBe(true);
  });

  // 8
  it("no debería eliminar un producto inexistente", () => {
    const eliminado = service.eliminarProducto("999");
    expect(eliminado).toBe(false);
  });

  // 9
  it("debería actualizar el nombre correctamente", () => {
    service.productos[0].nombre = "Producto Modificado";
    expect(service.productos[0].nombre).toBe("Producto Modificado");
  });

  // 10
  it("debería registrar historial al quitar stock", () => {
    service.modificarStock('001', 1, false);
    expect(service.productos[0].historial.length).toBe(1);
  });

  // 11
  it("tipo de movimiento debería ser INGRESO al sumar", () => {
    const res = service.modificarStock("001", 1, true);
    expect(res.movimiento.tipo).toBe("INGRESO");
  });

  // 12
  it("tipo de movimiento debería ser EGRESO al restar", () => {
    const res = service.modificarStock("001", 1, false);
    expect(res.movimiento.tipo).toBe("EGRESO");
  });

  // 13
it('debería mantener historial ordenado (el último movimiento debe estar primero)', () => {
  service.modificarStock("001", 1, true);
  service.modificarStock("001", 2, true);

  const hist = service.productos[0].historial;

  // El último movimiento agregado es el primero en la lista (unshift)
  expect(hist[0].cantidad).toBe(2);
  expect(hist[1].cantidad).toBe(1);
});

  // 14
  it("debería devolver null si el código no existe en modificarStock", () => {
    const res = service.modificarStock("999", 5, true);
    expect(res).toBeNull();
  });

  // 15
  it("debería conservar categoría del producto", () => {
    const p = service.obtenerProductos()[0];
    expect(p.categoria).toBe("General");
  });

});
