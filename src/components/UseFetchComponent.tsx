import { FC, useState } from "react";
import styles from '@/styles/Home.module.css'
import useFetch from "@/hooks/useFetch";

type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export const UseFetchComponent: FC = () => {
  const postIds = [1,2,3,4,5,6,7,8];
  const [index, setIndex] = useState(0);

  const { error, data } = useFetch<Post>(
    `https://jsonplaceholder.typicode.com/posts/${postIds[index]}`
  );
  
  const incrementIndex = () => setIndex((i) => i === postIds.length - 1 ? i : i + 1);

  const NextPostButton = () => <button onClick={incrementIndex}>Next Post</button>;

  if (error) {
    return (
      <>
        <p>{error}</p>
        <NextPostButton />
      </>
    )
  }
  if (!data) {
    return <p>...loading...</p>;
  };

  return (
    <div className={styles.center} style={{ width: '100%', display: 'flex', justifyContent: 'space-around' }}>
      <div style={{ width: '500px' }}>
        <h1>{data.title}</h1>
        <p>{data.body}</p>
      </div>
      {index === postIds.length - 1
        ? <p>reached end of list</p>
        : <NextPostButton />
      }
    </div>
  );
}