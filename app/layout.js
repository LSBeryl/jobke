import Link from "next/link";
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
        <div className="footer">
          <div>&copy; 2024 잡케. All rights reserved.</div>
          <div>
            <Link href="https://chzzk.naver.com/cad491fc20e7092e40615955cae88e80">
              치지직
            </Link>
            •<Link href="https://discord.com/invite/v2s2F8FHFp">디스코드</Link>•
            <Link href="https://www.youtube.com/@jobke_game">유튜브</Link>
          </div>
        </div>
      </body>
    </html>
  );
}
