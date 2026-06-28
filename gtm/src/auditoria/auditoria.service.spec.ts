import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuditoriaService } from './auditoria.service';
import { BitacoraAuditoria } from './bitacora-auditoria.entity';

describe('AuditoriaService', () => {
  let service: AuditoriaService;
  let repositorio: Record<string, jest.Mock>;

  beforeEach(async () => {
    repositorio = {
      create: jest.fn(
        (datos: Partial<BitacoraAuditoria>) =>
          ({
            id: 'a-uuid-1',
            creadoEn: new Date(),
            ...datos,
          }) as BitacoraAuditoria,
      ),
      save: jest.fn((entidad: BitacoraAuditoria) => Promise.resolve(entidad)),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditoriaService,
        {
          provide: getRepositoryToken(BitacoraAuditoria),
          useValue: repositorio,
        },
      ],
    }).compile();

    service = module.get<AuditoriaService>(AuditoriaService);
  });

  describe('registrar', () => {
    it('debe crear y guardar un registro de auditoria', async () => {
      const datos = {
        accion: 'POST',
        recurso: '/clientes',
        descripcion: 'Crear cliente',
        datosEntrada: { rut: '12345678-9' },
        usuario: 'admin',
        direccionIp: '127.0.0.1',
      };

      await service.registrar(datos);

      expect(repositorio.create).toHaveBeenCalledWith({
        accion: 'POST',
        recurso: '/clientes',
        descripcion: 'Crear cliente',
        datosEntrada: { rut: '12345678-9' },
        usuario: 'admin',
        direccionIp: '127.0.0.1',
      });
      expect(repositorio.save).toHaveBeenCalled();
    });

    it('debe usar "sistema" como usuario por defecto', async () => {
      await service.registrar({
        accion: 'POST',
        recurso: '/clientes',
      });

      expect(repositorio.create).toHaveBeenCalledWith(
        expect.objectContaining({ usuario: 'sistema' }),
      );
    });
  });

  describe('buscarTodos', () => {
    it('debe retornar registros ordenados por fecha descendente', async () => {
      const registros = [
        { id: '1', accion: 'POST', recurso: '/clientes', creadoEn: new Date() },
        {
          id: '2',
          accion: 'PATCH',
          recurso: '/ordenes-trabajo',
          creadoEn: new Date(),
        },
      ];
      repositorio.find.mockResolvedValue(registros);

      const resultado = await service.buscarTodos();

      expect(resultado).toHaveLength(2);
      expect(repositorio.find).toHaveBeenCalledWith({
        order: { creadoEn: 'DESC' },
        take: 50,
      });
    });

    it('debe respetar el limite personalizado', async () => {
      repositorio.find.mockResolvedValue([]);

      await service.buscarTodos(10);

      expect(repositorio.find).toHaveBeenCalledWith({
        order: { creadoEn: 'DESC' },
        take: 10,
      });
    });
  });
});
