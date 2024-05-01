"use client";

import { styled } from "styled-components";
import { useEffect, useState, useNavigate } from "react";
import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "firebase/auth";

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
  const [isReady, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLogin, setLogin] = useState(false);

  const init = async () => {
    await auth.authStateReady();
    setReady(true);
  };
  useEffect(() => {
    init();
  }, []);

  async function submit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      await signInWithEmailAndPassword(
        auth,
        "jobkejobkejobke@gmail.com",
        password
      ).then((credential) => {
        console.log(credential);
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
                onChange={(e) => setPassword(e.target.value)}
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
