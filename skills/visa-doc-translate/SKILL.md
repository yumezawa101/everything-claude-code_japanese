---
name: visa-doc-translate
description: ビザ申請書類（画像）を英語に翻訳し、原本と翻訳のバイリンガル PDF を作成
---

ビザ申請書類の翻訳を支援します。

## 手順

ユーザーが画像ファイルパスを提供したら、確認を求めずに以下の手順を自動的に実行してください：

1. **画像変換**: ファイルが HEIC の場合、`sips -s format png <input> --out <output>` を使用して PNG に変換する

2. **画像の回転**:
   - EXIF の向きデータを確認する
   - EXIF データに基づいて画像を自動回転する
   - EXIF の向きが 6 の場合、反時計回りに 90 度回転する
   - 必要に応じて追加の回転を適用する（書類が上下逆に見える場合は 180 度を試す）

3. **OCR テキスト抽出**:
   - 複数の OCR メソッドを自動的に試行する：
     - macOS Vision フレームワーク（macOS で推奨）
     - EasyOCR（クロスプラットフォーム、tesseract 不要）
     - Tesseract OCR（利用可能な場合）
   - 書類からすべてのテキスト情報を抽出する
   - 書類の種類を特定する（預金証明書、在職証明書、退職証明書など）

4. **翻訳**:
   - すべてのテキスト内容をプロフェッショナルな英語に翻訳する
   - 原本の書類構造とフォーマットを維持する
   - ビザ申請に適切な専門用語を使用する
   - 固有名詞は原語のまま残し、括弧内に英語を添える
   - 中国語の名前にはピンイン形式を使用する（例: WU Zhengye）
   - すべての数字、日付、金額を正確に保持する

5. **PDF 生成**:
   - PIL と reportlab ライブラリを使用した Python スクリプトを作成する
   - 1 ページ目: 回転済みの原本画像を A4 ページに合わせて中央配置・スケーリングして表示
   - 2 ページ目: 適切なフォーマットで英語翻訳を表示：
     - タイトルは中央揃えで太字
     - 本文は左揃えで適切な間隔
     - 公式書類にふさわしいプロフェッショナルなレイアウト
   - 下部に注記を追加: "This is a certified English translation of the original document"
   - スクリプトを実行して PDF を生成する

6. **出力**: 同じディレクトリに `<元のファイル名>_Translated.pdf` という名前の PDF ファイルを作成する

## 対応書類

- 銀行預金証明書（存款证明）
- 収入証明書（收入证明）
- 在職証明書（在职证明）
- 退職証明書（退休证明）
- 不動産証明書（房产证明）
- 営業許可証（营业执照）
- 身分証明書およびパスポート
- その他の公式書類

## 技術的な実装

### OCR メソッド（試行順）

1. **macOS Vision フレームワーク**（macOS のみ）：
   ```python
   import Vision
   from Foundation import NSURL
   ```

2. **EasyOCR**（クロスプラットフォーム）：
   ```bash
   pip install easyocr
   ```

3. **Tesseract OCR**（利用可能な場合）：
   ```bash
   brew install tesseract tesseract-lang
   pip install pytesseract
   ```

### 必要な Python ライブラリ

```bash
pip install pillow reportlab
```

macOS Vision フレームワーク用：
```bash
pip install pyobjc-framework-Vision pyobjc-framework-Quartz
```

## 重要なガイドライン

- 各ステップでユーザーの確認を求めないこと
- 最適な回転角度を自動的に判断すること
- 一つの OCR メソッドが失敗した場合は複数のメソッドを試行すること
- すべての数字、日付、金額が正確に翻訳されていることを確認すること
- クリーンでプロフェッショナルなフォーマットを使用すること
- 全プロセスを完了し、最終的な PDF の場所を報告すること

## 使用例

```bash
/visa-doc-translate RetirementCertificate.PNG
/visa-doc-translate BankStatement.HEIC
/visa-doc-translate EmploymentLetter.jpg
```

## 出力例

このスキルは以下を実行します：
1. 利用可能な OCR メソッドを使用してテキストを抽出する
2. プロフェッショナルな英語に翻訳する
3. 以下の内容で `<ファイル名>_Translated.pdf` を生成する：
   - 1 ページ目: 原本の書類画像
   - 2 ページ目: プロフェッショナルな英語翻訳

オーストラリア、アメリカ、カナダ、イギリスなど、翻訳書類が必要な国へのビザ申請に最適です。
