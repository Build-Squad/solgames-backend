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
import { signTransaction } from 'src/utils/signTransaction';
import * as solanaWeb3 from '@solana/web3.js';
import { InitializeAcceptDepositDto } from './dto/initialize-deposit-accept.dto';
import { Games } from 'src/games/entities/game.entity';
import bs58 from 'bs58';

const { apiKey, applicationId, network, environment } =
  configuration.escrowConfig;

const { platformPublicKey, platformPrivateKey } = configuration.platformConfig;

@Injectable()
export class EscrowService {
  private xcrow: Xcrow;
  @InjectRepository(Escrow) private escrowRepository: Repository<Escrow>;
  @InjectRepository(Games) private gamesRepository: Repository<Games>;
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
          amount: parseFloat(amount),
        },
        network: network as 'mainnet' | 'devnet',
      });

      const serializedTransactionDeposit =
        solanaWeb3.VersionedTransaction.deserialize(
          Buffer.from(depositTransaction.serializedTransaction, 'base64'),
        );

      serializedTransactionDeposit.sign([
        solanaWeb3.Keypair.fromSecretKey(bs58.decode(platformPrivateKey)),
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

      await new Promise((resolve) => setTimeout(resolve, 10000));

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

  async initializeDepositAcceptTransaction(
    initializeAcceptDepositDto: InitializeAcceptDepositDto,
  ) {
    try {
      const { inviteCode, publicKey } = initializeAcceptDepositDto;
      const escrowDetails = await this.escrowRepository.findOne({
        where: { inviteCode },
      });
      const gameDetails = await this.gamesRepository.findOne({
        where: {
          inviteCode,
        },
      });
      if (!escrowDetails) {
        return {
          data: null,
          success: false,
          message: 'No escrow found for this invite code.',
        };
      }
      if (!gameDetails) {
        return {
          data: null,
          success: false,
          message: 'No game found for this invite code.',
        };
      }
      if (gameDetails?.acceptorId) {
        return {
          data: null,
          success: false,
          message: 'A player has already joined the game.',
        };
      }
      const depositDetails = await this.initializeDepositTransaction({
        publicKey,
        amount: escrowDetails?.amount,
        vaultId: escrowDetails?.vaultId,
      });

      if (depositDetails.success) {
        return {
          success: true,
          data: {
            escrowDetails: escrowDetails,
            depositSerializedTransaction: depositDetails.data,
          },
          message: 'Accept transaction initialized successfully!',
        };
      } else {
        return depositDetails;
      }
    } catch (e) {
      console.error(e);
      return {
        success: false,
        data: null,
        message: 'Something went wrong!',
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

      return {
        data: result,
        success: true,
        message: 'Transaction executed successfully!',
      };
    } catch (err) {
      console.error('Xcrow execute error:', err);
      return {
        data: null,
        success: false,
        message: 'Deposit Execute failed! Please try again',
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
