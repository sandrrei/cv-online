import { Controller, Get, Header, Headers, Ip, Render } from '@nestjs/common';
import { CvService } from './cv.service';
import { MetricsService } from './metrics.service';

@Controller()
export class CvController {
  constructor(
    private readonly cvService: CvService,
    private readonly metricsService: MetricsService,
  ) {}

  @Get()
  @Render('index')
  getHome(
    @Headers('x-forwarded-for') forwardedFor: string,
    @Headers('x-real-ip') realIp: string,
    @Ip() ip: string,
  ) {
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : (realIp || ip);
    this.metricsService.incrementWebHome(clientIp);
    return this.cvService.getProfile();
  }

  @Get('cv')
  getCv(
    @Headers('x-forwarded-for') forwardedFor: string,
    @Headers('x-real-ip') realIp: string,
    @Ip() ip: string,
  ) {
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : (realIp || ip);
    this.metricsService.incrementJsonApi(clientIp);
    return {
      success: true,
      data: this.cvService.getProfile(),
    };
  }

  @Get('cv/terminal')
  @Header('Content-Type', 'text/plain; charset=utf-8')
  getTerminalVersion(
    @Headers('x-forwarded-for') forwardedFor: string,
    @Headers('x-real-ip') realIp: string,
    @Ip() ip: string,
  ): string {
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : (realIp || ip);
    this.metricsService.incrementTerminal(clientIp);
    return this.cvService.getTerminalOutput();
  }

  @Get('cv/metrics')
  @Header('Content-Type', 'text/plain; charset=utf-8')
  getMetrics(): string {
    return this.metricsService.getPrometheusMetrics();
  }
}