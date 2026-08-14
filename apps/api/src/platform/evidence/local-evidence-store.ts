import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";

import type { TaskEvidenceMimeType } from "@mainline/contracts";

const extensions: Record<TaskEvidenceMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function getDefaultEvidenceDirectory(): string {
  return resolve(import.meta.dirname, "../../../../../data/evidence");
}

export class LocalEvidenceStore {
  constructor(private readonly directory = getDefaultEvidenceDirectory()) {}

  write(id: string, mimeType: TaskEvidenceMimeType, content: Buffer): string {
    mkdirSync(this.directory, { recursive: true });
    const filename = `${id}.${extensions[mimeType]}`;
    writeFileSync(resolve(this.directory, filename), content, { flag: "wx" });
    return filename;
  }

  read(filename: string): Buffer {
    if (basename(filename) !== filename) {
      throw new Error("非法的本地凭据文件名。");
    }

    return readFileSync(resolve(this.directory, filename));
  }

  remove(filename: string): void {
    if (basename(filename) === filename) {
      rmSync(resolve(this.directory, filename), { force: true });
    }
  }
}
