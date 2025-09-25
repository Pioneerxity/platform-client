'use client';

import React, { ChangeEvent, type CSSProperties } from 'react';

import { Badge } from './Badge';
import type { ThemeTokens } from '../theme';
import type { BaseConfig, FlowNode, Kind, NodeData } from '../types';
import { ROLE_BADGE } from '../constants';

type InspectorProps = {
  node: FlowNode | null;
  onChange: (updater: (node: FlowNode) => FlowNode) => void;
  t: ThemeTokens;
};

type ConfigUpdater<K extends Kind> = <Field extends keyof NodeData<K>['config']>(
  field: Field,
  value: NodeData<K>['config'][Field],
) => void;

const textareaStyle = (t: ThemeTokens): CSSProperties => ({
  padding: '8px 10px',
  borderRadius: 8,
  border: `1px solid ${t.border}`,
  background: t.panel,
  color: t.text,
  fontSize: 13,
  resize: 'vertical' as const,
});

const inputStyle = (t: ThemeTokens): CSSProperties => ({
  padding: '8px 10px',
  borderRadius: 8,
  border: `1px solid ${t.border}`,
  background: t.panel,
  color: t.text,
  fontSize: 13,
});

const selectStyle = (t: ThemeTokens): CSSProperties => ({
  ...inputStyle(t),
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
});

const sectionStyle = (t: ThemeTokens) => ({
  borderTop: `1px solid ${t.border}`,
  paddingTop: 12,
  marginTop: 12,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 8,
});

const sectionTitleStyle = (t: ThemeTokens) => ({ fontWeight: 600, fontSize: 12, color: t.subtext, textTransform: 'uppercase' as const });

const helperTextStyle = (t: ThemeTokens) => ({ fontSize: 11, color: t.subtext });

