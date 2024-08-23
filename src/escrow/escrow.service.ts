import { Xcrow } from '@xcrowdev/node';
import { Injectable } from '@nestjs/common';
import { CreateEscrowDto } from './dto/create-escrow.dto';
import { UpdateEscrowDto } from './dto/update-escrow.dto';
import configuration from 'src/config/configuration';

const { apiKey, applicationId, network, environment } =
  configuration.escrowConfig;

@Injectable()
export class EscrowService {
  private xcrow: Xcrow;

  constructor() {
    this.xcrow = new Xcrow({
      apiKey,
      applicationId,
      environment: environment as 'test' | 'production',
    });
  }

  async createEscrow(createEscrowDto: CreateEscrowDto) {
    try {
      const depositOutput = await this.xcrow.deposit({
        payer: createEscrowDto.publicKey,
        strategy: 'blockhash',
        priorityFeeLevel: 'Low',
        token: {
          mintAddress: 'So11111111111111111111111111111111111111112',
          amount: createEscrowDto.amount,
        },
        network: network as 'mainnet' | 'devnet',
      });
      return {
        success: true,
        data: depositOutput,
        message: 'Escrow created successfully!',
      };
    } catch (error) {
      console.error('Error during creating a escrow:', error);
      return {
        success: false,
        data: null,
        message: 'Error creating a escrow!',
      };
    }
  }

  findAll() {
    return `This action returns all escrow`;
  }

  findOne(id: number) {
    return `This action returns a #${id} escrow`;
  }

  update(id: number, updateEscrowDto: UpdateEscrowDto) {
    return `This action updates a #${id} escrow`;
  }

  remove(id: number) {
    return `This action removes a #${id} escrow`;
  }
}
