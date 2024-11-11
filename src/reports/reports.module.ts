import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Reports } from './reports.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reports])],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
