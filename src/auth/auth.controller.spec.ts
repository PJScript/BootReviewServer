import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers:[AuthService]
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBe('hello world')
  });
});
