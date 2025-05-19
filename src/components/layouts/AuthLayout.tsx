
import { ReactNode } from "react";
import { ThemeProvider } from "../theme-provider";
import { ThemeToggle } from "../theme-toggle";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <ThemeProvider defaultTheme="light">
      <div className="flex min-h-screen w-full flex-col bg-background dark:bg-background">
        <header className="fixed top-0 right-0 p-4">
          <ThemeToggle />
        </header>
        
        <div className="fancy-grid flex min-h-screen flex-col items-center justify-center p-4 sm:px-8">
          <div className="w-full max-w-md rounded-xl bg-background p-8 shadow-lg dark:bg-background/80">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {title}
              </h1>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            <div className="mt-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
