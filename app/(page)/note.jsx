"use client";

import { useEffect, useState } from "react";
import styles from "../../styles/note.module.css";
import { db, auth } from "../firebase";
import { setPersistence, browserLocalPersistence } from "firebase/auth";
import { getDocs, collection, getDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { useMediaQuery } from "react-responsive";

export default function Note() {
  const [noteData, setNoteData] = useState(null); // 초기 상태를 null로 설정
  const [isLogin, setLogin] = useState(false); // 초기 로그인 상태 명시적으로 설정
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

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
    await auth.authStateReady();
    setPersistence(auth, browserLocalPersistence).then(() => {
      auth.onAuthStateChanged((user) => {
        if (user) setLogin(true);
      });
    });
  };

  useEffect(() => {
    init();
    setMounted(true);
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
      setNoteData(results); // 여기에서 noteData 상태를 업데이트
    }

    fetchIds();
  }, []);

  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  return (
    mounted && (
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
            {isMobile ? (
              <colgroup>
                <col className={styles.col60} />
                <col className={styles.col30} />
              </colgroup>
            ) : (
              <colgroup>
                <col className={styles.col10} />
                <col className={styles.col50} />
                <col className={styles.col15} />
                <col className={styles.col15} />
              </colgroup>
            )}
            <thead>
              <tr>
                {isMobile ? null : <td>번호</td>}
                <td>제목</td>
                <td>작성자</td>
                {isMobile ? null : <td>날짜</td>}
              </tr>
            </thead>
            <tbody>
              {noteData ? (
                noteData.length > 0 ? (
                  noteData
                    .sort((a, b) => {
                      const timeA = a.creationTime
                        ? a.creationTime.seconds
                        : null;
                      const timeB = b.creationTime
                        ? b.creationTime.seconds
                        : null;
                      return timeB - timeA;
                    })
                    .map((data, i) => (
                      <tr
                        key={i}
                        onClick={() => {
                          router.push(
                            `note/${noteData.length - i}?id=${data.uuid}`
                          );
                        }}
                      >
                        {isMobile ? null : <td>{noteData.length - i}</td>}
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
                        {isMobile ? null : (
                          <td>
                            {formatTime(data.creationTime.seconds * 1000)}
                          </td>
                        )}
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={isMobile ? "2" : "4"}>데이터가 없습니다.</td>
                  </tr>
                )
              ) : (
                <tr>
                  <td colSpan={isMobile ? "2" : "4"}>데이터 로딩 중...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  );
}
