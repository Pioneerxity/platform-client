import type { Kind } from './types';

export const SEQUENCE: Kind[] = [
  'start',
  'scrum',
  'ba',
  'arch',
  'coding',
  'qa',
  'devops',
  'security',
  'end',
];

export const NEXT: Record<Kind, Kind[]> = {
  start: ['scrum'],
  scrum: ['ba'],
  ba: ['arch'],
  arch: ['coding'],
  coding: ['qa'],
  qa: ['devops'],
  devops: ['security'],
  security: ['end'],
  end: [],
};

export const ROLE_BADGE: Record<Kind, string> = {
  start: 'Trigger',
  scrum: 'Scrum Master',
  ba: 'Business Analyst',
  arch: 'Architect',
  coding: 'Coding Assistant',
  qa: 'QA',
  devops: 'DevOps',
  security: 'Security',
  end: 'Launch',
};

export const NODE_MOVE_STYLE = { transition: 'transform 0.45s ease' } as const;
