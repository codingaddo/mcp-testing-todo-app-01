import "./globals.css";
import type { Metadata } from "next";
import { ReactQueryClientProvider } from "../components/ReactQueryClientProvider";

export const metadata: Metadata = {
  title: "MCP Testing Todo App",
  description: "Simple todo app frontend talking to FastAPI backend",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-100 text-slate-900">
        <ReactQueryClientProvider>
          <main className="mx-auto max-w-2xl px-4 py-8">{children}</main>
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}
