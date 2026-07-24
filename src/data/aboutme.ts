// 自己紹介のデータを記述するファイル．フロント側は触らずともここを編集すればAboutセクションが更新されます

export interface AboutMe {
  icon: string;
  description: string;
}

export const aboutMe: AboutMe = {
  icon: "/images/global/icon-vr.png",
  description: `HHKBレイアウトをこよなく愛し，技術を学ぶ学生です．
  情報工学を専攻していて，研究室ではVR空間における「重さの知覚」をテーマに，疑似触覚(Pseudo-Haptics)と電気的筋肉刺激(EMS)を組み合わせた運動感覚提示について研究しています．
  身の回りのちょっとした不便を解決したり，面白さを届けられるようなワクワクする開発・技術が大好きです！
  広く浅く，興味を持ったものはとことん深く．いろいろやってます！
`,
};
