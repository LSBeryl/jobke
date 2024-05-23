import Menu from "../components/menu";
import "../styles/global.css";

export const metadata = {
  title: "잡케랑 게임하자!",
  description: "치지직 스트리머 잡케",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="kr">
      <body>
        <div className="header">
          <Menu />
        </div>
        <div className="component">
          <div>{children}</div>
        </div>
      </body>
    </html>
  );
}
