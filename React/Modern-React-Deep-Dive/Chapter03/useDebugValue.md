# useDebugValue

`useDebugValue`는 개발 과정에서 디버깅하고 싶은 정보를 이 훅에 담으면 개발자 도구에서 확인이 가능하다.

```ts
const useDate = () => {
  const date = new Date();
  useDebugValue(date, (date) => `현재 시간: ${date.toISOString()}`);
  return date;
};

const App = () => {
  const date = useDate();
  const [counter, setCounter] = useState(0);

  const handleClick = () => {
    setCounter((prev) => prev + 1);
  };

  return (
    <div>
      <h1>
        {counter} {date.toISOString()}
      </h1>
      <button onClick={handleClick}>+</button>
    </div>
  );
};
```

<img width="355" alt="image" src="https://github.com/cobocho/cobocho/assets/99083803/93f060f0-4350-44a9-be34-01e718122c1c">
