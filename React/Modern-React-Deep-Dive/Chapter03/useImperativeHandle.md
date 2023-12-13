# useImperativeHandle

`useImperativeHandle`을 이해하기 위해서는 우선 `forwardRef`에 대해 알아야한다.

## forwardRef

`ref`는 `useRef`의 반환 객체이다.

```ts
const Child = ({ ref }: { ref: React.RefObject<HTMLInputElement> }) => {
  useEffect(() => {
    console.log(ref);
  }, [ref]);

  return <div>안녕</div>;
};

const App = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <input type="text" ref={inputRef} />
      // `ref` is not a prop. Trying to access it will result in `undefined` being returned.
      <Child ref={ref} />
    </div>
  );
};
```

만약 이러한 `ref`를 상위 컴포넌트에서 하위 컴포넌트로 전달하려 한다면 에러가 발생한다.

```ts
const Child = ({ parentRef }: { parentRef: React.RefObject<HTMLInputElement> }) => {
  useEffect(() => {
    console.log(parentRef);
  }, [parentRef]);

  return <div>안녕</div>;
};

const App = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <input type="text" ref={inputRef} />
      <Child parentRef={inputRef} />
    </div>
  );
};
```

하지만 위와 같이 `ref`가 아닌 다른 이름으로 받으면 오류가 발생하지 않는다.

```ts
const Child = forwardRef((props, ref) => {
  useEffect(() => {
    console.log(ref);
  }, [ref]);

  return <div>안녕</div>;
});

const App = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <input type="text" ref={inputRef} />
      <Child ref={inputRef} />
    </div>
  );
};
```

`forwardRef`는 `ref`를 전달하는데 일관성을 주기 위해서이다. 네이밍의 자유가 주어진 props 보다는 `forwardRef`를 통해 `ref`의 전달을 예측할 수 있다.

# useImperativeHandle이란?

`useImperativeHandle`이란 넘겨받은 `ref`를 원하는 대로 수정할 수 잇는 훅이다.

```ts
interface Props extends InputHTMLAttributes<HTMLInputElement> {
  value: string;
}

interface RefType {
  alert: () => void;
}

const Input = forwardRef<RefType, Props>((props, ref) => {
  useImperativeHandle(
    ref,
    () => {
      return {
        alert: () => alert(props.value),
      };
    },
    [props.value],
  );

  return <input {...props} />;
});

const App = () => {
  const inputRef = useRef<RefType>(null);
  const [text, setText] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const handleClick = () => {
    inputRef.current?.alert();
  };

  return (
    <div>
      <Input ref={inputRef} onChange={handleChange} value={text} />
      <button onClick={handleClick}>Focus</button>
    </div>
  );
};

export default App;
```

위와 같이 `ref`에 추가적인 동작을 정의하여 자식 컴포넌트에서 설정한 객체와 키값에도 접근이 가능해진다.
