import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { EscrowService } from './escrow.service';
import { XcrowExecuteDto } from './dto/execute-escrow.dto';
import { CreateEscrowDto } from './dto/create-escrow.dto';
import { InitializeAcceptDepositDto } from './dto/initialize-deposit-accept.dto';

@Controller('escrow')
export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  @Post('create-escrow')
  createEscrow(@Body() updatedCreateEscrowDto: CreateEscrowDto) {
    return this.escrowService.createEscrow(updatedCreateEscrowDto);
  }

  @Post('deposit-accept-transaction')
  initializeDepositAcceptTransaction(
    @Body()
    initializeAcceptDepositDto: InitializeAcceptDepositDto,
  ) {
    return this.escrowService.initializeDepositAcceptTransaction(
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.escrowService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.escrowService.remove(+id);
  }
}
