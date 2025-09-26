import { FiGithub, FiTwitter, FiMail, FiHeart } from 'react-icons/fi'

import Logo from '@/components/ui/logo'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Logo size="md" />
            <p className="max-w-xs text-sm text-muted-foreground">
              A modern platform for managing your items with style and
              efficiency.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <FiGithub className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <FiTwitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a
                href="mailto:contact@concat.app"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <FiMail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/items"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Items
                </a>
              </li>
              <li>
                <a
                  href="/settings"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Settings
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#about"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#blog"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#careers"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#privacy"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#terms"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#cookies"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Cookie Policy
                </a>
              </li>
              <li>
                <a
                  href="#security"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Security
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>© {currentYear} concat. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <span>Made with</span>
              <FiHeart className="h-4 w-4 text-red-500" />
              <span>by the concat team</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
