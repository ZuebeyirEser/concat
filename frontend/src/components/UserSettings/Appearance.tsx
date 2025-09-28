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
      <div className="max-w-2xl">
        {/* Appearance Header */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-r from-purple-500/5 to-pink-500/10 rounded-lg border border-purple-500/20">
          <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
            <FiMonitor className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Theme Preferences</h3>
            <p className="text-sm text-muted-foreground">Choose how the interface looks and feels</p>
          </div>
        </div>

        <div className="space-y-4">
          <RadioGroup onValueChange={setTheme} value={theme} className="space-y-4">
            {themeOptions.map(option => {
              const Icon = option.icon
              return (
                <div key={option.value} className="relative">
                  <div
                    onClick={() => setTheme(option.value)}
                    className={`flex cursor-pointer items-center space-x-4 rounded-lg border p-4 transition-all duration-200 hover:border-border hover:bg-muted/20 ${theme === option.value
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border/60 bg-background'
                      }`}
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={option.value}
                      className="pointer-events-none"
                    />
                    <div className="flex flex-1 items-center space-x-4">
                      <div
                        className={`rounded-lg p-3 ${theme === option.value
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted/50 text-muted-foreground'
                          }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">
                          {option.label}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </RadioGroup>

          {/* Theme Info */}
          <div className="mt-8 p-4 bg-muted/30 rounded-lg border border-border/50">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium text-foreground">Current Theme: {themeOptions.find(opt => opt.value === theme)?.label}</p>
                <p className="text-xs text-muted-foreground mt-1">Changes apply immediately across the entire application</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Appearance
