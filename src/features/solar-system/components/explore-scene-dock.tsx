"use client";

import {
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { getExploreSceneCopy } from "@/lib/i18n/explore-scene-copy";
import { useLocaleStore } from "@/stores/locale-store";
import type { ExploreDockPanel } from "@/stores/explore-scene-ui-store";
import { useExploreSceneUiStore } from "@/stores/explore-scene-ui-store";

import controlStyles from "./explore-scene-controls.module.css";

interface ExploreSceneDockProps {
  navigator: ReactNode;
  scaleNotice: string;
  selection: ReactNode;
  time: ReactNode;
  view: ReactNode;
}

const PANEL_ORDER = [
  "selection",
  "navigator",
  "view",
  "time",
] as const satisfies readonly ExploreDockPanel[];

type ResponsiveShellMode = "desktop" | "compact" | "mobile";

function panelContent(
  panel: ExploreDockPanel,
  props: ExploreSceneDockProps,
): ReactNode {
  return props[panel];
}

function useResponsiveShellMode(
  rootRef: RefObject<HTMLDivElement | null>,
): ResponsiveShellMode {
  const [mode, setMode] = useState<ResponsiveShellMode>("desktop");

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const read = () => {
      const next = getComputedStyle(root)
        .getPropertyValue("--explore-shell-mode")
        .trim();
      setMode(
        next === "mobile"
          ? "mobile"
          : next === "compact"
            ? "compact"
            : "desktop",
      );
    };
    read();
    const observer = new ResizeObserver(read);
    observer.observe(document.documentElement);
    window.addEventListener("orientationchange", read);
    return () => {
      observer.disconnect();
      window.removeEventListener("orientationchange", read);
    };
  }, [rootRef]);

  return mode;
}

function PanelTabs({ mobile = false }: { mobile?: boolean }) {
  const locale = useLocaleStore((state) => state.locale);
  const copy = getExploreSceneCopy(locale);
  const panelLabels = copy.dock.panelLabels;
  const active = useExploreSceneUiStore((state) => state.activeDockPanel);
  const setActive = useExploreSceneUiStore((state) => state.setActiveDockPanel);
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      return;
    }
    const currentIndex = PANEL_ORDER.indexOf(active);
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? PANEL_ORDER.length - 1
          : event.key === "ArrowRight"
            ? (currentIndex + 1) % PANEL_ORDER.length
            : (currentIndex - 1 + PANEL_ORDER.length) % PANEL_ORDER.length;
    const nextPanel = PANEL_ORDER[nextIndex];
    if (!nextPanel) return;
    event.preventDefault();
    setActive(nextPanel);
    window.requestAnimationFrame(() => {
      document.getElementById(`explore-tab-${nextPanel}`)?.focus();
    });
  };
  return (
    <div
      aria-label={copy.dock.tabsLabel}
      className={controlStyles.panelTabs}
      onKeyDown={handleKeyDown}
      role="tablist"
    >
      {PANEL_ORDER.map((panel) => (
        <button
          aria-controls={`explore-panel-${panel}`}
          aria-selected={active === panel}
          className={
            active === panel ? controlStyles.panelTabActive : undefined
          }
          id={`explore-tab-${panel}`}
          key={panel}
          onClick={() => setActive(panel)}
          role="tab"
          tabIndex={active === panel ? 0 : -1}
          type="button"
        >
          {mobile && panel === "selection"
            ? copy.dock.mobileSelectionLabel
            : panelLabels[panel]}
        </button>
      ))}
    </div>
  );
}

