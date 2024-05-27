"use client";

import { useEffect, useState } from "react";
import styles from "../../styles/articles.module.css";
import { db, auth } from "../firebase";
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
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";

export default function Articles() {
  const [noteData, setNoteData] = useState([]);
  const [ids, setIds] = useState([]);

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

  useEffect(() => {
    const tempIds = [];
    async function fetchIds() {
      const querySnapshot = await getDocs(collection(db, "articles"));
      const docIds = querySnapshot.docs.map((doc) => doc.id);
      const promises = docIds.map(async (id) => {
        const snapshot = await getDoc(doc(db, "articles", id));
        tempIds.push([snapshot.data(), id]);
        return snapshot.data();
      });
      const results = await Promise.all(promises);
      return results;
    }

    async function fetchData() {
      const data = await fetchIds();
      setIds(
        tempIds.sort((a, b) => {
          const timeA = a[0].creationTime ? a[0].creationTime.seconds : null;
          const timeB = b[0].creationTime ? b[0].creationTime.seconds : null;
          return timeB - timeA;
        })
      );
      setNoteData(data);
    }

    fetchData();
  }, []);

  return (
    <div className={styles.container}>
      <h2>게시판</h2>
      <div className={styles.tableCon}>
        <div
          onClick={() => {
            router.push("/write?type=normal");
          }}
        >
          <Pencil height="1rem" />
          글쓰기
        </div>
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
                      router.push(
                        `articles/${noteData.length - i}?id=${ids[i][1]}`
                      );
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
                <td colSpan={"4"}>데이터가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
