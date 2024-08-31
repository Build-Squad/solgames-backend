import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AccessCodesService } from './access-codes.service';
import { CreateAccessCodeDto } from './dto/create-access-code.dto';
import { UpdateAccessCodeDto } from './dto/update-access-code.dto';

@Controller('access-codes')
export class AccessCodesController {
  constructor(private readonly accessCodesService: AccessCodesService) {}

  @Post()
  create(@Body() createAccessCodeDto: CreateAccessCodeDto) {
    return this.accessCodesService.create(createAccessCodeDto);
  }

  @Get()
  findAll() {
    return this.accessCodesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accessCodesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAccessCodeDto: UpdateAccessCodeDto,
  ) {
    return this.accessCodesService.update(id, updateAccessCodeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accessCodesService.remove(id);
  }
}
