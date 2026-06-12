import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import AppAutoRefresh from "@/components/AppAutoRefresh";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["400","500","600","700","800"] });

const extensionErrorGuard = `
(function () {
  function text(value) {
    if (!value) return "";
    if (value.message) return String(value.message);
    return String(value);
  }

  function isMetaMaskError(eventOrReason) {
    var message = text(eventOrReason && (eventOrReason.error || eventOrReason.reason || eventOrReason.message || eventOrReason));
    var filename = String((eventOrReason && eventOrReason.filename) || "");
    return message.indexOf("Failed to connect to MetaMask") !== -1 ||
      filename.indexOf("chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/") === 0;
  }

  window.addEventListener("error", function (event) {
    if (isMetaMaskError(event)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  window.addEventListener("unhandledrejection", function (event) {
    if (isMetaMaskError(event)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
})();
`;

export const metadata: Metadata = {
  title: "SafeReach",
  description: "Smart Student Safety Tracking System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: extensionErrorGuard }} />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Suspense fallback={null}>
          <AppAutoRefresh />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
