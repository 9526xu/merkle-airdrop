import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { Mutex } from 'async-mutex';

const settingsPath = path.join(__dirname, '../../data/settings.json');
const mutex = new Mutex();

export interface AppSettings {
  status: 'COLLECTION' | 'PROCESSING' | 'CLAIM';
}

const defaultSettings: AppSettings = {
  status: 'COLLECTION'
};

// Initialize settings file if not exists
const initSettings = async () => {
  const release = await mutex.acquire();
  try {
    if (!existsSync(settingsPath)) {
        await fs.writeFile(settingsPath, JSON.stringify(defaultSettings, null, 2));
    }
  } finally {
    release();
  }
};

// Call init immediately (fire and forget, or await in top level if supported)
initSettings();

export const getSettings = async (): Promise<AppSettings> => {
  const release = await mutex.acquire();
  try {
    if (!existsSync(settingsPath)) {
      // Should be created by init, but just in case
      await fs.writeFile(settingsPath, JSON.stringify(defaultSettings, null, 2));
      return defaultSettings;
    }
    const data = await fs.readFile(settingsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading settings, returning default:", error);
    return defaultSettings;
  } finally {
    release();
  }
};

export const saveSettings = async (newSettings: Partial<AppSettings>): Promise<AppSettings> => {
  const release = await mutex.acquire();
  try {
    let current: AppSettings = defaultSettings;
    if (existsSync(settingsPath)) {
        const data = await fs.readFile(settingsPath, 'utf8');
        current = JSON.parse(data);
    }
    
    const updated = { ...current, ...newSettings };
    await fs.writeFile(settingsPath, JSON.stringify(updated, null, 2));
    return updated;
  } finally {
    release();
  }
};
