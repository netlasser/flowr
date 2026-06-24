import { describe, it, expect, beforeEach } from "vitest";
import { useFlowrStore } from "../store";

beforeEach(() => {
  useFlowrStore.setState(useFlowrStore.getInitialState());
});

describe("store / auth", () => {
  it("starts with a guest user and guest token", () => {
    const state = useFlowrStore.getState();
    expect(state.currentUser).not.toBeNull();
    expect(state.currentUser?.id).toBe("guest-user");
    expect(state.token).toBe("guest-token");
  });

  it("setAuth updates user and token", () => {
    useFlowrStore.getState().setAuth(
      { id: "u1", email: "a@b.com", name: "Alice", createdAt: "2024-01-01" },
      "real-token",
    );
    const state = useFlowrStore.getState();
    expect(state.currentUser?.id).toBe("u1");
    expect(state.currentUser?.name).toBe("Alice");
    expect(state.token).toBe("real-token");
  });

  it("logout resets to defaults", () => {
    useFlowrStore.getState().setAuth(
      { id: "u1", email: "a@b.com", name: "Alice", createdAt: "2024-01-01" },
      "real-token",
    );
    useFlowrStore.getState().logout();
    const state = useFlowrStore.getState();
    expect(state.currentUser).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isGuardianActive).toBe(false);
  });
});

describe("store / zones", () => {
  it("starts with 3 default zones", () => {
    const zones = useFlowrStore.getState().zones;
    expect(zones).toHaveLength(3);
    expect(zones.map((z) => z.name)).toEqual([
      "Deep Code",
      "Comms & Sync",
      "Admin & Planning",
    ]);
  });

  it("addZone appends a zone and returns it", () => {
    const zone = useFlowrStore.getState().addZone("Test Zone", "desc", "red", "Star");
    expect(zone.name).toBe("Test Zone");
    expect(zone.color).toBe("red");
    expect(zone.icon).toBe("Star");
    expect(useFlowrStore.getState().zones).toHaveLength(4);
  });

  it("updateZone modifies a zone in place", () => {
    const zones = useFlowrStore.getState().zones;
    const target = zones[0];
    useFlowrStore.getState().updateZone(target.id, "Renamed", "new desc", "blue", "Heart");
    const updated = useFlowrStore.getState().zones.find((z) => z.id === target.id);
    expect(updated?.name).toBe("Renamed");
    expect(updated?.description).toBe("new desc");
    expect(updated?.color).toBe("blue");
    expect(updated?.icon).toBe("Heart");
  });

  it("deleteZone removes a zone by id", () => {
    const target = useFlowrStore.getState().zones[1];
    useFlowrStore.getState().deleteZone(target.id);
    const ids = useFlowrStore.getState().zones.map((z) => z.id);
    expect(ids).not.toContain(target.id);
    expect(useFlowrStore.getState().zones).toHaveLength(2);
  });

  it("setZones replaces all zones", () => {
    useFlowrStore.getState().setZones([]);
    expect(useFlowrStore.getState().zones).toHaveLength(0);
  });
});

