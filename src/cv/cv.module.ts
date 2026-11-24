import { Module } from '@nestjs/common';
import { CvController } from './cv.controller';
import { CvService } from './cv.service';
import { MetricsService } from './metrics.service';

@Module({
  controllers: [CvController],
  providers: [CvService, MetricsService],
  exports: [CvService, MetricsService], // <--- Exportar também o MetricsService
})
export class CvModule {}
