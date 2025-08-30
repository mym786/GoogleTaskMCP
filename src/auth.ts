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
    // Try to build credentials from individual environment variables first
    const envCredentials = this.buildCredentialsFromEnv();
    if (envCredentials) {
      return envCredentials;
    }

    // Fall back to existing methods
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
    
    throw new Error('Google credentials not found. Set individual environment variables (GOOGLE_SERVICE_ACCOUNT_TYPE, GOOGLE_PROJECT_ID, etc.), GOOGLE_APPLICATION_CREDENTIALS, GOOGLE_CREDENTIALS_JSON, or create a .env file.');
  }

  private buildCredentialsFromEnv() {
    const requiredFields = [
      'GOOGLE_SERVICE_ACCOUNT_TYPE',
      'GOOGLE_PROJECT_ID', 
      'GOOGLE_PRIVATE_KEY_ID',
      'GOOGLE_PRIVATE_KEY',
      'GOOGLE_CLIENT_EMAIL',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_AUTH_URI',
      'GOOGLE_TOKEN_URI'
    ];

    // Check if all required fields are present
    const missingFields = requiredFields.filter(field => !process.env[field]);
    if (missingFields.length > 0) {
      return null; // Not all fields present, fall back to other methods
    }

    try {
      return {
        type: process.env.GOOGLE_SERVICE_ACCOUNT_TYPE,
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Handle escaped newlines
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: process.env.GOOGLE_AUTH_URI,
        token_uri: process.env.GOOGLE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
        universe_domain: process.env.GOOGLE_UNIVERSE_DOMAIN || 'googleapis.com'
      };
    } catch (error) {
      logger.error('Failed to build credentials from environment variables', error instanceof Error ? error : new Error(String(error)));
      throw new Error('Invalid service account environment variables');
    }
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