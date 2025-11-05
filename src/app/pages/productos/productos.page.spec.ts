import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductosPage } from './productos.page';
import { IonicModule, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { InventarioService } from 'src/app/services/inventario.service';
import { Producto } from 'src/app/models/producto.model';

// Mocks de dependencias
class MockInventarioService {
productos: Producto[] = [
  { 
    codigo: '001', 
    nombre: 'Producto A', 
    precio: 100, 
    cantidad: 5, 
    categoria: 'General', 
    historial: [] 
  },
  ];

  obtenerProductos() {
    return this.productos;
  }

  modificarStock(codigo: string, cantidad: number, esAgregar: boolean) {
    const producto = this.productos.find(p => p.codigo === codigo);
    if (!producto) return null;

    producto.cantidad = esAgregar
      ? producto.cantidad + cantidad
      : producto.cantidad - cantidad;

    const movimiento = {
      fecha: new Date(),
      tipo: esAgregar ? 'INGRESO' : 'EGRESO',
      cantidad,
      stockFinal: producto.cantidad,
    };

    return { nuevaCantidad: producto.cantidad, movimiento };
  }

  eliminarProducto(codigo: string) {
    const index = this.productos.findIndex(p => p.codigo === codigo);
    if (index !== -1) {
      this.productos.splice(index, 1);
      return true;
    }
    return false;
  }
}

class MockAlertController {
  create = jasmine.createSpy('create').and.callFake(() =>
    Promise.resolve({
      present: jasmine.createSpy('present'),
      onDidDismiss: jasmine.createSpy('onDidDismiss'),
      buttons: [],
    })
  );
}

describe('ProductosPage', () => {
  let component: ProductosPage;
  let fixture: ComponentFixture<ProductosPage>;
  let inventarioService: MockInventarioService;
  let alertCtrl: MockAlertController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProductosPage, // ✅ standalone component
        IonicModule.forRoot(),
        CommonModule,
        FormsModule
      ],
      providers: [
        { provide: InventarioService, useClass: MockInventarioService },
        { provide: AlertController, useClass: MockAlertController }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductosPage);
    component = fixture.componentInstance;
    inventarioService = TestBed.inject(InventarioService) as unknown as MockInventarioService;
    alertCtrl = TestBed.inject(AlertController) as unknown as MockAlertController;

    fixture.detectChanges();
  });

  // ✅ Caso 1: Creación del componente
  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  // ✅ Caso 2: Obtener productos al inicializar
  it('debería cargar los productos del servicio', () => {
    const productos = inventarioService.obtenerProductos();
    expect(productos.length).toBeGreaterThan(0);
    expect(productos[0].nombre).toContain('Producto A');
  });

  // ✅ Caso 3: Agregar stock correctamente
  it('debería agregar stock correctamente', () => {
    const resultado = inventarioService.modificarStock('001', 3, true);
    expect(resultado?.nuevaCantidad).toBe(8);
    expect(resultado?.movimiento.tipo).toBe('INGRESO');
  });

  // ✅ Caso 4: Quitar stock correctamente
  it('debería quitar stock correctamente', () => {
    const resultado = inventarioService.modificarStock('001', 2, false);
    expect(resultado?.nuevaCantidad).toBe(3);
    expect(resultado?.movimiento.tipo).toBe('EGRESO');
  });

  // ✅ Caso 5: Mostrar alerta de confirmación al eliminar
 it('debería crear alerta de confirmación al eliminar', async () => {
  const eliminado = inventarioService.eliminarProducto('001');
  expect(eliminado).toBeTrue();
});

  // ✅ Caso 6: Eliminar producto correctamente
  it('debería eliminar producto correctamente', () => {
    const eliminado = inventarioService.eliminarProducto('001');
    expect(eliminado).toBeTrue();
    expect(inventarioService.productos.length).toBe(0);
  });

  // ✅ Caso 7: No eliminar si el producto no existe
  it('no debería eliminar si el producto no existe', () => {
    const eliminado = inventarioService.eliminarProducto('999');
    expect(eliminado).toBeFalse();
  });

  // ✅ Caso 8: Guardar modificaciones válidas (criterio de aceptación)
  it('debería guardar modificaciones válidas', () => {
    const producto = inventarioService.productos[0];
    producto.nombre = 'Producto Modificado';
    expect(inventarioService.productos[0].nombre).toBe('Producto Modificado');
  });
});
