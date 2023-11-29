# shallowEqual

리액트에서는 동등 비교를 위해 `==` 나 `===`이 아닌 [Object.is](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Object/is)를 사용한다.

```js
/*
익스플로러를 위한 폴리필 코드
*/
function is(x: any, y: any) {
	return (x === y && (x !== 0 || 1 / x === 1 / y)) || (x !== x && y !== y);
}

const objectIs: (x: any, y: any) => boolean = typeof Object.is === 'function' ? Object.is : is;

export default objectIs;
```

리액트에서는 위에 존재하는 `ObjectIs`를 활용하여 **shallowEqual** 이라는 함수를 만들어 동등 비교를 연산한다.

```js
import is from './objectIs';
import hasOwnProperty from './hasOwnProperty';

function shallowEqual(objA: mixed, objB: mixed): boolean {
	// Object.is를 통해 단순 비교를 진행한다.
	if (is(objA, objB)) {
		return true;
	}

	if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
		return false;
	}

	const keysA = Object.keys(objA);
	const keysB = Object.keys(objB);

	// 키의 개수가 다르면 false를 반환한다.
	if (keysA.length !== keysB.length) {
		return false;
	}

	// A의 키를 기준으로, B의 키 유무를 판별하고 값을 비교한다.
	for (let i = 0; i < keysA.length; i++) {
		const currentKey = keysA[i];
		if (!hasOwnProperty.call(objB, currentKey) || !is(objA[currentKey], objB[currentKey])) {
			return false;
		}
	}

	return true;
}

export default shallowEqual;
```

`shallowEqual`의 가장 큰 특징은 객체의 얕은 비교까지만 구현한다. 즉 1 뎁스까지의 객체 비교를 구현하였다.
`shallowEqual`이 가장 많은 쓰이는 요소는 **의존성 배열**을 확인할 경우에 많이 쓰인다.

따라서 `useCallback`이나 `useMemo` 같은 메모이제이션 훅을 사용할 시 `shallowEqual`의 비교 로직을 기반으로 설계하여야한다.