export function ExploreSceneDock(props: ExploreSceneDockProps) {
  const locale = useLocaleStore((state) => state.locale);
  const copy = getExploreSceneCopy(locale);
  const panelLabels = copy.dock.panelLabels;
  const rootRef = useRef<HTMLDivElement>(null);
  const shellMode = useResponsiveShellMode(rootRef);
  const active = useExploreSceneUiStore((state) => state.activeDockPanel);
  const collapsed = useExploreSceneUiStore(
    (state) => state.desktopDockCollapsed,
  );
  const mobileOpen = useExploreSceneUiStore((state) => state.mobileDockOpen);
  const selectionFocusRequest = useExploreSceneUiStore(
    (state) => state.selectionFocusRequest,
  );
  const openMobile = useExploreSceneUiStore((state) => state.openMobileDock);
  const closeMobile = useExploreSceneUiStore((state) => state.closeMobileDock);
  const toggleDesktopDock = useExploreSceneUiStore(
    (state) => state.toggleDesktopDock,
  );
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const handledSelectionFocusRequest = useRef(0);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (shellMode === "mobile" && mobileOpen && !dialog.open) {
      dialog.showModal();
      window.requestAnimationFrame(() => {
        dialog
          .querySelector<HTMLElement>("[role=tab][aria-selected=true]")
          ?.focus();
      });
    } else if ((shellMode !== "mobile" || !mobileOpen) && dialog.open) {
      dialog.close();
    }
  }, [mobileOpen, shellMode]);

  useEffect(() => {
    if (shellMode !== "mobile" && mobileOpen) closeMobile();
  }, [closeMobile, mobileOpen, shellMode]);

  useEffect(() => {
    if (selectionFocusRequest === handledSelectionFocusRequest.current) return;
    handledSelectionFocusRequest.current = selectionFocusRequest;
    if (active !== "selection" || collapsed) return;
    if (shellMode === "mobile" && !mobileOpen) return;
    window.requestAnimationFrame(() => {
      rootRef.current
        ?.querySelector<HTMLElement>("[data-selection-summary-heading]")
        ?.focus();
    });
  }, [active, collapsed, mobileOpen, selectionFocusRequest, shellMode]);

  return (
    <div
      className={controlStyles.responsiveRoot}
      data-shell-mode={shellMode}
      ref={rootRef}
    >
      {shellMode !== "mobile" ? (
        <aside
          aria-label={copy.dock.label}
          className={controlStyles.desktopDock}
          data-collapsed={collapsed ? "true" : "false"}
        >
          <header className={controlStyles.dockHeader}>
            <p className={controlStyles.scaleNotice}>{props.scaleNotice}</p>
            <button
              aria-expanded={!collapsed}
              aria-label={collapsed ? copy.dock.expand : copy.dock.minimize}
              className={controlStyles.collapseButton}
              onClick={toggleDesktopDock}
              type="button"
            >
              <span aria-hidden="true">{collapsed ? "+" : "−"}</span>
            </button>
          </header>
          {collapsed ? null : (
            <>
              <PanelTabs />
              <section
                aria-labelledby={`explore-tab-${active}`}
                className={controlStyles.panelBody}
                id={`explore-panel-${active}`}
                role="tabpanel"
              >
                {panelContent(active, props)}
              </section>
            </>
          )}
        </aside>
      ) : (
        <>
          <div className={controlStyles.mobileDockBar}>
            <span>{props.scaleNotice}</span>
            <button
              aria-expanded={mobileOpen}
              aria-haspopup="dialog"
              onClick={() => openMobile(active)}
              ref={triggerRef}
              type="button"
            >
              {copy.dock.mobileOpen(panelLabels[active])}
            </button>
          </div>
          <dialog
            aria-labelledby={titleId}
            className={controlStyles.bottomSheet}
            onCancel={(event) => {
              event.preventDefault();
              closeMobile();
            }}
            onClose={() => {
              if (useExploreSceneUiStore.getState().mobileDockOpen)
                closeMobile();
              triggerRef.current?.focus();
            }}
            onPointerDown={(event) => event.stopPropagation()}
            onPointerMove={(event) => event.stopPropagation()}
            onTouchMove={(event) => event.stopPropagation()}
            onWheel={(event) => event.stopPropagation()}
            ref={dialogRef}
          >
            <header className={controlStyles.sheetHeader}>
              <div>
                <p className={controlStyles.eyebrow}>
                  {copy.dock.mobileEyebrow}
                </p>
                <h2 id={titleId}>{panelLabels[active]}</h2>
              </div>
              <button
                aria-label={copy.dock.mobileClose}
                onClick={closeMobile}
                type="button"
              >
                ×
              </button>
            </header>
            <PanelTabs mobile />
            <section
              aria-labelledby={`explore-tab-${active}`}
              className={controlStyles.sheetScroller}
              id={`explore-panel-${active}`}
              role="tabpanel"
            >
              {panelContent(active, props)}
            </section>
          </dialog>
        </>
      )}
    </div>
  );
}
