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
  arrayUnion,
  updateDoc,
} from "firebase/firestore";

export default function Page({ params: { page, id }, searchParams }) {
  const [noteData, setNoteData] = useState([]);
  const [articlesData, setArticlesData] = useState([]);
  const [articleIds, setIds] = useState([]);

  const [repName, setRepName] = useState("익명");
  const [repMsg, setRepMsg] = useState("");

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
  }, []);

  useEffect(() => {
    async function fetchIds() {
      const querySnapshot = await getDocs(collection(db, "articles"));
      const docIds = querySnapshot.docs.map((doc) => doc.id);
      setIds(docIds);
      const promises = docIds.map(async (id) => {
        const snapshot = await getDoc(doc(db, "articles", id));
        return snapshot.data();
      });

      const results = await Promise.all(promises);
      return results;
    }

    async function fetchData() {
      const data = await fetchIds();
      setArticlesData(data);
    }

    fetchData();
  }, [update]);

  switch (page) {
    case "articles":
      return (
        <div className={styles.note}>
          {articlesData[0] ? (
            articlesData
              .sort((a, b) => {
                const timeA = a.creationTime ? a.creationTime.seconds : null;
                const timeB = b.creationTime ? b.creationTime.seconds : null;
                return timeB - timeA;
              })
              .map((data, i) =>
                i + 1 == id ? (
                  <div key={i}>
                    <div>{data.title}</div>
                    <div>
                      <span>작성자 : {data.userName}</span>
                      <span>
                        작성일 : {formatTime(data.creationTime.seconds * 1000)}
                      </span>
                    </div>
                    <MDEditor.Markdown source={data.message} />
                    <div className={styles.replyText}>
                      댓글 {data.reply.length}
                    </div>
                    <div className={styles.replyCon}>
                      {data.reply.length > 0 ? (
                        data.reply.map((repData, i) => (
                          <div key={i} className={styles.reply}>
                            <div>
                              <div>{repData.userName}</div>|
                              <div>
                                {formatTime(
                                  repData.creationTime.seconds * 1000
                                )}
                              </div>
                            </div>
                            <div>{repData.message}</div>
                          </div>
                        ))
                      ) : (
                        <div>아직 댓글이 없습니다.</div>
                      )}
                      <div className={styles.replyInputCon}>
                        <div>
                          <div>
                            <input
                              type="text"
                              placeholder="닉네임"
                              value={repName}
                              onChange={(e) => setRepName(e.target.value)}
                            />
                          </div>
                          <textarea
                            placeholder="서로를 존중하는 댓글을 달아주세요."
                            value={repMsg}
                            onChange={(e) => setRepMsg(e.target.value)}
                          ></textarea>
                        </div>
                        <button
                          onClick={async () => {
                            await updateDoc(
                              doc(db, "articles", searchParams.id),
                              {
                                reply: arrayUnion({
                                  creationTime: new Date(),
                                  message: repMsg,
                                  userName: repName,
                                }),
                              }
                            );
                            setRepMsg("");
                            setRepName("익명");
                            setUpdate([...update]);
                          }}
                        >
                          등록
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null
              )
          ) : (
            <div colSpan={"4"}>데이터 로딩 중...</div>
          )}
        </div>
      );
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
                  <div key={i}>
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
