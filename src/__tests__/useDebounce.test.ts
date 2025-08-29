import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "@/lib/hooks/useDebounce";

describe("useDebounce", () => {
  it("should return initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 500));

    expect(result.current).toBe("initial");
  });

  it("should debounce value changes", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial", delay: 500 },
      }
    );

    expect(result.current).toBe("initial");

    // Изменяем значение
    rerender({ value: "updated", delay: 500 });

    // Сразу после изменения значение ещё старое
    expect(result.current).toBe("initial");

    // Прогоняем таймеры на половину задержки
    act(() => {
      jest.advanceTimersByTime(250);
    });

    // Значение всё ещё старое
    expect(result.current).toBe("initial");

    // Прогоняем оставшееся время
    act(() => {
      jest.advanceTimersByTime(250);
    });

    // Теперь значение должно обновиться
    expect(result.current).toBe("updated");
  });

  it("should reset timer on rapid value changes", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial", delay: 500 },
      }
    );

    // Первое изменение
    rerender({ value: "first", delay: 500 });

    // Прогоняем время почти до конца
    act(() => {
      jest.advanceTimersByTime(400);
    });

    // Значение ещё не изменилось
    expect(result.current).toBe("initial");

    // Второе изменение - должно сбросить таймер
    rerender({ value: "second", delay: 500 });

    // Прогоняем 400ms
    act(() => {
      jest.advanceTimersByTime(400);
    });

    // Значение всё ещё старое (таймер был сброшен)
    expect(result.current).toBe("initial");

    // Прогоняем ещё 100ms (итого 500ms с момента второго изменения)
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Теперь должно быть второе значение
    expect(result.current).toBe("second");
  });

  it("should handle different delay values", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial", delay: 100 },
      }
    );

    rerender({ value: "fast", delay: 100 });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current).toBe("fast");

    // Изменяем delay
    rerender({ value: "slow", delay: 1000 });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Ещё не должно измениться
    expect(result.current).toBe("fast");

    act(() => {
      jest.advanceTimersByTime(900);
    });

    // Теперь должно измениться
    expect(result.current).toBe("slow");
  });

  it("should cleanup timeout on unmount", () => {
    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");

    const { result, rerender, unmount } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial", delay: 500 },
      }
    );

    rerender({ value: "updated", delay: 500 });

    // Размонтируем до истечения таймера
    unmount();

    // Проверяем что clearTimeout был вызван
    expect(clearTimeoutSpy).toHaveBeenCalled();

    clearTimeoutSpy.mockRestore();
  });

  it("should handle empty string values", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "", delay: 300 },
      }
    );

    expect(result.current).toBe("");

    rerender({ value: "not empty", delay: 300 });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe("not empty");

    rerender({ value: "", delay: 300 });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current).toBe("");
  });

  it("should handle zero delay", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial", delay: 0 },
      }
    );

    rerender({ value: "instant", delay: 0 });

    // Даже с нулевой задержкой нужно прогнать таймеры
    act(() => {
      jest.advanceTimersByTime(0);
    });

    expect(result.current).toBe("instant");
  });
});
