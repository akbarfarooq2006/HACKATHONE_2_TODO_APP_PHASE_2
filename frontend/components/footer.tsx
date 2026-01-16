export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Links */}
          <div className="flex flex-wrap justify-center md:justify-start gap-6">
            <a
              href="/about"
              className="text-foreground hover:text-accent transition-colors text-sm"
            >
              About
            </a>
            <a
              href="/privacy"
              className="text-foreground hover:text-accent transition-colors text-sm"
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="text-foreground hover:text-accent transition-colors text-sm"
            >
              Terms
            </a>
            <a
              href="/contact"
              className="text-foreground hover:text-accent transition-colors text-sm"
            >
              Contact
            </a>
          </div>

          {/* Copyright */}
          <div className="text-foreground text-sm text-center md:text-right">
            © {currentYear} TaskApp. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
