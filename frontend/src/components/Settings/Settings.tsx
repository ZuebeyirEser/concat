import { FiUser, FiLock, FiMonitor, FiAlertTriangle } from 'react-icons/fi'
import { useState } from 'react'

import Appearance from '@/components/UserSettings/Appearance'
import ChangePassword from '@/components/UserSettings/ChangePassword'
import DeleteAccount from '@/components/UserSettings/DeleteAccount'
import UserInformation from '@/components/UserSettings/UserInformation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'

import useAuth from '@/hooks/useAuth'

const tabsConfig = [
  {
    value: 'my-profile',
    title: 'Profile',
    icon: FiUser,
    component: UserInformation,
    color: 'blue',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-500/30',
  },
  {
    value: 'password',
    title: 'Security',
    icon: FiLock,
    component: ChangePassword,
    color: 'orange',
    bgColor: 'bg-orange-500/10',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-500/30',
  },
  {
    value: 'appearance',
    title: 'Appearance',
    icon: FiMonitor,
    component: Appearance,
    color: 'purple',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-500/30',
  },
  {
    value: 'danger-zone',
    title: 'Account',
    icon: FiAlertTriangle,
    component: DeleteAccount,
    color: 'red',
    bgColor: 'bg-red-500/10',
    textColor: 'text-red-600',
    borderColor: 'border-red-500/30',
  },
]

export function Settings() {
  const { user: currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('my-profile')
  const finalTabs = currentUser?.is_superuser
    ? tabsConfig.slice(0, 3)
    : tabsConfig

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account preferences and security settings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <TabsList className="inline-flex h-12 items-center justify-center rounded-lg bg-muted p-1">
              {finalTabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.value
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={`relative flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-300 ${isActive
                      ? `${tab.bgColor} ${tab.textColor} shadow-sm border ${tab.borderColor} font-semibold`
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.title}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>
        </div>

        {finalTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-0">
            <Card className="overflow-hidden rounded-lg border bg-card shadow-sm min-h-[600px]">
              <tab.component />
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}