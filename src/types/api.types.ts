import { User, Project, DailyUpdate, ClientUpdate, ProjectCollaborator, Cost, ProjectContact, RoofingMaterial, UpdateThread, FilterOptions, LoginCredentials } from './entities.types';

// API Client Types
export interface MockEntityMethods<T> {
  list: (orderBy?: string, limit?: number | null) => Promise<T[]>;
  filter: (filters: FilterOptions, orderBy?: string | null) => Promise<T[]>;
  findOne: (id: string) => Promise<T | null>;
  create: (data: Partial<T>) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T>;
  remove: (id: string) => Promise<boolean>;
}

export interface AuthMethods {
  me: () => Promise<User>;
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => Promise<boolean>;
}

export interface Base44Client {
  entities: {
    Project: MockEntityMethods<Project>;
    DailyUpdate: MockEntityMethods<DailyUpdate>;
    ClientUpdate: MockEntityMethods<ClientUpdate>;
    ProjectCollaborator: MockEntityMethods<ProjectCollaborator>;
    Cost: MockEntityMethods<Cost>;
    ProjectContact: MockEntityMethods<ProjectContact>;
    RoofingMaterial: MockEntityMethods<RoofingMaterial>;
    UpdateThread: MockEntityMethods<UpdateThread>;
  };
  auth: AuthMethods;
}

// Integrations Types
export interface EmailIntegrationConfig {
  enabled: boolean;
  provider?: 'gmail' | 'smtp';
  from_email?: string;
}

export interface IntegrationStatus {
  email: EmailIntegrationConfig;
}
