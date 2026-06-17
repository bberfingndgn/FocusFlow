export const SECONDS_TO_GROW_FLOWER = 4 * 60 * 60; // 4 hours in seconds
export const USER_NAME = 'Alex';

export const SUBJECT_OPTIONS = ["Mathematics", "Science", "Social Studies", "English"] as const;

export const SUBJECT_EMOJIS: Record<string, string> = {
  "Mathematics": "➕",
  "Science": "🧪",
  "Social Studies": "🌍",
  "English": "📖",
};

// Chart hex colors
export const SUBJECT_COLORS: Record<string, string> = {
  "Mathematics": "#60A5FA",
  "Science": "#34D399",
  "Social Studies": "#FB923C",
  "English": "#A78BFA",
};

export const SUBJECT_FLOWER_LOTTIE: Record<string, string> = {
  'Mathematics':    '/lottie/flower_mavi.json',
  'Science':        '/lottie/flower_mor.json',
  'Social Studies': '/lottie/flower_pembe.json',
  'English':        '/lottie/flower_sari.json',
};

export const SUBJECT_LABELS: Record<string, string> = {
  'Mathematics':    'Matematik',
  'Social Studies': 'Sosyal Bilimler',
  'Science':        'Fen Bilgisi',
  'English':        'İngilizce',
};

// Badge / card Tailwind classes
export const SUBJECT_BADGE_COLORS: Record<string, string> = {
  "Mathematics": "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700",
  "Science": "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-200 dark:border-purple-700",
  "Social Studies": "bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900/50 dark:text-pink-200 dark:border-pink-700",
  "English": "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-700",
};
