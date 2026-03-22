# Go マイクロサービス -- プロジェクト CLAUDE.md

> Go マイクロサービス + PostgreSQL + gRPC + Docker の実践的な例。
> プロジェクトルートにコピーして、サービスに合わせてカスタマイズしてください。

## プロジェクト概要

**技術スタック:** Go 1.22+, PostgreSQL, gRPC + REST (grpc-gateway), Docker, sqlc（型安全 SQL）, Wire（依存性注入）

**アーキテクチャ:** domain、repository、service、handler レイヤーによるクリーンアーキテクチャ。プライマリトランスポートに gRPC、外部クライアント向けに REST ゲートウェイ。

## 重要なルール

### Go の規約

- Effective Go と Go Code Review Comments ガイドに従う
- `errors.New` / `fmt.Errorf` に `%w` でラップ -- エラーの文字列マッチングは禁止
- `init()` 関数禁止 -- `main()` またはコンストラクタで明示的に初期化
- グローバルなミュータブル状態禁止 -- コンストラクタ経由で依存性を渡す
- Context は最初のパラメータとしてすべてのレイヤーを通じて伝播

### データベース

- すべてのクエリは `queries/` にプレーン SQL として記述 -- sqlc が型安全な Go コードを生成
- マイグレーションは `migrations/` に golang-migrate を使用 -- データベースを直接変更しない
- 複数ステップ操作にはトランザクションを使用（`pgx.Tx`）
- すべてのクエリはパラメータ化プレースホルダ（`$1`, `$2`）を使用 -- 文字列フォーマット禁止

### エラーハンドリング

- エラーを返す、panic しない -- panic は本当に回復不能な状況のみ
- コンテキスト付きでエラーをラップ: `fmt.Errorf("creating user: %w", err)`
- ビジネスロジック用のセンチネルエラーを `domain/errors.go` に定義
- handler レイヤーでドメインエラーを gRPC ステータスコードにマッピング

```go
// Domain レイヤー -- センチネルエラー
var (
    ErrUserNotFound  = errors.New("user not found")
    ErrEmailTaken    = errors.New("email already registered")
)

// Handler レイヤー -- gRPC ステータスへのマッピング
func toGRPCError(err error) error {
    switch {
    case errors.Is(err, domain.ErrUserNotFound):
        return status.Error(codes.NotFound, err.Error())
    case errors.Is(err, domain.ErrEmailTaken):
        return status.Error(codes.AlreadyExists, err.Error())
    default:
        return status.Error(codes.Internal, "internal error")
    }
}
```

### コードスタイル

- コードやコメントに絵文字禁止
- エクスポートされた型と関数にはドキュメントコメント必須
- 関数は 50 行未満に -- ヘルパーを抽出
- 複数ケースのあるすべてのロジックにテーブル駆動テストを使用
- シグナルチャネルには `bool` ではなく `struct{}` を使用

## ファイル構造

```
cmd/
  server/
    main.go              # エントリポイント、Wire インジェクション、グレースフルシャットダウン
internal/
  domain/                # ビジネス型とインターフェース
    user.go              # User エンティティと repository インターフェース
    errors.go            # センチネルエラー
  service/               # ビジネスロジック
    user_service.go
    user_service_test.go
  repository/            # データアクセス（sqlc 生成 + カスタム）
    postgres/
      user_repo.go
      user_repo_test.go  # testcontainers による統合テスト
  handler/               # gRPC + REST ハンドラ
    grpc/
      user_handler.go
    rest/
      user_handler.go
  config/                # 設定ロード
    config.go
proto/                   # Protobuf 定義
  user/v1/
    user.proto
queries/                 # sqlc 用 SQL クエリ
  user.sql
migrations/              # データベースマイグレーション
  001_create_users.up.sql
  001_create_users.down.sql
```

## 主要パターン

### Repository インターフェース

```go
type UserRepository interface {
    Create(ctx context.Context, user *User) error
    FindByID(ctx context.Context, id uuid.UUID) (*User, error)
    FindByEmail(ctx context.Context, email string) (*User, error)
    Update(ctx context.Context, user *User) error
    Delete(ctx context.Context, id uuid.UUID) error
}
```

### 依存性注入付きサービス