export function Inspector({ node, onChange, t }: InspectorProps) {
  if (!node) {
    return <div style={{ color: t.subtext, fontSize: 12 }}>Select a node to inspect.</div>;
  }

  const data = node.data as NodeData;

  const updateNodeField = <Field extends keyof NodeData>(field: Field, value: NodeData[Field]) => {
    onChange((current) => {
      const currentData = current.data as NodeData;
      return {
        ...current,
        data: { ...currentData, [field]: value },
      };
    });
  };

  const handleTitle = (event: ChangeEvent<HTMLInputElement>) => {
    updateNodeField('title', event.target.value);
  };

  const handleDescription = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const next = event.target.value;
    updateNodeField('description', next.length ? next : undefined);
  };

  const handleInputs = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const items = event.target.value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    updateNodeField('inputs', items.length ? items : undefined);
  };

  const handleOutputs = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const items = event.target.value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    updateNodeField('outputs', items.length ? items : undefined);
  };

  const inputsValue = (data.inputs ?? []).join(', ');
  const outputsValue = (data.outputs ?? []).join(', ');

  const renderConfigForm = () => {
    switch (data.kind) {
      case 'start':
      case 'end':
        return (
          <div style={sectionStyle(t)}>
            <span style={sectionTitleStyle(t)}>Configuration</span>
            <span style={helperTextStyle(t)}>This node does not expose additional settings.</span>
          </div>
        );
      case 'scrum': {
        const typed = data as NodeData<'scrum'>;
        const update: ConfigUpdater<'scrum'> = (field, value) => {
          onChange((current) => {
            const currentData = current.data as NodeData<'scrum'>;
            return {
              ...current,
              data: {
                ...currentData,
                config: { ...currentData.config, [field]: value },
              },
            };
          });
        };
        return <ScrumConfigForm config={typed.config} update={update} t={t} />;
      }
      case 'ba': {
        const typed = data as NodeData<'ba'>;
        const update: ConfigUpdater<'ba'> = (field, value) => {
          onChange((current) => {
            const currentData = current.data as NodeData<'ba'>;
            return {
              ...current,
              data: {
                ...currentData,
                config: { ...currentData.config, [field]: value },
              },
            };
          });
        };
        return <BusinessConfigForm config={typed.config} update={update} t={t} />;
      }
      case 'arch': {
        const typed = data as NodeData<'arch'>;
        const update: ConfigUpdater<'arch'> = (field, value) => {
          onChange((current) => {
            const currentData = current.data as NodeData<'arch'>;
            return {
              ...current,
              data: {
                ...currentData,
                config: { ...currentData.config, [field]: value },
              },
            };
          });
        };
        return <ArchitectureConfigForm config={typed.config} update={update} t={t} />;
      }
      case 'coding': {
        const typed = data as NodeData<'coding'>;
        const update: ConfigUpdater<'coding'> = (field, value) => {
          onChange((current) => {
            const currentData = current.data as NodeData<'coding'>;
            return {
              ...current,
              data: {
                ...currentData,
                config: { ...currentData.config, [field]: value },
              },
            };
          });
        };
        return <CodingConfigForm config={typed.config} update={update} t={t} />;
      }
      case 'qa': {
        const typed = data as NodeData<'qa'>;
        const update: ConfigUpdater<'qa'> = (field, value) => {
          onChange((current) => {
            const currentData = current.data as NodeData<'qa'>;
            return {
              ...current,
              data: {
                ...currentData,
                config: { ...currentData.config, [field]: value },
              },
            };
          });
        };
        return <QaConfigForm config={typed.config} update={update} t={t} />;
      }
      case 'devops': {
        const typed = data as NodeData<'devops'>;
        const update: ConfigUpdater<'devops'> = (field, value) => {
          onChange((current) => {
            const currentData = current.data as NodeData<'devops'>;
            return {
              ...current,
              data: {
                ...currentData,
                config: { ...currentData.config, [field]: value },
              },
            };
          });
        };
        return <DevOpsConfigForm config={typed.config} update={update} t={t} />;
      }
      case 'security': {
        const typed = data as NodeData<'security'>;
        const update: ConfigUpdater<'security'> = (field, value) => {
          onChange((current) => {
            const currentData = current.data as NodeData<'security'>;
            return {
              ...current,
              data: {
                ...currentData,
                config: { ...currentData.config, [field]: value },
              },
            };
          });
        };
        return <SecurityConfigForm config={typed.config} update={update} t={t} />;
      }
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        flex: 1,
        overflowY: 'auto',
        paddingRight: 6,
        maxHeight: '100%',
      }}
      className="inspector-scroll"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Badge text={ROLE_BADGE[data.kind]} tone="accent" t={t} />
        <span style={{ fontSize: 12, color: t.subtext }}>#{node.id}</span>
      </div>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: t.subtext }}>
        Title
        <input value={data.title} onChange={handleTitle} style={inputStyle(t)} />
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: t.subtext }}>
        Description
        <textarea
          rows={4}
          value={data.description ?? ''}
          onChange={handleDescription}
          style={textareaStyle(t)}
        />
      </label>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: 12, color: t.subtext }}>Inputs</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(data.inputs ?? []).map((item) => (
            <Badge key={item} text={item} t={t} />
          ))}
          {!data.inputs?.length && <span style={{ color: t.subtext }}>None</span>}
        </div>
        <textarea
          rows={2}
          value={inputsValue}
          onChange={handleInputs}
          style={{ ...textareaStyle(t), resize: 'none' }}
          placeholder="Comma-separated list, e.g. repoRef, meetingNotes"
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: 12, color: t.subtext }}>Outputs</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(data.outputs ?? []).map((item) => (
            <Badge key={item} text={item} tone="accent" t={t} />
          ))}
          {!data.outputs?.length && <span style={{ color: t.subtext }}>None</span>}
        </div>
        <textarea
          rows={2}
          value={outputsValue}
          onChange={handleOutputs}
          style={{ ...textareaStyle(t), resize: 'none' }}
          placeholder="Comma-separated list, e.g. qaReport, pullRequest"
        />
      </div>

      {renderConfigForm()}

      <div style={sectionStyle(t)}>
        <span style={sectionTitleStyle(t)}>Config Snapshot</span>
        <pre
          style={{
            margin: 0,
            borderRadius: 8,
            padding: 12,
            background: t.bg,
            color: t.text,
            fontSize: 12,
            maxHeight: 200,
            overflow: 'auto',
          }}
        >
          {JSON.stringify(data.config, null, 2)}
        </pre>
      </div>
    </div>
  );
}

