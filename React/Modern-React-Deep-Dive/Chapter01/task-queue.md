# 자바스크립트의 비동기 처리

자바스크립트는 싱글 스레드에서 동기적으로 작동한다. 하지만 모던 웹 애플리케이션에서는 비동기로 많은 작업들이 이루어진다.
자바스크립트는 스레드 간 메모리 공유로 인한 동시성 이슈를 방지하기 위해 싱글 스레드로 설계되었다.

따라서 비동기 작업을 위해 이벤트 루프와 태스크 큐가 존재한다.

![](https://i.imgur.com/1oCFAbj.png)

비동기 함수를 태스크 큐에 넣고 이벤트루프는 태스크 큐를 매번 확인하며 콜스택이 비워질 때마다 태스크 큐의 함수들을 콜스택에 넣는다.
비동기 함수의 수행은 메인 스레드가 아닌 브라우저나 노드에서 태스크 큐에 할당된 별도 스레드에서 이루어진다.(즉 엔진은 싱글 스레드지만, 브라우저는 멀티 스레드이다.)

# 태스크 큐와 마이크로 태스크 큐

마이크로 태스크 큐는 태스크 큐보다 우선순위를 가진다.

태스크 큐와 마이크로 태스크 큐에 들어가는 작업은 다음과 같다.

- 태스크 큐

  - `setTimeout`, `setInterval`, `setImmediate`

- 마이크로 태스크 큐

  - `process.nextTick`, `Promises`, `queueMicroTask`, `MutationObserver`

```js
setTimeout(() => console.log(1), 0);

Promise.resolve()
  .then(() => console.log(2))
  .then(() => console.log(3));
```

위 코드의 경우 실제로 실행시키면 `2`, `3`, `1`의 순서로 출력된다.

브라우저 렌더링과 비교해보자.

```js
const sync = document.querySelector('#sync');
const macrotask = document.querySelector('#macrotask');
const microtask = document.querySelector('#microtask');
const macroMicro = document.querySelector('#macro_micro');

sync.addEventListener('click', () => {
  for (let i = 0; i < 100000; i++) {
    sync.innerHTML = i;
  }
});

macrotask.addEventListener('click', () => {
  for (let i = 0; i < 100000; i++) {
    setTimeout(() => {
      macrotask.innerHTML = i;
    }, 0);
  }
});

microtask.addEventListener('click', () => {
  for (let i = 0; i < 100000; i++) {
    queueMicrotask(() => {
      microtask.innerHTML = i;
    });
  }
});

macroMicro.addEventListener('click', () => {
  for (let i = 0; i < 100000; i++) {
    sync.innerHTML = i;

    setTimeout(() => {
      macrotask.innerHTML = i;
    }, 0);

    queueMicrotask(() => {
      microtask.innerHTML = i;
    });
  }
});
```

해당 코드를 실행시켜보면 다음과 같다.

![Nov-30-2023 01-39-56](https://github.com/cobocho/FE-Books/assets/99083803/85a4f0cf-d40c-4e6b-a01b-8dee0032b1fb)

즉 브라우저 렌더링을 포함시켰을 때의 순서는

동기 작업 => 마이크로 태스크 큐 => 렌더링 => 태스크 큐

의 순서로 이루어진다.
