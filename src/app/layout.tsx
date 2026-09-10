import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { StarterDashboardFloatingButton } from "@/features/starter-dashboard";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next Feature Starter",
  description: "Feature-based Next.js starter with built-in code generation.",
};

// Controls only the floating shortcut. /dashboard-demo stays reachable directly.
// Safe default: missing/false → the button is not rendered.
const showStarterDashboard = process.env.SHOW_STARTER_DASHBOARD === "true";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        {showStarterDashboard && <StarterDashboardFloatingButton />}
      </body>
    </html>
  );
}
