import {
  Compass,
  House,
  Moon,
  Plus,
  Sun,
  UserCircle,
} from "@phosphor-icons/react";
import { useEffect, useState, type ComponentType } from "react";

import { fetchLocalHealth } from "./api";
import { TodayScreen } from "../features/tasks/TodayScreen";

type NavigationKey = "today" | "goals" | "me";
type NavigationAction = NavigationKey | "record";
type ConnectionState = "checking" | "ready" | "offline";
type Theme = "dark" | "light";

interface NavigationItem {
  key: NavigationAction;
  label: string;
  icon: ComponentType<{ size?: number; weight?: "regular" | "fill" }>;
}

const navigationItems: NavigationItem[] = [
  { key: "today", label: "今天", icon: House },
  { key: "goals", label: "目标", icon: Compass },
  { key: "record", label: "记录", icon: Plus },
  { key: "me", label: "我的", icon: UserCircle },
];

const pageCopy: Record<Exclude<NavigationKey, "today">, { title: string; body: string }> = {
  goals: {
    title: "目标还在整理中",
    body: "下一阶段会在这里呈现你的章节、主线与支线。",
  },
  me: {
    title: "你的存档",
    body: "经验、奖励、复盘和本地备份会在这里慢慢形成。",
  },
};

function connectionLabel(state: ConnectionState): string {
  if (state === "ready") {
    return "本地存档已连接";
  }

  if (state === "offline") {
    return "本地存档暂不可用";
  }

  return "正在连接本地存档";
}

export function App() {
  const [activePage, setActivePage] = useState<NavigationKey>("today");
  const [connectionState, setConnectionState] = useState<ConnectionState>("checking");
  const [theme, setTheme] = useState<Theme>("dark");
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetchLocalHealth(controller.signal)
      .then(() => setConnectionState("ready"))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setConnectionState("offline");
      });

    return () => controller.abort();
  }, []);

  const isToday = activePage === "today";
  const secondaryPage = isToday ? null : pageCopy[activePage];

  return (
    <div className="app-shell" data-theme={theme}>
      <header className="topbar">
        <div>
          <p className="wordmark">MAINLINE</p>
          <p className="chapter-label">第一阶段 · 过渡</p>
        </div>
        <button
          aria-label={theme === "dark" ? "切换到浅色界面" : "切换到深色界面"}
          className="icon-button"
          onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
          title={theme === "dark" ? "切换到浅色界面" : "切换到深色界面"}
          type="button"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      <main className="content" id="main-content">
        {isToday ? (
          <>
            <TodayScreen isComposerOpen={isComposerOpen} onComposerOpenChange={setIsComposerOpen} />
            <div aria-live="polite" className={`connection connection--${connectionState}`}>
              <span aria-hidden="true" className="connection-dot" />
              {connectionLabel(connectionState)}
            </div>
          </>
        ) : (
          <section aria-labelledby="secondary-page-heading" className="placeholder-view">
            <p className="section-kicker">{navigationItems.find((item) => item.key === activePage)?.label}</p>
            <h1 id="secondary-page-heading">{secondaryPage?.title}</h1>
            <p className="lede">{secondaryPage?.body}</p>
          </section>
        )}
      </main>

      <nav aria-label="主导航" className="bottom-navigation">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.key;

          return (
            <button
              aria-current={isActive ? "page" : undefined}
              className={`navigation-item ${isActive ? "navigation-item--active" : ""}`}
              key={item.key}
              onClick={() => {
                if (item.key === "record") {
                  setActivePage("today");
                  setIsComposerOpen(true);
                  return;
                }

                setActivePage(item.key);
                setIsComposerOpen(false);
              }}
              type="button"
            >
              <Icon size={22} weight={isActive ? "fill" : "regular"} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
