// プロダクトのデータを記述するファイル．フロント側は触らずともここに追加すればカードが増えます

export interface Product {
  id: string;
  title: string;
  thumbnail: string;
  techStack: string[];
  description: string;
  features: string[];
  challenges: string[];
  screenshots: string[];
  urls: {
    demo?: string;
    github?: string;
    website?: string;
  };
}

export const products: Product[] = [
  {
    id: "portfolio",
    title: "Portfolio Website",
    thumbnail: "/images/products/portfolio/thumb_portfolio.png",
    techStack: ["Next.js", "TypeScript", "Chakra UI", "Vercel"],
    description: "はじめての長期インターンではNext.jsを用いたフロントエンド開発を行いました．モダンなフレームワークを利用する中で，コンポーネント分割の粒度，保守・拡張性を考慮した設計思想，OSSデザインシステムの効率的な活用方法について学びました．これらの知見を活かした振り返りもかね，これまでの大学生活の活動のアウトプットを目的に，当プロダクトの開発を行いました．開発にはgithub copilotをはじめとしたエージェントの活用や，マージ前のcursor bug botなどのAIワークフローを使ったレビュー，本番環境とインテグレーションを分離したブランチ管理で共同開発でも実際に行われる開発フローを意識しました．また，ブログを管理するプロジェクトとしての役割も担っており，rehypeを用いたマークダウンパースによりNext.js上での静的ページ生成を実現しています．これにより，git上での記事管理とデプロイの自動化を実現しています．",
    features: [
      "レスポンシブデザイン", 
      "アニメーション効果",
      "Markdownによるブログ記事管理",
      "Vercelによる継続的デプロイメント"
    ],
    challenges: [
      "モダンフレームワークを利用した開発",
      "パフォーマンス最適化",
      "コンポーネント分割のベストプラクティスの模索",
      "OSSデザインシステム(Chakra UI v3)の活用",
    ],
    screenshots: [
      "/images/products/portfolio/thumb_portfolio.png",
      "/images/products/portfolio/prev_blog.png",
      "/images/products/portfolio/prev_git.png",
      "/images/products/portfolio/prev_gitGraph.png",
    ],
    urls: {
      github: "https://github.com/yuzukq/portfolio",
      website: "https://yuzuportfolio.vercel.app/"
    }
  },
  {
    id: "better-portal-extension",
    title: "Better Portal Extension",
    thumbnail: "/images/products/better-portal-extension/thumb_betterPortalExtension.png", 
    techStack: ["HTML", "CSS", "JavaScript", "Chrome Extension API"],
    description: "大学で運用されているポータルサイトのUI/UXを改善するために開発したChrome拡張機能です．所属大学で運用されているポータルサイトは，ウィンドウ操作のUXに関する不満や，大学側から提供されているコンテンツに対する導線の悪さが教員，学生から声が揚げられていました．これらの課題を解決するためにChrome拡張機能という形でクライアントサイドで動的にUIの変更を実現しました．google web storeにて公開中のページからインストールするのみでこの機能を利用することが出来ます．",
    features: [
      "アイコンサイズ変更時のリアルタイムフィードバック",
      "ストアからインストールするだけで利用可能",
      "大学から提供されている複数コンテンツへのショートカットを提供",
    ],
    challenges: [
      "Chrome Extension APIの習得",
      "非エンジニア層が利用できるようにGUIデザインを工夫",
      "ページ実装時に今後の拡張性を重視してステートマシンによるページ管理を実現",
    ],
    screenshots: [
      "/images/products/better-portal-extension/prev_betterPortalExtension_1.png",
      "/images/products/better-portal-extension/prev_betterPortalExtension_2.png",
      "/images/products/better-portal-extension/prev_button.png",
      "/images/products/better-portal-extension/prev_viewer.png",
      "/images/products/better-portal-extension/prev_timestamp.png",
    ],
    urls: {
      github: "https://github.com/yuzukq/Better-Portal-Extension",
      demo: "https://chromewebstore.google.com/detail/eioioildkjhlbeoaikbhhajncblbmnmh?utm_source=item-share-cb"
    }
  },
  {
    id: "AttendanceReminder",
    title: "AttendanceReminder-forCIT",
    thumbnail: "/images/products/AttendanceReminder/thumb_attendanceReminder.png",
    techStack: ["Google App Script", "Discord webhook"],
    description: "大学で運用されている出席管理システムへの登録を支援するツールです．私が所属している大学では，令和7年度から教室に掲示されたQRコードを個人所有のスマートフォンで読み取ることで，Webを経由して出席登録を行う仕組みが導入されました．この出席支援ツールは，ユーザーがGoogleスプレッドシート状の時間割表テンプレートにあらかじめ時間割を登録しておくことで，講義開講時間の30分前に自動で通知と各講義に応じた主出席登録用のリンクを任意のDiscordチャンネルに送信するツールとなっています．このツールにより，所属している大学のコミュニティ内全体で，各ユーザーの履修状況に応じた出席登録の失念防止に貢献しただけでなく，カメラを起動することなく，個人所有の端末やPCからの出席も可能になりました．また，このツールではドキュメントの整備も徹底し，非エンジニア領域の学生がこのツールを取り入れやすくするような工夫を施しました．",
    features: [
      "Discordからの容易な出席登録",
      "googleスプレッドシートと連携した自動通知",
      "google app scriptによるサーバレス通知の実現"
    ],
    challenges: [
      "ユーザーのツール導入の敷居を下げるためにテンプレートとドキュメントの整備を行いました．",
      "通知対象として，コミュニティで広く利用されているDiscordを選定したことで利便性が向上したと感じています"
    ],
    screenshots: [
      "/images/products/AttendanceReminder/prev_attendanceReminder_1.png",
      "/images/products/AttendanceReminder/thumb_attendanceReminder.png",
      "/images/products/AttendanceReminder/prev_attendanceReminder_2.png",
    ],
    urls: {
      demo: "https://github.com/yuzukq/AttendanceReminder-forCIT",
      github: "https://github.com/yuzukq/AttendanceReminder-forCIT"
    }
  },
  {
    id: "HeadFlickIME",
    title: "非接触型文字入力デバイス",
    thumbnail: "/images/products/HeadFlickIME/thumb_HeadFlickIME.jpg",
    techStack: ["Arduino","Processing" ,"六軸加速度センサ", "フォトリフレクタ"],
    description: "瞼の開閉動作と頭部の動作を組み合わせて文字入力を実現するデバイスです．Arduinoを用いた電子工作において，フォトリフレクタと加速度センサを固定したハードウェアを3Dプリンタで設計したことで，外部カメラやソフトウェア画像処理を利用することなく簡易的なアイトラッキングとフェイシャルトラッキングを実現しました．また，入力補助を兼ねるインタフェースとしてはProcessingによるフリック入力盤をリアルタイムに描画することで，良好なユーザービリティのUI/UXを実現しました．また，この文字入力デバイスは，福祉的な領域での活用だけでなく，参考画像にて掲載したような3Dモデルをリアルタイムに操作する娯楽的な領域での活用も期待できます．",
    features: [
      "外部カメラ不要のウェアラブル端末",
      "頭部の動作のみでフリック入力を実現"
    ],
    challenges: [
      "既存のアイトラッキングデバイスが抱える高コストという課題を安価なマイコンとセンサの組み合わせで解消しました．",
      "六軸加速度センサの特性でるドリフトを抑制するための地磁気とのセンサヒュージョンの必要性など課題が明らかになりました．"
    ],
    screenshots: [
      "/images/products/HeadFlickIME/prev_HeadFlickIME_1.png",
      "/images/products/HeadFlickIME/prev_HeadFlickIME_2.png",
      "/images/products/HeadFlickIME/prev_HeadFlickIME_3.png",
    ],
    urls: {
      demo: "https://youtu.be/X3LBFIodq7U",
      github: "https://github.com/yuzukq/HeadFlickIME"
    }
  },
  {
    id: "Recolle",
    title: "Recolle",
    thumbnail: "/images/Recolle/thumb_recolle_1.png",
    techStack: ["Ruby on Rails","PostgreSQL", "Tailwind CSS","GPT-4o", "Daisy UI"],
    description: "Recolle（リコレ） は，ユーザーの個性，写真と位置情報をもとに，自動で日記を生成してくれるウェブアプリケーションです． 画像をアップロードするだけで，撮影場所や写っている風景をもとに，AIが自然な文章を生成し，旅の記録や日常の思い出を手軽に残せます． Z世代の“思い出の整理”をもっと簡単に，もっと楽しく——そんな思いから生まれました．",
    features: [
      "生成AIによるブログの自動生成",
      "視覚的に継続を促すインタフェース",
      "画像の位置情報とペルソナに基づく推論",
      "Webアプリケーションのため使用端末を問わないプラットフォームの提供"
    ],
    challenges: [
      "はじめてのハッカソンに参加",
      "Dockerやgitを活用した安定的な共同開発を実現",
      "オンプレ環境でデモ環境を構築",
      "心理的安全性を意識した雰囲気づくり"
    ],
    screenshots: [
      "/images/Recolle/prev_recolle_1.png",
      "/images/Recolle/prev_recolle_2.png",
      "/images/Recolle/prev_recolle_3.png",
      "/images/Recolle/prev_recolle_4.png",
      "/images/Recolle/prev_recolle_5.png",
      "/images/Recolle/prev_recolle_6.png",
      "/images/Recolle/prev_recolle_7.png",
      "/images/Recolle/prev_recolle_8.png",
      "/images/Recolle/prev_recolle_9.png",
      "/images/Recolle/prev_recolle_10.png",
      "/images/Recolle/prev_recolle_11.png",
      "/images/Recolle/prev_recolle_12.png",
    ],
    urls: {
      demo: "https://www.youtube.com/watch?v=DMOSmGkLs44",
      github: "https://student.redesigner.jp/portfolios/PF2e831921f7aa86dc5b77430183df1c1b"
    }
  },
  {
    id: "Unity",
    title: "Unityを使った創作活動",
    thumbnail: "/images/products/Unity/thumb_unity.png",
    techStack: ["Unity", "C#", "Blender", "Photoshop"],
    description: "VRChat上でのワールドギミックやモデルの制作，Vketへの出展，サークル活動での共同ゲーム開発においてUnityやBlenderを使用した開発を行っています．三枚目の画像は「世界一，テンポ，光，井」というテーマをもとに作られた作品だったりします(?!?!)",
    features: [
      "VRChat上でのワールドギミックやモデルの制作",
      "Vketへの出展",
      "BeatSaberで利用可能なカスタムモデルの制作",
      "サークル活動での共同ゲーム開発"
    ],
    challenges: [
      "趣味で行う創作活動では幅広く興味を持った技術領域へ挑戦しています．"
    ],
    screenshots: [
      "/images/products/Unity/thumb_unity.png",
      "/images/products/Unity/prev_saber.png",
      "/images/products/Unity/prev_don.png",
      "/images/products/Unity/prev_vket.png"
    ],
    urls: {
      demo: "https://vrchat.com/home/launch?worldId=wrld_18bd5d2c-7dc3-40c2-8a70-0e3227b88575",
      github: "https://github.com/yuzukq/Custom-Saber-MikuMikuSaber"
    }
  }
  
];
