
import { ReactNode } from "react";
import { Sidebar } from "../sidebar/Sidebar";
import { ThemeProvider } from "../theme-provider";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <ThemeProvider defaultTheme="light">
      <div className="flex h-screen w-full bg-background dark:bg-background">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}
