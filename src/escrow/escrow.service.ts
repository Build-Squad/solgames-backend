import { Xcrow } from '@xcrowdev/node';
import { Injectable } from '@nestjs/common';
import { CreateEscrowDto } from './dto/create-escrow.dto';
import { UpdateEscrowDto } from './dto/update-escrow.dto';
import configuration from 'src/config/configuration';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Escrow } from './entities/escrow.entity';
import { XcrowExecuteDto } from './dto/execute-escrow.dto';
import {
  ESCROW_TRANSACTION_STATUS,
  EscrowTransaction,
} from './entities/escrowTransaction.entity';

const { apiKey, applicationId, network, environment } =
  configuration.escrowConfig;

@Injectable()
export class EscrowService {
  private xcrow: Xcrow;
  @InjectRepository(Escrow) private escrowRepository: Repository<Escrow>;
  @InjectRepository(EscrowTransaction)
  private escrowTransactionRepository: Repository<EscrowTransaction>;

  constructor() {
    this.xcrow = new Xcrow({
      apiKey,
      applicationId,
      environment: environment as 'test' | 'production',
    });
  }

  async initializeCreateEscrow(createEscrowDto: CreateEscrowDto) {
    const { publicKey, amount, inviteCode } = createEscrowDto;
    try {
      const depositOutput = await this.xcrow.deposit({
        payer: publicKey,
        strategy: 'blockhash',
        priorityFeeLevel: 'Low',
        token: {
          mintAddress: 'So11111111111111111111111111111111111111112',
          amount: amount,
        },
        network: network as 'mainnet' | 'devnet',
      });

      // Create the escrow record in the database
      const newEscrow = this.escrowRepository.create({
        amount,
        inviteCode: inviteCode,
        vaultId: depositOutput?.vaultId,
      });

      await this.escrowRepository.save(newEscrow);

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
        message:
          'Error creating an escrow transaction, please reload and try again!',
      };
    }
  }

  async initializeAcceptEscrow(createEscrowDto: CreateEscrowDto) {
    const { publicKey, inviteCode } = createEscrowDto;

    const escrow = await this.escrowRepository.findOne({
      where: {
        inviteCode,
      },
    });

    if (escrow) {
      try {
        const depositOutput = await this.xcrow.deposit({
          payer: publicKey,
          strategy: 'blockhash',
          priorityFeeLevel: 'Low',
          token: {
            mintAddress: 'So11111111111111111111111111111111111111112',
            amount: Number(escrow.amount),
          },
          network: network as 'mainnet' | 'devnet',
          vaultId: escrow?.vaultId,
        });
        return {
          success: true,
          data: depositOutput,
          message: 'Successfully initiated fund transfer!',
        };
      } catch (error) {
        console.error('Error creating an accept transaction:', error);
        return {
          success: false,
          data: null,
          message:
            'Error creating an accept transaction, please reload and try again!',
        };
      }
    } else {
      return {
        success: false,
        data: null,
        message: 'Escrow not found',
      };
    }
  }

  async executeXcrow(xcrowExecuteDto: XcrowExecuteDto) {
    const {
      vaultId,
      signedTransaction,
      transactionId,
      inviteCode,
      userId,
      userRole,
    } = xcrowExecuteDto;

    try {
      const result = await this.xcrow.execute({
        vaultId,
        signedTransaction,
        transactionId,
      });

      const escrowAccount = await this.escrowRepository.findOne({
        where: { inviteCode },
      });

      // Create the escrow transaction record in the database
      const newEscrowTransaction = this.escrowTransactionRepository.create({
        amount: escrowAccount.amount,
        escrow: escrowAccount,
        status: ESCROW_TRANSACTION_STATUS.Completed,
        transactionHash: result?.txHash,
        userId,
        role: userRole,
      });

      await this.escrowTransactionRepository.save(newEscrowTransaction);

      return { data: result, success: true, message: 'Transaction saved!' };
    } catch (err) {
      console.error('Xcrow execute error:', err);
      return {
        data: null,
        success: false,
        message: 'Save transaction failed! Please try again',
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
