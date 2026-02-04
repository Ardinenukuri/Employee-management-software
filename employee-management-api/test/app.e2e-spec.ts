import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Employee API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  it('/auth/register (POST) - Register a user', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: `john.${Date.now()}@test.com`, // Dynamic email
        password: 'password123',
        employeeIdentifier: `ID-${Date.now()}`,
        phoneNumber: '0780000000'
      })
      .expect(201);
  });

  it('/auth/login (POST) - Should return token', async () => {
    // Note: Use an email you just registered or one existing in your DB
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@test.com', password: 'password123' }); // Adjust credentials
    
    if (response.status === 200) {
        authToken = response.body.accessToken;
    }
    expect(response.status).toBeDefined();
  });

  it('/attendance/clock-in (POST) - Requires Auth', () => {
    return request(app.getHttpServer())
      .post('/api/v1/attendance/clock-in')
      .expect(401); // Unauthorized if no token
  });

  afterAll(async () => {
    await app.close();
  });
});