function clampTemperature(value: string) {
  if (!value.trim()) return undefined;
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return undefined;
  return Math.min(1, Math.max(0, parsed));
}

function normalizeBaseField(input: string) {
  const trimmed = input.trim();
  return trimmed.length ? trimmed : undefined;
}

type BaseSectionProps<K extends Kind> = {
  label: string;
  config: NodeData<K>['config'];
  update: ConfigUpdater<K>;
  t: ThemeTokens;
};

function LlmSection<K extends Kind>({ label, config, update, t }: BaseSectionProps<K>) {
  const base = config as BaseConfig;
  return (
    <div style={sectionStyle(t)}>
      <span style={sectionTitleStyle(t)}>{label}</span>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: t.subtext }}>
        LLM Model
        <input
          value={base.llmModel ?? ''}
          onChange={(event) => update('llmModel' as keyof NodeData<K>['config'], normalizeBaseField(event.target.value) as NodeData<K>['config'][keyof NodeData<K>['config']])}
          style={inputStyle(t)}
          placeholder="gpt-4o-mini"
        />
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: t.subtext }}>
        Temperature
        <input
          type="number"
          min={0}
          max={1}
          step={0.05}
          value={base.temperature ?? ''}
          onChange={(event) =>
            update(
              'temperature' as keyof NodeData<K>['config'],
              clampTemperature(event.target.value) as NodeData<K>['config'][keyof NodeData<K>['config']],
            )
          }
          style={inputStyle(t)}
        />
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: t.subtext }}>
        System Prompt
        <textarea
          rows={3}
          value={base.systemPrompt ?? ''}
          onChange={(event) =>
            update(
              'systemPrompt' as keyof NodeData<K>['config'],
              normalizeBaseField(event.target.value) as NodeData<K>['config'][keyof NodeData<K>['config']],
            )
          }
          style={textareaStyle(t)}
          placeholder="You are the AI Scrum Master..."
        />
      </label>
    </div>
  );
}

function ScrumConfigForm({ config, update, t }: { config: NodeData<'scrum'>['config']; update: ConfigUpdater<'scrum'>; t: ThemeTokens }) {
  const auth = config.auth ?? { type: 'token' as const };
  return (
    <>
      <LlmSection label="LLM Settings" config={config} update={update} t={t} />
      <div style={sectionStyle(t)}>
        <span style={sectionTitleStyle(t)}>Jira Settings</span>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: t.subtext }}>
          Jira Base URL
          <input
            value={config.jiraBaseUrl ?? ''}
            onChange={(event) => update('jiraBaseUrl', normalizeBaseField(event.target.value))}
            style={inputStyle(t)}
            placeholder="https://your-domain.atlassian.net"
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: t.subtext }}>
          Project Key
          <input
            value={config.projectKey ?? ''}
            onChange={(event) => update('projectKey', normalizeBaseField(event.target.value))}
            style={inputStyle(t)}
            placeholder="PX"
          />
        </label>
      </div>
      <div style={sectionStyle(t)}>
        <span style={sectionTitleStyle(t)}>Authentication</span>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: t.subtext }}>
          Mode
          <select
            value={auth.type}
            onChange={(event) => update('auth', { ...auth, type: event.target.value as 'token' | 'basic' })}
            style={selectStyle(t)}
          >
            <option value="token">Token / API key</option>
            <option value="basic">Basic (username + API token)</option>
          </select>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: t.subtext }}>
          Secret / Token
          <input
            type="password"
            value={auth.token ?? ''}
            onChange={(event) =>
              update('auth', {
                ...auth,
                token: normalizeBaseField(event.target.value),
              })
            }
            style={inputStyle(t)}
            placeholder="Paste token"
          />
        </label>
        {auth.type === 'basic' && (
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: t.subtext }}>
            Username / Email
            <input
              value={auth.username ?? ''}
              onChange={(event) =>
                update('auth', {
                  ...auth,
                  username: normalizeBaseField(event.target.value),
                })
              }
              style={inputStyle(t)}
              placeholder="alice@company.com"
            />
          </label>
        )}
      </div>
    </>
  );
}

