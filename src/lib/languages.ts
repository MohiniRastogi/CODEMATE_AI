export type LanguageConfig = {
  slug: string;
  name: string;
  emoji: string;
  desc: string;
  placeholder: string;
  example: string;
};

export const LANGUAGE_CONFIGS: LanguageConfig[] = [
  {
    slug: "python",
    name: "Python",
    emoji: "🐍",
    desc: "Use the Python Code Generator for scripts, automation, APIs and data structures.",
    placeholder: "Create a Python program to reverse a string.",
    example: "Create a Python program to reverse a string without using slicing.",
  },
  {
    slug: "java",
    name: "Java",
    emoji: "☕",
    desc: "The Java Code Generator writes OOP examples, algorithms and Spring snippets.",
    placeholder: "Create a Java class implementing Binary Search.",
    example: "Create a Java class implementing Binary Search with a main method.",
  },
  {
    slug: "c",
    name: "C",
    emoji: "🔧",
    desc: "A C Program Generator for pointers, arrays and classic exercises.",
    placeholder: "Write a C program to reverse an array using pointers.",
    example: "Write a C program to reverse an array in place using pointers.",
  },
  {
    slug: "cpp",
    name: "C++",
    emoji: "🧠",
    desc: "STL usage, competitive programming solutions and OOP designs.",
    placeholder: "Write a C++ program to sort a vector using STL.",
    example: "Write a C++ program that sorts a vector of structs using STL sort.",
  },
  {
    slug: "javascript",
    name: "JavaScript",
    emoji: "🟨",
    desc: "Browser logic, Node scripts and API clients in seconds.",
    placeholder: "Create a JavaScript function to debounce user input.",
    example: "Create a JavaScript debounce function and show how to use it on an input.",
  },
  {
    slug: "typescript",
    name: "TypeScript",
    emoji: "🔷",
    desc: "Typed utilities, components and backend services.",
    placeholder: "Create a TypeScript generic utility to deep-freeze an object.",
    example: "Create a strongly typed TypeScript generic utility to deep-freeze an object.",
  },
  {
    slug: "go",
    name: "Go",
    emoji: "🐹",
    desc: "CLI tools, concurrent workers and HTTP services.",
    placeholder: "Write a Go program using goroutines to fetch URLs concurrently.",
    example: "Write a Go worker pool that fetches URLs concurrently with a WaitGroup.",
  },
  {
    slug: "sql",
    name: "SQL",
    emoji: "🗄️",
    desc: "Queries, joins, schemas and reporting statements.",
    placeholder: "Write an SQL query to find the top 5 customers by total order value.",
    example: "Write an SQL query joining orders and customers to rank top spenders.",
  },
  { slug: "rust", name: "Rust", emoji: "🦀", desc: "Systems code with memory safety.", placeholder: "Write a Rust program to parse a CSV file.", example: "Write a Rust program that parses a CSV file and prints a summary." },
  { slug: "php", name: "PHP", emoji: "🐘", desc: "Web backends and scripts.", placeholder: "Write a PHP script to validate a form submission.", example: "Write a PHP script that validates and sanitizes a contact form." },
  { slug: "kotlin", name: "Kotlin", emoji: "🅺", desc: "Android and JVM services.", placeholder: "Write a Kotlin data class with validation.", example: "Write a Kotlin data class with validation and a factory method." },
  { slug: "swift", name: "Swift", emoji: "🕊️", desc: "iOS and macOS apps.", placeholder: "Write a Swift function to fetch JSON with async/await.", example: "Write a Swift async function that fetches and decodes JSON." },
  { slug: "html", name: "HTML", emoji: "🌐", desc: "Semantic markup and page structure.", placeholder: "Create an accessible HTML pricing table.", example: "Create an accessible, semantic HTML pricing table." },
  { slug: "css", name: "CSS", emoji: "🎨", desc: "Layouts, animations and responsive design.", placeholder: "Create a responsive CSS grid card layout.", example: "Create a responsive CSS grid card layout with hover effects." },
];

export const LANGUAGE_NAMES = LANGUAGE_CONFIGS.map((l) => l.name);

/** Cards shown on the home screen. */
export const FEATURED_LANGUAGES = LANGUAGE_CONFIGS.slice(0, 8);

export const DEFAULT_LANGUAGE = LANGUAGE_CONFIGS[0];

/** Resolve a slug, name or alias (case-insensitive) to a language config. */
export function resolveLanguage(input?: string | null): LanguageConfig {
  if (!input) return DEFAULT_LANGUAGE;
  const key = input.trim().toLowerCase();
  const aliases: Record<string, string> = {
    "c++": "cpp",
    cplusplus: "cpp",
    js: "javascript",
    ts: "typescript",
    golang: "go",
    py: "python",
  };
  const slug = aliases[key] ?? key;
  return (
    LANGUAGE_CONFIGS.find((l) => l.slug === slug || l.name.toLowerCase() === key) ??
    DEFAULT_LANGUAGE
  );
}
