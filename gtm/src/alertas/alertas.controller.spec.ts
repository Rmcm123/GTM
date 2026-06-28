import { Test, TestingModule } from '@nestjs/testing';
import { AlertasController } from './alertas.controller';
import { AlertasService } from './alertas.service';

describe('AlertasController', () => {
  let controller: AlertasController;
  let service: Record<string, jest.Mock>;

  beforeEach(async () => {
    service = {
      obtenerTodas: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlertasController],
      providers: [{ provide: AlertasService, useValue: service }],
    }).compile();

    controller = module.get<AlertasController>(AlertasController);
  });

  it('obtenerTodas debe delegar al service', async () => {
    await controller.obtenerTodas();
    expect(service.obtenerTodas).toHaveBeenCalled();
  });
});
