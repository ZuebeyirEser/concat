import { useTheme } from 'next-themes'
import { FiMonitor, FiSun, FiMoon } from 'react-icons/fi'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

const Appearance = () => {
  const { theme, setTheme } = useTheme()

  const themeOptions = [
    {
      value: 'system',
      label: 'System',
      description: "Use your system's theme setting",
      icon: FiMonitor,
    },
    {
      value: 'light',
      label: 'Light Mode',
      description: 'Clean and bright interface',
      icon: FiSun,
    },
    {
      value: 'dark',
      label: 'Dark Mode',
      description: 'Easy on the eyes in low light',
      icon: FiMoon,
    },
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Appearance
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Choose how concat looks and feels to you
        </p>
      </div>

      <RadioGroup onValueChange={setTheme} value={theme} className="space-y-3">
        {themeOptions.map(option => {
          const Icon = option.icon
          return (
            <div key={option.value} className="relative">
              <div
                className={`flex cursor-pointer items-center space-x-4 rounded-lg border-2 p-4 transition-all hover:bg-purple-50 dark:hover:bg-purple-900/20 ${
                  theme === option.value
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                    : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                }`}
              >
                <RadioGroupItem
                  value={option.value}
                  id={option.value}
                  className="mt-1"
                />
                <div className="flex flex-1 items-start space-x-3">
                  <div
                    className={`mt-2 rounded-lg p-2 ${
                      theme === option.value
                        ? 'bg-purple-100 text-purple-600 dark:bg-purple-800 dark:text-purple-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <Label
                      htmlFor={option.value}
                      className="cursor-pointer text-base font-medium text-gray-900 dark:text-gray-100"
                    >
                      {option.label}
                    </Label>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {option.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </RadioGroup>
    </div>
  )
}
export default Appearance
