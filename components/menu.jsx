"use client";

import Link from "next/link";
import { Menu as MenuBtn } from "lucide-react";
import { useState } from "react";

export default function Menu() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="title">
        <img src="" alt="" />
        <Link href="/">잡케</Link>
      </div>
      <div className="menu">
        <Link href="/note">공지</Link>
        <Link href="/articles">게시판</Link>
        <Link href="/plan">방송 일정</Link>
        <Link href="/auth">스트리머 인증</Link>
      </div>
      <div className="mobMenuCon">
        <MenuBtn
          color={"var(--white)"}
          onClick={() => {
            setOpen(!open);
          }}
        />
        <div
          className="mobMenu"
          style={{ display: open ? "" : "none" }}
          onClick={() => {
            setOpen(!open);
          }}
        >
          <Link href="/note">공지</Link>
          <Link href="/articles">게시판</Link>
          <Link href="/plan">방송 일정</Link>
          <Link href="/auth">스트리머 인증</Link>
          <div className="mobMenuAlert">
            ※ 메뉴를 종료하려면 빈 공간을 탭하세요.
          </div>
        </div>
      </div>
    </div>
  );
}
