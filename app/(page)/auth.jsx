"use client";

import styles from "../../styles/auth.module.css";
import { useEffect, useState } from "react";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Auth() {
  const [isReady, setReady] = useState(false); // 파이어베이스 로그인 준비 상태
  const [isLogin, setLogin] = useState(false);
  const [password, setPassword] = useState(""); // 유저가 입력한 비밀번호
  const [isLoading, setLoading] = useState(false); // 로그인 버튼 누른 후 로딩되는 상태
  const [error, setError] = useState(""); // 로그인 실패 시 나타날 에러
  const route = useRouter();

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
    setReady(true);
  };

  useEffect(() => {
    init();
  }, []);

  async function submit(e) {
    // 자동로그인 되어있지 않을 때, 비밀번호 입력하고 submit하면 실행되는 함수
    // signInWithEmailAndPassword를 통해 이메일과 비밀번호 입력 후 로그인
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await signInWithEmailAndPassword(
        auth,
        "jobkejobkejobke@gmail.com",
        password
      ).then(() => {
        route.push("/");
      });
    } catch (e) {
      console.error(e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrap}>
      {isReady ? (
        isLogin ? (
          <>이미 인증 완료된 상태입니다.</>
        ) : (
          <>
            <form onSubmit={submit}>
              <input
                type="password"
                placeholder="인증 코드 입력"
                onInput={(e) => setPassword(e.target.value)}
              />
              <input type="submit" value={isLoading ? "인증 중..." : "인증"} />
            </form>
            <div className={styles.error}>
              {error ? (
                <>
                  <div>인증 도중 오류가 발생하였습니다.</div>
                  <div>오류 메시지 : {error.message}</div>
                </>
              ) : null}
            </div>
          </>
        )
      ) : null}
    </div>
  );
}
