# 3. 고급 타입

const httpStatusFromPaths: [number, string, ...string[]] = [
400,
"Bad Request",
"/users/:id",
"/users/:userId",
"/users/:uuid",
];
// 첫 번째 자리는 숫자(400), 두 번째 자리는 문자열(‘Bad Request’)을 받아야 하고, 그 이후로는 문자열 타입의 원소를 개수 제한 없이 받을 수 있음

const optionalTuple1: [number, number, number?] = [1, 2];
const optionalTuple2: [number, number, number?] = [1, 2, 3]; // 3번째 인덱스에 해당하는 숫자형 원소는 있어도 되고 없어도 됨을 의미한다

````

특정 인덱스에 타입을 부여하는 **튜플**도 존재한다. 튜플에도 옵셔널 연산자나 전개 구문이 적용 가능하다.

### 3.1.6 enum 타입

```ts
enum ProgrammingLanguage {
  Typescript, // 0
  Javascript, // 1
  Java, // 2
  Python, // 3
  Kotlin, // 4
  Rust, // 5
  Go, // 6
}

// 각 멤버에게 접근하는 방식은 자바스크립트에서 객체의 속성에 접근하는 방식과 동일하다
ProgrammingLanguage.Typescript; // 0
ProgrammingLanguage.Rust; // 5
ProgrammingLanguage["Go"]; // 6

// 또한 역방향으로도 접근이 가능하다
ProgrammingLanguage[2]; // “Java”

enum ProgrammingLanguage {
  Typescript = "Typescript",
  Javascript = "Javascript",
  Java = 300,
  Python = 400,
  Kotlin, // 401
  Rust, // 402
  Go, // 403
}
````

`enum`은 열거형이라고도 부르며 일종의 구조체를 만드는 개념이다.

`enum`의 문제점으로는 **트리쉐이킹 불가**, **역방향 접근**, **Enum간 비교 불가** 등이 존재한다.

#### const enum

```ts
const enum NUMBER {
  ONE = 1,
  TWO = 2,
}
const myNumber: NUMBER = 100; // NUMBER enum에서 100을 관리하고 있지 않지만 이는 에러를 발생시키지 않는다

const enum STRING_NUMBER {
  ONE = 'ONE',
  TWO = 'TWO',
}
const myStringNumber: STRING_NUMBER = 'THREE'; // Error
```

이러한 역방향 문제와 트리쉐이킹 문제를 해결하기 위해 `const enum`이 존재한다.

`const enum`의 경우 역방향 접근이 불가하며 컴파일 인라인으로 변환되기 때문에 트리쉐이킹이 가능하다.

하지만 숫자로서의 접근에 대해 방지하지 못하며 유니코드로 컴파일되며 번들사이즈가 커질 수 있다.

따라서 `as const` 어설션을 통해 관리하는 것이 좋다.
