// "use client";

// import { useEffect, useState } from "react";
// import styles from "../../styles/articles.module.css";
// import { db, auth } from "../firebase";
// import {
//   getDocs,
//   collection,
//   getDoc,
//   doc,
//   addDoc,
//   deleteDoc,
//   setDoc,
//   getDocFromCache,
//   query,
// } from "firebase/firestore";
// import { useRouter } from "next/navigation";
// import { Pencil } from "lucide-react";
// import { useMediaQuery } from "react-responsive";

// export default function Articles() {
//   const [noteData, setNoteData] = useState([]);
//   const [ids, setIds] = useState([]);

//   const [mounted, setMounted] = useState(false);

//   const router = useRouter();

//   function formatTime(t) {
//     const wallTime = new Date(t);
//     const formatWallTime = `${wallTime.getFullYear()}-${
//       wallTime.getMonth() + 1 < 10
//         ? "0" + (wallTime.getMonth() + 1)
//         : wallTime.getMonth() + 1
//     }-${
//       wallTime.getDate() < 10 ? "0" + wallTime.getDate() : wallTime.getDate()
//     }`;
//     return formatWallTime;
//   }

//   useEffect(() => {
//     const tempIds = [];
//     async function fetchIds() {
//       const querySnapshot = await getDocs(collection(db, "articles"));
//       const docIds = querySnapshot.docs.map((doc) => doc.id);
//       const promises = docIds.map(async (id) => {
//         const snapshot = await getDoc(doc(db, "articles", id));
//         tempIds.push([snapshot.data(), id]);
//         return snapshot.data();
//       });
//       const results = await Promise.all(promises);
//       return results;
//     }

//     async function fetchData() {
//       const data = await fetchIds();
//       setIds(
//         tempIds.sort((a, b) => {
//           const timeA = a[0].creationTime ? a[0].creationTime.seconds : null;
//           const timeB = b[0].creationTime ? b[0].creationTime.seconds : null;
//           return timeB - timeA;
//         })
//       );
//       setNoteData(data);
//     }

//     fetchData();
//     setMounted(true);
//   }, []);

//   const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

//   return (
//     mounted && (
//       <div className={styles.container}>
//         <h2>게시판</h2>
//         <div className={styles.tableCon}>
//           <div
//             onClick={() => {
//               router.push("/write?type=normal");
//             }}
//           >
//             <Pencil height="1rem" />
//             글쓰기
//           </div>
//           <table className={styles.table}>
//             <colgroup>
//               {isMobile ? (
//                 <colgroup>
//                   <col className={styles.col60} />
//                   <col className={styles.col30} />
//                 </colgroup>
//               ) : (
//                 <colgroup>
//                   <col className={styles.col10} />
//                   <col className={styles.col50} />
//                   <col className={styles.col15} />
//                   <col className={styles.col15} />
//                 </colgroup>
//               )}
//             </colgroup>
//             <thead>
//               <tr>
//                 {isMobile ? null : <td>번호</td>}
//                 <td>제목</td>
//                 <td>작성자</td>
//                 {isMobile ? null : <td>날짜</td>}
//               </tr>
//             </thead>
//             <tbody>
//               {noteData ? (
//                 noteData.length > 0 ? (
//                   noteData
//                     .sort((a, b) => {
//                       const timeA = a.creationTime
//                         ? a.creationTime.seconds
//                         : null;
//                       const timeB = b.creationTime
//                         ? b.creationTime.seconds
//                         : null;
//                       return timeB - timeA;
//                     })
//                     .map((data, i) => (
//                       <tr
//                         key={i}
//                         onClick={() => {
//                           router.push(
//                             `articles/${noteData.length - i}?id=${ids[i][1]}`
//                           );
//                         }}
//                       >
//                         {isMobile ? null : <td>{noteData.length - i}</td>}
//                         <td>{data.title}</td>
//                         <td
//                           style={
//                             data.userName == "관리자"
//                               ? {
//                                   color: "#a00",
//                                   fontWeight: "700",
//                                 }
//                               : data.userName == "잡케"
//                               ? {
//                                   color: "var(--green-main)",
//                                   fontWeight: "700",
//                                 }
//                               : null
//                           }
//                         >
//                           {data.userName}
//                         </td>
//                         {isMobile ? null : (
//                           <td>
//                             {formatTime(data.creationTime.seconds * 1000)}
//                           </td>
//                         )}
//                       </tr>
//                     ))
//                 ) : (
//                   <tr>
//                     <td colSpan={isMobile ? "2" : "4"}>데이터가 없습니다.</td>
//                   </tr>
//                 )
//               ) : (
//                 <tr>
//                   <td colSpan={isMobile ? "2" : "4"}>데이터 로딩중...</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     )
//   );
// }

"use client";

import { useEffect, useState } from "react";
import styles from "../../styles/note.module.css";
import { db, auth } from "../firebase";
import { setPersistence, browserLocalPersistence } from "firebase/auth";
import { getDocs, collection, getDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { useMediaQuery } from "react-responsive";

export default function Articles() {
  const [noteData, setNoteData] = useState(null); // 초기 상태를 null로 설정
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

  useEffect(() => {
    setMounted(true);
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
      setNoteData(results); // 여기에서 noteData 상태를 업데이트
    }

    fetchIds();
  }, []);

  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  return (
    mounted && (
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
                            `articles/${noteData.length - i}?id=${data.uuid}`
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
