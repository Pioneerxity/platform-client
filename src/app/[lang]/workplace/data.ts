import { MarkerType } from '@xyflow/react';

import type { FlowEdge, FlowNode } from './types';

export const initialNodes: FlowNode[] = [
  {
    id: 'start',
    type: 'start',
    position: { x: 0, y: 0 },
    data: {
      kind: 'start',
      title: 'START - Trigger',
      description: 'Webhook, cron, or manual trigger kicks things off.',
      inputs: [],
      outputs: ['rawRequirement', 'meetingNotes', 'repoRef'],
      config: {},
    },
  },
  {
    id: 'scrum',
    type: 'agent',
    position: { x: 320, y: -60 },
    data: {
      kind: 'scrum',
      title: 'AI Scrum Master',
      description: 'Converts context into Jira epics and stories with acceptance criteria.',
      inputs: ['meetingNotes', 'rawRequirement'],
      outputs: ['jiraTickets'],
      config: {
        jiraBaseUrl: 'https://jira.example.com',
        projectKey: 'PX',
        auth: { type: 'token' },
        llmModel: 'gpt-4o-mini',
        temperature: 0.2,
      },
    },
  },
  {
    id: 'ba',
    type: 'agent',
    position: { x: 640, y: -60 },
    data: {
      kind: 'ba',
      title: 'AI Business Analyst',
      description: 'Expands requirements into detailed use cases.',
      inputs: ['jiraTickets', 'rawRequirement'],
      outputs: ['useCaseDoc', 'acceptanceCriteria'],
      config: {
        template: 'full',
        includeAcceptanceCriteria: true,
        llmModel: 'gpt-4o',
        temperature: 0.2,
      },
    },
  },
  {
    id: 'arch',
    type: 'agent',
    position: { x: 960, y: -60 },
    data: {
      kind: 'arch',
      title: 'AI Architect',
      description: 'Produces diagrams, ADRs, and C4 components.',
      inputs: ['useCaseDoc'],
      outputs: ['architecturePack'],
      config: {
        diagrammer: 'mermaid',
        includeC4: true,
        llmModel: 'gpt-4o',
        temperature: 0.25,
      },
    },
  },
  {
    id: 'coding',
    type: 'agent',
    position: { x: 1280, y: 0 },
    data: {
      kind: 'coding',
      title: 'AI Coding Assistant',
      description: 'Creates feature branches, pull requests, and code walkthroughs.',
      inputs: ['architecturePack', 'repoRef'],
      outputs: ['pullRequest', 'tests'],
      config: {
        repoUrl: 'https://github.com/pioneerxity/platform',
        language: 'TypeScript',
        framework: 'Next.js',
        styleGuide: 'Airbnb',
        llmModel: 'o3-mini',
      },
    },
  },
  {
    id: 'qa',
    type: 'agent',
    position: { x: 1600, y: 60 },
    data: {
      kind: 'qa',
      title: 'AI QA Lead',
      description: 'Runs regression packs and reports coverage.',
      inputs: ['tests', 'pullRequest'],
      outputs: ['qaReport'],
      config: {
        testFramework: 'Playwright',
        coverageTarget: 0.85,
        llmModel: 'gpt-4o-mini',
      },
    },
  },
  {
    id: 'devops',
    type: 'agent',
    position: { x: 1920, y: 0 },
    data: {
      kind: 'devops',
      title: 'AI DevOps Engineer',
      description: 'Packages and deploys the build artefacts.',
      inputs: ['qaReport', 'pullRequest'],
      outputs: ['releaseCandidate'],
      config: {
        cloud: ['AWS', 'GCP'],
        enableCD: true,
        registry: 'ghcr',
        useKubernetes: true,
      },
    },
  },
  {
    id: 'security',
    type: 'agent',
    position: { x: 2240, y: 0 },
    data: {
      kind: 'security',
      title: 'AI Security Analyst',
      description: 'Performs SAST/SCA scans and policy gating.',
      inputs: ['releaseCandidate'],
      outputs: ['securityReport'],
      config: {
        scanners: ['semgrep', 'trivy'],
        blockOnHigh: true,
      },
    },
  },
  {
    id: 'end',
    type: 'end',
    position: { x: 2560, y: 0 },
    data: {
      kind: 'end',
      title: 'END - Launch',
      description: 'Final go / no-go release decision.',
      inputs: ['securityReport'],
      outputs: [],
      config: {},
    },
  },
];

export const initialEdges: FlowEdge[] = [
  {
    id: 'start->scrum',
    source: 'start',
    target: 'scrum',
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  { id: 'scrum->ba', source: 'scrum', target: 'ba', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'ba->arch', source: 'ba', target: 'arch', markerEnd: { type: MarkerType.ArrowClosed } },
  {
    id: 'arch->coding',
    source: 'arch',
    target: 'coding',
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  { id: 'coding->qa', source: 'coding', target: 'qa', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'qa->devops', source: 'qa', target: 'devops', markerEnd: { type: MarkerType.ArrowClosed } },
  {
    id: 'devops->security',
    source: 'devops',
    target: 'security',
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'security->end',
    source: 'security',
    target: 'end',
    markerEnd: { type: MarkerType.ArrowClosed },
  },
];
