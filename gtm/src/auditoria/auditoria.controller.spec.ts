import { Test, TestingModule } from '@nestjs/testing';
import { AuditoriaController } from './auditoria.controller';
import { AuditoriaService } from './auditoria.service';

describe('AuditoriaController', () => {
  let controller: AuditoriaController;
  let service: Record<string, jest.Mock>;

  beforeEach(async () => {
    service = {
      buscarTodos: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditoriaController],
      providers: [{ provide: AuditoriaService, useValue: service }],
    }).compile();

    controller = module.get<AuditoriaController>(AuditoriaController);
  });

  it('buscarTodos debe delegar al service con limite por defecto', async () => {
    await controller.buscarTodos();
    expect(service.buscarTodos).toHaveBeenCalledWith(50);
  });

  it('buscarTodos debe respetar el limite del query param', async () => {
    await controller.buscarTodos('20');
    expect(service.buscarTodos).toHaveBeenCalledWith(20);
  });

  it('buscarTodos debe limitar a maximo 100', async () => {
    await controller.buscarTodos('500');
    expect(service.buscarTodos).toHaveBeenCalledWith(100);
  });
});
