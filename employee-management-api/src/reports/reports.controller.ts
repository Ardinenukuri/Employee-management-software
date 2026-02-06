import {
  Controller,
  Get,
  Query,
  Res,
  StreamableFile,
  UseGuards,
  Param,
  Post,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import type { Response } from 'express'; 
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('attendance/pdf')
  @ApiQuery({ name: 'startDate', type: Date, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'endDate', type: Date, description: 'YYYY-MM-DD' })
  async getPdfReport(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
    @Res({ passthrough: true }) res: Response,
  ) {
    const buffer = await this.reportsService.generatePdfReport(
      startDate,
      endDate,
    );
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=attendance-report.pdf',
      'Content-Length': buffer.length,
    });
    return new StreamableFile(buffer);
  }

  @Get('attendance/excel')
  @ApiQuery({ name: 'startDate', type: Date, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'endDate', type: Date, description: 'YYYY-MM-DD' })
  async getExcelReport(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
    @Res({ passthrough: true }) res: Response,
  ) {
    const buffer = await this.reportsService.generateExcelReport(
      startDate,
      endDate,
    );
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=attendance-report.xlsx',
    });
    return new StreamableFile(buffer);
  }

  @Post('attendance/generate')
  @ApiQuery({ name: 'type', enum: ['pdf', 'excel'] })
  async trigger(
    @Query('type') type: 'pdf' | 'excel',
    @Query('start') start: Date,
    @Query('end') end: Date,
  ) {
    return this.reportsService.startReportGeneration(type, start, end);
  }

  @Get('status/:jobId')
  status(@Param('jobId') jobId: string) {
    return this.reportsService.getReportStatus(jobId);
  }

  @Get('download/:jobId')
  download(
    @Param('jobId') jobId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const report = this.reportsService.downloadReport(jobId);
    res.set({ 'Content-Type': report.type });
    if (!report.buffer) {
      throw new Error('Report buffer is undefined');
    }
    return new StreamableFile(report.buffer);
  }
}
