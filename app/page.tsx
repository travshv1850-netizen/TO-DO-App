"use client";

import { useState, useEffect, useRef } from "react";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
};

type Filter = "all" | "active" | "completed";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isComposingRef = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem("todos");
    if (saved) {
      setTodos(JSON.parse(saved));
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("todos", JSON.stringify(todos));
    }
  }, [todos, mounted]);

  const addTodo = () => {
    const text = input.trim();
    if (!text) return;
    setTodos((prev) => [
      {
        id: crypto.randomUUID(),
        text,
        completed: false,
        createdAt: Date.now(),
      },
      ...prev,
    ]);
    setInput("");
    inputRef.current?.focus();
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((t) => !t.completed));
  };

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  if (!mounted) return null;

  return (
    <main className="min-h-screen flex items-start justify-center pt-16 px-4 pb-16">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white tracking-tight mb-1">
            ToDoリスト
          </h1>
          <p className="text-white/60 text-sm">
            {activeCount === 0
              ? "すべて完了しました！"
              : `${activeCount}件の未完了タスク`}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Input area */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onCompositionStart={() => { isComposingRef.current = true; }}
                onCompositionEnd={() => { isComposingRef.current = false; }}
                onKeyDown={(e) => e.key === "Enter" && !isComposingRef.current && addTodo()}
                placeholder="新しいタスクを入力..."
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
              <button
                onClick={addTodo}
                disabled={!input.trim()}
                className="px-4 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all active:scale-95"
              >
                追加
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex border-b border-slate-100">
            {(["all", "active", "completed"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-2.5 text-xs font-medium transition-all ${
                  filter === f
                    ? "text-indigo-600 border-b-2 border-indigo-500"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {f === "all" ? "すべて" : f === "active" ? "未完了" : "完了済み"}
              </button>
            ))}
          </div>

          {/* Todo list */}
          <ul className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="py-12 text-center text-slate-400 text-sm">
                {filter === "completed"
                  ? "完了済みのタスクはありません"
                  : filter === "active"
                  ? "未完了のタスクはありません"
                  : "タスクを追加してみましょう"}
              </li>
            ) : (
              filtered.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-center gap-3 px-4 py-3.5 group hover:bg-slate-50 transition-colors"
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      todo.completed
                        ? "bg-indigo-500 border-indigo-500"
                        : "border-slate-300 hover:border-indigo-400"
                    }`}
                    aria-label={todo.completed ? "未完了に戻す" : "完了にする"}
                  >
                    {todo.completed && (
                      <svg
                        className="w-2.5 h-2.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Text */}
                  <span
                    className={`flex-1 text-sm leading-relaxed transition-all ${
                      todo.completed
                        ? "line-through text-slate-400"
                        : "text-slate-700"
                    }`}
                  >
                    {todo.text}
                  </span>

                  {/* Delete button */}
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center text-slate-300 hover:text-red-400 transition-all"
                    aria-label="削除"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </li>
              ))
            )}
          </ul>

          {/* Footer */}
          {todos.length > 0 && (
            <div className="px-4 py-3 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {activeCount}件残り
              </span>
              {completedCount > 0 && (
                <button
                  onClick={clearCompleted}
                  className="text-xs text-slate-400 hover:text-red-400 transition-colors"
                >
                  完了済みを削除 ({completedCount})
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