function BusinessConfigForm({ config, update, t }: { config: NodeData<'ba'>['config']; update: ConfigUpdater<'ba'>; t: ThemeTokens }) {
  return (
    <>
      <LlmSection label="LLM Settings" config={config} update={update} t={t} />
      <div style={sectionStyle(t)}>
        <span style={sectionTitleStyle(t)}>Use Case Generation</span>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: t.subtext }}>
          Template
          <select
            value={config.template ?? 'simple'}
            onChange={(event) => update('template', event.target.value as 'simple' | 'full')}
            style={selectStyle(t)}
          >
            <option value="simple">Simple (lightweight)</option>
            <option value="full">Full (detailed)</option>
          </select>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: t.subtext }}>
          <input
            type="checkbox"
            checked={Boolean(config.includeAcceptanceCriteria)}
            onChange={(event) => update('includeAcceptanceCriteria', event.target.checked)}
          />
          Include acceptance criteria
        </label>
      </div>
    </>
  );
}

function ArchitectureConfigForm({ config, update, t }: { config: NodeData<'arch'>['config']; update: ConfigUpdater<'arch'>; t: ThemeTokens }) {
  return (
    <>
      <LlmSection label="LLM Settings" config={config} update={update} t={t} />
      <div style={sectionStyle(t)}>
        <span style={sectionTitleStyle(t)}>Architecture Assets</span>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: t.subtext }}>
          Diagrammer
          <select
            value={config.diagrammer ?? 'mermaid'}
            onChange={(event) => update('diagrammer', event.target.value as 'mermaid' | 'plantuml' | 'drawio')}
            style={selectStyle(t)}
          >
            <option value="mermaid">Mermaid</option>
            <option value="plantuml">PlantUML</option>
            <option value="drawio">draw.io</option>
          </select>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: t.subtext }}>
          <input
            type="checkbox"
            checked={Boolean(config.includeC4)}
            onChange={(event) => update('includeC4', event.target.checked)}
          />
          Include C4 diagrams
        </label>
      </div>
    </>
  );
}

function CodingConfigForm({ config, update, t }: { config: NodeData<'coding'>['config']; update: ConfigUpdater<'coding'>; t: ThemeTokens }) {
  return (
    <>
      <LlmSection label="LLM Settings" config={config} update={update} t={t} />
      <div style={sectionStyle(t)}>
        <span style={sectionTitleStyle(t)}>Repository & Standards</span>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: t.subtext }}>
          Repository URL
          <input
            value={config.repoUrl ?? ''}
            onChange={(event) => update('repoUrl', normalizeBaseField(event.target.value))}
            style={inputStyle(t)}
            placeholder="https://github.com/org/project"
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: t.subtext }}>
          Language
          <input
            value={config.language ?? ''}
            onChange={(event) => update('language', normalizeBaseField(event.target.value))}
            style={inputStyle(t)}
            placeholder="TypeScript"
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: t.subtext }}>
          Framework
          <input
            value={config.framework ?? ''}
            onChange={(event) => update('framework', normalizeBaseField(event.target.value))}
            style={inputStyle(t)}
            placeholder="Next.js"
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: t.subtext }}>
          Style Guide
          <input
            value={config.styleGuide ?? ''}
            onChange={(event) => update('styleGuide', normalizeBaseField(event.target.value))}
            style={inputStyle(t)}
            placeholder="Airbnb"
          />
        </label>
      </div>
    </>
  );
}

function QaConfigForm({ config, update, t }: { config: NodeData<'qa'>['config']; update: ConfigUpdater<'qa'>; t: ThemeTokens }) {
  return (
    <>
      <LlmSection label="LLM Settings" config={config} update={update} t={t} />
      <div style={sectionStyle(t)}>
        <span style={sectionTitleStyle(t)}>Testing</span>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: t.subtext }}>
          Test Framework
          <input
            value={config.testFramework ?? ''}
            onChange={(event) => update('testFramework', normalizeBaseField(event.target.value))}
            style={inputStyle(t)}
            placeholder="Playwright"
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: t.subtext }}>
          Coverage Target (0 - 1)
          <input
            type="number"
            min={0}
            max={1}
            step={0.05}
            value={config.coverageTarget ?? ''}
            onChange={(event) =>
              update('coverageTarget', clampTemperature(event.target.value))
            }
            style={inputStyle(t)}
          />
        </label>
      </div>
    </>
  );
}

