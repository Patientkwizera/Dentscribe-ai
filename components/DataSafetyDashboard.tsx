import { SafetyRow } from './SafetyRow';

export function DataSafetyDashboard() {
  return (
    <div className="bg-paper border border-line rounded-xl p-6 mb-8">
      <h3 className="font-display text-xl text-ink mb-4">Your Data Protection</h3>
      <div className="space-y-1">
        <SafetyRow 
          label="Patient identifiers in notes" 
          value="Auto-redacted" 
          icon="CheckCircle"
        />
        <SafetyRow 
          label="Audio recordings" 
          value="Deleted after 24 hours" 
          icon="CheckCircle"
        />
        <SafetyRow 
          label="Note history" 
          value="Encrypted, only you can access" 
          icon="CheckCircle"
        />
        <SafetyRow 
          label="Export your data" 
          value="Available anytime" 
          icon="Download"
          action="/settings/export"
        />
      </div>
    </div>
  );
}
