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
import { useRouter, useSearchParams } from "next/navigation";

export default function Page({ params: { page, id } }) {
  const [noteData, setNoteData] = useState([]);
  const [articlesData, setArticlesData] = useState([]);

  const [repName, setRepName] = useState("익명");
  const [repMsg, setRepMsg] = useState("");

  const [update, setUpdate] = useState([]);

  const searchParams = useSearchParams();

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

  const [isLogin, setLogin] = useState(false);

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
                articlesData.length - i == id ? (
                  <div key={i}>
                    <div>{data.title}</div>
                    <div>
                      <span>작성자 : {data.userName}</span>
                      <span>
                        작성일 : {formatTime(data.creationTime.seconds * 1000)}
                      </span>
                      <div>
                        <div
                          onClick={() => {
                            router.push(
                              `/write?type=normal&mode=modify&id=${data.uuid}`
                            );
                          }}
                        >
                          수정
                        </div>
                        <div
                          onClick={() => {
                            (async () => {
                              if (isLogin) {
                                const check = confirm("글을 삭제하시겠습니까?");
                                if (check) {
                                  await deleteDoc(
                                    doc(db, "articles", data.uuid)
                                  );
                                  alert("관리자 권한으로 글이 삭제되었습니다.");
                                  router.push("/articles");
                                } else {
                                  alert("취소되었습니다.");
                                }
                              } else {
                                const check = confirm("글을 삭제하시겠습니까?");
                                if (check) {
                                  const pw = prompt("비밀번호를 입력해주세요.");
                                  if (pw == data.password) {
                                    await deleteDoc(
                                      doc(db, "articles", data.uuid)
                                    );
                                    alert("글이 삭제되었습니다.");
                                  } else {
                                    alert(
                                      "비밀번호가 올바르지 않습니다. 다시 시도해주세요."
                                    );
                                  }
                                } else {
                                  alert("취소되었습니다.");
                                }
                              }
                            })();
                          }}
                        >
                          삭제
                        </div>
                      </div>
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
                        <div>
                          <button
                            onClick={async () => {
                              if (repName == "관리자" || repName == "잡케") {
                                if (isLogin) {
                                  await updateDoc(
                                    doc(db, "articles", searchParams.get("id")),
                                    {
                                      reply: arrayUnion({
                                        creationTime: new Date(),
                                        message: repMsg,
                                        userName: repName,
                                      }),
                                    }
                                  );
                                  setRepMsg("");
                                  setUpdate([...update]);
                                } else {
                                  alert("사용할 수 없는 이름입니다.");
                                }
                              } else {
                                await updateDoc(
                                  doc(db, "articles", searchParams.get("id")),
                                  {
                                    reply: arrayUnion({
                                      creationTime: new Date(),
                                      message: repMsg,
                                      userName: repName,
                                    }),
                                  }
                                );
                                setRepMsg("");
                                setUpdate([...update]);
                              }
                            }}
                          >
                            등록
                          </button>
                        </div>
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
                noteData.length - i == id ? (
                  <div key={i}>
                    <div>{data.title}</div>
                    <div>
                      <span>작성자 : {data.userName}</span>
                      <span>
                        작성일 : {formatTime(data.creationTime.seconds * 1000)}
                      </span>
                      <div>
                        <div
                          onClick={() => {
                            router.push(
                              `/write?type=note&mode=modify&id=${data.uuid}`
                            );
                          }}
                        >
                          수정
                        </div>
                        <div
                          onClick={() => {
                            (async () => {
                              if (isLogin) {
                                const check = confirm("글을 삭제하시겠습니까?");
                                if (check) {
                                  await deleteDoc(
                                    doc(db, "announcements", data.uuid)
                                  );
                                  alert("관리자 권한으로 글이 삭제되었습니다.");
                                  router.push("/note");
                                } else {
                                  alert("취소되었습니다.");
                                }
                              } else {
                                alert("글 삭제 권한이 없습니다.");
                              }
                            })();
                          }}
                        >
                          삭제
                        </div>
                      </div>
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
