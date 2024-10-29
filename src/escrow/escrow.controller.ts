import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { EscrowService } from './escrow.service';
import { XcrowExecuteDto } from './dto/execute-escrow.dto';
import { CreateEscrowDto } from './dto/create-escrow.dto';
import { InitializeAcceptDepositDto } from './dto/initialize-deposit-accept.dto';

@Controller('escrow')
export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  @Post('create-escrow')
  async createEscrow(@Body() updatedCreateEscrowDto: CreateEscrowDto) {
    return await this.escrowService.createEscrow(updatedCreateEscrowDto);
  }

  @Post('deposit-accept-transaction')
  async initializeDepositAcceptTransaction(
    @Body()
    initializeAcceptDepositDto: InitializeAcceptDepositDto,
  ) {
    return await this.escrowService.initializeDepositAcceptTransaction(
      initializeAcceptDepositDto,
    );
  }

  @Post('execute-deposit')
  async executeXcrow(@Body() xcrowExecuteDto: XcrowExecuteDto) {
    return await this.escrowService.executeDepositXcrow(xcrowExecuteDto);
  }
  @Post('withdrawal-transaction')
  async withdrawalTransaction(@Body() xcrowWithdrawalTransaction: any) {
    return await this.escrowService.initializeWithdrawTransaction(
      xcrowWithdrawalTransaction,
    );
  }

  @Post('execute-withdrawal')
  async executeWithdrawal(@Body() xcrowExecuteWithdrawalDto: any) {
    return await this.escrowService.executeWithdrawal(
      xcrowExecuteWithdrawalDto,
    );
  }

  @Get()
  findAll() {
    return this.escrowService.findAll();
  }

  @Get('get-escrow/:inviteCode')
  findOne(@Param('inviteCode') inviteCode: string) {
    return this.escrowService.findOne(inviteCode);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.escrowService.remove(+id);
  }
}
