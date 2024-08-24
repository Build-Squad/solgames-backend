import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EscrowService } from './escrow.service';
import { CreateEscrowDto } from './dto/create-escrow.dto';
import { UpdateEscrowDto } from './dto/update-escrow.dto';
import { XcrowExecuteDto } from './dto/execute-escrow.dto';

@Controller('escrow')
export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  @Post('deposit')
  create(@Body() createEscrowDto: CreateEscrowDto) {
    return this.escrowService.createEscrow(createEscrowDto);
  }

  @Post('execute')
  async executeXcrow(@Body() xcrowExecuteDto: XcrowExecuteDto) {
    return await this.escrowService.executeXcrow(xcrowExecuteDto);
  }

  @Get()
  findAll() {
    return this.escrowService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.escrowService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEscrowDto: UpdateEscrowDto) {
    return this.escrowService.update(+id, updateEscrowDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.escrowService.remove(+id);
  }
}
