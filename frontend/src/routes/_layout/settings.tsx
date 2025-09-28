import { createFileRoute } from '@tanstack/react-router'
import { FiUser, FiLock, FiMonitor, FiAlertTriangle } from 'react-icons/fi'

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
  },
  {
    value: 'password',
    title: 'Security',
    icon: FiLock,
    component: ChangePassword,
  },
  {
    value: 'appearance',
    title: 'Appearance',
    icon: FiMonitor,
    component: Appearance,
  },
  {
    value: 'danger-zone',
    title: 'Account',
    icon: FiAlertTriangle,
    component: DeleteAccount,
  },
]

export const Route = createFileRoute('/_layout/settings')({
  component: UserSettings,
})

function UserSettings() {
  const { user: currentUser } = useAuth()
  const finalTabs = currentUser?.is_superuser
    ? tabsConfig.slice(0, 3)
    : tabsConfig

  if (!currentUser) {
    return null
  }

  return (
    <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account preferences and security settings
        </p>
      </div>

      <Tabs defaultValue="my-profile" className="w-full">
        {/* Clean Professional Tab Navigation */}
        <div className="mb-8 flex justify-center">
          <TabsList className="inline-flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
            {finalTabs.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm hover:bg-gray-50 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.title}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>

        {/* Tab Content */}
        {finalTabs.map(tab => (
          <TabsContent key={tab.value} value={tab.value}>
            <Card className="overflow-hidden rounded-lg border-purple-200 bg-white/90 shadow-sm backdrop-blur-sm dark:border-purple-700 dark:bg-gray-900/90">
              <tab.component />
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
