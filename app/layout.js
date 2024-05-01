export const metadata = {
  title: "Jobke",
  description: "Generated by Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <style>
          {`
            body { margin: 0; }
          `}
        </style>
      </head>
      <body>{children}</body>
    </html>
  );
}
