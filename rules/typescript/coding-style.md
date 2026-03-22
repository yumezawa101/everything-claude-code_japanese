---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---
# TypeScript/JavaScript コーディングスタイル

> このファイルは [common/coding-style.md](../common/coding-style.md) を TypeScript/JavaScript 固有のコンテンツで拡張します。

## 型とインターフェース

パブリック API、共有モデル、コンポーネント props を明示的で読みやすく再利用可能にするために型を使用します。

### パブリック API

- エクスポートされた関数、共有ユーティリティ、パブリッククラスメソッドにはパラメータ型と戻り値型を追加
- 明らかなローカル変数の型は TypeScript に推論させる
- 繰り返し使用するインラインオブジェクト形状は名前付き型やインターフェースに抽出

```typescript
// 誤り: エクスポート関数に明示的な型がない
export function formatUser(user) {
  return `${user.firstName} ${user.lastName}`
}

// 正解: パブリック API には明示的な型
interface User {
  firstName: string
  lastName: string
}

export function formatUser(user: User): string {
  return `${user.firstName} ${user.lastName}`
}
```

### Interface と Type Alias

- 拡張または実装される可能性のあるオブジェクト形状には `interface` を使用
- ユニオン、インターセクション、タプル、マップ型、ユーティリティ型には `type` を使用
- 相互運用性のために `enum` が必要でない限り、文字列リテラルユニオンを優先

```typescript
interface User {
  id: string
  email: string
}

type UserRole = 'admin' | 'member'
type UserWithRole = User & {
  role: UserRole
}
```

### `any` の回避

- アプリケーションコードで `any` を使用しない
- 外部または信頼できない入力には `unknown` を使用し、安全にナローイングする
- 値の型が呼び出し元に依存する場合はジェネリクスを使用

```typescript
// 誤り: any は型安全性を失わせる
function getErrorMessage(error: any) {
  return error.message
}

// 正解: unknown は安全なナローイングを強制する
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unexpected error'
}
```

### React Props

- コンポーネント props は名前付き `interface` または `type` で定義
- コールバック props は明示的に型付け
- 特別な理由がない限り `React.FC` は使用しない

```typescript
interface User {
  id: string
  email: string
}

interface UserCardProps {
  user: User
  onSelect: (id: string) => void
}

function UserCard({ user, onSelect }: UserCardProps) {
  return <button onClick={() => onSelect(user.id)}>{user.email}</button>
}
```

### JavaScript ファイル

- `.js` と `.jsx` ファイルでは、型が明確さを向上させ TypeScript への移行が実用的でない場合に JSDoc を使用
- JSDoc はランタイムの挙動と一致させる

```javascript
/**
 * @param {{ firstName: string, lastName: string }} user
 * @returns {string}
 */
export function formatUser(user) {
  return `${user.firstName} ${user.lastName}`
}
```

## 不変性

スプレッド演算子を使用して不変な更新を行う:

```typescript
interface User {
  id: string
  name: string
}

// 誤り: ミューテーション
function updateUser(user: User, name: string): User {
  user.name = name // MUTATION!
  return user
}

// 正解: 不変性
function updateUser(user: Readonly<User>, name: string): User {
  return {
    ...user,
    name
  }
}
```

## エラーハンドリング

async/await と try-catch を使用し、unknown エラーを安全にナローイングする:

```typescript
interface User {
  id: string
  email: string
}

declare function riskyOperation(userId: string): Promise<User>

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unexpected error'
}

const logger = {
  error: (message: string, error: unknown) => {
    // Replace with your production logger (for example, pino or winston).
  }
}

async function loadUser(userId: string): Promise<User> {
  try {
    const result = await riskyOperation(userId)
    return result
  } catch (error: unknown) {
    logger.error('Operation failed', error)
    throw new Error(getErrorMessage(error))
  }
}
```

## 入力バリデーション

Zod でスキーマベースのバリデーションを行い、スキーマから型を推論する:

```typescript
import { z } from 'zod'

const userSchema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150)
})

type UserInput = z.infer<typeof userSchema>

const validated: UserInput = userSchema.parse(input)
```

## Console.log

- 本番コードで `console.log` を使用しない
- 代わりに適切なロギングライブラリを使用
- 自動検出については hooks を参照
