"use client";

import styles from "../../styles/write.module.css";
import MDEditor from "@uiw/react-md-editor";
import rehypeSanitize from "rehype-sanitize";
import { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function Write() {
  const [title, setTitle] = useState("");
  const [mdValue, setMdValue] = useState("");
  const [userName, setUserName] = useState("");

  const router = useRouter();

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
                await addDoc(collection(db, "articles"), {
                  title: title,
                  message: mdValue,
                  creationTime: new Date(),
                  userName: userName,
                  reply: [],
                });
                setTitle("");
                setMdValue("");
                alert("글이 등록되었습니다.");
                router.push("/articles");
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
            placeholder="이름"
            value={userName}
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
