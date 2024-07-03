"use client";

import styles from "../../styles/plan.module.css";
import { useState, useEffect } from "react";
import makeCalendar from "../(data)/makeCalendar";
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
import Link from "next/link";
import { useMediaQuery } from "react-responsive";

export default function Plan() {
  const [calendar, setCalendar] = useState([[], [], [], [], [], []]);
  const [month, setMonth] = useState(0);

  const [scheduleData, setScheduleData] = useState({});
  const [update, setUpdate] = useState([]);

  const [isLogin, setLogin] = useState(false); // 로그인 되어있는 상태인지 표시

  const [planOpen, setPlanOpen] = useState({ open: false, num: -1 });

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

  async function edit(day) {
    const updateMessage = prompt("수정 메시지를 입력해주세요 (', '로 구분)");
    const updateMap = { ...scheduleData };
    updateMap[day] = updateMessage;
    await setDoc(doc(db, "schedule", "schedule"), {
      ...updateMap,
    });
    setUpdate([...update]);
  }

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    const date = new Date();
    const month = date.getMonth() + 1;
    setMonth(month);
    const tempCalendar = makeCalendar(month);
    setCalendar([...tempCalendar]);
  }, []);

  useEffect(() => {
    async function fetchScheduleIds() {
      const querySnapshot = await getDocs(query(collection(db, "schedule")));
      querySnapshot.forEach((doc) => {
        setScheduleData(doc.data());
      });
    }
    fetchScheduleIds();
  }, [update]);

  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  return (
    <div className={styles.plan}>
      {isMobile && planOpen.open ? (
        <div
          className={styles.planPopup}
          onClick={(e) => {
            if (e.target.className.includes("planPopup")) {
              const data = { open: false, num: -1 };
              setPlanOpen(data);
            }
          }}
        >
          <div>
            <div className={styles.popupTitle}>
              <h3>
                {month}월 {planOpen.num}일 일정
              </h3>
              {isLogin ? (
                <div
                  onClick={() => {
                    edit(planOpen.num);
                  }}
                >
                  수정
                </div>
              ) : null}
            </div>
            {scheduleData[planOpen.num]
              ? scheduleData[planOpen.num]
                  .split(", ")
                  .map((game) => <div key={game}>{game}</div>)
              : null}
          </div>
        </div>
      ) : null}
      <div className={styles.tableCon}>
        <div>{month}월</div>
        <table>
          <thead>
            <tr>
              <td className={styles.red}>일</td>
              <td>월</td>
              <td>화</td>
              <td>수</td>
              <td>목</td>
              <td>금</td>
              <td className={styles.blue}>토</td>
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3, 4, 5].map((week) => (
              <tr key={week}>
                {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                  <td
                    key={day}
                    onClick={() => {
                      const data = { open: true, num: calendar[week][day] };

                      setPlanOpen(data);
                    }}
                  >
                    <div>
                      <div
                        className={
                          day == 0 ? styles.red : day == 6 ? styles.blue : ""
                        }
                      >
                        {calendar[week][day]}
                        {isLogin && calendar[week][day] ? (
                          <div
                            className={styles.edit}
                            onClick={() => {
                              edit(calendar[week][day]);
                            }}
                          >
                            수정
                          </div>
                        ) : null}
                      </div>
                      <div className={styles.gameTagCon}>
                        {scheduleData[calendar[week][day]]
                          ? scheduleData[calendar[week][day]]
                              .split(", ")
                              .map((game) =>
                                isMobile ? (
                                  <div
                                    className={styles.gameTagMob}
                                    key={game}
                                  ></div>
                                ) : (
                                  <div className={styles.gameTag} key={game}>
                                    {game}
                                  </div>
                                )
                              )
                          : null}
                      </div>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
