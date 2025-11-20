#!/usr/bin/env python3

import discord
from discord import app_commands
from discord.ext import tasks
import os
from datetime import datetime
import subprocess


class ArchStatusBot(discord.Client):
    def __init__(self):
        intents = discord.Intents.default()
        super().__init__(intents=intents)
        self.tree = app_commands.CommandTree(self)
        self.share_path = "/home/yuzu/share/"

    async def setup_hook(self):
        await self.tree.sync()
        print("コマンドツリーを同期しました")

    async def on_ready(self):
        print(f'{self.user} としてログインしました')
        print(f'Bot ID: {self.user.id}')
        print('------')
        # プリセンス更新タスクを開始
        self.update_presence.start()

    # ディレクトリの最終更新日時を取得
    def get_last_modified_time(self) -> str:
        try:
            if os.path.exists(self.share_path):
                timestamp = os.path.getmtime(self.share_path)
                dt = datetime.fromtimestamp(timestamp)
                return dt.strftime("%Y-%m-%d %H:%M:%S")
            else:
                return "ディレクトリが存在しません"
        except Exception as e:
            return f"エラー: {str(e)}"

    # プリセンスの定期更新
    @tasks.loop(minutes=5)
    async def update_presence(self):
        last_modified = self.get_last_modified_time()
        activity = discord.Activity(
            type=discord.ActivityType.playing,
            name="接続可能✅️",
            state=f"ファイルの最終更新: {last_modified}",
        )
        await self.change_presence(activity=activity)
        print(f"プリセンスを更新しました: {last_modified}")

    @update_presence.before_loop
    async def before_update_presence(self):
        await self.wait_until_ready()


