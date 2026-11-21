/**
 * MAX Bridge SDK — Клиентский адаптер интеграции национальной платформы MAX (Госуслуги / MAX)
 * Обеспечивает безопасное взаимодействие веб-приложения с нативным контейнером супер-аппа.
 * 
 * Спецификация: TICKET-04 (Dual-Mode: Нативный мост + Веб-симулятор /max-preview)
 */

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface MAXBridgeAPI {
  version?: string;
  platform?: string;
  ready: () => void;
  expand: () => void;
  close: () => void;
  sendData?: (data: string) => void;
  openLink?: (url: string) => void;
  onBackButtonPressed?: (callback: () => void) => void;
  offBackButtonPressed?: (callback: () => void) => void;
  getSafeAreaInsets?: () => SafeAreaInsets;
  themeParams?: {
    bg_color?: string;
    text_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
}

declare global {
  interface Window {
    MAXBridge?: MAXBridgeAPI;
  }
}

class MAXBridgeClient {
  private isClient = typeof window !== "undefined";
  private backButtonCallbacks: Array<() => void> = [];

  /**
   * Проверяет, запущено ли веб-приложение внутри супер-аппа MAX или в режиме эмуляции
   */
  public isMaxEnvironment(): boolean {
    if (!this.isClient) return false;
    const urlParams = new URLSearchParams(window.location.search);
    const platformParam = urlParams.get("platform");
    return Boolean(window.MAXBridge || platformParam === "max");
  }

  /**
   * Сигнализирует контейнеру супер-аппа MAX о полной готовности веб-интерфейса
   */
  public ready(): void {
    if (!this.isClient) return;

    if (window.MAXBridge?.ready) {
      try {
        window.MAXBridge.ready();
        console.info("[MAXBridge] ready() invoked on native bridge");
      } catch (err) {
        console.warn("[MAXBridge] ready() error:", err);
      }
    } else {
      console.info("[MAXBridge (Simulator)] ready() acknowledged");
    }
  }

  /**
   * Разворачивает контейнер мини-приложения на максимальную высоту экрана
   */
  public expand(): void {
    if (!this.isClient) return;

    if (window.MAXBridge?.expand) {
      try {
        window.MAXBridge.expand();
        console.info("[MAXBridge] expand() invoked on native bridge");
      } catch (err) {
        console.warn("[MAXBridge] expand() error:", err);
      }
    } else {
      console.info("[MAXBridge (Simulator)] expand() acknowledged");
    }
  }

  /**
   * Закрывает мини-приложение и возвращает пользователя в чат супер-аппа
   */
  public close(): void {
    if (!this.isClient) return;

    if (window.MAXBridge?.close) {
      window.MAXBridge.close();
    } else {
      console.info("[MAXBridge (Simulator)] close() requested");
      if (window.history.length > 1) {
        window.history.back();
      }
    }
  }

  /**
   * Регистрирует обработчик системной кнопки «Назад» в навигационной панели MAX
   */
  public onBackButtonPressed(callback: () => void): () => void {
    if (!this.isClient) return () => {};

    this.backButtonCallbacks.push(callback);

    if (window.MAXBridge?.onBackButtonPressed) {
      try {
        window.MAXBridge.onBackButtonPressed(callback);
      } catch (err) {
        console.warn("[MAXBridge] onBackButtonPressed error:", err);
      }
    }

    // Возвращает функцию отписки
    return () => {
      this.backButtonCallbacks = this.backButtonCallbacks.filter((cb) => cb !== callback);
      if (window.MAXBridge?.offBackButtonPressed) {
        try {
          window.MAXBridge.offBackButtonPressed(callback);
        } catch {
          // ignore
        }
      }
    };
  }

  /**
   * Триггерит обработчики кнопки «Назад» (вызывается симулятором /max-preview)
   */
  public triggerBackButton(): void {
    if (this.backButtonCallbacks.length > 0) {
      const latestCallback = this.backButtonCallbacks[this.backButtonCallbacks.length - 1];
      latestCallback();
    } else if (this.isClient && window.history.length > 1) {
      window.history.back();
    }
  }

  /**
   * Возвращает безопасные зоны экрана (Safe Area Insets)
   */
  public getSafeAreaInsets(): SafeAreaInsets {
    if (!this.isClient) {
      return { top: 0, bottom: 0, left: 0, right: 0 };
    }

    if (window.MAXBridge?.getSafeAreaInsets) {
      try {
        return window.MAXBridge.getSafeAreaInsets();
      } catch {
        // fallback
      }
    }

    return {
      top: 44, // Стандартная высота статус-бара iOS/Android
      bottom: 34, // Стандартная высота домашнего индикатора
      left: 0,
      right: 0,
    };
  }
}

export const maxBridge = new MAXBridgeClient();
