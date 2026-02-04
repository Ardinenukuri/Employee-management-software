// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../employees/dto/create-employee.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { MailProducerService } from '../mail/mail.producer.service';
import { ResetPasswordDto } from './dto/reset-password.dto';

// Define a type for the user object without the password AND the method
type UserWithoutPassword = Omit<User, 'password' | 'hashPassword'>; // <-- Also omit hashPassword

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private mailProducerService: MailProducerService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<UserWithoutPassword> {
    const { email, employeeIdentifier } = createUserDto;

    const existingUser = await this.usersRepository.findOne({
      where: [{ email }, { employeeIdentifier }],
      withDeleted: true,
    });
    if (existingUser) {
      throw new ConflictException(
        'Email or Employee Identifier already exists',
      );
    }

    const user = this.usersRepository.create(createUserDto);
    await this.usersRepository.save(user);

    // This now correctly matches the updated UserWithoutPassword type
    const { password: _password, ...result } = user;
    return result;
  }

  // ... (login method is unchanged)
  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const { email, password } = loginDto;
    const user = await this.usersRepository.findOneBy({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { email: user.email, sub: user.id, role: user.role };
      const accessToken = this.jwtService.sign(payload);
      return { accessToken };
    } else {
      throw new UnauthorizedException('Please check your login credentials');
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findOneBy({ email });
    if (!user) {
      // We don't want to reveal if a user exists or not for security reasons
      return {
        message:
          'If a matching account exists, a password reset link has been sent.',
      };
    }

    // Create a special, short-lived token for password reset
    const payload = {
      email: user.email,
      sub: user.id,
      purpose: 'password-reset',
    };
    const token = this.jwtService.sign(payload, { expiresIn: '10m' });

    await this.mailProducerService.sendPasswordResetLink(user.email, token);

    return {
      message:
        'If a matching account exists, a password reset link has been sent.',
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;
    let payload;

    // 1. Verify ONLY the token structure
    try {
      payload = this.jwtService.verify(token);
    } catch (_error) {
      throw new UnauthorizedException(
        'Invalid or expired password reset token.',
      );
    }

    // 2. Check purpose outside the try/catch
    if (payload.purpose !== 'password-reset') {
      throw new UnauthorizedException('Invalid token purpose');
    }

    // 3. Lookup user (Now the test will see the NotFoundException)
    const user = await this.usersRepository.findOneBy({ email: payload.email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.save(user);

    return { message: 'Password has been reset successfully.' };
  }
}