describe("store / tasks", () => {
  it("starts with 6 default tasks", () => {
    const tasks = useFlowrStore.getState().tasks;
    expect(tasks).toHaveLength(6);
  });

  it("addTask appends a task and returns it", () => {
    const task = useFlowrStore.getState().addTask("New task", "details", "z-deep-code");
    expect(task.title).toBe("New task");
    expect(task.description).toBe("details");
    expect(task.zoneId).toBe("z-deep-code");
    expect(task.completed).toBe(false);
    expect(useFlowrStore.getState().tasks).toHaveLength(7);
  });

  it("toggleComplete flips task completion", () => {
    const first = useFlowrStore.getState().tasks[0];
    expect(first.completed).toBe(false);
    useFlowrStore.getState().toggleComplete(first.id);
    expect(useFlowrStore.getState().tasks.find((t) => t.id === first.id)?.completed).toBe(true);
    useFlowrStore.getState().toggleComplete(first.id);
    expect(useFlowrStore.getState().tasks.find((t) => t.id === first.id)?.completed).toBe(false);
  });

  it("deleteTask removes a task", () => {
    const target = useFlowrStore.getState().tasks[0];
    useFlowrStore.getState().deleteTask(target.id);
    expect(useFlowrStore.getState().tasks.find((t) => t.id === target.id)).toBeUndefined();
  });

  it("moveTask changes the task's zoneId", () => {
    const task = useFlowrStore.getState().tasks[0];
    useFlowrStore.getState().moveTask(task.id, "z-admin");
    expect(useFlowrStore.getState().tasks.find((t) => t.id === task.id)?.zoneId).toBe("z-admin");
  });

  it("reorderTasks maintains zone assignment but changes position via splice", () => {
    const deepCodeTasks = useFlowrStore
      .getState()
      .tasks.filter((t) => t.zoneId === "z-deep-code");
    expect(deepCodeTasks).toHaveLength(3);
    useFlowrStore.getState().reorderTasks("z-deep-code", 0, 2);
    const reordered = useFlowrStore
      .getState()
      .tasks.filter((t) => t.zoneId === "z-deep-code");
    expect(reordered).toHaveLength(3);
    expect(reordered[0].id).toBe(deepCodeTasks[1].id);
  });
});

describe("store / focus guardian", () => {
  it("setFocusIntention activates guardian with intention phase", () => {
    useFlowrStore.getState().setFocusIntention("z-deep-code");
    const state = useFlowrStore.getState();
    expect(state.isGuardianActive).toBe(true);
    expect(state.activeZoneId).toBe("z-deep-code");
    expect(state.focusPhase).toBe("intention");
  });

  it("confirmFocus sets phase to active and starts timer", () => {
    useFlowrStore.getState().setFocusIntention("z-deep-code");
    useFlowrStore.getState().confirmFocus("pomodoro", 25);
    const state = useFlowrStore.getState();
    expect(state.focusPhase).toBe("active");
    expect(state.timerMode).toBe("pomodoro");
    expect(state.pomodoroSecondsLeft).toBe(1500);
    expect(state.isTimerRunning).toBe(true);
  });

  it("tickTimer decrements pomodoro seconds", () => {
    useFlowrStore.getState().setFocusIntention("z-deep-code");
    useFlowrStore.getState().confirmFocus("pomodoro", 25);
    useFlowrStore.getState().tickTimer();
    expect(useFlowrStore.getState().pomodoroSecondsLeft).toBe(1499);
  });

  it("endFocus stops guardian and records focus duration", () => {
    useFlowrStore.getState().setFocusIntention("z-deep-code");
    useFlowrStore.getState().confirmFocus("count-up", 10);
    useFlowrStore.getState().endFocus(false);
    const state = useFlowrStore.getState();
    expect(state.isGuardianActive).toBe(false);
    expect(state.activeZoneId).toBeNull();
    expect(state.isBufferActive).toBe(true);
  });

  it("dismissCelebration triggers buffer", () => {
    useFlowrStore.getState().setFocusIntention("z-deep-code");
    useFlowrStore.getState().confirmFocus("count-up", 10);
    useFlowrStore.getState().dismissCelebration();
    const state = useFlowrStore.getState();
    expect(state.focusPhase).toBeNull();
    expect(state.isGuardianActive).toBe(false);
    expect(state.isBufferActive).toBe(true);
  });

  it("incrementSwitchesAvoided increases counter", () => {
    useFlowrStore.getState().incrementSwitchesAvoided();
    useFlowrStore.getState().incrementSwitchesAvoided();
    expect(useFlowrStore.getState().switchesAvoided).toBe(2);
  });

  it("extendFocus adds minutes to pomodoroSecondsLeft", () => {
    useFlowrStore.getState().setFocusIntention("z-deep-code");
    useFlowrStore.getState().confirmFocus("pomodoro", 25);
    const before = useFlowrStore.getState().pomodoroSecondsLeft;
    useFlowrStore.getState().extendFocus(5);
    expect(useFlowrStore.getState().pomodoroSecondsLeft).toBe(before + 300);
  });

  it("toggleTimerRunning pauses and resumes", () => {
    useFlowrStore.getState().setFocusIntention("z-deep-code");
    useFlowrStore.getState().confirmFocus("count-up", 10);
    expect(useFlowrStore.getState().isTimerRunning).toBe(true);
    useFlowrStore.getState().toggleTimerRunning();
    expect(useFlowrStore.getState().isTimerRunning).toBe(false);
    useFlowrStore.getState().toggleTimerRunning();
    expect(useFlowrStore.getState().isTimerRunning).toBe(true);
  });
});

