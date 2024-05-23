"use client";

import Link from "next/link";

export default function Menu() {
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
    </div>
  );
}
