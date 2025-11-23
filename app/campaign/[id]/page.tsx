'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import CampaignChart from '@/components/CampaignChart'
import AlertCard from '@/components/AlertCard'
import HealthScoreBadge from '@/components/HealthScoreBadge'

interface Metric {
  timestamp: string
  ctr: number
  cpc: number
  roas: number
  conversions: number
  bounceRate: number
  spend: number
  isAnomaly: boolean
  anomalyType: string | null
}

interface Campaign {
  id: string
  name: string
  status: string
  settings: any
  alerts: any[]
}

export default function CampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [sensitivitySettings, setSensitivitySettings] = useState<any>(null)
  const [isSavingSensitivity, setIsSavingSensitivity] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/campaigns/${params.id}`)
        const data = await response.json()
        setCampaign(data.campaign)
        setMetrics(data.metrics)
        
        // Fetch sensitivity settings
        const settingsResponse = await fetch(`/api/campaigns/${params.id}/settings`)
        const settingsData = await settingsResponse.json()
        setSensitivitySettings(settingsData)
        
        // Generate dummy AI suggestions based on alerts
        if (data.campaign.alerts && data.campaign.alerts.length > 0) {
          const alert = data.campaign.alerts[0]
          if (alert.suggestions) {
            try {
              setSuggestions(JSON.parse(alert.suggestions))
            } catch {
              setSuggestions([
                'Review targeting parameters',
                'Check ad creative performance',
                'Consider adjusting bid strategy',
              ])
            }
          } else {
            setSuggestions([
              'Review targeting parameters',
              'Check ad creative performance',
              'Consider adjusting bid strategy',
            ])
          }
        }
      } catch (error) {
        console.error('Error fetching campaign:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchData()
    }
  }, [params.id])

  const handleResolveAlert = async (alertId: string, status: 'resolved' | 'dismissed') => {
    try {
      await fetch(`/api/alerts/${alertId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, resolvedBy: 'user' }),
      })
      
      // Refresh data
      const response = await fetch(`/api/campaigns/${params.id}`)
      const data = await response.json()
      setCampaign(data.campaign)
      setSelectedAlert(null)
    } catch (error) {
      console.error('Error resolving alert:', error)
    }
  }

  const handleSensitivityChange = async (metric: string, value: number) => {
    if (!sensitivitySettings) return
    
    const updated = { ...sensitivitySettings, [metric]: value }
    setSensitivitySettings(updated)
    
    setIsSavingSensitivity(true)
    try {
      await fetch(`/api/campaigns/${params.id}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updated),
      })
    } catch (error) {
      console.error('Error updating sensitivity:', error)
    } finally {
      setIsSavingSensitivity(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500">Loading campaign...</p>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500">Campaign not found</p>
      </div>
    )
  }

  const healthScore = campaign.alerts
    ? Math.max(
        0,
        100 -
          campaign.alerts.filter((a: any) => a.severity === 'critical' && a.status === 'open').length * 20 -
          campaign.alerts.filter((a: any) => a.severity === 'warning' && a.status === 'open').length * 10 -
          campaign.alerts.filter((a: any) => a.severity === 'info' && a.status === 'open').length * 5
      )
    : 100

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          ← Back to Dashboard
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
            <p className="mt-2 text-sm text-gray-600">Campaign ID: {campaign.id}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Health Score</div>
              <div className="mt-1">
                <HealthScoreBadge score={healthScore} size="lg" />
              </div>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                campaign.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {campaign.status}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <CampaignChart metrics={metrics} metricType="ctr" title="Click-Through Rate (CTR)" />
        <CampaignChart metrics={metrics} metricType="cpc" title="Cost Per Click (CPC)" />
        <CampaignChart metrics={metrics} metricType="roas" title="Return on Ad Spend (ROAS)" />
        <CampaignChart metrics={metrics} metricType="conversions" title="Conversions" />
        <CampaignChart metrics={metrics} metricType="bounceRate" title="Bounce Rate" />
        <CampaignChart metrics={metrics} metricType="spend" title="Spend" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Alerts</h2>
            <div className="space-y-4">
              {campaign.alerts && campaign.alerts.length > 0 ? (
                campaign.alerts.map((alert: any) => (
                  <div key={alert.id}>
                    <AlertCard
                      alert={{
                        ...alert,
                        campaign: { id: campaign.id, name: campaign.name },
                      }}
                    />
                    {selectedAlert === alert.id && (
                      <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleResolveAlert(alert.id, 'resolved')}
                            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                          >
                            Mark Resolved
                          </button>
                          <button
                            onClick={() => handleResolveAlert(alert.id, 'dismissed')}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => setSelectedAlert(null)}
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                    {selectedAlert !== alert.id && alert.status === 'open' && (
                      <button
                        onClick={() => setSelectedAlert(alert.id)}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Resolve Alert →
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No alerts for this campaign</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* AI Suggestions Panel */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Suggestions</h2>
            {suggestions.length > 0 ? (
              <ul className="space-y-3">
                {suggestions.map((suggestion, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-semibold mr-3">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-gray-700">{suggestion}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No suggestions available</p>
            )}
          </div>

          {/* Sensitivity Controls */}
          {sensitivitySettings && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Sensitivity Controls</h2>
              <p className="text-sm text-gray-500 mb-4">
                Adjust anomaly detection sensitivity for each metric
              </p>
              <div className="space-y-4">
                {[
                  { key: 'ctrSensitivity', label: 'CTR Sensitivity', max: 1 },
                  { key: 'cpcSensitivity', label: 'CPC Sensitivity', max: 1 },
                  { key: 'roasSensitivity', label: 'ROAS Sensitivity', max: 1 },
                  { key: 'conversionSensitivity', label: 'Conversion Sensitivity', max: 1 },
                  { key: 'bounceSensitivity', label: 'Bounce Rate Sensitivity', max: 1 },
                  { key: 'spendSensitivity', label: 'Spend Sensitivity', max: 1 },
                ].map(({ key, label, max }) => (
                  <div key={key}>
                    <div className="flex justify-between mb-1">
                      <label className="text-sm font-medium text-gray-700">{label}</label>
                      <span className="text-sm text-gray-500">
                        {(sensitivitySettings[key] * 100).toFixed(0)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={max}
                      step="0.01"
                      value={sensitivitySettings[key]}
                      onChange={(e) => handleSensitivityChange(key, parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                ))}
              </div>
              {isSavingSensitivity && (
                <p className="text-xs text-gray-500 mt-2">Saving...</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

