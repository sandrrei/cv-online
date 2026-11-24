import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

// The CV is read from a JSON file, so personal data never lives in the code.
// CV_FILE (default: <DATA_DIR>/cv.json). Falls back to data/cv.example.json.
export const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');

@Injectable()
export class CvService {
  private readonly logger = new Logger(CvService.name);
  private readonly cvFile = process.env.CV_FILE || path.join(DATA_DIR, 'cv.json');
  private readonly exampleFile = path.join(process.cwd(), 'data', 'cv.example.json');
  private profile: any = {};
  private loadedMtime = 0;

  constructor() {
    this.load();
  }

  // Reload automatically when cv.json changes: edit the file, no restart needed
  private load() {
    const file = fs.existsSync(this.cvFile) ? this.cvFile : this.exampleFile;
    try {
      const mtime = fs.statSync(file).mtimeMs;
      if (mtime === this.loadedMtime) return;
      this.profile = JSON.parse(fs.readFileSync(file, 'utf8'));
      this.loadedMtime = mtime;
      this.logger.log(`Loaded CV from ${file}`);
    } catch (e) {
      this.logger.error(`Could not load CV from ${file}: ${e}`);
    }
  }

  getProfile() {
    this.load();
    return this.profile;
  }

  getTerminalOutput(): string {
    const data = this.getProfile();
    const skills = Object.entries(data.skills || {})
      .map(([group, list]) => `- ${this.label(group)}: ${(list as string[]).join(', ')}`)
      .join('\n');
    const experience = (data.experience || [])
      .map((e) => `• ${e.role} @${e.company} (${e.period})\n  - ${(e.highlights || [])[0] || ''}`)
      .join('\n\n');
    const projects = (data.projects || [])
      .map((p, i) => `${i + 1}. ${p.name} - ${p.description}`)
      .join('\n');

    return `
======================================================================
  ${data.name} — ${data.title}
======================================================================
> "${data.tagline || ''}"

> Location: ${data.location || ''} | Email: ${data.email || ''}${data.phone ? ` | Phone: ${data.phone}` : ''}
> Status: ${data.status || ''}

[ SUMMARY ]
${data.bio || ''}

[ PROFESSIONAL EXPERIENCE ]
${experience}

[ CORE SKILLS ]
${skills}

[ HIGHLIGHTED PROJECTS ]
${projects}

[ CONTACT & EASTER EGG ]
${data.easterEgg || ''}
- LinkedIn: ${data.linkedin || ''}
- GitHub: ${data.github || ''}
======================================================================
    `.trim();
  }

  // "cloudAndDevOps" -> "Cloud And Dev Ops"; labels with spaces stay as they are
  private label(key: string): string {
    if (/\s/.test(key)) return key;
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
  }
}
