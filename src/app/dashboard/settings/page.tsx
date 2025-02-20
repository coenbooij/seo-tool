'use client'

import { Card } from "@/components/ui/card"
import { useLanguage } from "@/providers/language-provider"

export default function SettingsPage() {
  const { language, setLanguage, messages } = useLanguage()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{messages.settings.title}</h1>
      <div className="space-y-6 max-w-2xl">
        <Card className="p-6 bg-white">
          <h2 className="text-lg font-semibold mb-4">{messages.settings.userPreferences}</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
                {messages.settings.timezone}
              </label>
              <select 
                id="timezone"
                name="timezone"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                defaultValue="UTC"
                aria-label="Select timezone"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
              </select>
            </div>
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                {messages.settings.language}
              </label>
              <select 
                id="language"
                name="language"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                aria-label="Select language"
              >
                <option value="en">English</option>
                <option value="nl">Nederlands</option>
              </select>
            </div>
          </div>
        </Card>
        
        <Card className="p-6 bg-white">
          <h2 className="text-lg font-semibold mb-4">{messages.settings.notifications.title}</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700">{messages.settings.notifications.email.title}</h3>
                <p className="text-sm text-gray-500">{messages.settings.notifications.email.description}</p>
              </div>
              <label htmlFor="email-notifications" className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  id="email-notifications"
                  name="email-notifications"
                  className="sr-only peer" 
                  defaultChecked 
                  aria-label="Toggle email notifications"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700">{messages.settings.notifications.weeklyReports.title}</h3>
                <p className="text-sm text-gray-500">{messages.settings.notifications.weeklyReports.description}</p>
              </div>
              <label htmlFor="weekly-reports" className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  id="weekly-reports"
                  name="weekly-reports"
                  className="sr-only peer" 
                  defaultChecked 
                  aria-label="Toggle weekly reports"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}