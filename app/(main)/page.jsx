"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { setPersistence, browserLocalPersistence } from "firebase/auth";
import styles from "../../styles/main.module.css";
import Game from "./game";
import gameData from "../(data)/gameData";

export default function Main() {
  const [isLogin, setLogin] = useState(false); // 로그인 되어있는 상태인지 표시

  const init = async () => {
    // 처음 마운트 될 때 실행되는 함수
    // ready 시킨 후 localStorage에 user 존재하면 자동로그인
    // 비밀번호가 맞아야 로그인되므로(잡케만 로그인 가능) 로그아웃 구현은 나중에 필요하면 함
    await auth.authStateReady();
    setPersistence(auth, browserLocalPersistence).then(() => {
      auth.onAuthStateChanged((user) => {
        if (user) setLogin(true);
      });
    });
  };

  useEffect(() => {
    init();
  }, []);
  return (
    <div className={styles.main}>
      <div className={styles.description}>
        <div>
          <img src="/logo.png" alt="" />
          <div>
            <Link href="https://chzzk.naver.com/cad491fc20e7092e40615955cae88e80">
              <img src="/chzzk.jpg" />
            </Link>
            <Link href="https://discord.com/invite/v2s2F8FHFp">
              <img src="/discord.png" />
            </Link>
            <Link href="https://www.youtube.com/@jobke_game">
              <img src="/youtube.png" />
            </Link>
          </div>
        </div>
        <div>
          <div className={styles.nick}>
            종합게임 스트리머, <span>잡케.</span>
          </div>
          <div>
            저는 종합게임 스트리머이고, 주 컨텐츠는 GTA5 (GTA6 기다리다 현기증
            나는 중), 공포게임, 인디게임 등 스팀게임을 주로 방송하고 있습니다.
            현재 치지직과 유튜브 동시 송출 중이지만 차후 SOOP까지 송출할 계획이
            있습니다. 2월 26일부터 방송 시작하였고 부족한 점이 많지만 이쁘게
            봐주세요!
          </div>
        </div>
      </div>
      <div className={styles.game}>
        <div>지금까지 했던 게임들</div>
        {gameData.map((data, i) => (
          <Game
            key={i}
            game={data.game}
            desc={data.desc}
            img={data.img}
            title={data.title}
          />
        ))}
      </div>
      {/* {isLogin ? null : <Link href="/auth">인증하기</Link>} */}
    </div>
  );
}