function DevOpsConfigForm({ config, update, t }: { config: NodeData<'devops'>['config']; update: ConfigUpdater<'devops'>; t: ThemeTokens }) {
  const toggleCloud = (provider: 'DigitalOcean' | 'AWS' | 'GCP') => (checked: boolean) => {
    const next = new Set(config.cloud ?? []);
    if (checked) {
      next.add(provider);
    } else {
      next.delete(provider);
    }
    const array = Array.from(next) as ('DigitalOcean' | 'AWS' | 'GCP')[];
    update('cloud', array.length ? array : undefined);
  };

  return (
    <>
      <LlmSection label="LLM Settings" config={config} update={update} t={t} />
      <div style={sectionStyle(t)}>
        <span style={sectionTitleStyle(t)}>Deployment</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: t.subtext }}>
          Clouds
          {['DigitalOcean', 'AWS', 'GCP'].map((provider) => {
            const p = provider as 'DigitalOcean' | 'AWS' | 'GCP';
            return (
              <label key={provider} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={config.cloud?.includes(p) ?? false}
                  onChange={(event) => toggleCloud(p)(event.target.checked)}
                />
                {provider}
              </label>
            );
          })}
        </div>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: t.subtext }}>
          Container Registry
          <select
            value={config.registry ?? 'ghcr'}
            onChange={(event) => update('registry', event.target.value as 'ghcr' | 'dockerhub' | 'do-cr')}
            style={selectStyle(t)}
          >
            <option value="ghcr">GitHub Container Registry</option>
            <option value="dockerhub">Docker Hub</option>
            <option value="do-cr">DigitalOcean Container Registry</option>
          </select>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: t.subtext }}>
          <input
            type="checkbox"
            checked={Boolean(config.enableCD)}
            onChange={(event) => update('enableCD', event.target.checked)}
          />
          Enable continuous delivery
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: t.subtext }}>
          <input
            type="checkbox"
            checked={Boolean(config.useKubernetes)}
            onChange={(event) => update('useKubernetes', event.target.checked)}
          />
          Target Kubernetes
        </label>
      </div>
    </>
  );
}

function SecurityConfigForm({ config, update, t }: { config: NodeData<'security'>['config']; update: ConfigUpdater<'security'>; t: ThemeTokens }) {
  const toggleScanner = (scanner: 'semgrep' | 'trivy' | 'bandit' | 'snyk') => (checked: boolean) => {
    const next = new Set(config.scanners ?? []);
    if (checked) {
      next.add(scanner);
    } else {
      next.delete(scanner);
    }
    const array = Array.from(next) as ('semgrep' | 'trivy' | 'bandit' | 'snyk')[];
    update('scanners', array.length ? array : undefined);
  };

  return (
    <>
      <LlmSection label="LLM Settings" config={config} update={update} t={t} />
      <div style={sectionStyle(t)}>
        <span style={sectionTitleStyle(t)}>Security Gates</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: t.subtext }}>
          Scanners
          {['semgrep', 'trivy', 'bandit', 'snyk'].map((scanner) => {
            const s = scanner as 'semgrep' | 'trivy' | 'bandit' | 'snyk';
            return (
              <label key={scanner} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={config.scanners?.includes(s) ?? false}
                  onChange={(event) => toggleScanner(s)(event.target.checked)}
                />
                {scanner.toUpperCase()}
              </label>
            );
          })}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: t.subtext }}>
          <input
            type="checkbox"
            checked={Boolean(config.blockOnHigh)}
            onChange={(event) => update('blockOnHigh', event.target.checked)}
          />
          Block release on high severity issues
        </label>
      </div>
    </>
  );
}
