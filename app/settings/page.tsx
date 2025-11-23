'use client'

import { useEffect, useState } from 'react'

interface GlobalSettings {
  id: string
  slackEnabled: boolean
  emailEnabled: boolean
  inAppEnabled: boolean
  slackWebhook: string | null
  emailAddress: string | null
}

interface AlertRule {
  id?: string
  name: string
  metric: string
  operator: string
  threshold: number
  severity: string
  enabled: boolean
  campaignId?: string | null
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<GlobalSettings | null>(null)
  const [rules, setRules] = useState<AlertRule[]>([])
  const [campaigns, setCampaigns] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [newRule, setNewRule] = useState<AlertRule>({
    name: '',
    metric: 'roas',
    operator: 'lt',
    threshold: 1.5,
    severity: 'warning',
    enabled: true,
    campaignId: null,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsResponse, campaignsResponse] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/campaigns'),
        ])
        
        const settingsData = await settingsResponse.json()
        setSettings(settingsData.settings)
        setRules(settingsData.rules || [])

        const campaignsData = await campaignsResponse.json()
        setCampaigns(campaignsData.map((c: any) => ({ id: c.id, name: c.name })))
      } catch (error) {
        console.error('Error fetching settings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      })
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddRule = async () => {
    if (!newRule.name || !newRule.threshold) {
      alert('Please fill in all required fields')
      return
    }

    setIsSaving(true)
    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rules: [...rules, newRule],
        }),
      })
      
      setRules([...rules, newRule])
      setNewRule({
        name: '',
        metric: 'roas',
        operator: 'lt',
        threshold: 1.5,
        severity: 'warning',
        enabled: true,
        campaignId: null,
      })
      alert('Rule added successfully!')
    } catch (error) {
      console.error('Error adding rule:', error)
      alert('Failed to add rule')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500">Loading settings...</p>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500">Failed to load settings</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Configure notifications, sensitivity, and alert rules
        </p>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Notifications</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">In-App Notifications</label>
              <p className="text-sm text-gray-500">Receive alerts in the application</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.inAppEnabled}
                onChange={(e) =>
                  setSettings({ ...settings, inAppEnabled: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Email Notifications</label>
              <p className="text-sm text-gray-500">Receive alerts via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailEnabled}
                onChange={(e) =>
                  setSettings({ ...settings, emailEnabled: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          {settings.emailEnabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={settings.emailAddress || ''}
                onChange={(e) =>
                  setSettings({ ...settings, emailAddress: e.target.value })
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="your@email.com"
              />
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Slack Notifications</label>
              <p className="text-sm text-gray-500">Receive alerts in Slack</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.slackEnabled}
                onChange={(e) =>
                  setSettings({ ...settings, slackEnabled: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          {settings.slackEnabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slack Webhook URL
              </label>
              <input
                type="text"
                value={settings.slackWebhook || ''}
                onChange={(e) =>
                  setSettings({ ...settings, slackWebhook: e.target.value })
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="https://hooks.slack.com/services/..."
              />
            </div>
          )}
        </div>
        <div className="mt-6">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Notification Settings'}
          </button>
        </div>
      </div>

      {/* Alert Rules */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Alert Rules</h2>
        
        {/* Existing Rules */}
        <div className="space-y-4 mb-6">
          {rules.map((rule, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{rule.name}</h3>
                  <p className="text-sm text-gray-600">
                    Alert if {rule.metric} {rule.operator === 'lt' ? '<' : rule.operator === 'gt' ? '>' : rule.operator === 'eq' ? '=' : rule.operator === 'gte' ? '>=' : '<='} {rule.threshold} ({rule.severity})
                  </p>
                  {rule.campaignId && (
                    <p className="text-xs text-gray-500 mt-1">
                      Campaign: {campaigns.find((c) => c.id === rule.campaignId)?.name || 'Unknown'}
                    </p>
                  )}
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    rule.enabled
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {rule.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Rule */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Rule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rule Name
              </label>
              <input
                type="text"
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="e.g., Low ROAS Alert"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Metric
              </label>
              <select
                value={newRule.metric}
                onChange={(e) => setNewRule({ ...newRule, metric: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="ctr">CTR</option>
                <option value="cpc">CPC</option>
                <option value="roas">ROAS</option>
                <option value="conversions">Conversions</option>
                <option value="bounceRate">Bounce Rate</option>
                <option value="spend">Spend</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operator
              </label>
              <select
                value={newRule.operator}
                onChange={(e) => setNewRule({ ...newRule, operator: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="lt">Less Than (&lt;)</option>
                <option value="lte">Less Than or Equal (&lt;=)</option>
                <option value="gt">Greater Than (&gt;)</option>
                <option value="gte">Greater Than or Equal (&gt;=)</option>
                <option value="eq">Equal (=)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Threshold
              </label>
              <input
                type="number"
                step="0.01"
                value={newRule.threshold}
                onChange={(e) =>
                  setNewRule({ ...newRule, threshold: parseFloat(e.target.value) })
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity
              </label>
              <select
                value={newRule.severity}
                onChange={(e) => setNewRule({ ...newRule, severity: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campaign (Optional)
              </label>
              <select
                value={newRule.campaignId || ''}
                onChange={(e) =>
                  setNewRule({ ...newRule, campaignId: e.target.value || null })
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">All Campaigns</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleAddRule}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Adding...' : 'Add Rule'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

