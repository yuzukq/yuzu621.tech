// スキルのデータを記述するファイル
// カテゴリごとの箇条書き(チップ)で表示される。項目の追加・削除はここを編集するだけ。

export interface SkillCategory {
  id: string;
  /** カードの見出し(英語ラベル) */
  label: string;
  /** カテゴリの補足(任意) */
  note?: string;
  /** 触れたことのある技術・ツール */
  items: string[];
}

export interface Certification {
  name: string;
  year: string;
}

export const skillCategories: SkillCategory[] = [
  {
    id: "frontend",
    label: "FrontEnd",
    items: [
      "JavaScript",
      "TypeScript",
      "React",
      "Next.js",
      "Tailwind CSS",
      "three.js",
    ],
  },
  {
    id: "backend",
    label: "BackEnd",
    items: [
      "Ruby",
      "Ruby on Rails",
      "Node.js",
      "GraphQL",
      "Discord.py",
      "GAS (Google Apps Script)",
    ],
  },
  {
    id: "devops",
    label: "DevOps / Infra",
    note: "開発機がArch Linuxなので、サーバー系のコマンド操作もある程度心得があります。",
    items: [
      "Git",
      "GitHub",
      "GitHub Actions",
      "Docker",
      "Cloudflare (Tunnel / R2)",
      "AWS S3",
      "Arch Linux",
    ],
  },
  {
    id: "xr-hardware",
    label: "XR / Hardware",
    items: ["Unity", "C#", "Arduino / ESP32"],
  },
];

export const certifications: Certification[] = [
  { name: "基本情報技術者", year: "2025年2月" },
  { name: "VR技術者認定試験(app)", year: "2025年12月" },
];