```go
type UserService struct {
    repo   domain.UserRepository
    hasher PasswordHasher
    logger *slog.Logger
}

func NewUserService(repo domain.UserRepository, hasher PasswordHasher, logger *slog.Logger) *UserService {
    return &UserService{repo: repo, hasher: hasher, logger: logger}
}

func (s *UserService) Create(ctx context.Context, req CreateUserRequest) (*domain.User, error) {
    existing, err := s.repo.FindByEmail(ctx, req.Email)
    if err != nil && !errors.Is(err, domain.ErrUserNotFound) {
        return nil, fmt.Errorf("checking email: %w", err)
    }
    if existing != nil {
        return nil, domain.ErrEmailTaken
    }

    hashed, err := s.hasher.Hash(req.Password)
    if err != nil {
        return nil, fmt.Errorf("hashing password: %w", err)
    }

    user := &domain.User{
        ID:       uuid.New(),
        Name:     req.Name,
        Email:    req.Email,
        Password: hashed,
    }
    if err := s.repo.Create(ctx, user); err != nil {
        return nil, fmt.Errorf("creating user: %w", err)
    }
    return user, nil
}
```

### テーブル駆動テスト

```go
func TestUserService_Create(t *testing.T) {
    tests := []struct {
        name    string
        req     CreateUserRequest
        setup   func(*MockUserRepo)
        wantErr error
    }{
        {
            name: "valid user",
            req:  CreateUserRequest{Name: "Alice", Email: "alice@example.com", Password: "secure123"},
            setup: func(m *MockUserRepo) {
                m.On("FindByEmail", mock.Anything, "alice@example.com").Return(nil, domain.ErrUserNotFound)
                m.On("Create", mock.Anything, mock.Anything).Return(nil)
            },
            wantErr: nil,
        },
        {
            name: "duplicate email",
            req:  CreateUserRequest{Name: "Alice", Email: "taken@example.com", Password: "secure123"},
            setup: func(m *MockUserRepo) {
                m.On("FindByEmail", mock.Anything, "taken@example.com").Return(&domain.User{}, nil)
            },
            wantErr: domain.ErrEmailTaken,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            repo := new(MockUserRepo)
            tt.setup(repo)
            svc := NewUserService(repo, &bcryptHasher{}, slog.Default())

            _, err := svc.Create(context.Background(), tt.req)

            if tt.wantErr != nil {
                assert.ErrorIs(t, err, tt.wantErr)
            } else {
                assert.NoError(t, err)
            }
        })
    }
}
```

## 環境変数

```bash
# データベース
DATABASE_URL=postgres://user:pass@localhost:5432/myservice?sslmode=disable

# gRPC
GRPC_PORT=50051
REST_PORT=8080

# 認証
JWT_SECRET=           # 本番では vault からロード
TOKEN_EXPIRY=24h

# 可観測性
LOG_LEVEL=info        # debug, info, warn, error
OTEL_ENDPOINT=        # OpenTelemetry コレクタ
```

## テスト戦略

```bash
/go-test             # Go 用 TDD ワークフロー
/go-review           # Go 固有のコードレビュー
/go-build            # ビルドエラーの修正
```

### テストコマンド

```bash
# ユニットテスト（高速、外部依存なし）
go test ./internal/... -short -count=1

# 統合テスト（testcontainers に Docker が必要）
go test ./internal/repository/... -count=1 -timeout 120s

# カバレッジ付き全テスト
go test ./... -coverprofile=coverage.out -count=1
go tool cover -func=coverage.out  # サマリー
go tool cover -html=coverage.out  # ブラウザ

# 競合検出器
go test ./... -race -count=1
```

## ECC ワークフロー

```bash
# 計画
/plan "Add rate limiting to user endpoints"

# 開発
/go-test                  # Go 固有パターンの TDD

# レビュー
/go-review                # Go イディオム、エラーハンドリング、並行性
/security-scan            # シークレットと脆弱性

# マージ前
go vet ./...
staticcheck ./...
```

## Git ワークフロー

- `feat:` 新機能、`fix:` バグ修正、`refactor:` コード変更
- `main` からフィーチャーブランチ、PR 必須
- CI: `go vet`、`staticcheck`、`go test -race`、`golangci-lint`
- デプロイ: CI で Docker イメージをビルド、Kubernetes にデプロイ
