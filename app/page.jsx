"use client";

import { styled } from "styled-components";
import { useEffect, useState } from "react";
import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

const Wrap = styled.div`
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input``;

const Error = styled.div`
  color: #ff0000;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default function Page() {
  const [isReady, setReady] = useState(false); // 파이어베이스 로그인 준비 상태
  const [password, setPassword] = useState(""); // 유저가 입력한 비밀번호
  const [isLoading, setLoading] = useState(false); // 로그인 버튼 누른 후 로딩되는 상태
  const [error, setError] = useState(""); // 로그인 실패 시 나타날 에러
  const [isLogin, setLogin] = useState(false); // 로그인 되어있는 상태인지 표시

  const init = async () => {
    // 처음 마운트 될 때 실행되는 함수
    // ready 시킨 후 localStorage에 user 존재하면 자동로그인
    // 비밀번호가 맞아야 로그인되므로(잡케만 로그인 가능) 로그아웃 구현은 나중에 필요하면 함
    await auth.authStateReady();
    setReady(true);
    setPersistence(auth, browserLocalPersistence).then(() => {
      auth.onAuthStateChanged((user) => {
        if (user) setLogin(true);
      });
    });
    return () => temp();
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
        // 매개변수에 credential 들어감
        setLogin(true);
      });
    } catch (e) {
      console.error(e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Wrap>
      {isReady ? (
        isLogin ? (
          <>로그인 된 상태</>
        ) : (
          <>
            <Form onSubmit={submit}>
              <Input
                type="password"
                placeholder="비밀번호"
                onInput={(e) => setPassword(e.target.value)}
              />
              <Input type="submit" value={isLoading ? "인증 중..." : "인증"} />
            </Form>
            <Error>
              {error ? (
                <>
                  <div>인증 도중 오류가 발생하였습니다.</div>
                  <div>오류 메시지 : {error.message}</div>
                </>
              ) : null}
            </Error>
          </>
        )
      ) : null}
    </Wrap>
  );
}
