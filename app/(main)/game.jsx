import styles from "../../styles/game.module.css";

export default function Game({ game, desc, img, title }) {
  return (
    <div className={styles.box} style={{ backgroundImage: `url(${img})` }}>
      <div>{game}</div>
      <div>"{title}"</div>
      <div>
        {desc.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>
    </div>
  );
}
