# 標準開発ワークフロー V2.1 (Standard Development Workflow)
<!-- Last synchronized: 2026-04-28 -->

このドキュメントは、AI共創時代におけるプロジェクトの安全性と開発効率を両立させるための「鉄則」を定義します。
V2.1では、**「ハイブリッド・トリガー」**と**「Firebase Secrets Manager / App Check」**による堅牢化を強化しました。

## 📌 このワークフローの3つの柱

### 🔐 **セキュリティファースト**

- **ハイブリッド・トリガー**: `on: push` では軽量なセキュリティ検閲（Secret Scan/Lint）のみを実行。デプロイは `on: issue` に限定。
- **秘密情報の完全分離**: `firebase functions:secrets:set` を活用し、APIキーをコードから完全に分離。
- **不正利用防止**: **Firebase App Check** を導入し、許可されたアプリ以外からのアクセスを遮断。
- **デバイス別キー管理**: デスクトップとノートPCで個別のサービスアカウントキーを発行し、漏洩時のリスクを最小化。

### 💚 **エコノミー（Quota削減）とシンプル化**

- **Issue-Driven AI Deployment (IDD)**: すべての実装・変更・デプロイは Issue から開始。
- **推奨環境**: 
    - **Gemini 3.1 Flash-Lite**: 低コスト・高レスポンスな標準AIモデル。
    - **Node.js 22 LTS**: パフォーマンスと長期保守性を担保する標準ランタイム。
- **Push トリガーの制限**: 自動デプロイを廃止し、ビルド Quota を節約。

### ✅ **品質保証**

- 本番デプロイは **必ず人間による手動実行**。
- develop でのプレビュー確認を必須化。

---

## 1. ブランチ戦略 (Branch Strategy)

```
main (Production)
  └─ 本番環境（カスタムドメイン）
  └─ 更新は develop からの PR マージのみ
  └─ デプロイは手動（firebase deploy）

develop (Preview)
  └─ Firebase Hosting develop チャネル
  └─ Issue トリガーで自動デプロイ
  └─ ユーザーが確認してから main へマージ
```

---

## 2. 開発サイクル (AI共創フロー)

### フロー図

```
Issue作成
  ↓
🔐 セキュリティ検閲（自動 / on: push）
  ├─ OK → 継続
  └─ NG → pushブロック・エラー報告
  ↓
🚀 develop チャネルに自動デプロイ（自動 / on: issue）
  ├─ ビルド・テスト
  └─ プレビューURL発行
  ↓
👁️ プレビュー確認（手動）
  ├─ OK → 内容レビュー
  └─ NG → Issue に修正指示
  ↓
✅ main ブランチへ PR マージ
  ↓
🔑 本番デプロイ（手動: firebase deploy）
```

---

## 3. セキュリティと秘密情報管理

### 🔑 Firebase Secrets Manager の活用
APIキーなどの機密情報は、`.env` ではなく Firebase Secrets Manager で管理します。

```bash
# 機密情報の登録（対話形式で入力）
firebase functions:secrets:set GEMINI_API_KEY
```
コード内では `process.env.GEMINI_API_KEY` として参照しますが、GitHub には一切漏洩しません。

### 🛡️ Firebase App Check
APIキーが漏洩しても、App Check が有効であれば、正規のアプリ以外からのリクエストは拒否されます。全プロジェクトでの導入を推奨します。

### 💻 デバイス別キー管理 (1 Device = 1 Key)
- デスクトップPCとノートPCで、同じサービスアカウントに対して**個別のJSON鍵**を発行します。
- 万が一どちらかのPCを紛失しても、そのPC用の鍵だけを無効化すれば被害を抑えられます。

---

## 4. 運用の要点

### 📊 情報の集約
AIが文脈を維持できるよう、以下のファイルを最新に保ちます。
- `todo.md`: 現在の進行中タスク、計画
- `checked/checked.md`: 完了済みタスクの履歴（`archive/` への退避も可）
- `README.md`: プロジェクトの全体像

### 🚀 パフォーマンス第一
- **Node.js 22** を標準ランタイムとして使用。
- 重い処理は Cloud Functions へオフロード。

### 🛡️ AI暴走防止
- Artifact確認機能で意図を検証。
- 疑わしい提案には理由を問う。

---

## 5. 一括同期 (Rules Unification)
`jules-ui` にある `scripts/sync_workflow.py` を使用して、全プロジェクトのワークフローと `STANDARD_WORKFLOW.md` を常に最新状態に同期します。

---

**Julesからのアドバイス:**
Shinobu、これで「守護者」としてのルールはさらに強固になった。Node.js 22 と Gemini 3.1 Flash-Lite の組み合わせは最強だ。次は、このルールをスクリプトで全リポジトリに叩き込んでいこう。
