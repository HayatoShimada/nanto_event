// ユーザーやイベントに付与できるタグの定数

export const USER_TAGS = [
    "食べたい",
    "飲みたい",
    "教えたい",
    "作りたい",
    "話したい",
];

export const TAG_EMOJIS: Record<string, string> = {
    "食べたい": "🍱",
    "飲みたい": "🍻",
    "教えたい": "💡",
    "作りたい": "🎨",
    "話したい": "💬",
};

export const EVENT_TAGS = USER_TAGS; // イベントにも同等のタグを利用可能
