window.__ModuleLoader__.load({
  id: '@local/standalone-chat',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    // SVG Icons (Codex Style)
    function FolderIcon(props) {
      const size = props.size || 15;
      return h(
        'svg',
        {
          viewBox: '0 0 16 16',
          width: size,
          height: size,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: '1.25',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          style: { display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 },
          'aria-hidden': 'true',
        },
        h('path', { d: 'M1.5 3.5C1.5 2.67 2.17 2 3 2h3.29c.4 0 .78.16 1.06.44l1.21 1.21c.28.28.66.44 1.06.44H13c.83 0 1.5.67 1.5 1.5v6.5c0 .83-.67 1.5-1.5 1.5H3c-.83 0-1.5-.67-1.5-1.5v-8z' })
      );
    }

    function ComputerIcon(props) {
      const size = props.size || 15;
      return h(
        'svg',
        {
          viewBox: '0 0 16 16',
          width: size,
          height: size,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: '1.25',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          style: { display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 },
          'aria-hidden': 'true',
        },
        h('rect', { x: '2', y: '2.5', width: '12', height: '8.5', rx: '1.5' }),
        h('path', { d: 'M5 14h6' }),
        h('path', { d: 'M8 11v3' })
      );
    }

    function ChevronDownIcon(props) {
      const size = props.size || 11;
      return h(
        'svg',
        {
          viewBox: '0 0 16 16',
          width: size,
          height: size,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: '1.5',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          style: { display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, opacity: 0.7 },
          'aria-hidden': 'true',
        },
        h('path', { d: 'M4 6l4 4 4-4' })
      );
    }

    const STYLES = `
      /* Codex Plan A: Dual-Pill Scope Tabs Container */
      .dsh-codex-tabs-row {
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        position: relative;
        z-index: 5;
      }

      /* Base capsule pill button (Codex visual match) */
      .dsh-codex-tab {
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: 28px;
        padding: 0 10px;
        border-radius: var(--dsw-radius-md, 8px);
        border: 1px solid var(--dsw-alias-border-l1, rgba(255, 255, 255, 0.12));
        background: var(--dsw-alias-bg-layer-1, rgba(255, 255, 255, 0.04));
        color: var(--dsw-alias-label-secondary, #94a3b8);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        user-select: none;
        transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
        outline: none;
      }

      .dsh-codex-tab:hover {
        background: var(--dsw-alias-bg-layer-2, rgba(255, 255, 255, 0.08));
        color: var(--dsw-alias-label-primary, #ffffff);
        border-color: rgba(255, 255, 255, 0.22);
      }

      /* Active Selected Capsule Tab */
      .dsh-codex-tab.dsh-active {
        background: var(--dsw-alias-bg-layer-2, rgba(255, 255, 255, 0.14));
        color: var(--dsw-alias-label-primary, #ffffff);
        border-color: rgba(255, 255, 255, 0.28);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
      }

      .dsh-codex-tab-label {
        max-width: 220px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* Hide original solitary workspace chip when dual-tab is active */
      .dsh-native-chip-hidden {
        display: none !important;
      }

      /* Menu item inside workspace dropdown menu */
      .dsh-codex-menu-item {
        box-sizing: border-box;
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 8px 12px;
        border-radius: var(--dsw-radius-sm, 6px);
        color: var(--dsw-alias-label-primary, #ffffff);
        font-size: 13px;
        cursor: pointer;
        transition: background 0.12s ease;
        user-select: none;
      }
      .dsh-codex-menu-item:hover {
        background: var(--dsw-alias-interactive-bg-hover, rgba(255, 255, 255, 0.08));
      }
      .dsh-codex-menu-divider {
        height: 1px;
        margin: 4px 0;
        background: var(--dsw-alias-border-l1, rgba(255, 255, 255, 0.1));
      }
    `;

    return {
      inject: ['slots', 'uiWorkspace', 'sessions', 'workspaces'],
      apply(ctx) {
        // 1. Inject Styles
        try {
          if (typeof document !== 'undefined') {
            let styleEl = document.querySelector('style[data-plugin="@local/standalone-chat"]');
            if (!styleEl) {
              styleEl = document.createElement('style');
              styleEl.setAttribute('data-plugin', '@local/standalone-chat');
              styleEl.textContent = STYLES;
              document.head.appendChild(styleEl);
            }
          }
        } catch (e) {
          console.error('[standalone-chat] Failed to inject styles:', e);
        }

        const uiWorkspace = ctx.get('uiWorkspace');
        const sessions = ctx.get('sessions');
        const workspaces = ctx.get('workspaces');

        // State tracking: 'no-project' vs 'project'
        let currentMode = 'no-project';
        let observer;

        // Ignore our own DOM changes while reconciling the controls.
        function reconcileDOM() {
          if (observer) observer.disconnect();
          try {
            updateTabsDOM();
            injectIntoWorkspaceMenu();
          } finally {
            if (observer && document.body) {
              observer.observe(document.body, { childList: true, subtree: true });
            }
          }
        }

        // Check whether active session belongs to any workspace
        function checkCurrentSessionMode() {
          try {
            if (!sessions?.list?.getSnapshot || !workspaces?.list?.getSnapshot) {
              return currentMode;
            }
            const sList = sessions.list.getSnapshot();
            const wList = workspaces.list.getSnapshot();
            if (!sList || !sList.byId) return currentMode;

            const activeSession = Object.values(sList.byId).find(
              (s) => (s?.retainedBy?.mainView ?? 0) > 0
            );

            if (!activeSession) {
              return currentMode;
            }

            // Check if activeSession belongs to a workspace
            const ws = (wList.items || []).find((item) =>
              (item.sessionIds || []).includes(activeSession.id)
            );

            if (ws && ws.title && ws.title !== '不选择项目') {
              currentMode = 'project';
            } else {
              currentMode = 'no-project';
            }
          } catch (e) {
            console.warn('[standalone-chat] checkCurrentSessionMode error:', e);
          }
          return currentMode;
        }

        // Get current project title if in project mode
        function getCurrentProjectTitle() {
          try {
            if (!sessions?.list?.getSnapshot || !workspaces?.list?.getSnapshot) return '选择项目';
            const sList = sessions.list.getSnapshot();
            const wList = workspaces.list.getSnapshot();
            if (!sList || !sList.byId) return '选择项目';

            const activeSession = Object.values(sList.byId).find(
              (s) => (s?.retainedBy?.mainView ?? 0) > 0
            );
            if (!activeSession) return '选择项目';

            const ws = (wList.items || []).find((item) =>
              (item.sessionIds || []).includes(activeSession.id)
            );
            if (ws && ws.title) return ws.title;
          } catch (e) {}
          return '选择项目';
        }

        // Start / Switch to "不选择项目" chat
        let isSwitching = false;
        async function startNoProjectChat() {
          if (isSwitching) return;
          isSwitching = true;
          try {
            currentMode = 'no-project';

            // Find if there's already a blank ungrouped session
            if (sessions?.list?.getSnapshot) {
              const list = sessions.list.getSnapshot();
              const wList = workspaces?.list?.getSnapshot?.();
              const allWsSessions = new Set(
                (wList?.items || []).flatMap((w) => w.sessionIds || [])
              );

              if (list && list.byId) {
                const blankUngrouped = Object.values(list.byId).find(
                  (s) => s?.blank && !allWsSessions.has(s.id)
                );
                if (blankUngrouped && uiWorkspace?.openSession) {
                  uiWorkspace.openSession(blankUngrouped.id);
                  reconcileDOM();
                  unlockComposer();
                  return;
                }
              }
            }

            // Create a new blank session without workspace binding
            if (sessions && typeof sessions.create === 'function') {
              const newId = await sessions.create({});
              if (newId && uiWorkspace?.openSession) {
                uiWorkspace.openSession(newId);
              }
            } else if (uiWorkspace && typeof uiWorkspace.startSession === 'function') {
              uiWorkspace.startSession(undefined);
            }
          } catch (err) {
            console.error('[standalone-chat] startNoProjectChat error:', err);
          } finally {
            isSwitching = false;
            setTimeout(() => {
              reconcileDOM();
              unlockComposer();
            }, 50);
          }
        }

        // Unlock composer input box when in "不选择项目" mode
        function unlockComposer() {
          if (currentMode !== 'no-project') return;
          try {
            // Find input container / contenteditable
            const editorEl = document.querySelector('[data-composer-input], [contenteditable]');
            if (editorEl) {
              editorEl.setAttribute('contenteditable', 'true');
              editorEl.removeAttribute('aria-disabled');
              editorEl.classList.remove('ZOVoma_inputDisabled');
            }

            // Find placeholder element or set attribute
            const placeholderEl = document.querySelector('[class*="placeholder"], [data-placeholder]');
            if (placeholderEl && placeholderEl.textContent && placeholderEl.textContent.includes('选择一个工作区')) {
              placeholderEl.textContent = '随心输入';
            }
          } catch (e) {}
        }

        // Update Dual-Tab Capsule DOM in heroWorkspaceRow
        function updateTabsDOM() {
          const heroRow = document.querySelector('[class*="heroWorkspaceRow"]');
          if (!heroRow) return;

          checkCurrentSessionMode();

          // Native WorkspaceChip button
          const nativeChip = heroRow.querySelector('button[aria-haspopup="menu"], button[class*="workspace"]');
          if (!nativeChip) return;

          // Hide native chip
          nativeChip.classList.add('dsh-native-chip-hidden');

          // Look for or create custom dual-tab container
          let tabContainer = heroRow.querySelector('.dsh-codex-tabs-row');
          if (!tabContainer) {
            tabContainer = document.createElement('div');
            tabContainer.className = 'dsh-codex-tabs-row';
            heroRow.insertBefore(tabContainer, nativeChip);
          }

          const projectTitle = getCurrentProjectTitle();
          const isProjectActive = currentMode === 'project' && projectTitle !== '选择项目';

          // Preserve controls and focus when the visible workspace did not change.
          const tabState = JSON.stringify([projectTitle, isProjectActive]);
          if (
            tabContainer.getAttribute('data-dsh-tab-state') === tabState &&
            tabContainer.__dshNativeChip === nativeChip &&
            tabContainer.children.length === 2
          ) {
            unlockComposer();
            return;
          }

          tabContainer.innerHTML = '';

          // 1. Tab: [📁 选择项目] (or [📁 对话 ⌵])
          const btnProject = document.createElement('button');
          btnProject.type = 'button';
          btnProject.className = 'dsh-codex-tab' + (isProjectActive ? ' dsh-active' : '');
          btnProject.title = '选择或切换项目工作区';

          const folderIconWrap = document.createElement('span');
          folderIconWrap.className = 'dsh-codex-tab-icon';
          folderIconWrap.innerHTML = `<svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;flex-shrink:0;"><path d="M1.5 3.5C1.5 2.67 2.17 2 3 2h3.29c.4 0 .78.16 1.06.44l1.21 1.21c.28.28.66.44 1.06.44H13c.83 0 1.5.67 1.5 1.5v6.5c0 .83-.67 1.5-1.5 1.5H3c-.83 0-1.5-.67-1.5-1.5v-8z"/></svg>`;

          const projectLabel = document.createElement('span');
          projectLabel.className = 'dsh-codex-tab-label';
          projectLabel.textContent = isProjectActive ? projectTitle : '选择项目';

          const chevronWrap = document.createElement('span');
          chevronWrap.innerHTML = `<svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;flex-shrink:0;opacity:0.7;"><path d="M4 6l4 4 4-4"/></svg>`;

          btnProject.appendChild(folderIconWrap);
          btnProject.appendChild(projectLabel);
          btnProject.appendChild(chevronWrap);

          btnProject.onclick = (e) => {
            e.stopPropagation();
            // Trigger native chip to open the workspace dropdown
            nativeChip.classList.remove('dsh-native-chip-hidden');
            nativeChip.click();
            nativeChip.classList.add('dsh-native-chip-hidden');
          };

          // 2. Tab: [💻 不选择项目]
          const btnNoProject = document.createElement('button');
          btnNoProject.type = 'button';
          btnNoProject.className = 'dsh-codex-tab' + (!isProjectActive ? ' dsh-active' : '');
          btnNoProject.title = '无需选择工作区，直接自由对话 (Codex 模式)';

          const compIconWrap = document.createElement('span');
          compIconWrap.className = 'dsh-codex-tab-icon';
          compIconWrap.innerHTML = `<svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;flex-shrink:0;"><rect x="2" y="2.5" width="12" height="8.5" rx="1.5"/><path d="M5 14h6"/><path d="M8 11v3"/></svg>`;

          const noProjectLabel = document.createElement('span');
          noProjectLabel.className = 'dsh-codex-tab-label';
          noProjectLabel.textContent = '不选择项目';

          btnNoProject.appendChild(compIconWrap);
          btnNoProject.appendChild(noProjectLabel);

          btnNoProject.onclick = (e) => {
            e.stopPropagation();
            startNoProjectChat();
          };

          tabContainer.appendChild(btnProject);
          tabContainer.appendChild(btnNoProject);
          tabContainer.setAttribute('data-dsh-tab-state', tabState);
          tabContainer.__dshNativeChip = nativeChip;

          unlockComposer();
        }

        // Inject "不选择项目" into the workspace dropdown menu if opened
        function injectIntoWorkspaceMenu() {
          const menuEl = document.querySelector('[role="menu"]');
          if (!menuEl || menuEl.querySelector('.dsh-codex-menu-item')) return;

          // Check if this menu is the workspace picker menu (contains ADD_WORKSPACE or workspace items)
          const hasAddWs = Array.from(menuEl.querySelectorAll('*')).some(
            (el) => el.textContent && el.textContent.includes('添加工作区')
          );
          if (!hasAddWs) return;

          const topItem = document.createElement('div');
          topItem.className = 'dsh-codex-menu-item';
          topItem.innerHTML = `
            <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;flex-shrink:0;"><rect x="2" y="2.5" width="12" height="8.5" rx="1.5"/><path d="M5 14h6"/><path d="M8 11v3"/></svg>
            <span style="font-weight: 500;">不选择项目 (自由对话)</span>
          `;
          topItem.onclick = (e) => {
            e.stopPropagation();
            // Close menu
            document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            startNoProjectChat();
          };

          const divider = document.createElement('div');
          divider.className = 'dsh-codex-menu-divider';

          menuEl.insertBefore(divider, menuEl.firstChild);
          menuEl.insertBefore(topItem, divider);
        }

        // Global DOM Observer
        if (typeof window !== 'undefined') {
          observer = new MutationObserver(reconcileDOM);

          observer.observe(document.body, {
            childList: true,
            subtree: true,
          });

          // Initial check
          setTimeout(reconcileDOM, 100);
          setTimeout(reconcileDOM, 500);

          // Keyboard shortcut: Ctrl+Alt+N / Cmd+Alt+N to quickly jump to "不选择项目"
          window.addEventListener(
            'keydown',
            (e) => {
              const isPrimary = e.ctrlKey || e.metaKey;
              if (isPrimary && e.altKey && (e.code === 'KeyN' || e.key === 'n' || e.key === 'N')) {
                e.preventDefault();
                e.stopPropagation();
                startNoProjectChat();
              }
            },
            true
          );
        }

        // Subscribe to reactive stores if available
        if (sessions?.list?.subscribe) {
          sessions.list.subscribe(() => {
            setTimeout(reconcileDOM, 30);
          });
        }
        if (workspaces?.list?.subscribe) {
          workspaces.list.subscribe(() => {
            setTimeout(reconcileDOM, 30);
          });
        }
      },
    };
  },
});
