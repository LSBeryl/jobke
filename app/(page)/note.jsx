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
import { Pencil } from "lucide-react";

export default function Note() {
  const [noteData, setNoteData] = useState([]);
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
  }, []);

  return (
    <div className={styles.container}>
      <h2>공지사항</h2>
      <div className={styles.tableCon}>
        {isLogin ? (
          <div
            onClick={() => {
              router.push("/write?type=announce");
            }}
          >
            <Pencil height="1rem" />
            글쓰기
          </div>
        ) : null}
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
                      router.push(`note/${noteData.length - i}`);
                    }}
                  >
                    <td>{noteData.length - i}</td>
                    <td>{data.title}</td>
                    <td
                      style={
                        data.userName == "관리자"
                          ? {
                              color: "#a00",
                              fontWeight: "700",
                            }
                          : data.userName == "잡케"
                          ? {
                              color: "var(--green-main)",
                              fontWeight: "700",
                            }
                          : null
                      }
                    >
                      {data.userName}
                    </td>
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
