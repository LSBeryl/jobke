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
  updateDoc,
} from "firebase/firestore";
import { v4 } from "uuid";

export default function Write({ searchParams }) {
  const [title, setTitle] = useState("");
  const [mdValue, setMdValue] = useState("");
  const [userName, setUserName] = useState("");

  const [isLogin, setLogin] = useState(false);
  const router = useRouter();

  const [modifyData, setModifyData] = useState([]);

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
    async function fetchIds() {
      const type = searchParams.type == "normal" ? "articles" : "announcements";
      const querySnapshot = await getDocs(collection(db, type));
      const docIds = querySnapshot.docs.map((doc) => doc.id);
      const promises = docIds.map(async (id) => {
        const snapshot = await getDoc(doc(db, type, id));
        return snapshot.data();
      });

      const results = await Promise.all(promises);
      return results;
    }

    async function fetchData() {
      const data = await fetchIds();
      setModifyData(data);
      console.log(data);
    }

    fetchData();
  }, []);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (searchParams.mode == "modify") {
      modifyData.forEach((data, idx) => {
        if (data.uuid == searchParams.id) {
          setTitle(data.title);
          setMdValue(data.message);
          setUserName(data.userName);
        }
      });
    }
  }, [modifyData]);

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
                if (searchParams.mode == "modify") {
                  await updateDoc(
                    doc(
                      db,
                      searchParams.type == "normal"
                        ? "articles"
                        : "announcements",
                      searchParams.id
                    ),
                    {
                      title: title,
                      message: mdValue,
                      userName: userName,
                    }
                  );
                  alert("글이 수정되었습니다.");
                  router.push(
                    "/" + (searchParams.type == "normal" ? "articles" : "note")
                  );
                } else {
                  if (searchParams.type == "announce") {
                    if (isLogin) {
                      const uuid = v4();
                      await setDoc(doc(db, "announcements", uuid), {
                        title: title,
                        message: mdValue,
                        creationTime: new Date(),
                        userName: userName,
                        uuid: uuid,
                      });
                      setTitle("");
                      setMdValue("");
                      alert("글이 등록되었습니다.");
                      router.push("/note");
                    } else {
                      alert("비정상적인 접근입니다.");
                    }
                  } else if (searchParams.type == "normal") {
                    if (userName == "관리자" || userName == "잡케") {
                      if (isLogin) {
                        const uuid = v4();
                        await setDoc(doc(db, "articles", uuid), {
                          title: title,
                          message: mdValue,
                          creationTime: new Date(),
                          userName: userName,
                          reply: [],
                          uuid: uuid, // v4() -> '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed' uuid 결과 출력하는 함수
                        });
                        router.push("/articles");
                      } else {
                        alert("사용 불가한 이름입니다.");
                      }
                    } else {
                      const uuid = v4();
                      let userPw = prompt(
                        "수정과 삭제 시 사용할 비밀번호를 등록해주세요."
                      );
                      if (userPw == null) {
                        alert("취소되었습니다.");
                      } else {
                        while (!userPw) {
                          userPw = prompt("비밀번호를 다시 입력해주세요.");
                        }
                        await setDoc(doc(db, "articles", uuid), {
                          title: title,
                          message: mdValue,
                          creationTime: new Date(),
                          userName: userName,
                          reply: [],
                          uuid: uuid,
                          password: userPw,
                        });
                        setTitle("");
                        setMdValue("");
                        alert("글이 등록되었습니다.");
                        router.push("/articles");
                      }
                    }
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
            placeholder="작성자명"
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
