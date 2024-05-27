"use client";

import styles from "../../styles/write.module.css";
import MDEditor from "@uiw/react-md-editor";
import rehypeSanitize from "rehype-sanitize";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "../firebase";
import { setPersistence, browserLocalPersistence } from "firebase/auth";
import {
  getDocs,
  collection,
  getDoc,
  doc,
  addDoc,
  deleteDoc,
  setDoc,
  getDocFromCache,
  query,
} from "firebase/firestore";

export default function Write({ searchParams }) {
  const [title, setTitle] = useState("");
  const [mdValue, setMdValue] = useState("");
  const [userName, setUserName] = useState("");

  const [isLogin, setLogin] = useState(false);
  const router = useRouter();

  const init = async () => {
    // 처음 마운트 될 때 실행되는 함수
    // ready 시킨 후 localStorage에 user 존재하면 자동로그인
    // 비밀번호가 맞아야 로그인되므로(잡케만 로그인 가능) 로그아웃 구현은 나중에 필요하면 함
    await auth.authStateReady();
    setPersistence(auth, browserLocalPersistence).then(() => {
      auth.onAuthStateChanged((user) => {
        if (user) setLogin(true);
        else if (!user && searchParams.type == "announce") {
          router.push("/note");
          alert("비정상적인 접근입니다.");
        }
      });
    });
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (searchParams.type == "announce" && isLogin) setUserName("잡케");
  }, [isLogin]);

  return (
    <div className={styles.container}>
      <div className={styles.editor}>
        <div className={styles.form}>
          <input
            type="text"
            placeholder="제목"
            value={title}
            onChange={(v) => setTitle(v.target.value)}
          />
          <button
            onClick={async () => {
              if (mdValue && title && userName) {
                if (searchParams.type == "announce") {
                  if (isLogin) {
                    await addDoc(collection(db, "announcements"), {
                      title: title,
                      message: mdValue,
                      creationTime: new Date(),
                      userName: userName,
                    });
                    setTitle("");
                    setMdValue("");
                    alert("글이 등록되었습니다.");
                    router.push("/note");
                  } else {
                    alert("비정상적인 접근입니다.");
                  }
                } else if (searchParams.type == "normal") {
                  if (userName == "관리자") {
                    if (isLogin) {
                      await addDoc(collection(db, "articles"), {
                        title: title,
                        message: mdValue,
                        creationTime: new Date(),
                        userName: "관리자",
                        reply: [],
                      });
                      router.push("/articles");
                    } else {
                      alert("사용 불가한 이름입니다.");
                    }
                  } else {
                    await addDoc(collection(db, "articles"), {
                      title: title,
                      message: mdValue,
                      creationTime: new Date(),
                      userName: userName,
                      reply: [],
                    });
                    setTitle("");
                    setMdValue("");
                    alert("글이 등록되었습니다.");
                    router.push("/articles");
                  }
                }
              } else {
                alert("입력되지 않은 정보가 있습니다.");
              }
            }}
          >
            등록
          </button>
        </div>
        <div className={styles.name}>
          <input
            type="text"
            placeholder="이름"
            value={userName}
            maxLength={"10"}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        <MDEditor
          height={400}
          value={mdValue}
          onChange={setMdValue}
          previewOptions={{
            rehypePlugins: [[rehypeSanitize]],
          }}
        />
      </div>
    </div>
  );
}
