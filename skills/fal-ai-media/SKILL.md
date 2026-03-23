---
name: fal-ai-media
description: fal.ai MCPによる統合メディア生成 -- 画像、動画、音声。text-to-image（Nano Banana）、text/image-to-video（Seedance、Kling、Veo 3）、text-to-speech（CSM-1B）、video-to-audio（ThinkSound）をカバー。AIで画像、動画、音声を生成したい場合に使用。
origin: ECC
---

# fal.ai メディア生成

fal.aiモデルをMCP経由で使用して、画像、動画、音声を生成する。

## 発動条件

- テキストプロンプトから画像を生成したい場合
- テキストまたは画像から動画を作成する場合
- 音声、音楽、効果音を生成する場合
- あらゆるメディア生成タスク
- ユーザーが「画像を生成」「動画を作成」「テキスト読み上げ」「サムネイルを作って」などと言った場合

## MCP要件

fal.ai MCPサーバーの設定が必要。`~/.claude.json`に追加:

```json
"fal-ai": {
  "command": "npx",
  "args": ["-y", "fal-ai-mcp-server"],
  "env": { "FAL_KEY": "YOUR_FAL_KEY_HERE" }
}
```

APIキーは[fal.ai](https://fal.ai)で取得。

## MCPツール

fal.ai MCPが提供するツール:
- `search` -- キーワードで利用可能なモデルを検索
- `find` -- モデルの詳細とパラメータを取得
- `generate` -- パラメータを指定してモデルを実行
- `result` -- 非同期生成のステータスを確認
- `status` -- ジョブのステータスを確認
- `cancel` -- 実行中のジョブをキャンセル
- `estimate_cost` -- 生成コストを見積もり
- `models` -- 人気モデルを一覧表示
- `upload` -- 入力として使用するファイルをアップロード

---

## 画像生成

### Nano Banana 2（高速）
最適な用途: 素早い反復、ドラフト、text-to-image、画像編集。

```
generate(
  app_id: "fal-ai/nano-banana-2",
  input_data: {
    "prompt": "a futuristic cityscape at sunset, cyberpunk style",
    "image_size": "landscape_16_9",
    "num_images": 1,
    "seed": 42
  }
)
```

### Nano Banana Pro（高忠実度）
最適な用途: 本番用画像、リアリズム、タイポグラフィ、詳細なプロンプト。

```
generate(
  app_id: "fal-ai/nano-banana-pro",
  input_data: {
    "prompt": "professional product photo of wireless headphones on marble surface, studio lighting",
    "image_size": "square",
    "num_images": 1,
    "guidance_scale": 7.5
  }
)
```

### 画像パラメータ一覧

| パラメータ | 型 | オプション | 備考 |
|-------|------|---------|-------|
| `prompt` | string | 必須 | 生成したい内容を記述 |
| `image_size` | string | `square`, `portrait_4_3`, `landscape_16_9`, `portrait_16_9`, `landscape_4_3` | アスペクト比 |
| `num_images` | number | 1-4 | 生成枚数 |
| `seed` | number | 任意の整数 | 再現性 |
| `guidance_scale` | number | 1-20 | プロンプトへの忠実度（高いほど忠実） |

### 画像編集
Nano Banana 2に入力画像を指定して、インペインティング、アウトペインティング、スタイル変換を行う:

```
# First upload the source image
upload(file_path: "/path/to/image.png")

# Then generate with image input
generate(
  app_id: "fal-ai/nano-banana-2",
  input_data: {
    "prompt": "same scene but in watercolor style",
    "image_url": "<uploaded_url>",
    "image_size": "landscape_16_9"
  }
)
```

---

## 動画生成

### Seedance 1.0 Pro（ByteDance）
最適な用途: text-to-video、高品質なモーションのimage-to-video。

```
generate(
  app_id: "fal-ai/seedance-1-0-pro",
  input_data: {
    "prompt": "a drone flyover of a mountain lake at golden hour, cinematic",
    "duration": "5s",
    "aspect_ratio": "16:9",
    "seed": 42
  }
)
```

### Kling Video v3 Pro
最適な用途: ネイティブ音声生成付きのtext/image-to-video。

```
generate(
  app_id: "fal-ai/kling-video/v3/pro",
  input_data: {
    "prompt": "ocean waves crashing on a rocky coast, dramatic clouds",
    "duration": "5s",
    "aspect_ratio": "16:9"
  }
)
```

### Veo 3（Google DeepMind）
最適な用途: 生成サウンド付きの動画、高い映像品質。

```
generate(
  app_id: "fal-ai/veo-3",
  input_data: {
    "prompt": "a bustling Tokyo street market at night, neon signs, crowd noise",
    "aspect_ratio": "16:9"
  }
)
```

### Image-to-Video
既存の画像から動画を生成:

```
generate(
  app_id: "fal-ai/seedance-1-0-pro",
  input_data: {
    "prompt": "camera slowly zooms out, gentle wind moves the trees",
    "image_url": "<uploaded_image_url>",
    "duration": "5s"
  }
)
```

### 動画パラメータ

| パラメータ | 型 | オプション | 備考 |
|-------|------|---------|-------|
| `prompt` | string | 必須 | 動画の内容を記述 |
| `duration` | string | `"5s"`, `"10s"` | 動画の長さ |
| `aspect_ratio` | string | `"16:9"`, `"9:16"`, `"1:1"` | フレーム比率 |
| `seed` | number | 任意の整数 | 再現性 |
| `image_url` | string | URL | image-to-video用のソース画像 |

---

## 音声生成

### CSM-1B（会話音声）
自然で会話的な品質のtext-to-speech。

```
generate(
  app_id: "fal-ai/csm-1b",
  input_data: {
    "text": "Hello, welcome to the demo. Let me show you how this works.",
    "speaker_id": 0
  }
)
```

### ThinkSound（Video-to-Audio）
動画コンテンツに合った音声を生成。

```
generate(
  app_id: "fal-ai/thinksound",
  input_data: {
    "video_url": "<video_url>",
    "prompt": "ambient forest sounds with birds chirping"
  }
)
```

### ElevenLabs（API経由、MCPなし）
プロフェッショナルな音声合成にはElevenLabsを直接使用:

```python
import os
import requests

resp = requests.post(
    "https://api.elevenlabs.io/v1/text-to-speech/<voice_id>",
    headers={
        "xi-api-key": os.environ["ELEVENLABS_API_KEY"],
        "Content-Type": "application/json"
    },
    json={
        "text": "Your text here",
        "model_id": "eleven_turbo_v2_5",
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}
    }
)
with open("output.mp3", "wb") as f:
    f.write(resp.content)
```

### VideoDB Generative Audio
VideoDBが設定済みの場合、生成音声機能を使用:

```python
# Voice generation
audio = coll.generate_voice(text="Your narration here", voice="alloy")

# Music generation
music = coll.generate_music(prompt="upbeat electronic background music", duration=30)

# Sound effects
sfx = coll.generate_sound_effect(prompt="thunder crack followed by rain")
```

---

## コスト見積もり

生成前に見積もりコストを確認:

```
estimate_cost(
  estimate_type: "unit_price",
  endpoints: {
    "fal-ai/nano-banana-pro": {
      "unit_quantity": 1
    }
  }
)
```

## モデル検索

特定タスク向けのモデルを検索:

```
search(query: "text to video")
find(endpoint_ids: ["fal-ai/seedance-1-0-pro"])
models()
```

## ヒント

- プロンプトの反復時に再現可能な結果を得るには`seed`を使用する
- プロンプト反復には低コストモデル（Nano Banana 2）から始め、最終版でProに切り替える
- 動画のプロンプトは説明的だが簡潔にする -- モーションとシーンに焦点を当てる
- image-to-videoは純粋なtext-to-videoよりも制御しやすい結果が得られる
- 高コストな動画生成を実行する前に`estimate_cost`を確認する

## 関連スキル

- `videodb` -- 動画処理、編集、ストリーミング
- `video-editing` -- AI搭載の動画編集ワークフロー
- `content-engine` -- ソーシャルプラットフォーム向けコンテンツ作成