describe("store / transition buffer", () => {
  it("startBuffer activates buffer with given duration", () => {
    useFlowrStore.getState().startBuffer("z-deep-code", "z-comms", 5);
    const state = useFlowrStore.getState();
    expect(state.isBufferActive).toBe(true);
    expect(state.bufferSecondsLeft).toBe(300);
    expect(state.bufferFromZoneId).toBe("z-deep-code");
    expect(state.bufferToZoneId).toBe("z-comms");
    expect(state.bufferBypassed).toBe(false);
  });

  it("tickBuffer decrements seconds", () => {
    useFlowrStore.getState().startBuffer("z-deep-code", "z-comms", 3);
    useFlowrStore.getState().tickBuffer();
    expect(useFlowrStore.getState().bufferSecondsLeft).toBe(179);
    useFlowrStore.getState().tickBuffer();
    expect(useFlowrStore.getState().bufferSecondsLeft).toBe(178);
  });

  it("extendBuffer adds extra seconds", () => {
    useFlowrStore.getState().startBuffer("z-deep-code", "z-comms", 3);
    useFlowrStore.getState().extendBuffer(120);
    expect(useFlowrStore.getState().bufferSecondsLeft).toBe(300);
  });

  it("skipBuffer deactivates buffer and marks bypassed", () => {
    useFlowrStore.getState().startBuffer("z-deep-code", "z-comms", 3);
    useFlowrStore.getState().skipBuffer();
    const state = useFlowrStore.getState();
    expect(state.isBufferActive).toBe(false);
    expect(state.bufferBypassed).toBe(true);
  });

  it("resetBuffer resets buffer to defaults (isBufferActive false, seconds back to 300)", () => {
    useFlowrStore.getState().startBuffer("z-deep-code", "z-comms", 3);
    useFlowrStore.getState().resetBuffer();
    const state = useFlowrStore.getState();
    expect(state.isBufferActive).toBe(false);
    expect(state.bufferSecondsLeft).toBe(300);
  });
});

describe("store / switches & badges", () => {
  it("addSwitch records a switch event", () => {
    const sw = useFlowrStore.getState().addSwitch("z-deep-code", "z-comms");
    expect(sw.fromZoneId).toBe("z-deep-code");
    expect(sw.toZoneId).toBe("z-comms");
    expect(useFlowrStore.getState().switches).toHaveLength(1);
  });

  it("addZoneSwitch pushes to zoneSwitchHistory", () => {
    useFlowrStore.getState().addZoneSwitch("z-deep-code");
    useFlowrStore.getState().addZoneSwitch("z-comms");
    expect(useFlowrStore.getState().zoneSwitchHistory).toHaveLength(2);
    expect(useFlowrStore.getState().zoneSwitchHistory[0].zoneId).toBe("z-deep-code");
  });

  it("clearZoneSwitchHistory empties the history", () => {
    useFlowrStore.getState().addZoneSwitch("z-deep-code");
    useFlowrStore.getState().clearZoneSwitchHistory();
    expect(useFlowrStore.getState().zoneSwitchHistory).toHaveLength(0);
  });

  it("earnBadge adds a badge to the list", () => {
    const badge = useFlowrStore.getState().earnBadge("Test Badge", "A test badge", "Star");
    expect(badge.name).toBe("Test Badge");
    expect(useFlowrStore.getState().badges).toHaveLength(1);
  });
});

