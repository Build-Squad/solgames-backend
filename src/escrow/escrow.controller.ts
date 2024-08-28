import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { EscrowService } from './escrow.service';
import { XcrowExecuteDto } from './dto/execute-escrow.dto';
import { CreateEscrowDto } from './dto/create-escrow.dto';

@Controller('escrow')
export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  @Post('create-escrow')
  createEscrow(@Body() updatedCreateEscrowDto: CreateEscrowDto) {
    return this.escrowService.createEscrow(updatedCreateEscrowDto);
  }

  @Post('execute-deposit')
  async executeXcrow(@Body() xcrowExecuteDto: XcrowExecuteDto) {
    return await this.escrowService.executeDepositXcrow(xcrowExecuteDto);
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
