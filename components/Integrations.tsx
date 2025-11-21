
import React from 'react';
import { BusinessProfile } from '../types';
import { Icons } from '../constants';

interface IntegrationsProps {
  business: BusinessProfile;
  onUpdate: (updatedBusiness: BusinessProfile) => void;
}

const IntegrationCard: React.FC<{
    name: string;
    description: string;
    iconUrl: string;
    enabled: boolean;
    onToggle: () => void;
}> = ({ name, description, iconUrl, enabled, onToggle }) => (
    <div className={`bg-slate-800 rounded-xl border p-6 flex flex-col h-full transition-all duration-300 ${enabled ? 'border-blue-500/50 shadow-lg shadow-blue-900/10' : 'border-slate-700 hover:border-slate-600'}`}>
        <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-lg bg-white p-2 flex items-center justify-center overflow-hidden">
                <img src={iconUrl} alt={name} className="w-full h-full object-contain" />
            </div>
            <button 
                onClick={onToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-blue-600' : 'bg-slate-600'}`}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
        <h3 className="text-white font-bold text-lg mb-1">{name}</h3>
        <p className="text-slate-400 text-sm flex-1">{description}</p>
        {enabled && (
            <div className="mt-4 pt-4 border-t border-slate-700/50">
                <button className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center">
                    <Icons.Settings /> <span className="ml-1">Configure Settings</span>
                </button>
            </div>
        )}
    </div>
);

const Integrations: React.FC<IntegrationsProps> = ({ business, onUpdate }) => {
  
  const toggleIntegration = (key: keyof BusinessProfile['integrations']) => {
      const currentIntegrations = business.integrations || { stripe: false, shopify: false, slack: false, hubspot: false, salesforce: false, googleSheets: false };
      const updated = {
          ...business,
          integrations: {
              ...currentIntegrations,
              [key]: !currentIntegrations[key]
          }
      };
      onUpdate(updated);
  };

  const integrations = business.integrations || { stripe: false, shopify: false, slack: false, hubspot: false, salesforce: false, googleSheets: false };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-12">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">App Marketplace</h2>
        <p className="text-slate-400">Supercharge your AI agent with powerful integrations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <IntegrationCard 
            name="Stripe"
            description="Accept credit card payments directly within WhatsApp chat flows. The AI will generate secure payment links."
            iconUrl="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg"
            enabled={integrations.stripe}
            onToggle={() => toggleIntegration('stripe')}
        />
        
        <IntegrationCard 
            name="Shopify"
            description="Sync your product catalog and inventory levels automatically. Prevent selling out-of-stock items."
            iconUrl="https://cdn.icon-icons.com/icons2/2407/PNG/512/shopify_logo_icon_146043.png"
            enabled={integrations.shopify}
            onToggle={() => toggleIntegration('shopify')}
        />

        <IntegrationCard 
            name="Slack"
            description="Send notifications to your team's Slack channel when high-value orders are placed or leads need attention."
            iconUrl="https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg"
            enabled={integrations.slack}
            onToggle={() => toggleIntegration('slack')}
        />

        <IntegrationCard 
            name="HubSpot"
            description="Automatically create and update deals in your CRM. Log full chat transcripts to customer timelines."
            iconUrl="https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/HubSpot_Logo.png/600px-HubSpot_Logo.png?20200730182550"
            enabled={integrations.hubspot}
            onToggle={() => toggleIntegration('hubspot')}
        />

        <IntegrationCard 
            name="Salesforce"
            description="Enterprise CRM sync. Map custom objects and trigger Apex flows based on WhatsApp conversations."
            iconUrl="https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg"
            enabled={integrations.salesforce}
            onToggle={() => toggleIntegration('salesforce')}
        />

        <IntegrationCard 
            name="Google Sheets"
            description="The poor man's database. Append every order as a new row in a designated Google Sheet."
            iconUrl="https://upload.wikimedia.org/wikipedia/commons/3/30/Google_Sheets_logo_%282014-2020%29.svg"
            enabled={integrations.googleSheets}
            onToggle={() => toggleIntegration('googleSheets')}
        />
      </div>
    </div>
  );
};

export default Integrations;
