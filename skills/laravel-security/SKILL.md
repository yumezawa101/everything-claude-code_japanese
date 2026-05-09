---
name: laravel-security
description: 認証/認可、バリデーション、CSRF、マスアサインメント、ファイルアップロード、シークレット、レート制限、セキュアデプロイのためのLaravelセキュリティベストプラクティス。
origin: ECC
---

# Laravel セキュリティベストプラクティス

一般的な脆弱性から保護するための Laravel アプリケーション向け包括的セキュリティガイダンスです。

## 発動条件

- 認証または認可の追加
- ユーザー入力やファイルアップロードの処理
- 新しい API エンドポイントの構築
- シークレットや環境設定の管理
- 本番デプロイメントの堅牢化

## 仕組み

- ミドルウェアがベースラインの保護を提供します（`VerifyCsrfToken` による CSRF、`SecurityHeaders` によるセキュリティヘッダー）。
- ガードとポリシーがアクセス制御を強制します（`auth:sanctum`、`$this->authorize`、ポリシーミドルウェア）。
- Form Request がサービスに到達する前に入力を検証・整形します（`UploadInvoiceRequest`）。
- レート制限が認証制御と合わせて不正利用からの保護を追加します（`RateLimiter::for('login')`）。
- データ安全性は暗号化キャスト、マスアサインメントガード、署名付きルート（`URL::temporarySignedRoute` + `signed` ミドルウェア）により実現されます。

## コアセキュリティ設定

- 本番環境では `APP_DEBUG=false`
- `APP_KEY` は必ず設定し、漏洩時にはローテーションする
- `SESSION_SECURE_COOKIE=true` と `SESSION_SAME_SITE=lax`（機密性の高いアプリでは `strict`）を設定
- 正しい HTTPS 検出のために信頼済みプロキシを設定

## セッションと Cookie の堅牢化

- JavaScript によるアクセスを防止するために `SESSION_HTTP_ONLY=true` を設定
- リスクの高いフローには `SESSION_SAME_SITE=strict` を使用
- ログイン時と権限変更時にセッションを再生成

## 認証とトークン

- API 認証には Laravel Sanctum または Passport を使用
- 機密データには有効期限の短いトークンとリフレッシュフローを推奨
- ログアウト時とアカウント侵害時にトークンを失効させる

ルート保護の例:

```php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/me', function (Request $request) {
    return $request->user();
});
```

## パスワードセキュリティ

- `Hash::make()` でパスワードをハッシュし、平文では決して保存しない
- リセットフローには Laravel のパスワードブローカーを使用

```php
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

$validated = $request->validate([
    'password' => ['required', 'string', Password::min(12)->letters()->mixedCase()->numbers()->symbols()],
]);

$user->update(['password' => Hash::make($validated['password'])]);
```

## 認可: ポリシーとゲート

- モデルレベルの認可にはポリシーを使用
- コントローラーとサービスで認可を強制

```php
$this->authorize('update', $project);
```

ルートレベルの強制にはポリシーミドルウェアを使用:

```php
use Illuminate\Support\Facades\Route;

Route::put('/projects/{project}', [ProjectController::class, 'update'])
    ->middleware(['auth:sanctum', 'can:update,project']);
```

## バリデーションとデータサニタイズ

- 常に Form Request で入力を検証
- 厳格なバリデーションルールと型チェックを使用
- 派生フィールドにリクエストペイロードを信頼しない

## マスアサインメント保護

- `$fillable` または `$guarded` を使用し、`Model::unguard()` は避ける
- DTO または明示的な属性マッピングを推奨

## SQL インジェクション防止

- Eloquent またはクエリビルダーのパラメータバインディングを使用
- 厳密に必要でない限り、生の SQL は避ける

```php
DB::select('select * from users where email = ?', [$email]);
```

## XSS 防止

