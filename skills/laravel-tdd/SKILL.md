---
name: laravel-tdd
description: PHPUnitとPestによるLaravelのテスト駆動開発 -- ファクトリ、データベーステスト、フェイク、カバレッジ目標。
origin: ECC
---

# Laravel TDD ワークフロー

PHPUnit と Pest を使用した Laravel アプリケーションのテスト駆動開発で、80% 以上のカバレッジ（ユニット + フィーチャー）を目指します。

## 使用タイミング

- Laravel での新機能やエンドポイント
- バグ修正やリファクタリング
- Eloquent モデル、ポリシー、ジョブ、通知のテスト
- プロジェクトが既に PHPUnit で標準化されていない限り、新しいテストには Pest を推奨

## 仕組み

### Red-Green-Refactor サイクル

1) 失敗するテストを書く
2) テストをパスするための最小限の変更を実装する
3) テストをグリーンに保ちながらリファクタリングする

### テストレイヤー

- **Unit**: 純粋な PHP クラス、値オブジェクト、サービス
- **Feature**: HTTP エンドポイント、認証、バリデーション、ポリシー
- **Integration**: データベース + キュー + 外部境界

スコープに基づいてレイヤーを選択:

- 純粋なビジネスロジックとサービスには **Unit** テストを使用。
- HTTP、認証、バリデーション、レスポンス形式には **Feature** テストを使用。
- DB/キュー/外部サービスを合わせて検証する場合は **Integration** テストを使用。

### データベース戦略

- `RefreshDatabase` はほとんどのフィーチャー/インテグレーションテストに使用（テスト実行ごとに1回マイグレーションを実行し、サポートされている場合は各テストをトランザクションでラップ。インメモリデータベースはテストごとに再マイグレーションする場合あり）
- `DatabaseTransactions` はスキーマが既にマイグレーション済みで、テストごとのロールバックのみ必要な場合に使用
- `DatabaseMigrations` はテストごとに完全な migrate/fresh が必要で、そのコストを許容できる場合に使用

データベースに触れるテストのデフォルトとして `RefreshDatabase` を使用します: トランザクションをサポートするデータベースの場合、静的フラグを使ってテスト実行ごとに1回マイグレーションを実行し、各テストをトランザクションでラップします。`:memory:` SQLite やトランザクション非対応の接続の場合、各テスト前にマイグレーションを実行します。スキーマが既にマイグレーション済みでテストごとのロールバックのみ必要な場合は `DatabaseTransactions` を使用します。

### テストフレームワークの選択

- 利用可能な場合、新しいテストはデフォルトで **Pest** を使用。
- プロジェクトが既に PHPUnit で標準化されている場合、または PHPUnit 固有のツールが必要な場合のみ **PHPUnit** を使用。

## 使用例

### PHPUnit の例

```php
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class ProjectControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_create_project(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/projects', [
            'name' => 'New Project',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('projects', ['name' => 'New Project']);
    }
}
```

### Feature テストの例（HTTP レイヤー）

```php
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class ProjectIndexTest extends TestCase
{
    use RefreshDatabase;

    public function test_projects_index_returns_paginated_results(): void
    {
        $user = User::factory()->create();
        Project::factory()->count(3)->for($user)->create();

        $response = $this->actingAs($user)->getJson('/api/projects');

        $response->assertOk();
        $response->assertJsonStructure(['success', 'data', 'error', 'meta']);
    }
}
```

### Pest の例

```php
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;

uses(RefreshDatabase::class);

test('owner can create project', function () {
    $user = User::factory()->create();

    $response = actingAs($user)->postJson('/api/projects', [
        'name' => 'New Project',
    ]);

    $response->assertCreated();
    assertDatabaseHas('projects', ['name' => 'New Project']);
});
```

### Feature テスト Pest の例（HTTP レイヤー）

```php
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

test('projects index returns paginated results', function () {
    $user = User::factory()->create();
    Project::factory()->count(3)->for($user)->create();

    $response = actingAs($user)->getJson('/api/projects');

    $response->assertOk();
    $response->assertJsonStructure(['success', 'data', 'error', 'meta']);
});
```

### ファクトリとステート

- テストデータにはファクトリを使用
- エッジケース用のステートを定義（archived、admin、trial）

```php
$user = User::factory()->state(['role' => 'admin'])->create();
```

### データベーステスト

- クリーンな状態のために `RefreshDatabase` を使用
- テストを分離し決定的に保つ
- 手動クエリよりも `assertDatabaseHas` を推奨

### 永続化テストの例

```php
use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class ProjectRepositoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_project_can_be_retrieved_by_slug(): void
    {
        $project = Project::factory()->create(['slug' => 'alpha']);

        $found = Project::query()->where('slug', 'alpha')->firstOrFail();

        $this->assertSame($project->id, $found->id);
    }
}
```

### 副作用のためのフェイク

- ジョブには `Bus::fake()`
- キューワークには `Queue::fake()`
- 通知には `Mail::fake()` と `Notification::fake()`
- ドメインイベントには `Event::fake()`

```php
use Illuminate\Support\Facades\Queue;

Queue::fake();

dispatch(new SendOrderConfirmation($order->id));

Queue::assertPushed(SendOrderConfirmation::class);
```

```php
use Illuminate\Support\Facades\Notification;

Notification::fake();

$user->notify(new InvoiceReady($invoice));

Notification::assertSentTo($user, InvoiceReady::class);
```

### 認証テスト（Sanctum）

```php
use Laravel\Sanctum\Sanctum;

Sanctum::actingAs($user);

$response = $this->getJson('/api/projects');
$response->assertOk();
```

### HTTP と外部サービス

- 外部 API の分離には `Http::fake()` を使用
- `Http::assertSent()` で送信ペイロードを検証

### カバレッジ目標

- ユニット + フィーチャーテストで 80% 以上のカバレッジを強制
- CI では `pcov` または `XDEBUG_MODE=coverage` を使用

### テストコマンド

- `php artisan test`
- `vendor/bin/phpunit`
- `vendor/bin/pest`

### テスト設定

- `phpunit.xml` で `DB_CONNECTION=sqlite` と `DB_DATABASE=:memory:` を設定して高速テストを実現
- 開発/本番データに触れないよう、テスト用の別環境を維持

### 認可テスト

```php
use Illuminate\Support\Facades\Gate;

$this->assertTrue(Gate::forUser($user)->allows('update', $project));
$this->assertFalse(Gate::forUser($otherUser)->allows('update', $project));
```

### Inertia Feature テスト

Inertia.js を使用する場合、Inertia テストヘルパーでコンポーネント名と props を検証します。

```php
use App\Models\User;
use Inertia\Testing\AssertableInertia;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class DashboardInertiaTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_inertia_props(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Dashboard')
            ->where('user.id', $user->id)
            ->has('projects')
        );
    }
}
```

Inertia レスポンスとテストの整合性を保つため、生の JSON アサーションよりも `assertInertia` を推奨します。
