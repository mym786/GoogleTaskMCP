import { GoogleAuth } from 'google-auth-library';
import { tasks_v1 } from 'googleapis';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { logger } from './utils/logger.js';

export class GoogleTasksAuth {
  private auth: GoogleAuth;
  private tasksClient: tasks_v1.Tasks | null = null;

  constructor() {
    try {
      logger.info('Initializing Google Tasks authentication');
      this.loadEnvFromFile();
      this.auth = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/tasks'],
        credentials: this.getCredentials()
      });
      logger.info('Google Tasks authentication initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Google Tasks authentication', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  private loadEnvFromFile() {
    const envPaths = [
      resolve(process.cwd(), '.env'),
      resolve(process.cwd(), '.env.local'),
      resolve(process.cwd(), 'config.env')
    ];

    for (const envPath of envPaths) {
      if (existsSync(envPath)) {
        try {
          const envContent = readFileSync(envPath, 'utf-8');
          this.parseEnvContent(envContent);
          break;
        } catch (error) {
          logger.warn(`Could not read env file at ${envPath}`, error instanceof Error ? error : new Error(String(error)));
        }
      }
    }
  }

  private parseEnvContent(content: string) {
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      const equalIndex = trimmed.indexOf('=');
      if (equalIndex === -1) continue;
      
      const key = trimmed.substring(0, equalIndex).trim();
      let value = trimmed.substring(equalIndex + 1).trim();
      
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      // Only set if not already defined
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }

  private getCredentials() {
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;
    
    if (credentialsJson) {
      try {
        return JSON.parse(credentialsJson);
      } catch (error) {
        const parseError = new Error('Invalid GOOGLE_CREDENTIALS_JSON format');
        logger.error('Failed to parse GOOGLE_CREDENTIALS_JSON', parseError);
        throw parseError;
      }
    }
    
    if (credentialsPath) {
      // Check if it's a service account file
      try {
        const credentialData = JSON.parse(readFileSync(credentialsPath, 'utf-8'));
        
        // If it's OAuth2 credentials, throw helpful error
        if (credentialData.web || credentialData.installed) {
          throw new Error(
            'OAuth2 credentials detected. This MCP server requires Service Account credentials.\n' +
            'Please create a Service Account in Google Cloud Console and download the JSON key.\n' +
            'See: https://cloud.google.com/iam/docs/creating-managing-service-accounts'
          );
        }
        
        return undefined; // Let GoogleAuth handle the service account file
      } catch (error) {
        if (error instanceof Error && error.message.includes('OAuth2 credentials detected')) {
          logger.error('Wrong credential type', error);
          throw error;
        }
        logger.warn('Could not validate credentials file', error instanceof Error ? error : new Error(String(error)));
        return undefined;
      }
    }
    
    throw new Error('Google credentials not found. Set GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_CREDENTIALS_JSON environment variable, or create a .env file.');
  }

  async getTasksClient(): Promise<tasks_v1.Tasks> {
    try {
      if (!this.tasksClient) {
        logger.info('Creating Google Tasks client');
        const authClient = await this.auth.getClient();
        this.tasksClient = new tasks_v1.Tasks({ auth: authClient as any });
        logger.info('Google Tasks client created successfully');
      }
      return this.tasksClient;
    } catch (error) {
      logger.error('Failed to get Google Tasks client', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }
}