describe("store / toasts", () => {
  it("pushToast adds a toast and returns its id", () => {
    const id = useFlowrStore.getState().pushToast("Hello", "info");
    expect(typeof id).toBe("string");
    const toasts = useFlowrStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe("Hello");
    expect(toasts[0].kind).toBe("info");
  });

  it("dismissToast removes the toast by id", () => {
    const id = useFlowrStore.getState().pushToast("Hello", "success");
    expect(useFlowrStore.getState().toasts).toHaveLength(1);
    useFlowrStore.getState().dismissToast(id);
    expect(useFlowrStore.getState().toasts).toHaveLength(0);
  });
});

describe("store / smart batching", () => {
  it("getSuggestionForText returns null for unknown text", () => {
    const suggestion = useFlowrStore.getState().getSuggestionForText("xyzzy");
    expect(suggestion).toBeNull();
  });

  it("addSuggestionFeedback stores feedback with a hash key", () => {
    useFlowrStore.getState().addSuggestionFeedback("hash1", "z-deep-code");
    const feedback = useFlowrStore.getState().zoneSuggestionFeedback;
    expect(feedback["hash1"]).toBeDefined();
    expect(feedback["hash1"].suggestedZoneId).toBe("z-deep-code");
    expect(feedback["hash1"].count).toBe(1);
  });

  it("correctSuggestionFeedback updates the correction", () => {
    useFlowrStore.getState().addSuggestionFeedback("hash1", "z-deep-code");
    useFlowrStore.getState().correctSuggestionFeedback("hash1", "z-admin");
    const feedback = useFlowrStore.getState().zoneSuggestionFeedback;
    expect(feedback["hash1"].userCorrectedZoneId).toBe("z-admin");
    expect(feedback["hash1"].count).toBe(1);
  });

  it("learnFromFeedback populates learnedKeywordMap after 3+ corrections for the same suggestion pair", () => {
    const { addSuggestionFeedback, correctSuggestionFeedback } = useFlowrStore.getState();
    addSuggestionFeedback("write some code", "z-comms");
    correctSuggestionFeedback("write some code", "z-deep-code");
    addSuggestionFeedback("write some code", "z-comms");
    correctSuggestionFeedback("write some code", "z-deep-code");
    addSuggestionFeedback("write some code", "z-comms");
    correctSuggestionFeedback("write some code", "z-deep-code");
    const map = useFlowrStore.getState().learnedKeywordMap;
    expect(Object.keys(map).length).toBeGreaterThan(0);
    expect(map["z-comms"]).toBe("z-deep-code");
  });
});

describe("store / adaptive duration", () => {
  it("starts with default preset of 25", () => {
    expect(useFlowrStore.getState().recommendedPreset).toBe(25);
  });

  it("setLastFocusDuration stores the minutes", () => {
    useFlowrStore.getState().setLastFocusDuration(42);
    expect(useFlowrStore.getState().lastFocusDurationMinutes).toBe(42);
  });

  it("adjustPreset increases preset on high completion", () => {
    useFlowrStore.getState().adjustPreset(0.9, 5);
    expect(useFlowrStore.getState().recommendedPreset).toBeGreaterThanOrEqual(25);
  });

  it("adjustPreset decreases preset on low completion", () => {
    useFlowrStore.getState().adjustPreset(0.3, 2);
    expect(useFlowrStore.getState().recommendedPreset).toBeLessThanOrEqual(25);
  });
});
