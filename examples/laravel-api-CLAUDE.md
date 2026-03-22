# Laravel API -- プロジェクト CLAUDE.md

> Laravel API + PostgreSQL + Redis + キューの実践的な例。
> プロジェクトルートにコピーして、サービスに合わせてカスタマイズしてください。

## プロジェクト概要

**技術スタック:** PHP 8.2+, Laravel 11.x, PostgreSQL, Redis, Horizon, PHPUnit/Pest, Docker Compose

**アーキテクチャ:** コントローラ -> サービス -> アクションのモジュラー Laravel アプリ。Eloquent ORM、非同期処理にキュー、バリデーションに Form Request、一貫した JSON レスポンスに API Resources。

## 重要なルール

### PHP の規約

- すべての PHP ファイルで `declare(strict_types=1)`
- すべてに型付きプロパティと戻り値型を使用
- サービスとアクションには `final` クラスを推奨
- コミットされたコードに `dd()` や `dump()` 禁止
- Laravel Pint（PSR-12）でフォーマット

### API レスポンスエンベロープ

すべての API レスポンスに一貫したエンベロープを使用:

```json
{
  "success": true,
  "data": {"...": "..."},
  "error": null,
  "meta": {"page": 1, "per_page": 25, "total": 120}
}
```

### データベース

- マイグレーションは git にコミット
- Eloquent またはクエリビルダを使用（raw SQL はパラメータ化されたもののみ）
- `where` や `orderBy` で使用するカラムにインデックス
- サービス内でモデルインスタンスの変更を避ける。repository またはクエリビルダ経由の create/update を推奨

### 認証

- Sanctum による API 認証
- モデルレベルの認可にはポリシーを使用
- コントローラとサービスで認証を強制

### バリデーション

- バリデーションには Form Request を使用
- ビジネスロジック用に入力を DTO に変換
- 派生フィールドのリクエストペイロードを決して信頼しない

### エラーハンドリング

- サービスでドメイン例外をスロー
- `bootstrap/app.php` の `withExceptions` で例外を HTTP レスポンスにマッピング
- 内部エラーをクライアントに露出させない

### コードスタイル

- コードやコメントに絵文字禁止
- 最大行長: 120 文字
- コントローラは薄く。サービスとアクションにビジネスロジック

## ファイル構造

```
app/
  Actions/
  Console/
  Events/
  Exceptions/
  Http/
    Controllers/
    Middleware/
    Requests/
    Resources/
  Jobs/
  Models/
  Policies/
  Providers/
  Services/
  Support/
config/
database/
  factories/
  migrations/
  seeders/
routes/
  api.php
  web.php
```

## 主要パターン

### サービスレイヤー

```php
<?php

declare(strict_types=1);

final class CreateOrderAction
{
    public function __construct(private OrderRepository $orders) {}

    public function handle(CreateOrderData $data): Order
    {
        return $this->orders->create($data);
    }
}

final class OrderService
{
    public function __construct(private CreateOrderAction $createOrder) {}

    public function placeOrder(CreateOrderData $data): Order
    {
        return $this->createOrder->handle($data);
    }
}
```

### コントローラパターン

```php
<?php

declare(strict_types=1);

final class OrdersController extends Controller
{
    public function __construct(private OrderService $service) {}

    public function store(StoreOrderRequest $request): JsonResponse
    {
        $order = $this->service->placeOrder($request->toDto());

        return response()->json([
            'success' => true,
            'data' => OrderResource::make($order),
            'error' => null,
            'meta' => null,
        ], 201);
    }
}
```

### ポリシーパターン

```php
<?php

declare(strict_types=1);

use App\Models\Order;
use App\Models\User;

final class OrderPolicy
{
    public function view(User $user, Order $order): bool
    {
        return $order->user_id === $user->id;
    }
}
```

### Form Request + DTO

```php
<?php

declare(strict_types=1);

final class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user();
    }

    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.sku' => ['required', 'string'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ];
    }

    public function toDto(): CreateOrderData
    {
        return new CreateOrderData(
            userId: (int) $this->user()->id,
            items: $this->validated('items'),
        );
    }
}
```

### API Resource

```php
<?php

declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'total' => $this->total,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
```

### キュージョブ

```php
<?php

declare(strict_types=1);

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Repositories\OrderRepository;
use App\Services\OrderMailer;

final class SendOrderConfirmation implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(private int $orderId) {}

    public function handle(OrderRepository $orders, OrderMailer $mailer): void
    {
        $order = $orders->findOrFail($this->orderId);
        $mailer->sendOrderConfirmation($order);
    }
}
```

### テストパターン（Pest）

```php
<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\postJson;

uses(RefreshDatabase::class);

test('user can place order', function () {
    $user = User::factory()->create();

    actingAs($user);

    $response = postJson('/api/orders', [
        'items' => [['sku' => 'sku-1', 'quantity' => 2]],
    ]);

    $response->assertCreated();
    assertDatabaseHas('orders', ['user_id' => $user->id]);
});
```

### テストパターン（PHPUnit）

```php
<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class OrdersControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_place_order(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/orders', [
            'items' => [['sku' => 'sku-1', 'quantity' => 2]],
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('orders', ['user_id' => $user->id]);
    }
}
```
