import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccessCode } from './entities/access-code.entity';
import { CreateAccessCodeDto } from './dto/create-access-code.dto';
import { UpdateAccessCodeDto } from './dto/update-access-code.dto';
import { generateUniqueCode } from 'src/utils/helper';
import { User } from 'src/user/entities/user.entity';
import { VerifyAccessCodeDto } from './dto/verify-access-code.dto';

@Injectable()
export class AccessCodesService {
  constructor(
    @InjectRepository(AccessCode)
    private readonly accessCodeRepository: Repository<AccessCode>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createAccessCodeDto: CreateAccessCodeDto) {
    try {
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
          success: true,
          data: null,
          message: 'User already has an access code assigned!',
        };
      } else {
        // Generate a unique code
        const code = await generateUniqueCode(this.accessCodeRepository);

        // Create the access code and assign it to the user
        const accessCode = this.accessCodeRepository.create({
          ...createAccessCodeDto,
          code,
          user,
        });

        // Save the access code to the database
        const savedAccessCode =
          await this.accessCodeRepository.save(accessCode);

        // Update the user's accessCode field with the new access code
        user.accessCode = savedAccessCode;
        await this.userRepository.save(user);

        return {
          data: savedAccessCode,
          success: true,
          message: 'Access code created successfully',
        };
      }
    } catch (e) {
      return {
        success: false,
        message: 'Error creating new access code!',
        data: null,
      };
    }
  }

  async findAll(): Promise<AccessCode[]> {
    return this.accessCodeRepository.find({
      relations: ['user', 'parentAccessCode'],
    });
  }

  async verify(verifyAccessCodeDto: VerifyAccessCodeDto) {
    try {
      const accessCode = await this.accessCodeRepository.findOne({
        where: { code: verifyAccessCodeDto.code },
        relations: ['user'],
      });
      if (!accessCode) {
        return {
          success: false,
          data: null,
          message: 'Not a valid access code!',
        };
      }

      // After verifying create new access code for the user who's using someone's access code
      const createRes = await this.create({
        isActive: true,
        userId: verifyAccessCodeDto.userId,
        parentAccessCodeId: accessCode.id,
      });

      if (createRes.success) {
        return {
          success: true,
          data: accessCode,
          message: 'Access code verified and created successfully!',
        };
      }
      throw Error('Something went wrong');
    } catch (e) {
      console.error(e);
      return {
        success: false,
        data: null,
        message: 'Access code verified successfully!',
      };
    }
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
