import "./globals.css";

export const metadata = {
  title: "Coram Digital Sales Room",
  description: "Coram AI — Unified physical security, threat detection, and emergency response.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
