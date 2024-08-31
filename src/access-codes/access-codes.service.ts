import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccessCode } from './entities/access-code.entity';
import { CreateAccessCodeDto } from './dto/create-access-code.dto';
import { UpdateAccessCodeDto } from './dto/update-access-code.dto';
import { generateUniqueCode } from 'src/utils/helper';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class AccessCodesService {
  constructor(
    @InjectRepository(AccessCode)
    private readonly accessCodeRepository: Repository<AccessCode>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createAccessCodeDto: CreateAccessCodeDto) {
    // Fetch the user to whom the access code is to be assigned
    const user = await this.userRepository.findOne({
      where: { id: createAccessCodeDto.userId },
      relations: ['accessCode'],
    });

    // Check if the user is valid.
    if (!user) {
      return {
        success: false,
        data: null,
        message: 'User not found!',
      };
    }

    // Check if the user already has an access code assigned
    if (user.accessCode) {
      return {
        success: false,
        data: null,
        message: 'User already has an access code assigned!',
      };
    }

    // Generate a unique code
    const code = await generateUniqueCode(this.accessCodeRepository);

    // Create the access code and assign it to the user
    const accessCode = this.accessCodeRepository.create({
      ...createAccessCodeDto,
      code,
      user,
    });

    // Save the access code to the database
    const savedAccessCode = await this.accessCodeRepository.save(accessCode);

    // Update the user's accessCode field with the new access code
    user.accessCode = savedAccessCode;
    await this.userRepository.save(user);

    return savedAccessCode;
  }

  async findAll(): Promise<AccessCode[]> {
    return this.accessCodeRepository.find({
      relations: ['user', 'parentAccessCode'],
    });
  }

  async findOne(id: string): Promise<AccessCode> {
    const accessCode = await this.accessCodeRepository.findOne({
      where: { id },
      relations: ['user', 'parentAccessCode'],
    });
    if (!accessCode) {
      throw new NotFoundException(`Access Code with ID ${id} not found`);
    }
    return accessCode;
  }

  async update(
    id: string,
    updateAccessCodeDto: UpdateAccessCodeDto,
  ): Promise<AccessCode> {
    const accessCode = await this.accessCodeRepository.preload({
      id,
      ...updateAccessCodeDto,
    });
    if (!accessCode) {
      throw new NotFoundException(`Access Code with ID ${id} not found`);
    }
    return this.accessCodeRepository.save(accessCode);
  }

  async remove(id: string): Promise<void> {
    const result = await this.accessCodeRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Access Code with ID ${id} not found`);
    }
  }
}
