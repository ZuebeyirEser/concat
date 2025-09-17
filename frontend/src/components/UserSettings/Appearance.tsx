import { useTheme } from 'next-themes'
import { FiMonitor, FiSun, FiMoon } from 'react-icons/fi'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

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
        <h3 className="text-lg font-semibold text-foreground">
          Appearance
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose how concat looks and feels to you
        </p>
      </div>

      <RadioGroup onValueChange={setTheme} value={theme} className="space-y-3">
        {themeOptions.map(option => {
          const Icon = option.icon
          return (
            <div key={option.value} className="relative">
              <div
                onClick={() => setTheme(option.value)}
                className={`flex cursor-pointer items-center space-x-4 rounded-md border p-4 transition-all hover:bg-accent/50 ${theme === option.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-background'
                  }`}
              >
                <RadioGroupItem
                  value={option.value}
                  id={option.value}
                  className="pointer-events-none"
                />
                <div className="flex flex-1 items-center space-x-3">
                  <div
                    className={`rounded-md p-2 ${theme === option.value
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">
                      {option.label}
                    </div>
                    <p className="text-xs text-muted-foreground">
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
