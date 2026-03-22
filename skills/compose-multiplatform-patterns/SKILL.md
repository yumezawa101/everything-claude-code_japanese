---
name: compose-multiplatform-patterns
description: KMPプロジェクト向けのCompose MultiplatformおよびJetpack Composeパターン -- 状態管理、ナビゲーション、テーマ、パフォーマンス、プラットフォーム固有UI。
origin: ECC
---

# Compose Multiplatformパターン

Compose MultiplatformとJetpack Composeを使用して、Android、iOS、Desktop、Web間で共有UIを構築するためのパターン。状態管理、ナビゲーション、テーマ、パフォーマンスをカバー。

## 発動条件

- Compose UI（Jetpack ComposeまたはCompose Multiplatform）の構築
- ViewModelとCompose stateによるUI状態管理
- KMPまたはAndroidプロジェクトでのナビゲーション実装
- 再利用可能なcomposableとデザインシステムの設計
- リコンポジションとレンダリングパフォーマンスの最適化

## 状態管理

### ViewModel + 単一状態オブジェクト

画面状態には単一のdata classを使用。`StateFlow`として公開しComposeで収集：

```kotlin
data class ItemListState(
    val items: List<Item> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val searchQuery: String = ""
)

class ItemListViewModel(
    private val getItems: GetItemsUseCase
) : ViewModel() {
    private val _state = MutableStateFlow(ItemListState())
    val state: StateFlow<ItemListState> = _state.asStateFlow()

    fun onSearch(query: String) {
        _state.update { it.copy(searchQuery = query) }
        loadItems(query)
    }

    private fun loadItems(query: String) {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true) }
            getItems(query).fold(
                onSuccess = { items -> _state.update { it.copy(items = items, isLoading = false) } },
                onFailure = { e -> _state.update { it.copy(error = e.message, isLoading = false) } }
            )
        }
    }
}
```

### Composeでの状態収集

```kotlin
@Composable
fun ItemListScreen(viewModel: ItemListViewModel = koinViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    ItemListContent(
        state = state,
        onSearch = viewModel::onSearch
    )
}

@Composable
private fun ItemListContent(
    state: ItemListState,
    onSearch: (String) -> Unit
) {
    // Stateless composable — easy to preview and test
}
```

### イベントシンクパターン

複雑な画面では、複数のコールバックラムダの代わりにsealed interfaceを使用：

```kotlin
sealed interface ItemListEvent {
    data class Search(val query: String) : ItemListEvent
    data class Delete(val itemId: String) : ItemListEvent
    data object Refresh : ItemListEvent
}

// In ViewModel
fun onEvent(event: ItemListEvent) {
    when (event) {
        is ItemListEvent.Search -> onSearch(event.query)
        is ItemListEvent.Delete -> deleteItem(event.itemId)
        is ItemListEvent.Refresh -> loadItems(_state.value.searchQuery)
    }
}

// In Composable — single lambda instead of many
ItemListContent(
    state = state,
    onEvent = viewModel::onEvent
)
```

## ナビゲーション

### 型安全ナビゲーション（Compose Navigation 2.8+）

ルートを`@Serializable`オブジェクトとして定義：

```kotlin
@Serializable data object HomeRoute
@Serializable data class DetailRoute(val id: String)
@Serializable data object SettingsRoute

@Composable
fun AppNavHost(navController: NavHostController = rememberNavController()) {
    NavHost(navController, startDestination = HomeRoute) {
        composable<HomeRoute> {
            HomeScreen(onNavigateToDetail = { id -> navController.navigate(DetailRoute(id)) })
        }
        composable<DetailRoute> { backStackEntry ->
            val route = backStackEntry.toRoute<DetailRoute>()
            DetailScreen(id = route.id)
        }
        composable<SettingsRoute> { SettingsScreen() }
    }
}
```

## パフォーマンス

### スキップ可能なリコンポジションのための安定型

すべてのプロパティが安定している場合、クラスに`@Stable`または`@Immutable`をマーク：

```kotlin
@Immutable
data class ItemUiModel(
    val id: String,
    val title: String,
    val description: String,
    val progress: Float
)
```

### `key()`とLazy Listの正しい使用

```kotlin
LazyColumn {
    items(
        items = items,
        key = { it.id }  // Stable keys enable item reuse and animations
    ) { item ->
        ItemRow(item = item)
    }
}
```

### `derivedStateOf`による読み取り遅延

```kotlin
val listState = rememberLazyListState()
val showScrollToTop by remember {
    derivedStateOf { listState.firstVisibleItemIndex > 5 }
}
```

## 避けるべきアンチパターン

- ViewModelで`MutableStateFlow` + `collectAsStateWithLifecycle`がライフサイクル的に安全な場合に`mutableStateOf`を使用する
- `NavController`をcomposableの深くに渡す -- 代わりにラムダコールバックを渡す
- `@Composable`関数内での重い計算 -- ViewModelまたは`remember {}`に移動する
- ViewModel initの代替として`LaunchedEffect(Unit)`を使用する
- composableパラメータで新しいオブジェクトインスタンスを作成する -- 不必要なリコンポジションを引き起こす

## 参考

スキル`android-clean-architecture`でモジュール構造とレイヤリングを参照。
スキル`kotlin-coroutines-flows`でコルーチンとFlowパターンを参照。
