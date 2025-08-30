import { tasks_v1 } from 'googleapis';
export declare class GoogleTasksAuth {
    private auth;
    private tasksClient;
    constructor();
    private loadEnvFromFile;
    private parseEnvContent;
    private getCredentials;
    private buildCredentialsFromEnv;
    getTasksClient(): Promise<tasks_v1.Tasks>;
}
