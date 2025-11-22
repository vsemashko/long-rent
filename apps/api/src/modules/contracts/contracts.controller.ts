import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { CreateContractDto, UpdateContractDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createContract(@Request() req, @Body() createContractDto: CreateContractDto) {
    return this.contractsService.createContract(req.user.id, createContractDto);
  }

  @Get('my-contracts')
  @UseGuards(JwtAuthGuard)
  getMyContracts(@Request() req) {
    return this.contractsService.getMyContracts(req.user.id);
  }

  @Get('landlord-contracts')
  @UseGuards(JwtAuthGuard)
  getLandlordContracts(@Request() req) {
    return this.contractsService.getLandlordContracts(req.user.id);
  }

  @Get('tenant-contracts')
  @UseGuards(JwtAuthGuard)
  getTenantContracts(@Request() req) {
    return this.contractsService.getTenantContracts(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getContractById(@Request() req, @Param('id') id: string) {
    return this.contractsService.getContractById(req.user.id, id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updateContract(
    @Request() req,
    @Param('id') id: string,
    @Body() updateContractDto: UpdateContractDto,
  ) {
    return this.contractsService.updateContract(req.user.id, id, updateContractDto);
  }

  @Post(':id/sign')
  @UseGuards(JwtAuthGuard)
  signContract(
    @Request() req,
    @Param('id') id: string,
    @Body() signatureData: any,
  ) {
    return this.contractsService.signContract(req.user.id, id, signatureData);
  }

  @Post(':id/activate')
  @UseGuards(JwtAuthGuard)
  activateContract(@Request() req, @Param('id') id: string) {
    return this.contractsService.activateContract(req.user.id, id);
  }

  @Post(':id/terminate')
  @UseGuards(JwtAuthGuard)
  terminateContract(
    @Request() req,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.contractsService.terminateContract(req.user.id, id, reason);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteContract(@Request() req, @Param('id') id: string) {
    return this.contractsService.deleteContract(req.user.id, id);
  }
}
