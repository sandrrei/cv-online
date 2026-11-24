import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as geoip from 'geoip-lite';
import { DATA_DIR } from './cv.service';

@Injectable()
export class MetricsService {
  private readonly filePath = path.join(DATA_DIR, 'metrics.json');
  private stats = {
    webHomeVisits: 0,
    jsonApiRequests: 0,
    terminalRequests: 0,
    countries: {} as Record<string, number>,
    startTime: new Date().toISOString(),
  };

  constructor() {
    this.loadMetrics();
  }

  private loadMetrics() {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
        this.stats.webHomeVisits = data.webHomeVisits || 0;
        this.stats.jsonApiRequests = data.jsonApiRequests || 0;
        this.stats.terminalRequests = data.terminalRequests || 0;
        this.stats.countries = data.countries || {};
      }
    } catch (e) {
      console.error('Could not load metrics, starting fresh', e);
    }
  }

  private saveMetrics() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.stats, null, 2));
    } catch (e) {
      console.error('Could not save metrics', e);
    }
  }

  private recordCountryFromIp(ip?: string) {
    let code = 'UNKNOWN';
    
    if (ip) {
      // Limpar IP caso venha em formato IPv6 encapsulado (ex: ::ffff:192.168.1.1)
      const cleanIp = ip.replace(/^.*:/, '');
      const geo = geoip.lookup(cleanIp);
      if (geo && geo.country) {
        code = geo.country.toUpperCase();
      }
    }

    this.stats.countries[code] = (this.stats.countries[code] || 0) + 1;
  }

  incrementWebHome(ip?: string) {
    this.stats.webHomeVisits++;
    this.recordCountryFromIp(ip);
    this.saveMetrics();
  }

  incrementJsonApi(ip?: string) {
    this.stats.jsonApiRequests++;
    this.recordCountryFromIp(ip);
    this.saveMetrics();
  }

  incrementTerminal(ip?: string) {
    this.stats.terminalRequests++;
    this.recordCountryFromIp(ip);
    this.saveMetrics();
  }

  getStats() {
    return {
      ...this.stats,
      uptimeSeconds: Math.floor((Date.now() - new Date(this.stats.startTime).getTime()) / 1000),
    };
  }

  getPrometheusMetrics(): string {
    const s = this.getStats();
    let metrics = `
# HELP cv_app_uptime_seconds Uptime of the CV application in seconds
# TYPE cv_app_uptime_seconds gauge
cv_app_uptime_seconds ${s.uptimeSeconds}

# HELP cv_web_visits_total Total visits to the web UI
# TYPE cv_web_visits_total counter
cv_web_visits_total ${s.webHomeVisits}

# HELP cv_json_api_requests_total Total requests to the JSON API (/cv)
# TYPE cv_json_api_requests_total counter
cv_json_api_requests_total ${s.jsonApiRequests}

# HELP cv_terminal_requests_total Total requests to the terminal version (/cv/terminal)
# TYPE cv_terminal_requests_total counter
cv_terminal_requests_total ${s.terminalRequests}
`;

    metrics += `\n# HELP cv_visits_by_country Visits broken down by country code\n# TYPE cv_visits_by_country counter\n`;
    for (const [country, count] of Object.entries(s.countries)) {
      metrics += `cv_visits_by_country{country="${country}"} ${count}\n`;
    }

    return metrics.trim();
  }
}