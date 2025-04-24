import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as yaml from 'js-yaml';
import get from 'lodash/get';
import merge from 'lodash/merge';
import set from 'lodash/set';

import { getLogger } from './get-logger';

class ConfigException extends Error { }

const logger = getLogger('packages/get-config.ts');

// __dirname tương ứng với thư mục chứa file này (packages/common/src)
const __dirname = dirname(fileURLToPath(import.meta.url));

function loadFromEnv(
  env: Record<string, string | undefined>,
  { delimiter = '__' } = {},
): Record<string, string> {
  return Object.entries(env).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      set(acc, key.toLowerCase().replace(delimiter, '.'), value);
    }
    return acc;
  }, {} as Record<string, string>);
}

function loadFromYaml(env = 'development'): Record<string, unknown> {
  const configFile = `env.${env}.yaml`;
  // Xác định root của monorepo từ đây
  const monorepoRoot = resolve(__dirname, '../../..');
  const configPath = resolve(monorepoRoot, configFile);

  logger?.info(`loading configuration from: ${configPath}`, 'ConfigService');
  try {
    return yaml.load(readFileSync(configPath, 'utf8')) as Record<string, unknown>;
  } catch (err) {
    throw new ConfigException(`Cannot load config file at ${configPath}: ${(err as Error).message}`);
  }
}

function loadConfiguration(): Record<string, unknown> {
  const envName = process.env.NODE_ENV || 'development';
  const fromYaml = loadFromYaml(envName);
  const fromProcess = loadFromEnv(process.env);

  return merge({}, fromYaml, fromProcess);
}

let CONFIG_DATA: Record<string, unknown> | undefined;

export function setupConfiguration(): void {
  if (!CONFIG_DATA) {
    CONFIG_DATA = loadConfiguration();
  }
}

export function getConfig<T>(key: string, fallback?: T): T {
  return get(CONFIG_DATA, key, fallback) as T;
}

export function getOrThrow<T>(key: string): T {
  const result = get(CONFIG_DATA, key);
  if (result === undefined) {
    throw new ConfigException(`Invalid ${key} config`);
  }
  return result as T;
}
