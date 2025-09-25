import type { Edge, Node } from '@xyflow/react';

export type Kind =
  | 'start'
  | 'scrum'
  | 'ba'
  | 'arch'
  | 'coding'
  | 'qa'
  | 'devops'
  | 'security'
  | 'end';

export type BaseConfig = {
  llmModel?: string;
  temperature?: number;
  systemPrompt?: string;
};

export type JiraConfig = BaseConfig & {
  jiraBaseUrl?: string;
  projectKey?: string;
  auth?: { type: 'token' | 'basic'; token?: string; username?: string };
};

export type UseCaseConfig = BaseConfig & {
  template?: 'simple' | 'full';
  includeAcceptanceCriteria?: boolean;
};

export type ArchConfig = BaseConfig & {
  diagrammer?: 'mermaid' | 'plantuml' | 'drawio';
  includeC4?: boolean;
};

export type CodingConfig = BaseConfig & {
  repoUrl?: string;
  language?: string;
  framework?: string;
  styleGuide?: string;
};

export type QAConfig = BaseConfig & {
  testFramework?: string;
  coverageTarget?: number;
};

export type DevOpsConfig = BaseConfig & {
  cloud?: ('DigitalOcean' | 'AWS' | 'GCP')[];
  enableCD?: boolean;
  registry?: 'ghcr' | 'dockerhub' | 'do-cr';
  useKubernetes?: boolean;
};

export type SecurityConfig = BaseConfig & {
  scanners?: ('semgrep' | 'trivy' | 'bandit' | 'snyk')[];
  blockOnHigh?: boolean;
};

export type KindConfigMap = {
  start: Record<string, never>;
  scrum: JiraConfig;
  ba: UseCaseConfig;
  arch: ArchConfig;
  coding: CodingConfig;
  qa: QAConfig;
  devops: DevOpsConfig;
  security: SecurityConfig;
  end: Record<string, never>;
};

export type NodeData<K extends Kind = Kind> = {
  kind: K;
  title: string;
  description?: string;
  inputs?: string[];
  outputs?: string[];
  config: KindConfigMap[K];
};

export type FlowNode = Node<NodeData>;
export type FlowEdge = Edge<{ label?: string }>;
