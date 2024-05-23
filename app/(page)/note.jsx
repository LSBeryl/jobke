"use client";

import { useEffect, useState } from "react";
import styles from "../../styles/note.module.css";
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
import MDEditor from "@uiw/react-md-editor";
import rehypeSanitize from "rehype-sanitize";
import { useRouter } from "next/navigation";

export default function Note() {
  const [mdValue, setMdValue] = useState("");
  const [update, setUpdate] = useState([]);
  const [noteData, setNoteData] = useState([]);
  const [title, setTitle] = useState("");
  const [isLogin, setLogin] = useState(false);

  const router = useRouter();

  function formatTime(t) {
    const wallTime = new Date(t);
    const formatWallTime = `${wallTime.getFullYear()}-${
      wallTime.getMonth() + 1 < 10
        ? "0" + (wallTime.getMonth() + 1)
        : wallTime.getMonth() + 1
    }-${
      wallTime.getDate() < 10 ? "0" + wallTime.getDate() : wallTime.getDate()
    }`;
    return formatWallTime;
  }

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

  useEffect(() => {
    async function fetchIds() {
      const querySnapshot = await getDocs(collection(db, "announcements"));
      const docIds = querySnapshot.docs.map((doc) => doc.id);
      const promises = docIds.map(async (id) => {
        const snapshot = await getDoc(doc(db, "announcements", id));
        return snapshot.data();
      });

      const results = await Promise.all(promises);
      return results;
    }

    async function fetchData() {
      const data = await fetchIds();
      setNoteData(data);
    }

    fetchData();
  }, [update]);

  return (
    <div className={styles.container}>
      {isLogin ? (
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
                if (mdValue && title) {
                  await addDoc(collection(db, "announcements"), {
                    title: title,
                    message: mdValue,
                    creationTime: new Date(),
                  });
                  setUpdate([...update]);
                  setTitle("");
                  setMdValue("");
                  alert("공지가 등록되었습니다.");
                } else {
                  alert("제목 혹은 내용이 입력되지 않았습니다.");
                }
              }}
            >
              등록
            </button>
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
      ) : null}
      <h2>공지사항</h2>
      <div className={styles.tableCon}>
        <table className={styles.table}>
          <colgroup>
            <col className={styles.col10} />
            <col className={styles.col60} />
            <col className={styles.col15} />
            <col className={styles.col15} />
          </colgroup>
          <thead>
            <tr>
              <td>번호</td>
              <td>제목</td>
              <td>작성자</td>
              <td>날짜</td>
            </tr>
          </thead>
          <tbody>
            {noteData[0] ? (
              noteData
                .sort((a, b) => {
                  const timeA = a.creationTime ? a.creationTime.seconds : null;
                  const timeB = b.creationTime ? b.creationTime.seconds : null;
                  return timeB - timeA;
                })
                .map((data, i) => (
                  <tr
                    key={i}
                    onClick={() => {
                      router.push(`note/${i + 1}`);
                    }}
                  >
                    <td>{i + 1}</td>
                    <td>{data.title}</td>
                    <td>잡케</td>
                    <td>{formatTime(data.creationTime.seconds * 1000)}</td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan={"4"}>데이터 로딩 중...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
