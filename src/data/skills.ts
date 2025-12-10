// スキルのデータを記述するファイル

export interface SkillData {
  [key: string]: number;
}

export interface SkillCategory {
  id: string;
  title: string;
  color: string;
  data: SkillData;
}

export interface Certification {
  name: string;
  year: string;
}

export const skillCategories: SkillCategory[] = [
  {
    id: "backend",
    title: "BackEnd",
    color: "blue.solid",
    data: {
      "Ruby on Rails": 2,
      "PostgreSQL": 1,
      "GraphQL": 2,
      "Nginx": 1,
      "CloudFlare": 1,
    },
  },
  {
    id: "frontend",
    title: "FrontEnd",
    color: "green.solid",
    data: {
      "JS/TS": 3,
      "React": 2,
      "Next.js": 2,
      "HTML/CSS": 3,
      "Tailwind CSS": 1,
    },
  },
  {
    id: "devops",
    title: "DevOps",
    color: "purple.solid",
    data: {
      "Docker": 3,
      "UNIX": 3,
      "Git/Github": 4,
      "Unity": 3,
      "Arduino": 3,
      "PlayWright": 1,
    },
  },
];

export const skillLevels = [
  { level: 1, description: "授業や個人で軽く使用した程度" },
  { level: 2, description: "インターン等で使用したことがあるがもう少し習熟が必要" },
  { level: 3, description: "個人でも長期的に使用している" },
  { level: 4, description: "実務レベルで利用できる" },
  { level: 5, description: "チョットデキル" },
];

export const certifications: Certification[] = [
  { name: "基本情報技術者", year: "2025年2月" },
  { name: "VR技術者認定試験", year: "受験予定" },
];
