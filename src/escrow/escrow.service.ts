import { Xcrow } from '@xcrowdev/node';
import { Injectable } from '@nestjs/common';
import configuration from 'src/config/configuration';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Escrow } from './entities/escrow.entity';
import { XcrowExecuteDto } from './dto/execute-escrow.dto';
import {
  ESCROW_TRANSACTION_STATUS,
  EscrowTransaction,
} from './entities/escrowTransaction.entity';
import { CreateEscrowDto } from './dto/create-escrow.dto';
import { hexToUint8Array, signTransaction } from 'src/utils/signTransaction';
import * as solanaWeb3 from '@solana/web3.js';

const { apiKey, applicationId, network, environment } =
  configuration.escrowConfig;

const { platformPublicKey, platformPrivateKey } = configuration.platformConfig;

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

  async initializeDepositTransaction({ publicKey, amount, vaultId }) {
    try {
      const depositTransaction = await this.xcrow.deposit({
        payer: publicKey,
        strategy: 'blockhash',
        priorityFeeLevel: 'Low',
        vaultId: vaultId,
        token: {
          mintAddress: 'So11111111111111111111111111111111111111112',
          amount: amount,
        },
        network: network as 'mainnet' | 'devnet',
      });

      const serializedTransactionDeposit =
        solanaWeb3.VersionedTransaction.deserialize(
          Buffer.from(depositTransaction.serializedTransaction, 'base64'),
        );
      serializedTransactionDeposit.sign([
        solanaWeb3.Keypair.fromSecretKey(hexToUint8Array(platformPrivateKey)),
      ]);

      const ser = Buffer.from(
        serializedTransactionDeposit.serialize(),
      ).toString('base64');

      return {
        success: true,
        data: {
          serializedTransaction: ser,
          transactionId: depositTransaction.transactionId,
        },
        message: 'Deposit transaction created successfully!',
      };
    } catch (error) {
      console.error('Error during Deposit transaction creation:', error);
      return {
        success: false,
        data: null,
        message: 'Error during Deposit transaction creation!',
      };
    }
  }

  async createEscrow(updatedCreateEscrowDto: CreateEscrowDto) {
    const { amount, inviteCode, publicKey } = updatedCreateEscrowDto;
    try {
      const createdEscrow = await this.xcrow.createVault({
        payer: platformPublicKey,
        strategy: 'blockhash',
        priorityFeeLevel: 'Medium',
        token: {
          mintAddress: 'So11111111111111111111111111111111111111112',
        },
        network: network as 'mainnet' | 'devnet',
      });

      const signedTransaction = await signTransaction(
        createdEscrow.serializedTransaction,
        platformPrivateKey,
      );

      const executeRes = await this.xcrow.execute({
        vaultId: createdEscrow.vaultId,
        transactionId: createdEscrow.transactionId,
        signedTransaction,
      });

      // Create the escrow record in the database
      const newEscrow = this.escrowRepository.create({
        amount,
        inviteCode: inviteCode,
        vaultId: createdEscrow.vaultId,
        transactionId: createdEscrow.transactionId,
        transactionHash: executeRes.txHash,
      });

      await this.escrowRepository.save(newEscrow);

      const depositTransactionDetails = await this.initializeDepositTransaction(
        {
          publicKey,
          amount,
          vaultId: createdEscrow.vaultId,
        },
      );

      if (depositTransactionDetails.success) {
        return {
          success: true,
          data: {
            escrowDetails: createdEscrow,
            depositSerializedTransaction: depositTransactionDetails.data,
          },
          message: 'Escrow created successfully!',
        };
      } else {
        return depositTransactionDetails;
      }
    } catch (e) {
      console.error('Error during creating a escrow:', e);
      return {
        success: false,
        data: null,
        message:
          'Error creating an escrow transaction, please reload and try again!',
      };
    }
  }

  async executeDepositXcrow(xcrowExecuteDto: XcrowExecuteDto) {
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
        transactionId: transactionId,
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

  remove(id: number) {
    return `This action removes a #${id} escrow`;
  }
}