- Blade はデフォルトで出力をエスケープ（`{{ }}`）
- `{!! !!}` は信頼できるサニタイズ済み HTML にのみ使用
- リッチテキストは専用ライブラリでサニタイズ

## CSRF 保護

- `VerifyCsrfToken` ミドルウェアを有効のまま維持
- フォームに `@csrf` を含め、SPA リクエストには XSRF トークンを送信

Sanctum での SPA 認証には、ステートフルリクエストが設定されていることを確認:

```php
// config/sanctum.php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost')),
```

## ファイルアップロードの安全性

- ファイルサイズ、MIME タイプ、拡張子を検証
- 可能な限りパブリックパスの外にアップロードを保存
- 必要に応じてマルウェアスキャンを実施

```php
final class UploadInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->can('upload-invoice');
    }

    public function rules(): array
    {
        return [
            'invoice' => ['required', 'file', 'mimes:pdf', 'max:5120'],
        ];
    }
}
```

```php
$path = $request->file('invoice')->store(
    'invoices',
    config('filesystems.private_disk', 'local') // set this to a non-public disk
);
```

## レート制限

- 認証および書き込みエンドポイントに `throttle` ミドルウェアを適用
- ログイン、パスワードリセット、OTP にはより厳格な制限を使用

```php
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

RateLimiter::for('login', function (Request $request) {
    return [
        Limit::perMinute(5)->by($request->ip()),
        Limit::perMinute(5)->by(strtolower((string) $request->input('email'))),
    ];
});
```

## シークレットと資格情報

- シークレットをソースコントロールにコミットしない
- 環境変数とシークレットマネージャーを使用
- 漏洩後はキーをローテーションし、セッションを無効化

## 暗号化属性

機密カラムを保存時に暗号化するには暗号化キャストを使用します。

```php
protected $casts = [
    'api_token' => 'encrypted',
];
```

## セキュリティヘッダー

- 適切な箇所に CSP、HSTS、フレーム保護を追加
- HTTPS リダイレクトの強制には信頼済みプロキシ設定を使用

ヘッダーを設定するミドルウェアの例:

```php
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class SecurityHeaders
{
    public function handle(Request $request, \Closure $next): Response
    {
        $response = $next($request);

        $response->headers->add([
            'Content-Security-Policy' => "default-src 'self'",
            'Strict-Transport-Security' => 'max-age=31536000', // add includeSubDomains/preload only when all subdomains are HTTPS
            'X-Frame-Options' => 'DENY',
            'X-Content-Type-Options' => 'nosniff',
            'Referrer-Policy' => 'no-referrer',
        ]);

        return $response;
    }
}
```

## CORS と API 公開

- `config/cors.php` でオリジンを制限
- 認証済みルートにはワイルドカードオリジンを避ける

```php
// config/cors.php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    'allowed_origins' => ['https://app.example.com'],
    'allowed_headers' => [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-XSRF-TOKEN',
        'X-CSRF-TOKEN',
    ],
    'supports_credentials' => true,
];
```

## ログと PII

- パスワード、トークン、完全なカードデータをログに記録しない
- 構造化ログで機密フィールドをマスキング

```php
use Illuminate\Support\Facades\Log;

Log::info('User updated profile', [
    'user_id' => $user->id,
    'email' => '[REDACTED]',
    'token' => '[REDACTED]',
]);
```

## 依存関係のセキュリティ

- `composer audit` を定期的に実行
- 依存関係を慎重にピン留めし、CVE 発生時には迅速に更新

## 署名付き URL

一時的な改ざん防止リンクには署名付きルートを使用します。

```php
use Illuminate\Support\Facades\URL;

$url = URL::temporarySignedRoute(
    'downloads.invoice',
    now()->addMinutes(15),
    ['invoice' => $invoice->id]
);
```

```php
use Illuminate\Support\Facades\Route;

Route::get('/invoices/{invoice}/download', [InvoiceController::class, 'download'])
    ->name('downloads.invoice')
    ->middleware('signed');
```
