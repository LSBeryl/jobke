"use client";

import styles from "../../../styles/viewer.module.css";
import { useEffect, useState } from "react";
import NotFound from "../../not-found";
import MDEditor from "@uiw/react-md-editor";
import { db, auth } from "../../firebase";
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

export default function Page({ params: { page, id } }) {
  const [noteData, setNoteData] = useState([]);
  const [update, setUpdate] = useState([]);

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
  switch (page) {
    case "articles":
      return <h1>게시판 중 {id} 글</h1>;
    case "note":
      return (
        <div className={styles.note}>
          {noteData[0] ? (
            noteData
              .sort((a, b) => {
                const timeA = a.creationTime ? a.creationTime.seconds : null;
                const timeB = b.creationTime ? b.creationTime.seconds : null;
                return timeB - timeA;
              })
              .map((data, i) =>
                i + 1 == id ? (
                  <div>
                    <div>{data.title}</div>
                    <div>
                      <span>작성자 : 잡케</span>
                      <span>
                        작성일 : {formatTime(data.creationTime.seconds * 1000)}
                      </span>
                    </div>
                    <MDEditor.Markdown source={data.message} />
                  </div>
                ) : null
              )
          ) : (
            <div colSpan={"4"}>데이터 로딩 중...</div>
          )}
        </div>
      );
    default:
      return <NotFound />;
  }
}