def main():
    # トークンファイルからDiscord Botトークンを読み込む
    try:
        with open("token.txt", "r") as f:
            token = f.read().strip()
    except FileNotFoundError:
        print("エラー: token.txt ファイルが見つかりません")
        return
    except Exception as e:
        print(f"トークン読み込みエラー: {e}")
        return

    client = ArchStatusBot()

    @client.tree.command(name="ls", description="共有ディレクトリの一覧を表示します")
    async def share_command(interaction: discord.Interaction):
        """shareディレクトリの内容を表示するコマンド"""
        share_path = "/home/yuzu/share/"
        
        try:
            # ディレクトリが存在するか確認
            if not os.path.exists(share_path):
                await interaction.response.send_message(
                    f"❌ エラー: `{share_path}` が存在しません",
                    ephemeral=True
                )
                return

            # ls -lhAF --color=never
            result = subprocess.run(
                ["ls", "-lhAF", "--color=never", share_path],
                capture_output=True,
                text=True,
                timeout=10
            )

            if result.returncode != 0:
                await interaction.response.send_message(
                    f"コマンド実行エラー:\n```\n{result.stderr}\n```",
                    ephemeral=True
                )
                return

            output = result.stdout
            
            # 出力が空の場合
            if not output.strip():
                await interaction.response.send_message(
                    f"📁 `{share_path}` は空です",
                    ephemeral=False
                )
                return

            header = f"📁 **共有ディレクトリ一覧**: `{share_path}`\n```\n"
            footer = "\n```"
            max_content_length = 2000 - len(header) - len(footer) # Discordのメッセージ長制限を考慮

            if len(output) > max_content_length:
                output = output[:max_content_length] + "\n... (出力が長すぎるため省略されました)"

            message = header + output + footer
            await interaction.response.send_message(message, ephemeral=False)

        except subprocess.TimeoutExpired:
            await interaction.response.send_message(
                "エラー: コマンド実行がタイムアウトしました",
                ephemeral=True
            )
        except Exception as e:
            await interaction.response.send_message(
                f"エラー: {str(e)}",
                ephemeral=True
            )

    @client.tree.command(name="uptime", description="サーバの稼働時間を表示します")
    async def uptime_command(interaction: discord.Interaction):
        """システムの稼働時間を表示するコマンド"""
        try:
            # uptimeコマンドを実行
            result = subprocess.run(
                ["uptime", "-p"],
                capture_output=True,
                text=True,
                timeout=5
            )

            if result.returncode != 0:
                await interaction.response.send_message(
                    f"コマンド実行エラー:\n```\n{result.stderr}\n```",
                    ephemeral=True
                )
                return

            uptime_pretty = result.stdout.strip()

            # 起動日時の取得
            result_since = subprocess.run(
                ["uptime", "-s"],
                capture_output=True,
                text=True,
                timeout=5
            )
            boot_time = result_since.stdout.strip() if result_since.returncode == 0 else "不明"

            message = f"⏰ **サーバ稼働時間**\n```\n{uptime_pretty}\n起動日時: {boot_time}\n```"
            await interaction.response.send_message(message, ephemeral=False)

        except subprocess.TimeoutExpired:
            await interaction.response.send_message(
                "エラー: コマンド実行がタイムアウトしました",
                ephemeral=True
            )
        except Exception as e:
            await interaction.response.send_message(
                f"エラー: {str(e)}",
                ephemeral=True
            )

    @client.tree.command(name="status", description="サーバのシステム状態を表示します")
    async def status_command(interaction: discord.Interaction):
        try:
            # CPU使用率を取得 (topコマンドを使用)
            cpu_result = subprocess.run(
                ["top", "-bn1"],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            # CPU使用率のパース
            cpu_usage = "取得失敗"
            for line in cpu_result.stdout.split('\n'):
                if '%Cpu(s):' in line or 'CPU:' in line:
                    # "%Cpu(s):  2.3 us,  1.5 sy,  0.0 ni, 96.2 id, ..."
                    parts = line.split(',')
                    for part in parts:
                        if 'id' in part:  # idle (アイドル時間)
                            idle = float(part.split()[0])
                            usage = 100.0 - idle
                            cpu_usage = f"{usage:.1f}%"
                            break
                    break
            
            # メモリ使用率
            mem_result = subprocess.run(
                ["free", "-h"],
                capture_output=True,
                text=True,
                timeout=5
            )

            # ディスク使用率
            disk_result = subprocess.run(
                ["df", "-h", "/home"],
                capture_output=True,
                text=True,
                timeout=5
            )

            # メモリ情報のパース
            mem_lines = mem_result.stdout.strip().split('\n')
            if len(mem_lines) >= 2:
                mem_info = mem_lines[1].split()
                total_mem = mem_info[1]
                used_mem = mem_info[2]
                mem_status = f"使用中: {used_mem} / {total_mem}"
            else:
                mem_status = "取得失敗"

            # ディスク情報のパース
            disk_lines = disk_result.stdout.strip().split('\n')
            if len(disk_lines) >= 2:
                disk_info = disk_lines[1].split()
                disk_usage = disk_info[4]
                disk_used = disk_info[2]
                disk_total = disk_info[1]
                disk_status = f"使用率: {disk_usage} ({disk_used}/{disk_total})"
            else:
                disk_status = "取得失敗"

            message = f"""📊 **サーバステータス**
```
【CPU使用率】
{cpu_usage}

【メモリ】
{mem_status}

【ディスク (/home)】
{disk_status}
```"""
            await interaction.response.send_message(message, ephemeral=False)

        except subprocess.TimeoutExpired:
            await interaction.response.send_message(
                "エラー: コマンド実行がタイムアウトしました",
                ephemeral=True
            )
        except Exception as e:
            await interaction.response.send_message(
                f"エラー: {str(e)}",
                ephemeral=True
            )

    @client.tree.command(name="services", description="Samba/Tailscaleサービスの状態を表示します")
    async def services_command(interaction: discord.Interaction):
        """重要なサービスの状態を確認するコマンド"""
        try:
            services = {
                "Samba": "smbd",
                "Tailscale": "tailscaled"
            }

            status_messages = []

            for service_name, service_unit in services.items():
                result = subprocess.run(
                    ["systemctl", "is-active", service_unit],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                
                status = result.stdout.strip()
                if status == "active":
                    emoji = "✅"
                    status_text = "稼働中"
                elif status == "inactive":
                    emoji = "⚠️"
                    status_text = "停止中"
                else:
                    emoji = "❌"
                    status_text = status

                # サービスの詳細情報取得
                detail_result = subprocess.run(
                    ["systemctl", "status", service_unit, "--no-pager", "-l"],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                
                # アクティブな時間を抽出
                uptime_info = "不明"
                for line in detail_result.stdout.split('\n'):
                    if "Active:" in line:
                        # "Active: active (running) since ..."
                        parts = line.split("since")
                        if len(parts) > 1:
                            uptime_info = parts[1].strip()
                        break

                status_messages.append(f"{emoji} **{service_name}** ({service_unit})\n   状態: {status_text}\n   起動: {uptime_info}")

            message = "🔧 **サービス状態**\n\n" + "\n\n".join(status_messages)
            await interaction.response.send_message(message, ephemeral=False)

        except subprocess.TimeoutExpired:
            await interaction.response.send_message(
                "エラー: コマンド実行がタイムアウトしました",
                ephemeral=True
            )
        except Exception as e:
            await interaction.response.send_message(
                f"エラー: {str(e)}",
                ephemeral=True
            )

    # Botを起動
    print("Botを起動します...")
    client.run(token)


if __name__ == "__main__":
    main()
