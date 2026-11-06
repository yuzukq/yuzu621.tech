// 記事カラム(max-w-3xl = 48rem)の表示幅。md 以上は html の font-size が 18px のため
// 最大 864px になり、左右 padding(md:px-8 = 36px x 2)を足した 936px 以上で頭打ちになる。
// 記事サムネイルと Markdown 本文画像の両方で共有する
export const ARTICLE_IMAGE_SIZES = '(min-width: 936px) 864px, 100vw'
